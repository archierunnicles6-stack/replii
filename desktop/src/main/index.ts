import {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  nativeImage,
  screen,
  session,
  shell,
  systemPreferences,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import http from "node:http";
import { spawnSync } from "node:child_process";

function parseEnvFile(contents: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function loadOpenAIKey(): string | undefined {
  return loadEnvVar("VITE_OPENAI_API_KEY");
}

const DEFAULT_BILLING_API_BASE = "https://replii-lac.vercel.app";

function loadEnvVar(key: string): string | undefined {
  const candidates = [
    path.join(app.getPath("userData"), ".env"),
    path.join(process.resourcesPath, ".env"),
    path.join(app.getAppPath(), "../../.env"),
    path.join(__dirname, "../../.env"),
  ];

  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue;
      const value = parseEnvFile(fs.readFileSync(file, "utf8"))[key]?.trim();
      if (value) return value;
    } catch {
      // ignore
    }
  }

  return process.env[key]?.trim() || undefined;
}

function loadBillingApiBase(): string {
  const raw = loadEnvVar("VITE_API_BASE_URL")?.replace(/\/$/, "");
  if (isDev && raw) return raw;
  if (raw && !raw.includes("localhost") && !raw.includes("127.0.0.1")) return raw;
  return DEFAULT_BILLING_API_BASE;
}

const isDev = !!process.env.ELECTRON_RENDERER_URL;

function setDockIcon(): void {
  if (process.platform !== "darwin" || !app.dock) return;

  const candidates = [
    path.join(process.resourcesPath, "icon.png"),
    path.join(process.resourcesPath, "icon.icns"),
    path.join(app.getAppPath(), "build/icon.png"),
    path.join(__dirname, "../../build/icon.png"),
    path.join(__dirname, "../../../build/icon.png"),
  ];

  for (const iconPath of candidates) {
    if (!fs.existsSync(iconPath)) continue;
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) continue;
    app.dock.setIcon(image);
    return;
  }
}

app.setName("Replii");

// Prevent dev crashes when stdout/stderr pipe closes (EPIPE on console.warn).
for (const stream of [process.stdout, process.stderr]) {
  stream?.on?.("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EPIPE") return;
  });
}

// Dev and packaged builds share the same app name — separate userData so both can run.
if (isDev) {
  app.setPath("userData", path.join(app.getPath("appData"), "replii-desktop-dev"));
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

/** Desktop OAuth lands here so the browser never needs to open replii:// directly. */
const OAUTH_LOOPBACK_PORT = 42817;
const OAUTH_LOOPBACK_PATH = "/auth/callback";

function startOAuthLoopbackServer(): void {
  const server = http.createServer((req, res) => {
    const url = req.url ?? "";
    if (!url.startsWith(OAUTH_LOOPBACK_PATH)) {
      res.writeHead(404);
      res.end();
      return;
    }

    const suffix = url.slice(OAUTH_LOOPBACK_PATH.length);
    handleDeepLink(`replii://auth/callback${suffix}`);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Signed in — Replii</title></head>
<body style="font-family:system-ui,sans-serif;text-align:center;padding:48px 24px;color:#18181b">
  <h1 style="font-size:24px;font-weight:600">Signed in</h1>
  <p style="margin-top:12px;color:#52525b">Return to Replii — you can close this tab.</p>
</body>
</html>`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(
        `[replii] OAuth loopback :${OAUTH_LOOPBACK_PORT} in use — restart Replii if Google sign-in fails`,
      );
      return;
    }
    console.error("[replii] OAuth loopback server error:", err);
  });

  server.listen(OAUTH_LOOPBACK_PORT, "127.0.0.1", () => {
    console.log(
      `[replii] OAuth callback http://127.0.0.1:${OAUTH_LOOPBACK_PORT}${OAUTH_LOOPBACK_PATH}`,
    );
  });
}

// Register custom protocol for OAuth callbacks (replii://auth/callback)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("replii", process.execPath, [
      path.resolve(process.argv[1] ?? ""),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("replii");
}

let dashboardWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let micHelperWindow: BrowserWindow | null = null;
let isOverlayHidden = false;
let overlayPendingShow = false;
let contentProtection = false;
let sessionActive = false;

const FREE_OVERLAY_LIMIT_SECONDS = 30 * 60;
const PLAN_STATE_PATH = () => path.join(app.getPath("userData"), "plan-state.json");

interface PlanLimitsState {
  plan: string;
  freeOverlaySecondsUsed: number;
}

function migrateLegacyFreeSessionsUsed(freeSessionsUsed: number): number {
  if (freeSessionsUsed >= 3) return FREE_OVERLAY_LIMIT_SECONDS;
  return Math.min(freeSessionsUsed * 600, FREE_OVERLAY_LIMIT_SECONDS);
}

function resolveFreeOverlaySecondsUsed(
  freeOverlaySecondsUsed: number | undefined,
  legacyFreeSessionsUsed: number | undefined,
): number {
  if (typeof freeOverlaySecondsUsed === "number" && freeOverlaySecondsUsed > 0) {
    return Math.max(0, freeOverlaySecondsUsed);
  }
  if (typeof legacyFreeSessionsUsed === "number" && legacyFreeSessionsUsed > 0) {
    return migrateLegacyFreeSessionsUsed(legacyFreeSessionsUsed);
  }
  return Math.max(0, freeOverlaySecondsUsed ?? 0);
}

function readPlanLimits(): PlanLimitsState {
  try {
    const file = PLAN_STATE_PATH();
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<PlanLimitsState>;
      return {
        plan: parsed.plan ?? "free",
        freeOverlaySecondsUsed: resolveFreeOverlaySecondsUsed(
          parsed.freeOverlaySecondsUsed,
          parsed.freeSessionsUsed,
        ),
      };
    }
  } catch {
    // ignore corrupt state
  }
  return { plan: "free", freeOverlaySecondsUsed: 0 };
}

function writePlanLimits(state: PlanLimitsState): void {
  try {
    fs.writeFileSync(PLAN_STATE_PATH(), JSON.stringify(state), "utf8");
  } catch {
    // ignore write failures
  }
}

function isPaidPlan(plan: string): boolean {
  return plan !== "free";
}

function canStartSessionFromLimits(state: PlanLimitsState): boolean {
  return (
    isPaidPlan(state.plan) ||
    state.freeOverlaySecondsUsed < FREE_OVERLAY_LIMIT_SECONDS
  );
}

function canDisableContentProtection(state: PlanLimitsState): boolean {
  return state.plan === "undetectable";
}

function consumeCallAudioSetupFlag(): boolean {
  const flagPath = path.join(app.getPath("userData"), "use-call-audio.flag");
  if (!fs.existsSync(flagPath)) return false;
  try {
    fs.unlinkSync(flagPath);
  } catch {
    // ignore
  }
  return true;
}

function runRepliiAudioSetup(): boolean {
  if (process.platform !== "darwin") return true;

  const candidates = [
    path.join(app.getAppPath(), "scripts/setup-replii-audio.swift"),
    path.join(__dirname, "../../scripts/setup-replii-audio.swift"),
  ];
  const scriptPath = candidates.find((p) => fs.existsSync(p));
  if (!scriptPath) return false;

  const result = spawnSync("swift", [scriptPath], { encoding: "utf8" });
  if (result.status === 0) {
    console.log("[replii] Audio routing ready");
    return true;
  }

  console.warn("[replii] Audio setup:", result.stderr || result.stdout);
  return false;
}

function getRendererIndexPath(): string {
  return path.join(app.getAppPath(), "out/renderer/index.html");
}

function getRendererUrl(route: string): string {
  if (isDev) {
    return `${process.env.ELECTRON_RENDERER_URL}#${route}`;
  }
  return getRendererIndexPath();
}

function bindWindowTitle(win: BrowserWindow, title = "Replii"): void {
  win.setTitle(title);
  win.on("page-title-updated", (event) => {
    event.preventDefault();
    if (!win.isDestroyed()) win.setTitle(title);
  });
}

function loadRoute(win: BrowserWindow, route: string): void {
  if (isDev) {
    win.loadURL(getRendererUrl(route));
    return;
  }

  const hash = route.startsWith("/") ? route : `/${route}`;
  win.loadFile(getRendererIndexPath(), { hash });
}

function sendWhenReady(win: BrowserWindow | null, channel: string, ...args: unknown[]): void {
  if (!win || win.isDestroyed()) return;
  const deliver = () => {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args);
  };
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", deliver);
  } else {
    deliver();
  }
}

function createDashboardWindow(): void {
  if (dashboardWindow) {
    dashboardWindow.show();
    dashboardWindow.focus();
    return;
  }

  dashboardWindow = new BrowserWindow({
    width: 1000,
    height: 660,
    minWidth: 800,
    minHeight: 560,
    title: "Replii",
    ...(process.platform === "darwin"
      ? {
          titleBarStyle: "hiddenInset" as const,
          trafficLightPosition: { x: 16, y: 16 },
        }
      : {}),
    backgroundColor: "#ffffff",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  bindWindowTitle(dashboardWindow);

  dashboardWindow.webContents.setBackgroundThrottling(false);

  dashboardWindow.once("ready-to-show", () => {
    dashboardWindow?.center();
    dashboardWindow?.show();
    dashboardWindow?.focus();
    if (process.platform === "darwin") {
      app.dock?.show();
    }
  });

  loadRoute(dashboardWindow, "/");

  dashboardWindow.webContents.on("did-fail-load", (_event, code, description, url) => {
    console.error("[replii] Dashboard failed to load:", code, description, url);
  });

  dashboardWindow.webContents.on("before-input-event", (_event, input) => {
    if (isHideShowShortcutInput(input)) handleHideShowShortcut();
  });

  dashboardWindow.on("closed", () => {
    dashboardWindow = null;
  });
}

const OVERLAY_BOTTOM_MARGIN = 20;

type OverlayMode = "pill" | "active";
let overlayMode: OverlayMode = "pill";

function repositionOverlayBottomCenter(): void {
  if (!overlayWindow || overlayMode !== "pill") return;
  const display = screen.getDisplayMatching(overlayWindow.getBounds());
  const { workArea } = display;
  const [width, height] = overlayWindow.getSize();
  const x = Math.round(workArea.x + (workArea.width - width) / 2);
  const y = Math.round(workArea.y + workArea.height - height - OVERLAY_BOTTOM_MARGIN);
  overlayWindow.setPosition(x, y);
}

function setOverlayMode(mode: OverlayMode): void {
  if (!overlayWindow) return;
  overlayMode = mode;
  const display = screen.getDisplayMatching(overlayWindow.getBounds());
  const { workArea } = display;

  if (mode === "active") {
    overlayWindow.setMinimumSize(320, 200);
    overlayWindow.setMaximumSize(workArea.width, workArea.height);
    overlayWindow.setSize(workArea.width, workArea.height, false);
    overlayWindow.setPosition(workArea.x, workArea.y);
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    return;
  }

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setMinimumSize(120, 32);
  overlayWindow.setMaximumSize(520, 200);
  repositionOverlayBottomCenter();
}

function createOverlayWindow(): void {
  if (overlayWindow) {
    revealOverlay();
    return;
  }

  const overlayWidth = 120;
  const overlayHeight = 56;

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    show: false,
    minWidth: 120,
    minHeight: 32,
    maxWidth: 520,
    ...(process.platform === "darwin"
      ? { roundedCorners: false }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  overlayWindow.webContents.setBackgroundThrottling(false);
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, "screen-saver", 1);

  const limits = readPlanLimits();
  const initialProtection = canDisableContentProtection(limits)
    ? contentProtection
    : false;
  contentProtection = initialProtection;
  overlayWindow.setContentProtection(initialProtection);

  loadRoute(overlayWindow, "/overlay");
  repositionOverlayBottomCenter();

  overlayWindow.webContents.on("did-finish-load", () => {
    overlayWindow?.setBackgroundColor("#00000000");
    repositionOverlayBottomCenter();
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
    sessionActive = false;
  });
}

function revealOverlay(): void {
  if (!overlayWindow) return;
  overlayPendingShow = false;
  overlayWindow.setBackgroundColor("#00000000");
  if (overlayMode === "pill") {
    repositionOverlayBottomCenter();
  }
  overlayWindow.showInactive();
  isOverlayHidden = false;
  overlayWindow.webContents.send("replii:visibility", true);
}

function showOverlay(): void {
  if (!overlayWindow) createOverlayWindow();
  if (!overlayWindow) return;

  if (overlayWindow.webContents.isLoading()) {
    overlayPendingShow = true;
    overlayWindow.webContents.once("did-finish-load", () => {
      if (overlayPendingShow) {
        // Wait for renderer to size the window before revealing.
        setTimeout(() => {
          if (overlayPendingShow) revealOverlay();
        }, 300);
      }
    });
    return;
  }

  revealOverlay();
}

function hideOverlay(): void {
  overlayWindow?.hide();
  isOverlayHidden = true;
  overlayWindow?.webContents.send("replii:visibility", false);
}

function closeOverlay(): void {
  overlayWindow?.close();
  overlayWindow = null;
  sessionActive = false;
}

let lastHideShowShortcutAt = 0;

function handleHideShowShortcut(): void {
  const now = Date.now();
  if (now - lastHideShowShortcutAt < 120) return;
  lastHideShowShortcutAt = now;

  dashboardWindow?.webContents.send("replii:shortcut-toggle");

  if (!overlayWindow || !sessionActive) return;
  overlayWindow.webContents.send("replii:shortcut-toggle");
}

function isHideShowShortcutInput(input: Electron.Input): boolean {
  if (input.type !== "keyDown") return false;
  const mod = process.platform === "darwin" ? input.meta : input.control;
  return mod && (input.key === "\\" || input.code === "Backslash");
}

function moveOverlay(dx: number, dy: number): void {
  if (!overlayWindow) return;
  const [x, y] = overlayWindow.getPosition();
  overlayWindow.setPosition(x + dx, y + dy);
}

function registerShortcuts(): void {
  const hideShowAccelerator = "CommandOrControl+\\";
  if (!globalShortcut.register(hideShowAccelerator, handleHideShowShortcut)) {
    console.warn(
      `[replii] Failed to register global shortcut: ${hideShowAccelerator}`,
    );
  }

  globalShortcut.register("CommandOrControl+Enter", () => {
    if (sessionActive) overlayWindow?.webContents.send("replii:assist");
  });

  globalShortcut.register("CommandOrControl+Left", () => {
    moveOverlay(-40, 0);
  });

  globalShortcut.register("CommandOrControl+Right", () => {
    moveOverlay(40, 0);
  });

  globalShortcut.register("CommandOrControl+R", () => {
    if (sessionActive) overlayWindow?.webContents.send("replii:clear-session");
  });
}

async function requestMicAccess(): Promise<boolean> {
  if (process.platform !== "darwin") return true;
  const status = systemPreferences.getMediaAccessStatus("microphone");
  if (status === "granted") return true;
  if (status === "denied") return false;
  return systemPreferences.askForMediaAccess("microphone");
}

async function fixMicAccess(): Promise<boolean> {
  const granted = await requestMicAccess();
  if (!granted) return false;
  dashboardWindow?.webContents.send("replii:mic-granted");
  overlayWindow?.webContents.send("replii:mic-granted");
  micHelperWindow?.webContents.send("replii:mic-granted");
  return true;
}

async function capturePrimaryScreenJpeg(): Promise<string | null> {
  try {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.bounds;
    const thumbW = Math.min(width, 1920);
    const thumbH = Math.min(height, 1080);

    const list = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: thumbW, height: thumbH },
    });

    const source =
      list.find((s) => s.display_id === String(display.id)) ?? list[0];
    if (!source?.thumbnail || source.thumbnail.isEmpty()) return null;

    return source.thumbnail.toJPEG(75).toString("base64");
  } catch (err) {
    console.warn("[replii] Screen capture failed:", err);
    return null;
  }
}

async function sampleBackdropLuminanceAsync(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<{ luminance: number; isDark: boolean }> {
  if (process.platform !== "darwin") {
    return { luminance: 0.6, isDark: false };
  }

  try {
    const display = screen.getDisplayNearestPoint({ x: rect.x, y: rect.y });
    const { width, height } = display.bounds;
    const list = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width, height },
    });

    const source =
      list.find((s) => s.display_id === String(display.id)) ?? list[0];
    if (!source?.thumbnail || source.thumbnail.isEmpty()) {
      return { luminance: 0.55, isDark: false };
    }

    const img = source.thumbnail;
    const bitmap = img.getBitmap();
    const w = img.getSize().width;
    const h = img.getSize().height;

    const relX = ((rect.x - display.bounds.x) / display.bounds.width) * w;
    const relY = ((rect.y - display.bounds.y) / display.bounds.height) * h;
    const relW = (rect.width / display.bounds.width) * w;
    const relH = (rect.height / display.bounds.height) * h;

    const x0 = Math.max(0, Math.floor(relX));
    const y0 = Math.max(0, Math.floor(relY));
    const x1 = Math.min(w - 1, Math.floor(relX + relW));
    const y1 = Math.min(h - 1, Math.floor(relY + relH));

    let sum = 0;
    let count = 0;
    for (let y = y0; y <= y1; y += 4) {
      for (let x = x0; x <= x1; x += 4) {
        const i = (y * w + x) * 4;
        const b = bitmap[i] ?? 0;
        const g = bitmap[i + 1] ?? 0;
        const r = bitmap[i + 2] ?? 0;
        sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        count += 1;
      }
    }

    const luminance = count ? sum / count / 255 : 0.5;
    return { luminance, isDark: luminance < 0.42 };
  } catch {
    return { luminance: 0.55, isDark: false };
  }
}

function micAppDisplayName(): string {
  return "Replii";
}

function createMicHelperWindow(): BrowserWindow {
  if (micHelperWindow) return micHelperWindow;

  micHelperWindow = new BrowserWindow({
    width: 420,
    height: 320,
    show: false,
    skipTaskbar: true,
    title: "Replii Microphone",
    backgroundColor: "#09090b",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  micHelperWindow.webContents.setBackgroundThrottling(false);

  loadRoute(micHelperWindow, "/mic-helper");

  micHelperWindow.on("closed", () => {
    micHelperWindow = null;
  });

  return micHelperWindow;
}

function showMicHelperWindow(): void {
  const win = createMicHelperWindow();
  win.show();
  win.focus();
  win.webContents.send("replii:request-mic-permission");
}

function hideMicHelperWindow(): void {
  micHelperWindow?.hide();
}

type PermissionKey = "accessibility" | "microphone" | "screen";

async function getPermissionStatus(): Promise<{
  accessibility: boolean;
  microphone: boolean;
  screen: boolean;
}> {
  if (process.platform !== "darwin") {
    return { accessibility: true, microphone: true, screen: true };
  }

  const mic = systemPreferences.getMediaAccessStatus("microphone");
  let screenGranted = systemPreferences.getMediaAccessStatus("screen") === "granted";

  if (screenGranted) {
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 1, height: 1 },
      });
      screenGranted = sources.length > 0;
    } catch {
      screenGranted = false;
    }
  }

  return {
    accessibility: systemPreferences.isTrustedAccessibilityClient(false),
    microphone: mic === "granted",
    screen: screenGranted,
  };
}

function openPermissionSettings(key: PermissionKey): void {
  if (process.platform === "win32") {
    const urls: Record<PermissionKey, string> = {
      accessibility: "ms-settings:privacy-accessibility",
      microphone: "ms-settings:privacy-microphone",
      screen: "ms-settings:privacy",
    };
    void shell.openExternal(urls[key]);
    return;
  }

  if (process.platform !== "darwin") return;

  const urls: Record<PermissionKey, string> = {
    accessibility:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
    microphone:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
    screen:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
  };

  if (key === "accessibility") {
    systemPreferences.isTrustedAccessibilityClient(true);
  } else if (key === "microphone") {
    void systemPreferences.askForMediaAccess("microphone");
  } else if (key === "screen") {
    void desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1, height: 1 },
    });
  }

  void shell.openExternal(urls[key]);
}

function setupMediaPermissions(): void {
  const ses = session.defaultSession;

  ses.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === "media" || permission === "display-capture");
  });

  ses.setPermissionCheckHandler((_webContents, permission) => {
    return permission === "media" || permission === "display-capture";
  });

  if (process.platform === "darwin") {
    ses.setDisplayMediaRequestHandler(
      async (_request, callback) => {
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 },
        });

        if (!sources.length) {
          callback({});
          return;
        }

        callback({
          video: sources[0],
          audio: "loopback",
        });
      },
      { useSystemPicker: false },
    );
  }
}

app.whenReady().then(async () => {
  setDockIcon();
  setupMediaPermissions();
  startOAuthLoopbackServer();
  const startupUrl = process.argv.find((arg) => arg.startsWith("replii://"));
  if (startupUrl) handleDeepLink(startupUrl);

  createDashboardWindow();
  createMicHelperWindow();
  registerShortcuts();

  ipcMain.handle("replii:ensure-microphone", async () => fixMicAccess());

  ipcMain.handle("replii:get-openai-key", () => loadOpenAIKey());

  ipcMain.handle("replii:get-api-base-url", () => loadBillingApiBase());

  ipcMain.handle(
    "replii:sample-backdrop",
    async (_event, rect: { x: number; y: number; width: number; height: number }) =>
      sampleBackdropLuminanceAsync(rect),
  );

  ipcMain.handle("replii:capture-screen", async () => capturePrimaryScreenJpeg());

  ipcMain.handle("replii:ensure-audio-setup", async () => true);

  ipcMain.handle("replii:get-mic-app-name", () => micAppDisplayName());

  ipcMain.handle("replii:show-mic-helper", () => {
    showMicHelperWindow();
    return true;
  });

  ipcMain.handle("replii:hide-mic-helper", () => {
    hideMicHelperWindow();
    return true;
  });

  ipcMain.on("replii:trigger-mock", () => {
    micHelperWindow?.webContents.send("replii:trigger-mock");
    dashboardWindow?.webContents.send("replii:trigger-mock");
  });

  ipcMain.on("replii:request-live-transcript", () => {
    micHelperWindow?.webContents.send("replii:request-live-transcript");
    dashboardWindow?.webContents.send("replii:request-live-transcript");
  });

  /** Prefer mic-helper as transcription source; dashboard only as fallback. */
  ipcMain.on("replii:live-transcript-push", (event, payload) => {
    const fromMicHelper =
      micHelperWindow &&
      !micHelperWindow.isDestroyed() &&
      event.sender.id === micHelperWindow.webContents.id;
    if (!fromMicHelper && micHelperWindow && !micHelperWindow.isDestroyed()) {
      return;
    }
    overlayWindow?.webContents.send("replii:live-transcript", payload);
    dashboardWindow?.webContents.send("replii:live-transcript", payload);
  });

  ipcMain.on("replii:session-listening", (_event, listening: boolean) => {
    micHelperWindow?.webContents.send("replii:session-listening", listening);
    dashboardWindow?.webContents.send("replii:session-listening", listening);
    overlayWindow?.webContents.send("replii:session-listening", listening);
  });

  ipcMain.on("replii:clear-live-transcript", () => {
    micHelperWindow?.webContents.send("replii:clear-live-transcript");
    dashboardWindow?.webContents.send("replii:clear-live-transcript");
  });

  ipcMain.on("replii:generate-meeting-summary", (_event, payload) => {
    createDashboardWindow();
    sendWhenReady(dashboardWindow, "replii:generate-meeting-summary", payload);
  });

  ipcMain.handle("replii:get-settings", () => ({
    contentProtection,
    platform: process.platform,
    sessionActive,
    useCallAudio: consumeCallAudioSetupFlag(),
  }));

  ipcMain.handle(
    "replii:set-content-protection",
    (_event, enabled: boolean, plan?: string) => {
      const limits = readPlanLimits();
      const activePlan = plan ?? limits.plan;

      if (plan && plan !== limits.plan) {
        writePlanLimits({ ...limits, plan });
      }

      if (enabled && activePlan !== "undetectable") {
        enabled = false;
      }

      contentProtection = enabled;
      overlayWindow?.setContentProtection(enabled);
      return contentProtection;
    },
  );

  ipcMain.handle("replii:resize", (_event, width: number, height: number) => {
    if (!overlayWindow || overlayMode === "active") return;
    overlayWindow.setSize(Math.round(width), Math.round(height), false);
    repositionOverlayBottomCenter();
  });

  ipcMain.handle("replii:set-overlay-mode", (_event, mode: OverlayMode) => {
    setOverlayMode(mode);
  });

  ipcMain.handle("replii:overlay-ready", () => {
    if (overlayPendingShow) revealOverlay();
    if (sessionActive) {
      sendWhenReady(overlayWindow, "replii:session-started");
      sendWhenReady(micHelperWindow, "replii:session-started");
    }
  });

  ipcMain.handle(
    "replii:set-ignore-mouse-events",
    (_event, ignore: boolean, options?: { forward?: boolean }) => {
      if (!overlayWindow) return;
      if (ignore) {
        overlayWindow.setIgnoreMouseEvents(true, { forward: options?.forward ?? true });
      } else {
        overlayWindow.setIgnoreMouseEvents(false);
      }
    },
  );

  ipcMain.handle("replii:move-by", (_event, dx: number, dy: number) => {
    moveOverlay(dx, dy);
  });

  ipcMain.handle("replii:hide", () => hideOverlay());

  ipcMain.handle("replii:show", () => showOverlay());

  ipcMain.handle("replii:trigger-shortcut-toggle", () => {
    handleHideShowShortcut();
    return true;
  });

  ipcMain.handle("replii:get-displays", () =>
    screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      label: `Display ${i + 1}`,
      bounds: d.bounds,
    })),
  );

  ipcMain.handle("replii:move-to-display", (_event, displayId: number) => {
    const display = screen.getAllDisplays().find((d) => d.id === displayId);
    if (!display || !overlayWindow) return false;
    overlayWindow.setPosition(display.bounds.x + 24, display.bounds.y + 48);
    return true;
  });

  ipcMain.handle("replii:start-session", async () => {
    if (sessionActive) {
      createDashboardWindow();
      createOverlayWindow();
      showOverlay();
      dashboardWindow?.show();
      dashboardWindow?.focus();
      return true;
    }

    const limits = readPlanLimits();
    if (!canStartSessionFromLimits(limits)) {
      return false;
    }

    const micGranted = await requestMicAccess();
    sessionActive = true;
    createDashboardWindow();
    createMicHelperWindow();
    dashboardWindow?.show();
    dashboardWindow?.focus();
    createOverlayWindow();
    // Stay in pill mode until the overlay renderer activates listening and
    // switches to active mode — fullscreen transparent windows with no UI
    // corrupt macOS compositing and show garbled text over the dashboard.
    showOverlay();
    sendWhenReady(micHelperWindow, "replii:session-started");
    sendWhenReady(dashboardWindow, "replii:session-started");
    sendWhenReady(overlayWindow, "replii:session-started");
    micHelperWindow?.webContents.setBackgroundThrottling(false);
    dashboardWindow?.webContents.setBackgroundThrottling(false);
    if (!micGranted) {
      showMicHelperWindow();
    }
    return true;
  });

  ipcMain.handle("replii:stop-session", () => {
    sessionActive = false;
    overlayMode = "pill";
    closeOverlay();
    micHelperWindow?.webContents.send("replii:session-stopped");
    dashboardWindow?.webContents.send("replii:session-stopped");
    return true;
  });

  ipcMain.handle("replii:request-end-session", () => {
    sendWhenReady(overlayWindow, "replii:request-end-session");
    return true;
  });

  ipcMain.handle("replii:open-dashboard", () => {
    createDashboardWindow();
    return true;
  });

  ipcMain.handle("replii:toggle-dashboard", () => {
    if (dashboardWindow?.isVisible()) {
      dashboardWindow.hide();
      return false;
    }
    createDashboardWindow();
    return true;
  });

  ipcMain.handle("replii:focus-dashboard", (_event, path?: string) => {
    createDashboardWindow();
    if (path) sendWhenReady(dashboardWindow, "replii:navigate", path);
    dashboardWindow?.show();
    dashboardWindow?.focus();
    if (process.platform === "darwin") {
      app.dock?.show();
    }
    return true;
  });

  ipcMain.handle("replii:notify-store-changed", () => {
    dashboardWindow?.webContents.send("replii:store-changed");
    overlayWindow?.webContents.send("replii:store-changed");
    return true;
  });

  ipcMain.handle(
    "replii:sync-plan-limits",
    (_event, state: PlanLimitsState) => {
      writePlanLimits({
        plan: state.plan ?? "free",
        freeOverlaySecondsUsed: Math.max(0, state.freeOverlaySecondsUsed ?? 0),
      });
      return true;
    },
  );

  ipcMain.handle("replii:quit", () => {
    app.quit();
  });

  ipcMain.handle("replii:open-external", (_event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle("replii:get-permission-status", () => getPermissionStatus());

  ipcMain.handle("replii:open-permission-settings", (_event, key: PermissionKey) => {
    openPermissionSettings(key);
    return true;
  });

  ipcMain.handle(
    "replii:set-dashboard-layout",
    (_event, layout: "onboarding" | "dashboard" | "paywall") => {
      if (!dashboardWindow) return false;
      if (layout === "onboarding") {
        dashboardWindow.setMinimumSize(800, 560);
        dashboardWindow.setSize(1000, 660, true);
        dashboardWindow.setBackgroundColor("#0a0a0a");
      } else if (layout === "paywall") {
        dashboardWindow.setMinimumSize(800, 640);
        dashboardWindow.setSize(1000, 760, true);
        dashboardWindow.setBackgroundColor("#f5f5f7");
      } else {
        dashboardWindow.setMinimumSize(960, 640);
        dashboardWindow.setSize(1180, 780, true);
        dashboardWindow.setBackgroundColor("#ffffff");
      }
      return true;
    },
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDashboardWindow();
    } else {
      dashboardWindow?.show();
    }
  });
});

// Handle deep links: replii://auth/callback, replii://billing/success, replii://open, etc.
function handleDeepLink(url: string) {
  if (!url.startsWith("replii://")) return;
  const path = url.slice("replii://".length).split("?")[0]?.replace(/\/$/, "") ?? "";
  if (path.startsWith("billing/")) {
    sendWhenReady(dashboardWindow, "replii:billing-callback", url);
  } else if (path.startsWith("auth/")) {
    sendWhenReady(dashboardWindow, "replii:auth-callback", url);
  }
  if (!dashboardWindow) createDashboardWindow();
  else {
    dashboardWindow.show();
    if (dashboardWindow.isMinimized()) dashboardWindow.restore();
    dashboardWindow.focus();
  }
}

// macOS: open-url fired when app is already running
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux: second instance carries the URL as argv
app.on("second-instance", (_event, argv) => {
  const url = argv.find((a) => a.startsWith("replii://"));
  if (url) handleDeepLink(url);
  if (process.platform === "darwin") app.dock?.show();
  if (dashboardWindow) {
    dashboardWindow.show();
    if (dashboardWindow.isMinimized()) dashboardWindow.restore();
    dashboardWindow.focus();
    return;
  }
  createDashboardWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

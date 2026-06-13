import {
  app,
  BrowserWindow,
  desktopCapturer,
  globalShortcut,
  ipcMain,
  screen,
  session,
  shell,
  systemPreferences,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

app.setName("Ghost");

// Register custom protocol for OAuth callbacks (ghost://auth/callback)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("ghost", process.execPath, [
      path.resolve(process.argv[1] ?? ""),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("ghost");
}

let dashboardWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let micHelperWindow: BrowserWindow | null = null;
let isOverlayHidden = false;
let overlayPendingShow = false;
let contentProtection = true;
let sessionActive = false;

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

function runGhostAudioSetup(): boolean {
  if (process.platform !== "darwin") return true;

  const candidates = [
    path.join(app.getAppPath(), "scripts/setup-ghost-audio.swift"),
    path.join(__dirname, "../../scripts/setup-ghost-audio.swift"),
  ];
  const scriptPath = candidates.find((p) => fs.existsSync(p));
  if (!scriptPath) return false;

  const result = spawnSync("swift", [scriptPath], { encoding: "utf8" });
  if (result.status === 0) {
    console.log("[ghost] Audio routing ready");
    return true;
  }

  console.warn("[ghost] Audio setup:", result.stderr || result.stdout);
  return false;
}

const isDev = !!process.env.ELECTRON_RENDERER_URL;

function getRendererUrl(route: string): string {
  if (isDev) {
    return `${process.env.ELECTRON_RENDERER_URL}#${route}`;
  }
  return path.join(__dirname, "../renderer/index.html");
}

function loadRoute(win: BrowserWindow, route: string): void {
  if (isDev) {
    win.loadURL(getRendererUrl(route));
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"), {
      hash: route.replace(/^\//, ""),
    });
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
    title: "Ghost",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: "#ffffff",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  dashboardWindow.once("ready-to-show", () => {
    dashboardWindow?.center();
    dashboardWindow?.show();
    dashboardWindow?.focus();
    if (process.platform === "darwin") {
      app.dock?.show();
    }
  });

  loadRoute(dashboardWindow, "/");

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
    },
  });

  overlayWindow.setContentProtection(contentProtection);
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, "screen-saver", 1);

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
  overlayWindow.webContents.send("ghost:visibility", true);
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
  overlayWindow?.webContents.send("ghost:visibility", false);
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

  dashboardWindow?.webContents.send("ghost:shortcut-toggle");

  if (!overlayWindow || !sessionActive) return;
  overlayWindow.webContents.send("ghost:shortcut-toggle");
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
      `[ghost] Failed to register global shortcut: ${hideShowAccelerator}`,
    );
  }

  globalShortcut.register("CommandOrControl+Enter", () => {
    if (sessionActive) overlayWindow?.webContents.send("ghost:assist");
  });

  globalShortcut.register("CommandOrControl+Left", () => {
    moveOverlay(-40, 0);
  });

  globalShortcut.register("CommandOrControl+Right", () => {
    moveOverlay(40, 0);
  });

  globalShortcut.register("CommandOrControl+R", () => {
    if (sessionActive) overlayWindow?.webContents.send("ghost:clear-session");
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
  dashboardWindow?.webContents.send("ghost:mic-granted");
  overlayWindow?.webContents.send("ghost:mic-granted");
  micHelperWindow?.webContents.send("ghost:mic-granted");
  return true;
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
  return "Ghost";
}

function createMicHelperWindow(): BrowserWindow {
  if (micHelperWindow) return micHelperWindow;

  micHelperWindow = new BrowserWindow({
    width: 420,
    height: 320,
    show: false,
    skipTaskbar: true,
    title: "Ghost Microphone",
    backgroundColor: "#09090b",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

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
  win.webContents.send("ghost:request-mic-permission");
}

function hideMicHelperWindow(): void {
  micHelperWindow?.hide();
}

type PermissionKey = "accessibility" | "microphone" | "screen";

function getPermissionStatus(): {
  accessibility: boolean;
  microphone: boolean;
  screen: boolean;
} {
  if (process.platform !== "darwin") {
    return { accessibility: true, microphone: true, screen: true };
  }

  const mic = systemPreferences.getMediaAccessStatus("microphone");
  const screenStatus = systemPreferences.getMediaAccessStatus("screen");

  return {
    accessibility: systemPreferences.isTrustedAccessibilityClient(false),
    microphone: mic === "granted",
    screen: screenStatus === "granted",
  };
}

function openPermissionSettings(key: PermissionKey): void {
  if (process.platform !== "darwin") return;

  const urls: Record<PermissionKey, string> = {
    accessibility:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
    microphone:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
    screen:
      "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
  };

  if (key === "microphone") {
    void systemPreferences.askForMediaAccess("microphone");
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
      { useSystemPicker: true },
    );
  }
}

app.whenReady().then(async () => {
  setupMediaPermissions();
  const startupUrl = process.argv.find((arg) => arg.startsWith("ghost://"));
  if (startupUrl) handleDeepLink(startupUrl);

  await requestMicAccess();
  createDashboardWindow();
  createMicHelperWindow();
  registerShortcuts();

  ipcMain.handle("ghost:ensure-microphone", async () => fixMicAccess());

  ipcMain.handle(
    "ghost:sample-backdrop",
    async (_event, rect: { x: number; y: number; width: number; height: number }) =>
      sampleBackdropLuminanceAsync(rect),
  );

  ipcMain.handle("ghost:ensure-audio-setup", async () => true);

  ipcMain.handle("ghost:get-mic-app-name", () => micAppDisplayName());

  ipcMain.handle("ghost:show-mic-helper", () => {
    showMicHelperWindow();
    return true;
  });

  ipcMain.handle("ghost:hide-mic-helper", () => {
    hideMicHelperWindow();
    return true;
  });

  ipcMain.on("ghost:trigger-mock", () => {
    dashboardWindow?.webContents.send("ghost:trigger-mock");
  });

  ipcMain.on("ghost:live-transcript-push", (_event, payload) => {
    overlayWindow?.webContents.send("ghost:live-transcript", payload);
  });

  ipcMain.on("ghost:session-listening", (_event, listening: boolean) => {
    dashboardWindow?.webContents.send("ghost:session-listening", listening);
    overlayWindow?.webContents.send("ghost:session-listening", listening);
  });

  ipcMain.on("ghost:clear-live-transcript", () => {
    dashboardWindow?.webContents.send("ghost:clear-live-transcript");
  });

  ipcMain.on("ghost:generate-meeting-summary", (_event, payload) => {
    dashboardWindow?.webContents.send("ghost:generate-meeting-summary", payload);
  });

  ipcMain.handle("ghost:get-settings", () => ({
    contentProtection,
    platform: process.platform,
    sessionActive,
    useCallAudio: consumeCallAudioSetupFlag(),
  }));

  ipcMain.handle("ghost:set-content-protection", (_event, enabled: boolean) => {
    contentProtection = enabled;
    overlayWindow?.setContentProtection(enabled);
    return contentProtection;
  });

  ipcMain.handle("ghost:resize", (_event, width: number, height: number) => {
    if (!overlayWindow || overlayMode === "active") return;
    overlayWindow.setSize(Math.round(width), Math.round(height), false);
    repositionOverlayBottomCenter();
  });

  ipcMain.handle("ghost:set-overlay-mode", (_event, mode: OverlayMode) => {
    setOverlayMode(mode);
  });

  ipcMain.handle("ghost:overlay-ready", () => {
    if (overlayPendingShow) revealOverlay();
    if (sessionActive) {
      overlayWindow?.webContents.send("ghost:session-started");
    }
  });

  ipcMain.handle(
    "ghost:set-ignore-mouse-events",
    (_event, ignore: boolean, options?: { forward?: boolean }) => {
      if (!overlayWindow) return;
      if (ignore) {
        overlayWindow.setIgnoreMouseEvents(true, { forward: options?.forward ?? true });
      } else {
        overlayWindow.setIgnoreMouseEvents(false);
      }
    },
  );

  ipcMain.handle("ghost:move-by", (_event, dx: number, dy: number) => {
    moveOverlay(dx, dy);
  });

  ipcMain.handle("ghost:hide", () => hideOverlay());

  ipcMain.handle("ghost:show", () => showOverlay());

  ipcMain.handle("ghost:get-displays", () =>
    screen.getAllDisplays().map((d, i) => ({
      id: d.id,
      label: `Display ${i + 1}`,
      bounds: d.bounds,
    })),
  );

  ipcMain.handle("ghost:move-to-display", (_event, displayId: number) => {
    const display = screen.getAllDisplays().find((d) => d.id === displayId);
    if (!display || !overlayWindow) return false;
    overlayWindow.setPosition(display.bounds.x + 24, display.bounds.y + 48);
    return true;
  });

  ipcMain.handle("ghost:start-session", async () => {
    const micGranted = await requestMicAccess();
    sessionActive = true;
    createDashboardWindow();
    createMicHelperWindow();
    dashboardWindow?.show();
    dashboardWindow?.focus();
    createOverlayWindow();
    setOverlayMode("active");
    showOverlay();
    micHelperWindow?.webContents.send("ghost:session-started");
    dashboardWindow?.webContents.send("ghost:session-started");
    overlayWindow?.webContents.send("ghost:session-started");
    if (!micGranted) {
      showMicHelperWindow();
    }
    return true;
  });

  ipcMain.handle("ghost:stop-session", () => {
    sessionActive = false;
    overlayMode = "pill";
    closeOverlay();
    dashboardWindow?.webContents.send("ghost:session-stopped");
    return true;
  });

  ipcMain.handle("ghost:open-dashboard", () => {
    createDashboardWindow();
    return true;
  });

  ipcMain.handle("ghost:focus-dashboard", (_event, path?: string) => {
    createDashboardWindow();
    if (path) dashboardWindow?.webContents.send("ghost:navigate", path);
    return true;
  });

  ipcMain.handle("ghost:notify-store-changed", () => {
    dashboardWindow?.webContents.send("ghost:store-changed");
    overlayWindow?.webContents.send("ghost:store-changed");
    return true;
  });

  ipcMain.handle("ghost:quit", () => {
    app.quit();
  });

  ipcMain.handle("ghost:open-external", (_event, url: string) => {
    void shell.openExternal(url);
  });

  ipcMain.handle("ghost:get-permission-status", () => getPermissionStatus());

  ipcMain.handle("ghost:open-permission-settings", (_event, key: PermissionKey) => {
    openPermissionSettings(key);
    return true;
  });

  ipcMain.handle(
    "ghost:set-dashboard-layout",
    (_event, layout: "onboarding" | "dashboard") => {
      if (!dashboardWindow) return false;
      if (layout === "onboarding") {
        dashboardWindow.setMinimumSize(800, 560);
        dashboardWindow.setSize(1000, 660, true);
        dashboardWindow.setBackgroundColor("#0a0a0a");
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

// Handle OAuth deep link callback: ghost://auth/callback#access_token=...
function handleDeepLink(url: string) {
  if (!url.startsWith("ghost://")) return;
  dashboardWindow?.webContents.send("ghost:auth-callback", url);
}

// macOS: open-url fired when app is already running
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Windows/Linux: second instance carries the URL as argv
app.on("second-instance", (_event, argv) => {
  const url = argv.find((a) => a.startsWith("ghost://"));
  if (url) handleDeepLink(url);
  if (dashboardWindow) {
    if (dashboardWindow.isMinimized()) dashboardWindow.restore();
    dashboardWindow.focus();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

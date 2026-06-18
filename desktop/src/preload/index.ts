import { contextBridge, desktopCapturer, ipcRenderer } from "electron";

export interface LiveTranscriptPayload {
  lines: Array<{
    id: string;
    speaker: "You" | "Prospect" | "Other";
    text: string;
    timestamp: number;
  }>;
  interim: string;
  error: string | null;
  hearingAudio: boolean;
  isSpeaking?: boolean;
  hasMic: boolean;
  hasSystemAudio: boolean;
  aiReady: boolean;
  audioSource: "desktop-capture" | "microphone" | null;
  isDemo?: boolean;
}

export interface GhostAPI {
  getSettings: () => Promise<{
    contentProtection: boolean;
    platform: string;
    sessionActive: boolean;
    useCallAudio?: boolean;
  }>;
  setContentProtection: (enabled: boolean, plan?: string) => Promise<boolean>;
  resize: (width: number, height: number) => Promise<void>;
  setOverlayMode: (mode: "pill" | "active") => Promise<void>;
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward?: boolean }) => Promise<void>;
  ready: () => Promise<void>;
  moveBy: (dx: number, dy: number) => Promise<void>;
  hide: () => Promise<void>;
  show: () => Promise<void>;
  getDisplays: () => Promise<
    Array<{
      id: number;
      label: string;
      bounds: { x: number; y: number; width: number; height: number };
    }>
  >;
  moveToDisplay: (displayId: number) => Promise<boolean>;
  startSession: () => Promise<boolean>;
  stopSession: () => Promise<boolean>;
  openDashboard: () => Promise<boolean>;
  toggleDashboard: () => Promise<boolean>;
  focusDashboard: (path?: string) => Promise<boolean>;
  quit: () => Promise<void>;
  getPermissionStatus: () => Promise<{
    accessibility: boolean;
    microphone: boolean;
    screen: boolean;
  }>;
  openPermissionSettings: (
    key: "accessibility" | "microphone" | "screen",
  ) => Promise<boolean>;
  setDashboardLayout: (layout: "onboarding" | "dashboard" | "paywall") => Promise<boolean>;
  onAssist: (callback: () => void) => () => void;
  onClearSession: (callback: () => void) => () => void;
  onVisibility: (callback: (visible: boolean) => void) => () => void;
  onShortcutToggle: (callback: () => void) => () => void;
  triggerShortcutToggle: () => Promise<boolean>;
  onSessionStarted: (callback: () => void) => () => void;
  onSessionStopped: (callback: () => void) => () => void;
  onNavigate: (callback: (path: string) => void) => () => void;
  onStoreChanged: (callback: () => void) => () => void;
  notifyStoreChanged: () => Promise<boolean>;
  syncPlanLimits: (state: {
    plan: string;
    freeSessionsUsed: number;
  }) => Promise<boolean>;
  onAuthCallback?: (callback: (url: string) => void) => () => void;
  onBillingCallback?: (callback: (url: string) => void) => () => void;
  openExternal?: (url: string) => Promise<void>;
  getDesktopAudioSources: () => Promise<Array<{ id: string; name: string }>>;
  ensureMicrophone: () => Promise<boolean>;
  getOpenAIKey: () => Promise<string | undefined>;
  onMicGranted: (callback: () => void) => () => void;
  sampleBackdrop: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Promise<{ luminance: number; isDark: boolean }>;
  captureScreen: () => Promise<string | null>;
  triggerMock: () => void;
  onTriggerMock: (callback: () => void) => () => void;
  ensureAudioSetup: () => Promise<boolean>;
  getMicAppName: () => Promise<string>;
  showMicHelper: () => Promise<boolean>;
  hideMicHelper: () => Promise<boolean>;
  onRequestMicPermission: (callback: () => void) => () => void;
  pushLiveTranscript: (state: LiveTranscriptPayload) => void;
  onLiveTranscript: (callback: (state: LiveTranscriptPayload) => void) => () => void;
  requestLiveTranscript: () => void;
  onRequestLiveTranscript: (callback: () => void) => () => void;
  setSessionListening: (listening: boolean) => void;
  onSessionListening: (callback: (listening: boolean) => void) => () => void;
  onClearLiveTranscript: (callback: () => void) => () => void;
  clearLiveTranscript: () => void;
  requestMeetingSummary: (payload: {
    meetingId: string;
    transcript: LiveTranscriptPayload["lines"];
  }) => void;
  onGenerateMeetingSummary: (
    callback: (payload: {
      meetingId: string;
      transcript: LiveTranscriptPayload["lines"];
    }) => void | Promise<void>,
  ) => () => void;
}

const ghostAPI: GhostAPI = {
  syncPlanLimits: (state: { plan: string; freeSessionsUsed: number }) =>
    ipcRenderer.invoke("ghost:sync-plan-limits", state),
  getSettings: () => ipcRenderer.invoke("ghost:get-settings"),
  setContentProtection: (enabled, plan) =>
    ipcRenderer.invoke("ghost:set-content-protection", enabled, plan),
  resize: (width, height) => ipcRenderer.invoke("ghost:resize", width, height),
  setOverlayMode: (mode) => ipcRenderer.invoke("ghost:set-overlay-mode", mode),
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.invoke("ghost:set-ignore-mouse-events", ignore, options),
  ready: () => ipcRenderer.invoke("ghost:overlay-ready"),
  moveBy: (dx, dy) => ipcRenderer.invoke("ghost:move-by", dx, dy),
  hide: () => ipcRenderer.invoke("ghost:hide"),
  show: () => ipcRenderer.invoke("ghost:show"),
  getDisplays: () => ipcRenderer.invoke("ghost:get-displays"),
  moveToDisplay: (displayId) =>
    ipcRenderer.invoke("ghost:move-to-display", displayId),
  startSession: () => ipcRenderer.invoke("ghost:start-session"),
  stopSession: () => ipcRenderer.invoke("ghost:stop-session"),
  openDashboard: () => ipcRenderer.invoke("ghost:open-dashboard"),
  toggleDashboard: () => ipcRenderer.invoke("ghost:toggle-dashboard"),
  focusDashboard: (path) => ipcRenderer.invoke("ghost:focus-dashboard", path),
  quit: () => ipcRenderer.invoke("ghost:quit"),
  getPermissionStatus: () => ipcRenderer.invoke("ghost:get-permission-status"),
  openPermissionSettings: (key) =>
    ipcRenderer.invoke("ghost:open-permission-settings", key),
  setDashboardLayout: (layout) =>
    ipcRenderer.invoke("ghost:set-dashboard-layout", layout),
  onAssist: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:assist", handler);
    return () => ipcRenderer.removeListener("ghost:assist", handler);
  },
  onClearSession: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:clear-session", handler);
    return () => ipcRenderer.removeListener("ghost:clear-session", handler);
  },
  onVisibility: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, visible: boolean) =>
      callback(visible);
    ipcRenderer.on("ghost:visibility", handler);
    return () => ipcRenderer.removeListener("ghost:visibility", handler);
  },
  onShortcutToggle: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:shortcut-toggle", handler);
    return () => ipcRenderer.removeListener("ghost:shortcut-toggle", handler);
  },
  triggerShortcutToggle: () =>
    ipcRenderer.invoke("ghost:trigger-shortcut-toggle"),
  onSessionStarted: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:session-started", handler);
    return () => ipcRenderer.removeListener("ghost:session-started", handler);
  },
  onSessionStopped: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:session-stopped", handler);
    return () => ipcRenderer.removeListener("ghost:session-stopped", handler);
  },
  onNavigate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, path: string) =>
      callback(path);
    ipcRenderer.on("ghost:navigate", handler);
    return () => ipcRenderer.removeListener("ghost:navigate", handler);
  },
  onStoreChanged: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:store-changed", handler);
    return () => ipcRenderer.removeListener("ghost:store-changed", handler);
  },
  notifyStoreChanged: () => ipcRenderer.invoke("ghost:notify-store-changed"),
  openExternal: (url) => ipcRenderer.invoke("ghost:open-external", url),
  getDesktopAudioSources: async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1, height: 1 },
    });
    return sources.map(({ id, name }) => ({ id, name }));
  },
  ensureMicrophone: () => ipcRenderer.invoke("ghost:ensure-microphone"),
  getOpenAIKey: () => ipcRenderer.invoke("ghost:get-openai-key"),
  onMicGranted: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:mic-granted", handler);
    return () => ipcRenderer.removeListener("ghost:mic-granted", handler);
  },
  sampleBackdrop: (rect) => ipcRenderer.invoke("ghost:sample-backdrop", rect),
  captureScreen: () => ipcRenderer.invoke("ghost:capture-screen"),
  triggerMock: () => {
    ipcRenderer.send("ghost:trigger-mock");
  },
  onTriggerMock: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:trigger-mock", handler);
    return () => ipcRenderer.removeListener("ghost:trigger-mock", handler);
  },
  ensureAudioSetup: () => ipcRenderer.invoke("ghost:ensure-audio-setup"),
  getMicAppName: () => ipcRenderer.invoke("ghost:get-mic-app-name"),
  showMicHelper: () => ipcRenderer.invoke("ghost:show-mic-helper"),
  hideMicHelper: () => ipcRenderer.invoke("ghost:hide-mic-helper"),
  onRequestMicPermission: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:request-mic-permission", handler);
    return () => ipcRenderer.removeListener("ghost:request-mic-permission", handler);
  },
  pushLiveTranscript: (state) => {
    ipcRenderer.send("ghost:live-transcript-push", state);
  },
  onLiveTranscript: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, state: LiveTranscriptPayload) =>
      callback(state);
    ipcRenderer.on("ghost:live-transcript", handler);
    return () => ipcRenderer.removeListener("ghost:live-transcript", handler);
  },
  requestLiveTranscript: () => {
    ipcRenderer.send("ghost:request-live-transcript");
  },
  onRequestLiveTranscript: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:request-live-transcript", handler);
    return () => ipcRenderer.removeListener("ghost:request-live-transcript", handler);
  },
  setSessionListening: (listening) => {
    ipcRenderer.send("ghost:session-listening", listening);
  },
  onSessionListening: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, listening: boolean) =>
      callback(listening);
    ipcRenderer.on("ghost:session-listening", handler);
    return () => ipcRenderer.removeListener("ghost:session-listening", handler);
  },
  onClearLiveTranscript: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("ghost:clear-live-transcript", handler);
    return () => ipcRenderer.removeListener("ghost:clear-live-transcript", handler);
  },
  clearLiveTranscript: () => {
    ipcRenderer.send("ghost:clear-live-transcript");
  },
  requestMeetingSummary: (payload) => {
    ipcRenderer.send("ghost:generate-meeting-summary", payload);
  },
  onGenerateMeetingSummary: (callback) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: { meetingId: string; transcript: LiveTranscriptPayload["lines"] },
    ) => {
      void callback(payload);
    };
    ipcRenderer.on("ghost:generate-meeting-summary", handler);
    return () => ipcRenderer.removeListener("ghost:generate-meeting-summary", handler);
  },
  onAuthCallback: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, url: string) =>
      callback(url);
    ipcRenderer.on("ghost:auth-callback", handler);
    return () => ipcRenderer.removeListener("ghost:auth-callback", handler);
  },
  onBillingCallback: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, url: string) =>
      callback(url);
    ipcRenderer.on("ghost:billing-callback", handler);
    return () => ipcRenderer.removeListener("ghost:billing-callback", handler);
  },
};

contextBridge.exposeInMainWorld("ghost", ghostAPI);

declare global {
  interface Window {
    ghost: GhostAPI;
  }
}

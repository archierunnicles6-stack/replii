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

export interface RepliiAPI {
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
  requestEndSession: () => Promise<boolean>;
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
  onRequestEndSession: (callback: () => void) => () => void;
  onNavigate: (callback: (path: string) => void) => () => void;
  onStoreChanged: (callback: () => void) => () => void;
  notifyStoreChanged: () => Promise<boolean>;
  syncPlanLimits: (state: {
    plan: string;
    freeOverlaySecondsUsed: number;
  }) => Promise<boolean>;
  onAuthCallback?: (callback: (url: string) => void) => () => void;
  onBillingCallback?: (callback: (url: string) => void) => () => void;
  openExternal?: (url: string) => Promise<void>;
  getDesktopAudioSources: () => Promise<Array<{ id: string; name: string }>>;
  ensureMicrophone: () => Promise<boolean>;
  getOpenAIKey: () => Promise<string | undefined>;
  getApiBaseUrl: () => Promise<string>;
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

const repliiAPI: RepliiAPI = {
  syncPlanLimits: (state: { plan: string; freeOverlaySecondsUsed: number }) =>
    ipcRenderer.invoke("replii:sync-plan-limits", state),
  getSettings: () => ipcRenderer.invoke("replii:get-settings"),
  setContentProtection: (enabled, plan) =>
    ipcRenderer.invoke("replii:set-content-protection", enabled, plan),
  resize: (width, height) => ipcRenderer.invoke("replii:resize", width, height),
  setOverlayMode: (mode) => ipcRenderer.invoke("replii:set-overlay-mode", mode),
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.invoke("replii:set-ignore-mouse-events", ignore, options),
  ready: () => ipcRenderer.invoke("replii:overlay-ready"),
  moveBy: (dx, dy) => ipcRenderer.invoke("replii:move-by", dx, dy),
  hide: () => ipcRenderer.invoke("replii:hide"),
  show: () => ipcRenderer.invoke("replii:show"),
  getDisplays: () => ipcRenderer.invoke("replii:get-displays"),
  moveToDisplay: (displayId) =>
    ipcRenderer.invoke("replii:move-to-display", displayId),
  startSession: () => ipcRenderer.invoke("replii:start-session"),
  stopSession: () => ipcRenderer.invoke("replii:stop-session"),
  requestEndSession: () => ipcRenderer.invoke("replii:request-end-session"),
  openDashboard: () => ipcRenderer.invoke("replii:open-dashboard"),
  toggleDashboard: () => ipcRenderer.invoke("replii:toggle-dashboard"),
  focusDashboard: (path) => ipcRenderer.invoke("replii:focus-dashboard", path),
  quit: () => ipcRenderer.invoke("replii:quit"),
  getPermissionStatus: () => ipcRenderer.invoke("replii:get-permission-status"),
  openPermissionSettings: (key) =>
    ipcRenderer.invoke("replii:open-permission-settings", key),
  setDashboardLayout: (layout) =>
    ipcRenderer.invoke("replii:set-dashboard-layout", layout),
  onAssist: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:assist", handler);
    return () => ipcRenderer.removeListener("replii:assist", handler);
  },
  onClearSession: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:clear-session", handler);
    return () => ipcRenderer.removeListener("replii:clear-session", handler);
  },
  onVisibility: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, visible: boolean) =>
      callback(visible);
    ipcRenderer.on("replii:visibility", handler);
    return () => ipcRenderer.removeListener("replii:visibility", handler);
  },
  onShortcutToggle: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:shortcut-toggle", handler);
    return () => ipcRenderer.removeListener("replii:shortcut-toggle", handler);
  },
  triggerShortcutToggle: () =>
    ipcRenderer.invoke("replii:trigger-shortcut-toggle"),
  onSessionStarted: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:session-started", handler);
    return () => ipcRenderer.removeListener("replii:session-started", handler);
  },
  onSessionStopped: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:session-stopped", handler);
    return () => ipcRenderer.removeListener("replii:session-stopped", handler);
  },
  onRequestEndSession: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:request-end-session", handler);
    return () => ipcRenderer.removeListener("replii:request-end-session", handler);
  },
  onNavigate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, path: string) =>
      callback(path);
    ipcRenderer.on("replii:navigate", handler);
    return () => ipcRenderer.removeListener("replii:navigate", handler);
  },
  onStoreChanged: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:store-changed", handler);
    return () => ipcRenderer.removeListener("replii:store-changed", handler);
  },
  notifyStoreChanged: () => ipcRenderer.invoke("replii:notify-store-changed"),
  openExternal: (url) => ipcRenderer.invoke("replii:open-external", url),
  getDesktopAudioSources: async () => {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1, height: 1 },
    });
    return sources.map(({ id, name }) => ({ id, name }));
  },
  ensureMicrophone: () => ipcRenderer.invoke("replii:ensure-microphone"),
  getOpenAIKey: () => ipcRenderer.invoke("replii:get-openai-key"),
  getApiBaseUrl: () => ipcRenderer.invoke("replii:get-api-base-url"),
  onMicGranted: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:mic-granted", handler);
    return () => ipcRenderer.removeListener("replii:mic-granted", handler);
  },
  sampleBackdrop: (rect) => ipcRenderer.invoke("replii:sample-backdrop", rect),
  captureScreen: () => ipcRenderer.invoke("replii:capture-screen"),
  triggerMock: () => {
    ipcRenderer.send("replii:trigger-mock");
  },
  onTriggerMock: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:trigger-mock", handler);
    return () => ipcRenderer.removeListener("replii:trigger-mock", handler);
  },
  ensureAudioSetup: () => ipcRenderer.invoke("replii:ensure-audio-setup"),
  getMicAppName: () => ipcRenderer.invoke("replii:get-mic-app-name"),
  showMicHelper: () => ipcRenderer.invoke("replii:show-mic-helper"),
  hideMicHelper: () => ipcRenderer.invoke("replii:hide-mic-helper"),
  onRequestMicPermission: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:request-mic-permission", handler);
    return () => ipcRenderer.removeListener("replii:request-mic-permission", handler);
  },
  pushLiveTranscript: (state) => {
    ipcRenderer.send("replii:live-transcript-push", state);
  },
  onLiveTranscript: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, state: LiveTranscriptPayload) =>
      callback(state);
    ipcRenderer.on("replii:live-transcript", handler);
    return () => ipcRenderer.removeListener("replii:live-transcript", handler);
  },
  requestLiveTranscript: () => {
    ipcRenderer.send("replii:request-live-transcript");
  },
  onRequestLiveTranscript: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:request-live-transcript", handler);
    return () => ipcRenderer.removeListener("replii:request-live-transcript", handler);
  },
  setSessionListening: (listening) => {
    ipcRenderer.send("replii:session-listening", listening);
  },
  onSessionListening: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, listening: boolean) =>
      callback(listening);
    ipcRenderer.on("replii:session-listening", handler);
    return () => ipcRenderer.removeListener("replii:session-listening", handler);
  },
  onClearLiveTranscript: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("replii:clear-live-transcript", handler);
    return () => ipcRenderer.removeListener("replii:clear-live-transcript", handler);
  },
  clearLiveTranscript: () => {
    ipcRenderer.send("replii:clear-live-transcript");
  },
  requestMeetingSummary: (payload) => {
    ipcRenderer.send("replii:generate-meeting-summary", payload);
  },
  onGenerateMeetingSummary: (callback) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      payload: { meetingId: string; transcript: LiveTranscriptPayload["lines"] },
    ) => {
      void callback(payload);
    };
    ipcRenderer.on("replii:generate-meeting-summary", handler);
    return () => ipcRenderer.removeListener("replii:generate-meeting-summary", handler);
  },
  onAuthCallback: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, url: string) =>
      callback(url);
    ipcRenderer.on("replii:auth-callback", handler);
    return () => ipcRenderer.removeListener("replii:auth-callback", handler);
  },
  onBillingCallback: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, url: string) =>
      callback(url);
    ipcRenderer.on("replii:billing-callback", handler);
    return () => ipcRenderer.removeListener("replii:billing-callback", handler);
  },
};

contextBridge.exposeInMainWorld("replii", repliiAPI);

declare global {
  interface Window {
    replii: RepliiAPI;
  }
}

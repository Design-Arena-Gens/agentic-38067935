export type LuxionMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  timestamp: number;
  channel?: "voice" | "text";
  tone?: "analysis" | "system" | "action";
  preview?: {
    title: string;
    items: string[];
  };
};

export type DiagnosticsState = {
  energyCore: {
    percent: number;
    status: "optimal" | "charging" | "critical";
    detail: string;
  };
  shieldMatrix: {
    integrity: number;
    status: "fortified" | "watch" | "critical";
    breaches: number;
    detail: string;
  };
  network: {
    latencyMs: number;
    bandwidthGbps: number;
    status: "optimal" | "degraded";
    detail: string;
  };
  environment: {
    externalTemp: number;
    humidity: number;
    airQuality: string;
    detail: string;
  };
  quantumFlux: {
    value: number;
    state: "stable" | "surging" | "declining";
    detail: string;
  };
};

export type DiagnosticsPatch = {
  energyCore?: Partial<DiagnosticsState["energyCore"]>;
  shieldMatrix?: Partial<DiagnosticsState["shieldMatrix"]>;
  network?: Partial<DiagnosticsState["network"]>;
  environment?: Partial<DiagnosticsState["environment"]>;
  quantumFlux?: Partial<DiagnosticsState["quantumFlux"]>;
};

export type MissionEvent = {
  id: string;
  title: string;
  eta: string;
  status: "queued" | "active" | "complete";
  impact: "low" | "medium" | "high";
  description: string;
};

export type MissionUpdate =
  | { type: "append"; mission: MissionEvent }
  | { type: "update"; id: string; changes: Partial<MissionEvent> };

export type QuickCommand = {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  accent: string;
};

export type LuxionContext = {
  diagnostics: DiagnosticsState;
  missions: MissionEvent[];
};

export type LuxionResponse = {
  message: string;
  tone: "system" | "analysis" | "action";
  preview?: {
    title: string;
    items: string[];
  };
  diagnosticsPatch?: DiagnosticsPatch;
  missionUpdate?: MissionUpdate;
  announcements?: string[];
};

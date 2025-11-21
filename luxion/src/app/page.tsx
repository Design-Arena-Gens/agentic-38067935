"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { computeLuxionResponse } from "@/lib/luxion-responder";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import type {
  DiagnosticsState,
  LuxionContext,
  LuxionMessage,
  MissionEvent,
  QuickCommand,
} from "@/types/luxion";

const initialDiagnostics: DiagnosticsState = {
  energyCore: {
    percent: 86,
    status: "optimal",
    detail: "Flux ring synchronized with standby turbines.",
  },
  shieldMatrix: {
    integrity: 91,
    status: "fortified",
    breaches: 0,
    detail: "Polarized shield segments humming within safe resonance.",
  },
  network: {
    latencyMs: 3.6,
    bandwidthGbps: 12.4,
    status: "optimal",
    detail: "Quantum mesh bonded to orbital uplink.",
  },
  environment: {
    externalTemp: 18,
    humidity: 35,
    airQuality: "Air quality index: 14 · Excellent",
    detail: "Halo vents cycling at 28% capacity.",
  },
  quantumFlux: {
    value: 1.42,
    state: "stable",
    detail: "Flux harmonics locked. No decoherence detected.",
  },
};

const initialMissions: MissionEvent[] = [
  {
    id: "mission-1",
    title: "Orbital Debrief",
    eta: "22:40",
    status: "queued",
    impact: "medium",
    description: "Synthesizing negotiation intel and telemetry overlays.",
  },
  {
    id: "mission-2",
    title: "Quantum Relay Calibration",
    eta: "LIVE",
    status: "active",
    impact: "high",
    description: "Fine-tuning entanglement nodes for hyperspace comms.",
  },
  {
    id: "mission-3",
    title: "Aurora Expedition Support",
    eta: "07:30",
    status: "queued",
    impact: "high",
    description: "Provisioning thermal drones and predictive terrain mesh.",
  },
];

const quickCommands: QuickCommand[] = [
  {
    id: "command-diagnostics",
    label: "Full Diagnostics",
    prompt: "Run a full system status diagnostic.",
    icon: "🛰️",
    accent: "from-sky-500/80 to-cyan-400/40",
  },
  {
    id: "command-weather",
    label: "Weather Sweep",
    prompt: "Give me the current weather status.",
    icon: "🌤️",
    accent: "from-orange-400/80 to-amber-500/30",
  },
  {
    id: "command-security",
    label: "Fortify Shields",
    prompt: "Reinforce all security systems.",
    icon: "🛡️",
    accent: "from-purple-500/70 to-fuchsia-500/30",
  },
  {
    id: "command-focus",
    label: "Focus Mode",
    prompt: "Help me get focused and motivated.",
    icon: "⚡",
    accent: "from-emerald-500/80 to-teal-500/30",
  },
  {
    id: "command-launch",
    label: "Launch Sequence",
    prompt: "Initiate the launch sequence checklist.",
    icon: "🚀",
    accent: "from-indigo-500/70 to-blue-500/30",
  },
  {
    id: "command-news",
    label: "Signal Brief",
    prompt: "Give me the latest intel updates.",
    icon: "🗞️",
    accent: "from-cyan-400/80 to-sky-500/30",
  },
];

const initialMessages: LuxionMessage[] = [
  {
    id: "msg-welcome",
    role: "assistant",
    content:
      "Luxion online. All ambient systems synchronized. What directive shall we orchestrate?",
    timestamp: Date.now(),
    tone: "system",
    preview: {
      title: "Core Subsystems",
      items: [
        "Energy core at 86% · optimal",
        "Shield matrix fortified",
        "Quantum flux stable",
      ],
    },
  },
];

function roleStyles(role: LuxionMessage["role"]) {
  if (role === "assistant") {
    return {
      bubble:
        "bg-gradient-to-br from-sky-500/30 via-sky-500/10 to-transparent text-slate-100 border border-sky-500/40",
      label: "text-sky-200",
    };
  }

  if (role === "system") {
    return {
      bubble:
        "bg-gradient-to-br from-slate-800/70 via-slate-900/60 to-slate-950/50 text-slate-100 border border-white/10",
      label: "text-slate-300",
    };
  }

  return {
    bubble:
      "bg-white/5 text-slate-100 border border-white/10 backdrop-blur-sm shadow-lg shadow-black/30",
    label: "text-slate-300",
  };
}

export default function Home() {
  const [messages, setMessages] = useState<LuxionMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [diagnostics, setDiagnostics] =
    useState<DiagnosticsState>(initialDiagnostics);
  const [missions, setMissions] = useState<MissionEvent[]>(initialMissions);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(() =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );

  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const speechEngine = useSpeechEngine({
    language: "en-US",
    onTranscript: (transcript) => {
      handleUserPrompt(transcript, "voice");
    },
    onError: (message) => {
      setToast(message);
    },
  });

  const diagnosticCards = useMemo(
    () => [
      {
        id: "energy",
        title: "Energy Core",
        primary: `${diagnostics.energyCore.percent}%`,
        status: diagnostics.energyCore.status,
        detail: diagnostics.energyCore.detail,
        accent: "from-sky-500/80 to-cyan-400/30",
      },
      {
        id: "shield",
        title: "Shield Matrix",
        primary: `${diagnostics.shieldMatrix.integrity}%`,
        status: diagnostics.shieldMatrix.status,
        detail: diagnostics.shieldMatrix.detail,
        accent: "from-purple-500/70 to-fuchsia-500/30",
      },
      {
        id: "network",
        title: "Quantum Mesh",
        primary: `${diagnostics.network.latencyMs} ms`,
        status: diagnostics.network.status,
        detail: diagnostics.network.detail,
        accent: "from-cyan-400/90 to-indigo-500/30",
      },
      {
        id: "environment",
        title: "Enviro Suite",
        primary: `${diagnostics.environment.externalTemp}°C`,
        status: diagnostics.environment.airQuality,
        detail: diagnostics.environment.detail,
        accent: "from-emerald-500/70 to-teal-500/30",
      },
      {
        id: "flux",
        title: "Quantum Flux",
        primary: `${diagnostics.quantumFlux.value.toFixed(2)} QN`,
        status: diagnostics.quantumFlux.state,
        detail: diagnostics.quantumFlux.detail,
        accent: "from-blue-500/70 to-sky-500/30",
      },
    ],
    [diagnostics]
  );

  const handleUserPrompt = (input: string, channel: "voice" | "text" = "text") => {
    const content = input.trim();
    if (!content) return;

    setDraft("");

    setMessages((prev) => {
      const next: LuxionMessage[] = [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content,
          timestamp: Date.now(),
          channel,
        },
      ];
      return next.slice(-24);
    });

    const context: LuxionContext = {
      diagnostics,
      missions,
    };

    const response = computeLuxionResponse(content, context);

    if (response.diagnosticsPatch) {
      setDiagnostics((prev) => ({
        energyCore: {
          ...prev.energyCore,
          ...response.diagnosticsPatch?.energyCore,
        },
        shieldMatrix: {
          ...prev.shieldMatrix,
          ...response.diagnosticsPatch?.shieldMatrix,
        },
        network: {
          ...prev.network,
          ...response.diagnosticsPatch?.network,
        },
        environment: {
          ...prev.environment,
          ...response.diagnosticsPatch?.environment,
        },
        quantumFlux: {
          ...prev.quantumFlux,
          ...response.diagnosticsPatch?.quantumFlux,
        },
      }));
    }

    if (response.missionUpdate) {
      if (response.missionUpdate.type === "append") {
        const { mission } = response.missionUpdate;
        setMissions((prev) => [mission, ...prev].slice(0, 6));
      } else if (response.missionUpdate.type === "update") {
        const { id, changes } = response.missionUpdate;
        setMissions((prev) =>
          prev.map((mission) =>
            mission.id === id
              ? { ...mission, ...changes }
              : mission
          )
        );
      }
    }

    const assistantMessage: LuxionMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.message,
      tone: response.tone,
      preview: response.preview,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage].slice(-24));

    if (autoSpeak) {
      speechEngine.speak(response.message, "Nova");
    }
  };

  const submitPrompt = () => {
    handleUserPrompt(draft, "text");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%)]" />
        <div className="absolute -left-24 top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-500/25 via-blue-500/10 to-transparent blur-[160px]" />
        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-bl from-purple-500/25 via-fuchsia-400/10 to-transparent blur-[200px]" />
      </div>

      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-slate-900/80 px-6 py-2 text-sm backdrop-blur-md shadow-lg shadow-sky-900/20">
          {toast}
        </div>
      )}

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-24 pt-12 md:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-950/60 px-6 py-6 backdrop-blur-xl shadow-[0_0_80px_rgba(15,23,42,0.45)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/60 to-blue-500/40 p-[1px] shadow-lg shadow-blue-900/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/40 to-blue-500/30 blur-lg" />
              <span className="relative text-3xl font-semibold tracking-tight text-slate-50">
                LX
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
                Luxion Command Nexus
              </h1>
              <p className="text-sm text-slate-300 md:text-base">
                Jarvis-inspired ambient intelligence for missions, focus, and realtime control.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Systems nominal
            </div>
            <div className="flex items-center gap-3 text-lg font-mono text-slate-100 md:text-xl">
              {timestamp}
            </div>
            <div className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Helios Initiative · Orbital Ops
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
          <section className="flex h-full min-h-[620px] flex-col gap-6 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-3xl">
            <div className="relative flex flex-col gap-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-inner shadow-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                    Conversational Console
                  </p>
                  <h2 className="text-xl font-semibold text-slate-100 md:text-2xl">
                    Luxion listening for directives
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Auto-voice</span>
                  <button
                    type="button"
                    onClick={() => setAutoSpeak((prev) => !prev)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full border border-white/10 transition-colors ${
                      autoSpeak
                        ? "bg-sky-500/70"
                        : "bg-slate-800"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform ${
                        autoSpeak ? "translate-x-8" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="relative flex h-[360px] flex-col gap-4 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/40 via-slate-950/50 to-slate-950/80 p-4">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.1),transparent_35%,rgba(147,197,253,0.12),transparent_70%)] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.35),transparent_58%)] opacity-30" />
                <div className="relative flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                  {messages.map((message) => {
                    const styles = roleStyles(message.role);
                    return (
                      <div key={message.id} className="flex flex-col gap-2">
                        <div className={`max-w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-lg ${styles.bubble}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className={`text-[11px] uppercase tracking-[0.3em] ${styles.label}`}>
                              {message.role === "assistant"
                                ? "Luxion"
                                : message.role === "system"
                                  ? "System"
                                  : "Commander"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-base text-slate-100">
                            {message.content}
                          </p>
                        </div>
                        {message.preview && (
                          <div className="ml-2 flex flex-col gap-2 rounded-xl border border-sky-500/20 bg-slate-900/40 px-4 py-3 text-xs text-sky-100 backdrop-blur">
                            <span className="text-[10px] uppercase tracking-[0.45em] text-sky-300">
                              {message.preview.title}
                            </span>
                            <ul className="grid gap-1 text-[13px] leading-relaxed text-slate-200">
                              {message.preview.items.map((item, index) => (
                                <li key={`${message.id}-preview-${index}`} className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/80" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={bottomAnchorRef} />
                </div>
                <div className="relative mt-4 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-2 text-xs text-slate-400">
                    <span className="inline-flex h-2 w-2 animate-ping rounded-full bg-sky-400/80" />
                    {speechEngine.isSupported
                      ? speechEngine.isListening
                        ? "Listening… speak your directive."
                        : "Hold the mic key or click to speak. Text input always available."
                      : "Voice capture unavailable in this browser. Type your directives instead."}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            submitPrompt();
                          }
                        }}
                        placeholder="Command Luxion…"
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-400/60 focus:bg-slate-900/50"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={submitPrompt}
                        className="inline-flex h-12 min-w-[110px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-900/30 transition hover:from-sky-400 hover:to-cyan-400"
                      >
                        Transmit
                      </button>
                      <button
                        type="button"
                        onClick={speechEngine.toggleListening}
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border text-lg transition ${
                          speechEngine.isListening
                            ? "border-sky-400/70 bg-sky-500/40 text-sky-50 shadow-lg shadow-sky-900/50"
                            : "border-white/10 bg-slate-900/70 text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
                        }`}
                      >
                        🎙️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  onClick={() => handleUserPrompt(command.prompt)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-left transition hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-900/30`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-70 transition group-hover:opacity-100 bg-gradient-to-br ${command.accent}`}
                  />
                  <div className="pointer-events-none absolute inset-x-6 top-4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />
                  <div className="relative flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{command.icon}</span>
                      <span className="text-[10px] uppercase tracking-[0.45em] text-white/70">
                        Quick Action
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {command.label}
                    </h3>
                    <p className="text-sm text-slate-200/90">
                      {command.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-3xl shadow-[0_0_50px_rgba(8,47,73,0.45)]">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Diagnostics
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                Live subsystem telemetry
              </h2>
              <div className="mt-6 grid gap-4">
                {diagnosticCards.map((card) => (
                  <div
                    key={card.id}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 opacity-80 bg-gradient-to-br ${card.accent}`}
                    />
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <div className="relative flex items-baseline justify-between">
                      <h3 className="text-sm uppercase tracking-[0.35em] text-white/80">
                        {card.title}
                      </h3>
                      <span className="text-[11px] uppercase tracking-[0.4em] text-white/60">
                        {card.status}
                      </span>
                    </div>
                    <div className="relative mt-2 flex items-end justify-between">
                      <span className="text-2xl font-semibold text-slate-50 md:text-3xl">
                        {card.primary}
                      </span>
                    </div>
                    <p className="relative mt-3 text-sm text-slate-100/90">
                      {card.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                Mission Rail
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                Upcoming directives
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4"
                  >
                    <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-200">
                      {mission.status}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                      {mission.eta}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-100">
                      {mission.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-200">
                      {mission.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-400">
                      <span>Impact: {mission.impact}</span>
                      <span>Command Link Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-sky-500/30 bg-slate-950/80 p-6 backdrop-blur-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Ambient Field
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                Luxion signal resonance
              </h2>
              <div className="mt-6 grid gap-4">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-sky-500/30 via-cyan-500/10 to-transparent p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Voice Link</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${
                          speechEngine.isListening ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      {speechEngine.isListening ? "Active" : "Standby"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-100/90">
                    {speechEngine.isSupported
                      ? "Hold communication whenever ready. Luxion will synthesise a response with resonance."
                      : "Browser lacks Web Speech API. Voice link disabled."}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/30 via-indigo-500/10 to-transparent p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Sonic Output</span>
                    <span>{autoSpeak ? "Enabled" : "Muted"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-100/90">
                    Luxion uses a radiant vocal profile tuned for clarity. Toggle above if you prefer silent confirmations.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500/30 via-teal-500/10 to-transparent p-4">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Ambient Focus</span>
                    <span>Harmonic 3.7</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-100/90">
                    Micro-adjustments maintain a steady cadence ideal for deep work or mission planning.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

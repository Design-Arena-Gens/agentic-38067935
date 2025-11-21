/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseSpeechEngineOptions = {
  autoStop?: boolean;
  language?: string;
  onError?: (message: string) => void;
  onListeningChange?: (listening: boolean) => void;
  onTranscript?: (transcript: string) => void;
};

type SpeechEngineControls = {
  isListening: boolean;
  isSupported: boolean;
  speak: (text: string, voiceHint?: string) => boolean;
  stopListening: () => void;
  stopSpeaking: () => void;
  toggleListening: () => void;
};

export function useSpeechEngine({
  autoStop = true,
  language = "en-US",
  onError,
  onListeningChange,
  onTranscript,
}: UseSpeechEngineOptions): SpeechEngineControls {
  const recognitionRef = useRef<any | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !isSupported) {
      return;
    }

    const Recognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new Recognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = !autoStop;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange?.(true);
    };

    recognition.onerror = (event: { error: string }) => {
      onError?.(
        {
          network: "Network issue encountered by the speech recogniser.",
          "not-allowed": "Microphone access was blocked.",
          "audio-capture": "No audio input detected.",
          aborted: "Listening aborted unexpectedly.",
        }[event.error] ?? "Speech recognition error."
      );
      setIsListening(false);
      onListeningChange?.(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);
    };

    recognition.onresult = (event: { results: ArrayLike<any> }) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        onTranscript?.(transcript);
      }

      if (autoStop) {
        recognition.stop();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop?.();
      recognitionRef.current = null;
    };
  }, [autoStop, isSupported, language, onError, onListeningChange, onTranscript]);

  const speak = useCallback(
    (text: string, voiceHint?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onError?.("Speech synthesis is not available in this browser.");
        return false;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.08;
      utterance.pitch = 1.05;
      utterance.volume = 0.85;

      if (voiceHint) {
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((voice) =>
          voice.name.toLowerCase().includes(voiceHint.toLowerCase())
        );
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      window.speechSynthesis.speak(utterance);
      return true;
    },
    [onError]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      onError?.("Speech recognition is not available.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        onError?.("Unable to start listening. Microphone in use?");
      }
    }
  }, [isListening, isSupported, onError]);

  return {
    isListening,
    isSupported,
    speak,
    stopListening,
    stopSpeaking,
    toggleListening,
  };
}

import { useState, useCallback, useEffect, useRef } from "react";

interface UseTTSReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

const STORAGE_KEY = "devpath-tts-settings";

function readSettings(): { rate: number; voiceName: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { rate: parsed.rate ?? 1, voiceName: parsed.voiceName ?? "" };
    }
  } catch { /* ignore */ }
  return { rate: 1, voiceName: "" };
}

export function useTTS(): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load voices
  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      voicesRef.current = speechSynthesis.getVoices();
    };
    loadVoices();
    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const settings = readSettings();
      const selectedVoice = settings.voiceName
        ? voicesRef.current.find((v) => v.name === settings.voiceName)
        : voicesRef.current.find((v) => v.lang.startsWith("en"));

      const chunks = chunkText(text, 3000);
      let index = 0;

      function speakNext() {
        if (index >= chunks.length) {
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = settings.rate;
        utterance.pitch = 1;
        utterance.lang = "en-US";
        if (selectedVoice) utterance.voice = selectedVoice;

        utterance.onend = () => {
          index++;
          speakNext();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
        };

        speechSynthesis.speak(utterance);
      }

      setIsSpeaking(true);
      speakNext();
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}

/**
 * Split text into chunks at sentence boundaries to avoid browser utterance limits.
 */
function chunkText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence end within maxLength
    const slice = remaining.slice(0, maxLength);
    const lastPeriod = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf(".\n"),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? ")
    );

    const splitAt = lastPeriod > 0 ? lastPeriod + 1 : maxLength;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return chunks;
}

import { computed, onBeforeUnmount, ref, watch } from "vue";

export interface AudioTrack {
  id: string;
  title: string;
  description?: string;
  wave: OscillatorType;
  baseFrequency: number;
  baseLevel?: number;
  partials?: { detune: number; level: number }[];
  filter?: { type: BiquadFilterType; frequency: number; Q?: number };
  modulation?: { type?: OscillatorType; frequency: number; depth: number; target?: "frequency" | "filter" };
}

type PersistedAudioState = {
  trackId: string;
  volume: number;
  muted: boolean;
};

const STORAGE_KEY = "fng.audio";

const tracks: AudioTrack[] = [
  {
    id: "brise-celeste",
    title: "Brise céleste",
    description: "Pads doux générés procéduralement.",
    wave: "sine",
    baseFrequency: 218,
    baseLevel: 0.55,
    partials: [
      { detune: -18, level: 0.25 },
      { detune: 12, level: 0.2 },
    ],
    filter: { type: "lowpass", frequency: 820, Q: 0.9 },
    modulation: { frequency: 0.28, depth: 18, type: "sine", target: "frequency" },
  },
  {
    id: "forge-profonde",
    title: "Forge profonde",
    description: "Ambiance grave inspirée des forges naines.",
    wave: "triangle",
    baseFrequency: 128,
    baseLevel: 0.6,
    partials: [
      { detune: -7, level: 0.18 },
      { detune: 5, level: 0.18 },
    ],
    filter: { type: "lowpass", frequency: 520, Q: 1.2 },
    modulation: { frequency: 0.18, depth: 30, type: "sine", target: "filter" },
  },
  {
    id: "sylve-lointaine",
    title: "Sylve lointaine",
    description: "Tapis sonore aérien aux harmoniques mouvantes.",
    wave: "sawtooth",
    baseFrequency: 176,
    baseLevel: 0.45,
    partials: [
      { detune: -25, level: 0.15 },
      { detune: 19, level: 0.12 },
    ],
    filter: { type: "bandpass", frequency: 640, Q: 4 },
    modulation: { frequency: 0.24, depth: 14, type: "sine", target: "filter" },
  },
];

const defaultTrackId = tracks[0]?.id ?? "brise-celeste";

function loadPersistedPreferences(): PersistedAudioState | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as PersistedAudioState;
  } catch (error) {
    console.warn("Impossible de lire les préférences audio", error);
    return undefined;
  }
}

function persistPreferences(state: PersistedAudioState) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Impossible d'enregistrer les préférences audio", error);
  }
}

export function useAudio(initialTrackId: string = defaultTrackId) {
  const playing = ref(false);
  const volume = ref(0.6);
  const muted = ref(false);
  const currentTrackId = ref(initialTrackId);

  const persisted = loadPersistedPreferences();
  if (persisted) {
    currentTrackId.value = persisted.trackId || initialTrackId;
    volume.value = persisted.volume ?? 0.6;
    muted.value = persisted.muted ?? false;
  }

  const currentTrack = computed(() => tracks.find((track) => track.id === currentTrackId.value) ?? tracks[0]);

  let audioContext: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let filterNode: BiquadFilterNode | null = null;
  let modulationOscillator: OscillatorNode | null = null;
  let modulationGain: GainNode | null = null;
  const oscillators: OscillatorNode[] = [];
  const oscillatorGains: GainNode[] = [];

  function ensureContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  }

  function connectToDestination(node: AudioNode) {
    if (filterNode) {
      node.connect(filterNode);
    } else if (masterGain) {
      node.connect(masterGain);
    }
  }

  function disposeNodes() {
    oscillators.splice(0).forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        /* ignore stopping errors */
      }
      oscillator.disconnect();
    });
    oscillatorGains.splice(0).forEach((gain) => gain.disconnect());

    if (modulationOscillator) {
      try {
        modulationOscillator.stop();
      } catch {
        /* ignore stopping errors */
      }
      modulationOscillator.disconnect();
      modulationOscillator = null;
    }
    if (modulationGain) {
      modulationGain.disconnect();
      modulationGain = null;
    }
    if (filterNode) {
      filterNode.disconnect();
      filterNode = null;
    }
    if (masterGain) {
      masterGain.disconnect();
      masterGain = null;
    }
  }

  async function startTrack(track: AudioTrack | undefined) {
    if (!track) {
      return;
    }
    const context = ensureContext();
    await context.resume();
    disposeNodes();

    masterGain = context.createGain();
    masterGain.gain.value = muted.value ? 0 : volume.value;
    masterGain.connect(context.destination);

    if (track.filter) {
      filterNode = context.createBiquadFilter();
      filterNode.type = track.filter.type;
      filterNode.frequency.value = track.filter.frequency;
      if (track.filter.Q !== undefined) {
        filterNode.Q.value = track.filter.Q;
      }
      filterNode.connect(masterGain);
    }

    const addOscillator = (options: { frequency: number; detune?: number; level?: number; wave?: OscillatorType }) => {
      const osc = context.createOscillator();
      osc.type = options.wave ?? track.wave;
      osc.frequency.value = options.frequency;
      if (options.detune !== undefined) {
        osc.detune.value = options.detune;
      }
      const gain = context.createGain();
      gain.gain.value = options.level ?? 0.6;
      osc.connect(gain);
      connectToDestination(gain);
      osc.start();
      oscillators.push(osc);
      oscillatorGains.push(gain);
      return osc;
    };

    const baseOscillator = addOscillator({
      frequency: track.baseFrequency,
      level: track.baseLevel ?? 0.6,
      wave: track.wave,
    });

    track.partials?.forEach((partial) => {
      addOscillator({
        frequency: track.baseFrequency,
        detune: partial.detune,
        level: partial.level,
        wave: track.wave,
      });
    });

    if (track.modulation) {
      modulationOscillator = context.createOscillator();
      modulationOscillator.type = track.modulation.type ?? "sine";
      modulationOscillator.frequency.value = track.modulation.frequency;
      modulationGain = context.createGain();
      modulationGain.gain.value = track.modulation.depth;
      modulationOscillator.connect(modulationGain);
      if (track.modulation.target === "filter" && filterNode) {
        modulationGain.connect(filterNode.frequency);
      } else {
        modulationGain.connect(baseOscillator.frequency);
      }
      modulationOscillator.start();
    }

    playing.value = true;
  }

  async function stopTrack() {
    disposeNodes();
    if (audioContext) {
      try {
        await audioContext.suspend();
      } catch {
        /* ignore suspend errors */
      }
    }
    playing.value = false;
  }

  function persistState() {
    persistPreferences({
      trackId: currentTrackId.value,
      volume: volume.value,
      muted: muted.value,
    });
  }

  async function togglePlayback() {
    if (playing.value) {
      await stopTrack();
    } else {
      await startTrack(currentTrack.value);
    }
  }

  async function setTrack(trackId: string) {
    if (currentTrackId.value === trackId) {
      return;
    }
    currentTrackId.value = trackId;
    if (playing.value) {
      await startTrack(currentTrack.value);
    }
  }

  function setVolume(value: number) {
    const clamped = Math.min(1, Math.max(0, value));
    volume.value = clamped;
    if (masterGain && !muted.value) {
      masterGain.gain.value = clamped;
    }
    persistState();
  }

  function toggleMute() {
    muted.value = !muted.value;
    if (masterGain) {
      masterGain.gain.value = muted.value ? 0 : volume.value;
    }
    persistState();
  }

  watch(volume, (value) => {
    if (masterGain && !muted.value) {
      masterGain.gain.value = value;
    }
  });

  watch(muted, (value) => {
    if (masterGain) {
      masterGain.gain.value = value ? 0 : volume.value;
    }
  });

  watch(currentTrackId, () => {
    persistState();
  });

  watch([volume, muted], () => {
    persistState();
  });

  onBeforeUnmount(() => {
    void stopTrack();
  });

  return {
    tracks,
    playing,
    togglePlayback,
    toggleMute,
    muted,
    currentTrack,
    currentTrackId,
    setTrack,
    volume,
    setVolume,
  };
}

export { tracks };

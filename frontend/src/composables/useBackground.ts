import { computed, ref } from "vue";
import type { RaceKey } from "../types/names";

const backgroundMap: Record<RaceKey, string> = {
  humain:
    "radial-gradient(circle at 16% 12%, rgba(255, 243, 207, 0.32), transparent 58%)," +
    "radial-gradient(circle at 82% 18%, rgba(255, 164, 112, 0.22), transparent 52%)," +
    "linear-gradient(135deg, #2a1712 0%, #120909 45%, #342327 100%)",
  elfe:
    "radial-gradient(circle at 78% 15%, rgba(180, 255, 223, 0.4), transparent 55%)," +
    "radial-gradient(circle at 12% 78%, rgba(122, 196, 255, 0.26), transparent 65%)," +
    "linear-gradient(145deg, #0e1f2f 0%, #1f4a4a 40%, #132030 100%)",
  nain:
    "radial-gradient(circle at 24% 20%, rgba(255, 214, 153, 0.28), transparent 60%)," +
    "radial-gradient(circle at 80% 70%, rgba(240, 110, 54, 0.2), transparent 70%)," +
    "linear-gradient(135deg, #28130d 0%, #401d15 50%, #1a0c08 100%)",
  gnome:
    "radial-gradient(circle at 30% 30%, rgba(255, 211, 255, 0.35), transparent 60%)," +
    "radial-gradient(circle at 82% 68%, rgba(173, 226, 255, 0.28), transparent 64%)," +
    "linear-gradient(140deg, #281433 0%, #3a2352 52%, #1b1025 100%)",
  orc:
    "radial-gradient(circle at 20% 25%, rgba(206, 255, 160, 0.36), transparent 58%)," +
    "radial-gradient(circle at 78% 75%, rgba(137, 209, 137, 0.28), transparent 60%)," +
    "linear-gradient(135deg, #141f12 0%, #21371c 50%, #0c130b 100%)",
};

const DEFAULT_RACE: RaceKey = "humain";
const TRANSITION_DURATION = 450;

const currentRace = ref<RaceKey>(DEFAULT_RACE);
const previousRace = ref<RaceKey | null>(null);
const transition = ref(false);
let timeoutHandle: number | null = null;

export function useBackground() {
  const currentBackground = computed(() => backgroundMap[currentRace.value] ?? backgroundMap[DEFAULT_RACE]);
  const previousBackground = computed(() => (previousRace.value ? backgroundMap[previousRace.value] : undefined));

  function setRace(race: RaceKey) {
    if (!backgroundMap[race] || race === currentRace.value) {
      return;
    }
    previousRace.value = currentRace.value;
    currentRace.value = race;
    transition.value = true;
    if (timeoutHandle !== null && typeof window !== "undefined") {
      window.clearTimeout(timeoutHandle);
    }
    if (typeof window !== "undefined") {
      timeoutHandle = window.setTimeout(() => {
        transition.value = false;
        previousRace.value = null;
      }, TRANSITION_DURATION);
    } else {
      transition.value = false;
      previousRace.value = null;
    }
  }

  return {
    backgroundMap,
    currentBackground,
    previousBackground,
    currentRace,
    isTransitioning: computed(() => transition.value),
    setRace,
    transitionDuration: TRANSITION_DURATION,
  };
}

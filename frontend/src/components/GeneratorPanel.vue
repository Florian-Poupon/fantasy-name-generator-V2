<template>
  <section class="generator">
    <header class="generator__header">
      <h1>Forge de noms fantastiques</h1>
      <p>
        Choisissez une race, un genre et une ambiance pour générer plusieurs propositions en un clic.
        Les noms sont enregistrés dans votre historique afin de pouvoir les retrouver et les mettre en
        favoris.
      </p>
    </header>

    <div class="generator__grid">
      <fieldset class="generator__group">
        <legend>Race</legend>
        <div class="pill-group" role="radiogroup" aria-label="Sélection de la race">
          <button
            v-for="race in raceOptions"
            :key="race"
            type="button"
            :class="['pill', { active: race === selectedRace }]"
            :aria-pressed="race === selectedRace"
            @click="updateRace(race)"
          >
            {{ race }}
          </button>
        </div>
      </fieldset>

      <fieldset class="generator__group">
        <legend>Genre</legend>
        <div class="pill-group" role="radiogroup" aria-label="Sélection du genre">
          <button
            v-for="gender in genderOptions"
            :key="gender"
            type="button"
            :class="['pill', { active: gender === selectedGender }]"
            :aria-pressed="gender === selectedGender"
            @click="selectedGender = gender"
          >
            {{ gender }}
          </button>
        </div>
      </fieldset>

      <fieldset class="generator__group">
        <legend>Style</legend>
        <div class="pill-group" role="radiogroup" aria-label="Sélection du style">
          <button
            v-for="style in styleOptions"
            :key="style"
            type="button"
            :class="['pill', { active: style === selectedStyle }]"
            :aria-pressed="style === selectedStyle"
            @click="selectedStyle = style"
          >
            {{ style }}
          </button>
        </div>
      </fieldset>

      <fieldset class="generator__group">
        <legend>Tonalité</legend>
        <select v-model="selectedTonality" aria-label="Choisissez une tonalité">
          <option value="">Aucune</option>
          <option v-for="option in tonalityOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </fieldset>

      <fieldset class="generator__group">
        <legend>Nombre de propositions</legend>
        <input
          id="suggestion-count"
          v-model.number="suggestionCount"
          type="range"
          min="1"
          max="5"
          step="1"
          aria-describedby="suggestion-count-help"
        />
        <div class="range-value">{{ suggestionCount }}</div>
        <p id="suggestion-count-help" class="helper">
          Entre 1 et 5 suggestions seront générées simultanément.
        </p>
      </fieldset>
    </div>

    <div class="generator__actions">
      <button class="primary" type="button" :disabled="!canGenerate || isGenerating" @click="handleGenerate">
        {{ isGenerating ? 'Génération...' : 'Forger des noms' }}
      </button>
      <button class="secondary" type="button" :disabled="!suggestions.length" @click="exportSuggestionsAsJson">
        Export JSON
      </button>
      <button class="secondary" type="button" :disabled="!suggestions.length" @click="exportSuggestionsAsPng">
        Export PNG
      </button>
    </div>

    <transition-group name="list" tag="div" class="generator__suggestions">
      <NameSuggestionCard
        v-for="suggestion in suggestions"
        :key="suggestion.value + suggestion.metadata.style + suggestion.metadata.tonality"
        :name="suggestion"
        :is-favorite="isFavorite(suggestion.value)"
        @copy="copyToClipboard"
        @share="shareName"
        @toggle-favorite="toggleFavorite"
      />
    </transition-group>

    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type" role="status" aria-live="polite">
        {{ toast.message }}
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import NameSuggestionCard from "./NameSuggestionCard.vue";
import { generateBatch } from "../lib/nameGenerator";
import type { DatasetSummary, GeneratedName, Tonality } from "../types/names";
import { useHistoryStore } from "../stores/history";

const props = defineProps<{ summary: DatasetSummary[] }>();
const emit = defineEmits<{ (event: "race-change", race: string): void }>();

const historyStore = useHistoryStore();

const tonalityOptions: Tonality[] = ["douce", "tranchante", "ancienne", "sauvage", "lumineuse"];

const raceOptions = computed(() => props.summary.map((item) => item.race));

const summaryIndex = computed(() => {
  return props.summary.reduce<Record<string, { genders: string[]; styles: Record<string, string[]> }>>(
    (acc, item) => {
      acc[item.race] = {
        genders: item.genders.map((gender) => gender.key),
        styles: item.genders.reduce<Record<string, string[]>>((map, gender) => {
          map[gender.key] = gender.styles;
          return map;
        }, {}),
      };
      return acc;
    },
    {},
  );
});

const selectedRace = ref(raceOptions.value[0] ?? "humain");
const genderOptions = computed(() => summaryIndex.value[selectedRace.value]?.genders ?? []);
const selectedGender = ref(genderOptions.value[0] ?? "masculin");
const styleOptions = computed(() => summaryIndex.value[selectedRace.value]?.styles[selectedGender.value] ?? []);
const selectedStyle = ref(styleOptions.value[0] ?? "classique");
const selectedTonality = ref<Tonality | "">("");
const suggestionCount = ref(3);
const isGenerating = ref(false);
const suggestions = ref<GeneratedName[]>([]);
const toast = ref<{ message: string; type: "success" | "error" } | null>(null);
let toastTimeout: number | undefined;

watch(
  raceOptions,
  (options) => {
    if (!options.includes(selectedRace.value) && options.length) {
      const [first] = options;
      if (first) {
        updateRace(first);
      }
    }
  },
  { immediate: true },
);

watch(genderOptions, (options) => {
  if (!options.includes(selectedGender.value) && options.length) {
    const [first] = options;
    if (first) {
      selectedGender.value = first;
    }
  }
});

watch(styleOptions, (options) => {
  if (!options.includes(selectedStyle.value) && options.length) {
    const [first] = options;
    if (first) {
      selectedStyle.value = first;
    }
  }
});

function updateRace(race: string) {
  selectedRace.value = race;
}

watch(
  selectedRace,
  (value) => {
    if (value) {
      emit("race-change", value);
    }
  },
  { immediate: true },
);

const canGenerate = computed(() => Boolean(selectedRace.value && selectedGender.value && selectedStyle.value));

function setToast(message: string, type: "success" | "error" = "success") {
  toast.value = { message, type };
  if (toastTimeout && typeof window !== "undefined") {
    window.clearTimeout(toastTimeout);
  }
  if (typeof window !== "undefined") {
    toastTimeout = window.setTimeout(() => {
      toast.value = null;
    }, 2200);
  }
}

async function handleGenerate() {
  if (!canGenerate.value) {
    return;
  }
  isGenerating.value = true;
  try {
    const tonality = selectedTonality.value || undefined;
    const names = generateBatch(
      {
        race: selectedRace.value,
        gender: selectedGender.value,
        style: selectedStyle.value,
        tonality,
      },
      suggestionCount.value,
    );
    suggestions.value = names;
    names.forEach((name) => historyStore.addEntry(name));
    setToast("Nouveaux noms générés");
  } catch (error) {
    console.error(error);
    setToast("Impossible de générer des noms", "error");
  } finally {
    isGenerating.value = false;
  }
}

function isFavorite(value: string) {
  return historyStore.favorites.some((entry) => entry.value === value);
}

async function copyToClipboard(value: string) {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setToast("Presse-papiers indisponible", "error");
      return;
    }
    await navigator.clipboard.writeText(value);
    setToast(`"${value}" copié dans le presse-papiers`);
  } catch (error) {
    console.error(error);
    setToast("Impossible de copier le nom", "error");
  }
}

async function shareName(value: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: "Nom fantastique",
        text: `Découvrez ce nom: ${value}`,
      });
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      }
    }
    setToast(`Partage prêt pour "${value}"`);
  } catch (error) {
    console.error(error);
    setToast("Le partage a été annulé", "error");
  }
}

function toggleFavorite(value: string) {
  historyStore.toggleFavoriteByValue(value);
  setToast("Mise à jour des favoris");
}

function exportSuggestionsAsJson() {
  if (!suggestions.value.length) {
    return;
  }
  const payload = JSON.stringify(
    suggestions.value.map((item) => ({
      name: item.value,
      metadata: item.metadata,
    })),
    null,
    2,
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `noms-${selectedRace.value}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setToast("Export JSON créé");
}

function exportSuggestionsAsPng() {
  if (!suggestions.value.length) {
    return;
  }
  const canvas = document.createElement("canvas");
  const width = 900;
  const lineHeight = 60;
  const padding = 60;
  const height = padding * 2 + lineHeight * suggestions.value.length;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    setToast("Export PNG impossible", "error");
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#2c1f16");
  gradient.addColorStop(1, "#523a28");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#f7e6c4";
  ctx.font = "bold 32px 'Cinzel', serif";
  ctx.fillText("Noms forgés", padding, padding - 16);
  ctx.font = "24px 'Montserrat', sans-serif";
  suggestions.value.forEach((item, index) => {
    const y = padding + lineHeight * (index + 1);
    ctx.fillText(`${index + 1}. ${item.value}`, padding, y);
  });
  canvas.toBlob((blob) => {
    if (!blob) {
      setToast("Export PNG impossible", "error");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `noms-${selectedRace.value}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast("Export PNG créé");
  });
}
</script>

<style scoped>
.generator {
  background: rgba(17, 9, 4, 0.65);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fdf5df;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
}

.generator__header h1 {
  font-family: "Cinzel", serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.generator__header p {
  margin: 0 0 1.5rem;
  line-height: 1.5;
  max-width: 42rem;
}

.generator__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.generator__group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: none;
  padding: 0;
  margin: 0;
}

.generator__group legend {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pill {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.pill:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 216, 107, 0.8);
}

.pill.active {
  background: linear-gradient(135deg, rgba(255, 216, 107, 0.2), rgba(255, 159, 28, 0.25));
  border-color: rgba(255, 216, 107, 0.7);
}

.generator__group select {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  color: inherit;
}

.generator__group select:focus-visible,
.pill:focus-visible,
button.primary:focus-visible,
button.secondary:focus-visible {
  outline: 2px solid #ffd86b;
  outline-offset: 2px;
}

.generator__group input[type="range"] {
  width: 100%;
}

.range-value {
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
}

.helper {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

.generator__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.generator__actions button {
  flex: 1;
  min-width: 140px;
}

button.primary,
button.secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

button.primary {
  background: linear-gradient(135deg, #ffd86b, #ff9f1c);
  color: #1e130a;
  box-shadow: 0 16px 32px rgba(255, 216, 107, 0.35);
}

button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

button.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.generator__suggestions {
  display: grid;
  margin-top: 2rem;
  gap: 1rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.toast {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.65);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background: rgba(46, 204, 113, 0.8);
  color: #0f2a17;
}

.toast.error {
  background: rgba(231, 76, 60, 0.85);
}

@media (min-width: 900px) {
  .generator__suggestions {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}
</style>

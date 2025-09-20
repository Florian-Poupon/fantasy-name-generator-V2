<template>
  <article class="name-card">
    <header class="name-card__header">
      <h3>{{ name.value }}</h3>
      <button
        class="icon-button"
        :aria-pressed="isFavorite"
        :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        @click="toggleFavorite"
      >
        <span v-if="isFavorite">★</span>
        <span v-else>☆</span>
        <span class="sr-only">{{ isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}</span>
      </button>
    </header>
    <dl class="name-card__meta">
      <div>
        <dt>Race</dt>
        <dd>{{ name.metadata.race }}</dd>
      </div>
      <div>
        <dt>Genre</dt>
        <dd>{{ name.metadata.gender }}</dd>
      </div>
      <div>
        <dt>Style</dt>
        <dd>{{ name.metadata.style }}</dd>
      </div>
      <div v-if="name.metadata.tonality">
        <dt>Tonalité</dt>
        <dd>{{ name.metadata.tonality }}</dd>
      </div>
    </dl>
    <footer class="name-card__actions">
      <button class="primary" @click="copy">Copier</button>
      <button class="secondary" @click="share">Partager</button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { GeneratedName } from "../types/names";

const props = defineProps<{ name: GeneratedName; isFavorite?: boolean }>();
const emit = defineEmits<{
  (event: "copy", value: string): void;
  (event: "share", value: string): void;
  (event: "toggle-favorite", value: string): void;
}>();

function copy() {
  emit("copy", props.name.value);
}

function share() {
  emit("share", props.name.value);
}

function toggleFavorite() {
  emit("toggle-favorite", props.name.value);
}
</script>

<style scoped>
.name-card {
  background: rgba(12, 7, 3, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  backdrop-filter: blur(6px);
  color: #fdf7ea;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.name-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.name-card__header h3 {
  font-size: 1.5rem;
  margin: 0;
  font-family: "Cinzel", serif;
  letter-spacing: 0.05em;
}

.icon-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffd86b;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.icon-button:hover {
  background: rgba(255, 216, 107, 0.3);
  transform: translateY(-1px);
}

.icon-button:focus-visible {
  outline: 2px solid #ffd86b;
  outline-offset: 2px;
}

.name-card__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin: 0;
}

.name-card__meta dt {
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.name-card__meta dd {
  margin: 0;
  font-size: 0.95rem;
}

.name-card__actions {
  display: flex;
  gap: 0.75rem;
}

button.primary,
button.secondary {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button.primary {
  background: linear-gradient(135deg, #ffd86b, #ff9f1c);
  color: #22160b;
  box-shadow: 0 10px 20px rgba(255, 216, 107, 0.3);
}

button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(255, 216, 107, 0.4);
}

button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fef3d5;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

button.secondary:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.45);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>

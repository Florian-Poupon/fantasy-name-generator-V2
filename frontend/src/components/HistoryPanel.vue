<template>
  <section class="history">
    <header class="history__header">
      <h2>Historique</h2>
      <div class="history__actions">
        <button type="button" class="secondary" :disabled="!entries.length" @click="exportHistory">
          Exporter l'historique
        </button>
        <button type="button" class="ghost" :disabled="!entries.length" @click="clearHistory">
          Vider
        </button>
      </div>
    </header>

    <p v-if="!entries.length" class="history__empty">
      Générez des noms pour alimenter l'historique. Vous pourrez ensuite les favoriser, les partager ou les
      exporter.
    </p>

    <ul v-else class="history__list">
      <li v-for="entry in entries" :key="entry.id" class="history__item">
        <div class="history__name">
          <strong>{{ entry.value }}</strong>
          <span class="history__meta">{{ entry.metadata.race }} · {{ entry.metadata.gender }}</span>
        </div>
        <div class="history__buttons">
          <button type="button" class="ghost" @click="copy(entry.value)">Copier</button>
          <button type="button" class="ghost" @click="share(entry.value)">Partager</button>
          <button type="button" class="ghost" @click="toggleFavorite(entry.id)">
            {{ entry.favorite ? '★ Favori' : '☆ Favori' }}
          </button>
          <button type="button" class="ghost" @click="removeEntry(entry.id)">Supprimer</button>
        </div>
      </li>
    </ul>

    <section v-if="favorites.length" class="history__favorites">
      <h3>Favoris</h3>
      <ul>
        <li v-for="favorite in favorites" :key="favorite.id">
          <span>{{ favorite.value }}</span>
          <button type="button" class="ghost" @click="toggleFavorite(favorite.id)">Retirer</button>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useHistoryStore } from "../stores/history";

const historyStore = useHistoryStore();
const { entries, favorites } = storeToRefs(historyStore);

function toggleFavorite(id: string) {
  historyStore.toggleFavorite(id);
}

function removeEntry(id: string) {
  historyStore.removeEntry(id);
}

function clearHistory() {
  historyStore.clearHistory();
}

async function copy(value: string) {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(value);
  } catch (error) {
    console.error("Impossible de copier", error);
  }
}

async function share(value: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "Nom fantastique", text: value });
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
      }
    }
  } catch (error) {
    console.error("Partage annulé", error);
  }
}

function exportHistory() {
  if (!entries.value.length) {
    return;
  }
  const payload = JSON.stringify(entries.value, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `historique-noms-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.history {
  background: rgba(12, 8, 6, 0.7);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f7ecda;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.history__header h2 {
  font-family: "Cinzel", serif;
  font-size: 1.5rem;
  margin: 0;
}

.history__actions {
  display: flex;
  gap: 0.5rem;
}

.history__empty {
  opacity: 0.75;
  margin: 0;
}

.history__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history__item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.75rem;
}

.history__name {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.history__meta {
  opacity: 0.7;
  font-size: 0.85rem;
}

.history__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button.ghost,
button.secondary {
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

button.ghost:hover,
button.secondary:hover {
  background: rgba(255, 216, 107, 0.2);
  transform: translateY(-1px);
}

button.ghost:disabled,
button.secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history__favorites ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history__favorites li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>

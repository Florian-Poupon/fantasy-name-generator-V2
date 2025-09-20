import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import type { GeneratedName } from "../types/names";

export interface NameHistoryEntry extends GeneratedName {
  id: string;
  timestamp: number;
  favorite: boolean;
}

const STORAGE_KEY = "fng.history";
const MAX_ENTRIES = 100;

function loadHistory(): NameHistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as NameHistoryEntry[];
    return parsed.map((entry) => ({
      ...entry,
      timestamp: entry.timestamp ?? Date.now(),
      favorite: Boolean(entry.favorite),
    }));
  } catch (error) {
    console.warn("Impossible de charger l'historique", error);
    return [];
  }
}

function persist(entries: NameHistoryEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const useHistoryStore = defineStore("history", () => {
  const entries = ref<NameHistoryEntry[]>(loadHistory());

  const favorites = computed(() => entries.value.filter((entry) => entry.favorite));

  function addEntry(name: GeneratedName): NameHistoryEntry {
    const existingIndex = entries.value.findIndex((entry) => entry.value === name.value);
    if (existingIndex >= 0) {
      const existing = entries.value[existingIndex];
      if (!existing) {
        return createEntry(name);
      }
      const updated: NameHistoryEntry = {
        ...existing,
        ...name,
        timestamp: Date.now(),
        id: existing.id,
        favorite: existing.favorite,
      };
      entries.value = [updated, ...entries.value.filter((_, index) => index !== existingIndex)];
      persist(entries.value);
      return updated;
    }

    return createEntry(name);
  }

  function createEntry(name: GeneratedName): NameHistoryEntry {
    const randomId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const newEntry: NameHistoryEntry = {
      ...name,
      id: randomId,
      timestamp: Date.now(),
      favorite: false,
    };
    entries.value = [newEntry, ...entries.value];
    if (entries.value.length > MAX_ENTRIES) {
      entries.value = entries.value.slice(0, MAX_ENTRIES);
    }
    persist(entries.value);
    return newEntry;
  }

  function toggleFavorite(id: string) {
    entries.value = entries.value.map((entry) =>
      entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
    );
    persist(entries.value);
  }

  function toggleFavoriteByValue(value: string) {
    const target = entries.value.find((entry) => entry.value === value);
    if (!target) {
      return;
    }
    toggleFavorite(target.id);
  }

  function removeEntry(id: string) {
    entries.value = entries.value.filter((entry) => entry.id !== id);
    persist(entries.value);
  }

  function clearHistory() {
    entries.value = [];
    persist(entries.value);
  }

  watch(
    entries,
    (value) => {
      persist(value);
    },
    { deep: true },
  );

  return {
    entries,
    favorites,
    addEntry,
    toggleFavorite,
    toggleFavoriteByValue,
    removeEntry,
    clearHistory,
  };
});

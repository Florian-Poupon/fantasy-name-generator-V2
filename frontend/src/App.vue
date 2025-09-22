<script setup lang="ts">
import { computed } from "vue";
import GeneratorPanel from "./components/GeneratorPanel.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import AudioPlayer from "./components/AudioPlayer.vue";
import { useBackground } from "./composables/useBackground";
import { listDatasetSummary } from "./lib/nameGenerator";

const datasetSummary = computed(() => listDatasetSummary());
const { currentBackground, previousBackground, isTransitioning, setRace, transitionDuration } = useBackground();
</script>

<template>
  <div class="app-shell">
    <div class="background-container" aria-hidden="true">
      <transition name="background" :duration="transitionDuration">
        <div
          v-if="currentBackground"
          key="foreground"
          class="background-layer"
          :style="{ backgroundImage: currentBackground }"
        ></div>
      </transition>
      <transition name="background" :duration="transitionDuration">
        <div
          v-if="isTransitioning && previousBackground"
          key="previous"
          class="background-layer previous"
          :style="{ backgroundImage: previousBackground }"
        ></div>
      </transition>
      <div class="background-overlay"></div>
    </div>

    <main class="layout">
      <GeneratorPanel :summary="datasetSummary" @race-change="setRace" />
      <aside class="sidebar">
        <HistoryPanel />
        <AudioPlayer />
      </aside>
    </main>

    <footer class="app-footer">
      <p>
        Projet modernisé avec Vue 3, stockage local et PWA. Partagez vos créations et contribuez de nouveaux
        corpus via le format documenté.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  position: relative;
  color: #fdf7ec;
  font-family: "Montserrat", sans-serif;
}

.background-container {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -2;
}

.background-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  will-change: opacity, transform;
}

.background-layer.previous {
  z-index: -1;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 60%),
    linear-gradient(120deg, rgba(26, 15, 8, 0.85), rgba(10, 7, 4, 0.9));
}

.layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  padding: 4rem 5vw 2rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-footer {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 2rem 1rem 3rem;
  opacity: 0.8;
}

.background-enter-active,
.background-leave-active {
  transition: opacity 0.45s ease;
}

.background-enter-from,
.background-leave-to {
  opacity: 0;
}

@media (min-width: 1100px) {
  .layout {
    grid-template-columns: 3fr 2fr;
  }
}
</style>

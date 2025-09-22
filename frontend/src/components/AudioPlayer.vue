<template>
  <section class="audio-player">
    <header>
      <h2>Ambiance musicale</h2>
      <p>Ajoutez une touche sonore à votre session de création.</p>
    </header>

  <div class="audio-player__controls">
    <button type="button" class="primary" @click="togglePlayback">
      {{ playing ? 'Pause' : 'Lecture' }}
    </button>
    <button type="button" class="ghost" @click="toggleMute">
      {{ muted ? 'Activer le son' : 'Couper le son' }}
    </button>
  </div>

  <label class="audio-player__field">
    <span>Piste</span>
    <select v-model="selectedTrack" @change="changeTrack">
      <option v-for="track in tracks" :key="track.id" :value="track.id">
        {{ track.title }}
      </option>
    </select>
  </label>

  <p v-if="currentTrack?.description" class="audio-player__description">
    {{ currentTrack.description }}
  </p>

  <label class="audio-player__field">
    <span>Volume</span>
    <input type="range" min="0" max="1" step="0.05" :value="volume" @input="onVolumeChange" />
  </label>
</section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAudio } from "../composables/useAudio";

const { playing, togglePlayback, toggleMute, muted, tracks, currentTrack, currentTrackId, setTrack, volume, setVolume } =
  useAudio();
const selectedTrack = ref(currentTrackId.value ?? tracks[0]?.id ?? "brise-celeste");

watch(currentTrackId, (trackId) => {
  if (trackId && selectedTrack.value !== trackId) {
    selectedTrack.value = trackId;
  }
});

function changeTrack(event: Event) {
  const target = event.target as HTMLSelectElement;
  void setTrack(target.value);
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement;
  setVolume(Number.parseFloat(target.value));
}
</script>

<style scoped>
.audio-player {
  background: rgba(14, 9, 7, 0.7);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8e9d8;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.audio-player header h2 {
  font-family: "Cinzel", serif;
  font-size: 1.5rem;
  margin: 0;
}

.audio-player header p {
  margin: 0;
  opacity: 0.75;
}

.audio-player__controls {
  display: flex;
  gap: 0.75rem;
}

.audio-player__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
}

.audio-player__description {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

select,
input[type="range"],
button.primary,
button.ghost {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  padding: 0.6rem 0.8rem;
  color: inherit;
}

button.primary {
  background: linear-gradient(135deg, #ffd86b, #ff9f1c);
  color: #21160d;
  border: none;
  cursor: pointer;
}

button.ghost {
  cursor: pointer;
}

button.primary:hover,
button.ghost:hover {
  transform: translateY(-1px);
}

select:focus-visible,
input[type="range"]:focus-visible,
button.primary:focus-visible,
button.ghost:focus-visible {
  outline: 2px solid #ffd86b;
  outline-offset: 2px;
}
</style>

// Utilitaire pour choisir un élément aléatoire dans une liste
function randomNbr(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return "";
  }
  return list[Math.floor(Math.random() * list.length)];
}

const namePools = {
  humain: {
    masculin: { prefixes: prefixesHumainMasculin, suffixes: suffixesHumainMasculin },
    feminin: { prefixes: prefixesHumainFeminin, suffixes: suffixesHumainFeminin },
    "non-binaire": {
      prefixes: prefixesHumainNonBinaire,
      suffixes: suffixesHumainNonBinaire,
    },
  },
  elfe: {
    masculin: { prefixes: prefixesElfeMasculin, suffixes: suffixesElfeMasculin },
    feminin: { prefixes: prefixesElfeFeminin, suffixes: suffixesElfeFeminin },
    "non-binaire": {
      prefixes: prefixesElfeNonBinaire,
      suffixes: suffixesElfeNonBinaire,
    },
  },
  nain: {
    masculin: { prefixes: prefixesNainMasculin, suffixes: suffixesNainMasculin },
    feminin: { prefixes: prefixesNainFeminin, suffixes: suffixesNainFeminin },
    "non-binaire": {
      prefixes: prefixesNainNonBinaire,
      suffixes: suffixesNainNonBinaire,
    },
  },
  gnome: {
    masculin: { prefixes: prefixesGnomeMasculin, suffixes: suffixesGnomeMasculin },
    feminin: { prefixes: prefixesGnomeFeminin, suffixes: suffixesGnomeFeminin },
    "non-binaire": {
      prefixes: prefixesGnomeNonBinaire,
      suffixes: suffixesGnomeNonBinaire,
    },
  },
  orc: {
    masculin: { prefixes: prefixesOrcMasculin, suffixes: suffixesOrcMasculin },
    feminin: { prefixes: prefixesOrcFeminin, suffixes: suffixesOrcFeminin },
    "non-binaire": {
      prefixes: prefixesOrcNonBinaire,
      suffixes: suffixesOrcNonBinaire,
    },
  },
};

const raceLabels = {
  humain: "Humain",
  elfe: "Elfe",
  nain: "Nain",
  gnome: "Gnome",
  orc: "Orc",
};

const genreLabels = {
  masculin: "masculin",
  feminin: "féminin",
  "non-binaire": "non-binaire",
};

const iconSources = {
  humain: {
    masculin: "images/picto/humain.png",
    feminin: "images/picto/humain-feminin.png",
  },
  elfe: {
    masculin: "images/picto/elfe.png",
    feminin: "images/picto/elfe-feminin.png",
  },
  nain: {
    masculin: "images/picto/nain.png",
    feminin: "images/picto/nain-feminin.png",
  },
  gnome: {
    masculin: "images/picto/gnome.png",
    feminin: "images/picto/gnome-feminin.png",
  },
  orc: {
    masculin: "images/picto/orc.png",
    feminin: "images/picto/orc-feminin.png",
  },
};

const genreIconVariant = {
  masculin: "masculin",
  feminin: "feminin",
  "non-binaire": "masculin",
};

const RECENT_BATCH_SIZE = 5;
const RECENT_LIMIT = 10;
const FAVORITES_STORAGE_KEY = "fantasy-name-generator:favorites";

let recentNames = [];
let favoriteNames = [];

const background = document.getElementById("background");
const raceButtons = document.querySelectorAll(".raceBtn button");
const genreButtons = document.querySelectorAll(".genreBtn button");
const generateButton = document.querySelector(".generateBtn button");
const nameList = document.querySelector("[data-name-list]");
const emptyRecent = document.querySelector("[data-empty-recent]");
const favoriteList = document.querySelector("[data-favorite-list]");
const emptyFavorites = document.querySelector("[data-empty-favorites]");
const statusMessage = document.querySelector("[data-status]");
const musicToggle = document.getElementById("music-toggle");
const backgroundMusic = document.getElementById("background-music");

if (generateButton) {
  generateButton.disabled = true;
  generateButton.classList.add("disabled");
}

function announceStatus(message) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
}

function setActiveButton(buttons, activeButton) {
  buttons.forEach((btn) => btn.classList.remove("active"));
  activeButton.classList.add("active");
}

function handleIconError(event) {
  const img = event.currentTarget;
  if (!img || img.dataset.fallbackApplied === "true") {
    return;
  }
  img.dataset.fallbackApplied = "true";
  if (img.dataset.fallbackSrc) {
    console.warn(
      `Pictogramme manquant pour ${img.dataset.requestedSrc}, utilisation du fallback.`
    );
    img.src = img.dataset.fallbackSrc;
  }
}

function buildAltText(race, genre) {
  const raceLabel = raceLabels[race] || race;
  if (!genre || !genreLabels[genre]) {
    return `Race ${raceLabel}`;
  }
  return `Race ${raceLabel} (${genreLabels[genre]})`;
}

function applyGenreToIcons(genre) {
  const variant = genreIconVariant[genre] ?? "masculin";
  const racePictos = document.querySelectorAll(".raceBtn button img");
  racePictos.forEach((img) => {
    const button = img.closest("button");
    const race = button?.getAttribute("data-race");
    if (!race) return;

    const iconSet = iconSources[race] || {};
    const fallbackSrc = iconSet.masculin ?? `images/picto/${race}.png`;
    const targetSrc = iconSet[variant] ?? fallbackSrc;

    img.dataset.fallbackSrc = fallbackSrc;
    img.dataset.requestedSrc = targetSrc;
    img.dataset.fallbackApplied = "false";
    img.alt = buildAltText(race, genre);
    img.dataset.genreVariant = genre;
    img.classList.toggle("picto--non-binaire", genre === "non-binaire");

    if (!img.dataset.iconErrorBound) {
      img.addEventListener("error", handleIconError);
      img.dataset.iconErrorBound = "true";
    }

    img.src = targetSrc;
  });
}

function updateGenerateBtnState() {
  if (!generateButton) return;
  const raceChoice = document.querySelector(".raceBtn button.active");
  const genreChoice = document.querySelector(".genreBtn button.active");
  const enabled = Boolean(raceChoice && genreChoice);
  generateButton.disabled = !enabled;
  generateButton.classList.toggle("disabled", !enabled);
}

function getSelections() {
  const raceChoice = document.querySelector(".raceBtn button.active");
  const genreChoice = document.querySelector(".genreBtn button.active");
  return {
    race: raceChoice?.getAttribute("data-race") ?? "",
    genre: genreChoice?.getAttribute("data-genre") ?? "",
  };
}

function generateNamesBatch(count) {
  const { race, genre } = getSelections();
  if (!race || !genre) {
    return [];
  }

  const pool = namePools[race]?.[genre];
  if (!pool) {
    return [];
  }

  const uniqueNames = new Set();
  const maxAttempts = count * 6;
  let attempts = 0;

  while (uniqueNames.size < count && attempts < maxAttempts) {
    attempts += 1;
    const prefix = randomNbr(pool.prefixes);
    const suffix = randomNbr(pool.suffixes);
    if (!prefix || !suffix) {
      continue;
    }
    uniqueNames.add(`${prefix}${suffix}`);
  }

  return Array.from(uniqueNames);
}

function mergeRecentNames(newNames) {
  const combined = [...newNames, ...recentNames];
  const unique = [];
  const seen = new Set();
  combined.forEach((name) => {
    if (!seen.has(name)) {
      unique.push(name);
      seen.add(name);
    }
  });
  recentNames = unique.slice(0, RECENT_LIMIT);
}

function createFavoriteButton(name) {
  const isFavorite = favoriteNames.includes(name);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "name-action favorite-toggle";
  button.setAttribute("aria-pressed", String(isFavorite));
  button.title = isFavorite ? "Retirer des favoris" : "Ajouter aux favoris";
  button.innerHTML = `<span aria-hidden="true">${isFavorite ? "★" : "☆"}</span><span class="sr-only">${
    isFavorite
      ? `Retirer « ${name} » des favoris`
      : `Ajouter « ${name} » aux favoris`
  }</span>`;
  button.addEventListener("click", () => toggleFavorite(name));
  return button;
}

function createCopyButton(name) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "name-action copy-action";
  button.textContent = "Copier";
  button.addEventListener("click", () => copyToClipboard(name));
  return button;
}

function createNameItem(name) {
  const item = document.createElement("li");
  item.className = "name-item";
  const isFavorite = favoriteNames.includes(name);
  if (isFavorite) {
    item.classList.add("is-favorite");
  }

  const text = document.createElement("span");
  text.className = "name-text";
  text.textContent = name;

  const actions = document.createElement("div");
  actions.className = "name-actions";
  actions.appendChild(createCopyButton(name));
  actions.appendChild(createFavoriteButton(name));

  item.appendChild(text);
  item.appendChild(actions);
  return item;
}

function renderRecentNames() {
  if (!nameList || !emptyRecent) return;
  nameList.innerHTML = "";

  if (recentNames.length === 0) {
    nameList.hidden = true;
    emptyRecent.hidden = false;
    return;
  }

  nameList.hidden = false;
  emptyRecent.hidden = true;

  recentNames.forEach((name) => {
    nameList.appendChild(createNameItem(name));
  });
}

function renderFavoriteNames() {
  if (!favoriteList || !emptyFavorites) return;
  favoriteList.innerHTML = "";

  if (favoriteNames.length === 0) {
    favoriteList.hidden = true;
    emptyFavorites.hidden = false;
    return;
  }

  favoriteList.hidden = false;
  emptyFavorites.hidden = true;

  favoriteNames.forEach((name) => {
    favoriteList.appendChild(createNameItem(name));
  });
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteNames));
  } catch (error) {
    console.warn("Impossible d'enregistrer les favoris", error);
  }
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((value) => typeof value === "string" && value.trim().length > 0);
    }
  } catch (error) {
    console.warn("Impossible de charger les favoris", error);
  }
  return [];
}

function toggleFavorite(name) {
  const index = favoriteNames.indexOf(name);
  if (index === -1) {
    favoriteNames.push(name);
    announceStatus(`« ${name} » ajouté aux favoris.`);
  } else {
    favoriteNames.splice(index, 1);
    announceStatus(`« ${name} » retiré des favoris.`);
  }
  saveFavorites();
  renderFavoriteNames();
  renderRecentNames();
}

async function copyToClipboard(name) {
  if (!name) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(name);
      announceStatus(`« ${name} » copié dans le presse-papiers.`);
      return;
    }
  } catch (error) {
    console.warn("Copie via clipboard API impossible", error);
  }

  const textarea = document.createElement("textarea");
  textarea.value = name;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  textarea.select();

  try {
    const success = document.execCommand("copy");
    announceStatus(
      success
        ? `« ${name} » copié dans le presse-papiers.`
        : `Copie terminée, sélectionnez manuellement « ${name} ».`
    );
  } catch (error) {
    console.warn("Copie manuelle nécessaire", error);
    announceStatus(`Copiez manuellement « ${name} ».`);
  } finally {
    document.body.removeChild(textarea);
    if (selectedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(selectedRange);
    }
  }
}

function handleGenerateClick() {
  const names = generateNamesBatch(RECENT_BATCH_SIZE);
  if (names.length === 0) {
    announceStatus("Aucun nom n'a pu être généré pour cette combinaison.");
    return;
  }

  mergeRecentNames(names);
  renderRecentNames();
  announceStatus(
    names.length === 1
      ? `Un nouveau nom a été forgé : « ${names[0]} ».`
      : `${names.length} noms viennent d'être forgés.`
  );
}

function handleRaceClick(event) {
  const button = event.currentTarget;
  if (!button) return;
  const race = button.getAttribute("data-race");
  if (!race) return;

  setActiveButton(raceButtons, button);

  if (background) {
    background.classList.add("fade-out");
    void background.offsetWidth;
    setTimeout(() => {
      background.style.backgroundImage = `url('images/background/background-${race}.png')`;
      background.classList.remove("fade-out");
    }, 0);
  }

  updateGenerateBtnState();
}

function handleGenreClick(event) {
  const button = event.currentTarget;
  if (!button) return;
  const genre = button.getAttribute("data-genre");
  if (!genre) return;

  setActiveButton(genreButtons, button);
  applyGenreToIcons(genre);
  updateGenerateBtnState();
}

function initialiseSelections() {
  raceButtons.forEach((button) => {
    button.addEventListener("click", handleRaceClick);
  });

  genreButtons.forEach((button) => {
    button.addEventListener("click", handleGenreClick);
  });

  updateGenerateBtnState();
}

function initialiseGenerateButton() {
  if (!generateButton) return;
  generateButton.addEventListener("click", handleGenerateClick);
  generateButton.disabled = true;
  generateButton.classList.add("disabled");
}

function initialiseMusicToggle() {
  if (!musicToggle || !backgroundMusic) return;
  musicToggle.addEventListener("click", () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
      musicToggle.textContent = "Désactiver Musique";
    } else {
      backgroundMusic.pause();
      musicToggle.textContent = "Activer Musique";
    }
  });
}

function init() {
  favoriteNames = loadFavorites();
  renderRecentNames();
  renderFavoriteNames();
  initialiseSelections();
  initialiseGenerateButton();
  initialiseMusicToggle();
}

document.addEventListener("DOMContentLoaded", init);

//Random Number

function randomNbr(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

//clic race
const raceClic = document.querySelectorAll(".raceBtn button");
const background = document.getElementById("background");

raceClic.forEach((button) => {
  button.addEventListener("click", () => {
    let race = button.getAttribute("data-race");

    //changer background
    if (!background) return;
    background?.classList.add("fade-out");
    void background.offsetWidth;
    setTimeout(() => {
      background.style.backgroundImage = `url('images/background/background-${race}.png')`;
      background.classList.remove("fade-out");
    }, 0);

    raceClic.forEach((button) => button.classList.remove("active"));
    button.classList.add("active");
    updateGenerateBtnState();
  });
});

//clic genre
const genreClic = document.querySelectorAll(".genreBtn button");

genreClic.forEach((button) => {
  button.addEventListener("click", () => {
    const genre = button.getAttribute("data-genre");

    // activer visuellement le bouton cliqué
    genreClic.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    // mettre à jour les pictos selon le genre
    const racePictos = document.querySelectorAll(".raceBtn button img");

    racePictos.forEach((img) => {
      const race = img.closest("button")?.getAttribute("data-race");
      if (!race) return;

      const suffix = genre === "feminin" ? "-feminin" : "";
      img.src = `images/picto/${race}${suffix}.png`;
    });
    updateGenerateBtnState();
  });
});

function updateGenerateBtnState() {
  const raceChoice = document.querySelector(".raceBtn button.active");
  const genreChoice = document.querySelector(".genreBtn button.active");
  const generateBtn = document.querySelector(".generateBtn button");
  if (!generateBtn) return;
  if (raceChoice && genreChoice) {
    generateBtn.disabled = false;
    generateBtn.classList.remove("disabled");
  } else {
    generateBtn.disabled = true;
    generateBtn.classList.add("disabled");
  }
}

// Désactive le bouton au chargement
document.addEventListener("DOMContentLoaded", () => {
  updateGenerateBtnState();
});

// création du nom
function generateName() {
  const raceChoice = document.querySelector(".raceBtn button.active");
  const genreChoice = document.querySelector(".genreBtn button.active");

  const raceData = raceChoice?.getAttribute("data-race");
  const genreData = genreChoice?.getAttribute("data-genre");

  let nom = "";

  if (raceData === "humain") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesHumainMasculin) + randomNbr(suffixesHumainMasculin);
    } else if (genreData === "feminin") {
      nom = randomNbr(prefixesHumainFeminin) + randomNbr(suffixesHumainFeminin);
    } else if (genreData === "non-binaire") {
      nom = randomNbr(prefixesHumainNonBinaire) + randomNbr(suffixesHumainNonBinaire);
    }
  }
  if (raceData === "elfe") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesElfeMasculin) + randomNbr(suffixesElfeMasculin);
    } else if (genreData === "feminin") {
      nom = randomNbr(prefixesElfeFeminin) + randomNbr(suffixesElfeFeminin);
    } else if (genreData === "non-binaire") {
      nom = randomNbr(prefixesElfeNonBinaire) + randomNbr(suffixesElfeNonBinaire);
    }
  }
  if (raceData === "nain") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesNainMasculin) + randomNbr(suffixesNainMasculin);
    } else if (genreData === "feminin") {
      nom = randomNbr(prefixesNainFeminin) + randomNbr(suffixesNainFeminin);
    } else if (genreData === "non-binaire") {
      nom = randomNbr(prefixesNainNonBinaire) + randomNbr(suffixesNainNonBinaire);
    }
  }
  if (raceData === "gnome") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesGnomeMasculin) + randomNbr(suffixesGnomeMasculin);
    } else if (genreData === "feminin") {
      nom = randomNbr(prefixesGnomeFeminin) + randomNbr(suffixesGnomeFeminin);
    } else if (genreData === "non-binaire") {
      nom = randomNbr(prefixesGnomeNonBinaire) + randomNbr(suffixesGnomeNonBinaire);
    }
  }
  if (raceData === "orc") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesOrcMasculin) + randomNbr(suffixesOrcMasculin);
    } else if (genreData === "feminin") {
      nom = randomNbr(prefixesOrcFeminin) + randomNbr(suffixesOrcFeminin);
    } else if (genreData === "non-binaire") {
      nom = randomNbr(prefixesOrcNonBinaire) + randomNbr(suffixesOrcNonBinaire);
    }
  }
  return nom;
}

//Afficher le nom

function afficherNom() {
  let generateBtn = document.querySelector(".generateBtn button");

  generateBtn?.addEventListener("click", () => {
    const raceChoice = document.querySelector(".raceBtn button.active");
    const genreChoice = document.querySelector(".genreBtn button.active");

    // Vérifie si race et genre sont bien sélectionnés
    if (!raceChoice || !genreChoice) {
      // alert("Veuillez sélectionner une race et un genre avant de forger un nom.");
      return;
    }

    let monNom = generateName();
    const yourName = document.querySelector(".yourName p");
    if (!yourName) return;
    yourName.textContent = `Votre nom est : "${monNom}"`;
  });
}

afficherNom();

document.addEventListener("DOMContentLoaded", () => {
  const musicToggle = document.getElementById("music-toggle");
  const backgroundMusic = document.getElementById("background-music");

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
});

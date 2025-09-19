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

      // choisir l'image selon le genre sélectionné
      if (genre === "masculin") {
        img.src = `images/picto/${race}.png`;
      } else {
        img.src = `images/picto/${race}-feminin.png`;
      }
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
    } else {
      nom = randomNbr(prefixesHumainFeminin) + randomNbr(suffixesHumainFeminin);
    }
  }
  if (raceData === "elfe") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesElfeMasculin) + randomNbr(suffixesElfeMasculin);
    } else {
      nom = randomNbr(prefixesElfeFeminin) + randomNbr(suffixesElfeFeminin);
    }
  }
  if (raceData === "nain") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesNainMasculin) + randomNbr(suffixesNainMasculin);
    } else {
      nom = randomNbr(prefixesNainFeminin) + randomNbr(suffixesNainFeminin);
    }
  }
  if (raceData === "gnome") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesGnomeMasculin) + randomNbr(suffixesGnomeMasculin);
    } else {
      nom = randomNbr(prefixesGnomeFeminin) + randomNbr(suffixesGnomeFeminin);
    }
  }
  if (raceData === "orc") {
    if (genreData === "masculin") {
      nom = randomNbr(prefixesOrcMasculin) + randomNbr(suffixesOrcMasculin);
    } else {
      nom = randomNbr(prefixesOrcFeminin) + randomNbr(suffixesOrcFeminin);
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

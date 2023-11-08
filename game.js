let cards = [];
let firstCard = null;
let secondCard = null;
let score = 0;
let timer = 0;
let timerInterval;
let isMuted = false;
let isPaused = false;
let lastAudio = undefined;
let popup = document.getElementById("popUpId"); // Get the popup
let xButton = document.getElementById("button_trigger"); // Get the button that opens the popup
let closeElements = document.querySelectorAll(".button_close"); // Get the element that closes the popup
let currentLanguage = localStorage.getItem("language") || "english"; // Använd engelska som standard om inget är sparad
const goBackButton = document.getElementById("goBackButton");

// VISIT EARLIER PAGE OR MENU.HTML
goBackButton.addEventListener("click", function () {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "menu.html.";
  }
});

// FUNCTIONS FOR CLOSING POPUP "AVSLUTA"
xButton.onclick = function () {
  // When the user clicks the button, open the popup
  popup.style.display = "flex";
};

closeElements.forEach((e) => {
  e.onclick = function () {
    popup.style.display = "none";
  };
});

window.onclick = function (event) {
  // When the user clicks anywhere outside of the popup, close it
  if (event.target == popup) {
    popup.style.display = "none";
  }
};

function updateScore() {
  document.querySelectorAll(".score").forEach((span) => {
    span.textContent = score;
  });
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function updateTitle() {
  document.getElementById("cate").innerText =
    localStorage.getItem("categoryTitle");
}

// TESTAR
// Funktion för att ändra språket
function changeLanguage(newLanguage) {
  currentLanguage = newLanguage;
  // Kör en funktion för att generera korten igen med det nya språket
  regenerateCards();
}

function generateCardDiv(card) {
  const language = currentLanguage === "french" ? "french" : "english";
  return `
  <div class="front">
  <img class="front-image" src=${card.image} />
  <p class="card-text">${card.language[currentLanguage]}</p>
</div>
<div class="back"></div>
    `;
}

function generateCards() {
  const gridContainer = document.querySelector(".section_game");
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = generateCardDiv(card);
    gridContainer.appendChild(cardElement);

    cardElement.clickTrigger = function () {
      if (isPaused || (firstCard && secondCard)) {
        return;
      }

      if (!isMuted) {
        const audioLanguage =
          currentLanguage === "french" ? "french" : "english";
        playCardSound(card.audio[audioLanguage]); // Spela upp ljudet när kortet klickas på
      }

      flipCard.call(this);
    };

    cardElement.addEventListener("click", cardElement.clickTrigger);
  }
}

/* BACKUP
function generateCardDiv(card) {
  return `
    <div class="front">
        <img class="front-image" src=${card.image} />
        <p class="card-text">${card.language.french}</p>
    </div>
    <div class="back"></div>
    `;
}

function generateCards() {
  const gridContainer = document.querySelector(".section_game");
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = generateCardDiv(card);
    gridContainer.appendChild(cardElement);

    cardElement.clickTrigger = function () {
      if (isPaused || (firstCard && secondCard)) {
        return;
      }

      if (!isMuted) {
        playCardSound(card.audio.french); // Spela upp ljudet när kortet klickas på
      }

      flipCard.call(this);
    };

    cardElement.addEventListener("click", cardElement.clickTrigger);
  }
}
*/

function playCardSound(audioSrc) {
  lastAudio = new Audio(audioSrc);
  lastAudio.play();
}

function flipCard() {
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    startTimer();
    return;
  }

  secondCard = this;
  score++;
  updateScore();

  checkForMatch();
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      if (!isPaused) {
        timer++;
        updateGameSeconds();
      }
    }, 1000);
  }
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", firstCard.clickTrigger);
  secondCard.removeEventListener("click", secondCard.clickTrigger);
  resetBoard();
  if (document.querySelectorAll(".card:not(.flipped)").length === 0) {
    endGame();
  }
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
}

function updateGameSeconds() {
  document.querySelectorAll(".info-seconds").forEach((span) => {
    span.innerText = timer;
  });
}

function updatePage() {
  updateRounds();
  updateScore();
  updateTitle();
  updateTotalTime();
  updateGameSeconds();
}

function registerMuteButton() {
  const muteButton = document.getElementById("button-mute");
  const iconSound = document.getElementById("sound-icon");
  muteButton.addEventListener("click", () => {
    isMuted = !isMuted; // Växla ljudets tillstånd

    iconSound.src = isMuted
      ? "icons/buttons/button_sound-off.png"
      : "icons/buttons/button_sound-on.png";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  hideEndGameInfo();
  showGameInfo();
  registerMuteButton();
  updatePage();
});

function increaseTotalTime() {
  let previousTotalTime = parseInt(localStorage.getItem("totalTime")) || 0;
  let currentTotalTime = previousTotalTime + timer;
  localStorage.setItem("totalTime", currentTotalTime);
}

function increaseRounds() {
  let rounds = localStorage.getItem("totalRounds") || 0;
  localStorage.setItem("totalRounds", ++rounds);
}

function increaseStars() {
  const category = localStorage.getItem("selectedCategory");
  let stars = localStorage.getItem("stars-" + category) || 0;
  localStorage.setItem("stars-" + category, ++stars);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timer = 0;
}

function hideGameInfo() {
  document.querySelector(".container_game-info").style.display = "none";
}

function showGameInfo() {
  document.querySelector(".container_game-info").style.display = "flex";
}

function hideEndGameInfo() {
  document.querySelector(".section_end-game").style.display = "none";
}
function showEndGameInfo() {
  document.querySelector(".section_end-game").style.display = "flex";
}

function resetScore() {
  score = 0;
  updateScore();
}

function resetCards() {
  const gridContainer = document.querySelector(".section_game");
  gridContainer.innerHTML = "";
}

function pause() {
  const playPause = document.getElementById("play-pause");

  if (isPaused) {
    isPaused = false;
    playPause.src = "icons/buttons/button_pause.png";
  } else {
    isPaused = true;

    playPause.src = "icons/buttons/button_play.png";
  }
}

// När spelet är slut
function endGame() {
  increaseRounds();
  increaseTotalTime();
  increaseStars();
  updatePage();
  resetTimer();
  hideGameInfo();
  showEndGameInfo();
}

// När spelet startas om
function restartGame() {
  hideEndGameInfo();
  showGameInfo();
  resetBoard();
  resetScore();
  resetCards();
  shuffleCards();
  generateCards();
  updatePage();
}

function main() {
  let category = localStorage.getItem("selectedCategory");

  fetch("./data/" + category + ".json")
    .then((res) => res.json())
    .then((data) => {
      cards = [...data, ...data];
      shuffleCards();
      generateCards();
    });
}

main();

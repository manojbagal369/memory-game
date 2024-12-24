const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const playerNameInput = document.getElementById("player-name");
let cards;
let interval;
let firstCard = false;
let secondCard = false;
let playerName = ""; // Variable to store player's name

// Items array
const items = [
  { name: "elon", image: "img/elon.jpg" },
  { name: "kim", image: "img/kim.jpg" },
  { name: "maj", image: "img/maj.jpg" },
  { name: "meloni", image: "img/meloni.jpg" },
  { name: "modi", image: "img/modi.jpg" },
  { name: "putin", image: "img/putin.jpg" },
  { name: "trump", image: "img/trump.jpg" },
  { name: "xi", image: "img/xi.jpg" },
];

// Initial Time
let seconds = 0,
  minutes = 0;
// Initial moves and win count
let movesCount = 0,
  winCount = 0;

// For timer
const timeGenerator = () => {
  seconds += 1;
  // minutes logic
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }
  // format time before displaying
  let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
  let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
  timeValue.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

// For calculating moves
const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Moves:</span>${movesCount}`;
};

// Pick random objects from the items array
const generateRandom = (size = 4) => {
  // temporary array
  let tempArray = [...items];
  // initializes cardValues array
  let cardValues = [];
  // size should be double (4*4 matrix)/2 since pairs of objects would exist
  size = (size * size) / 2;
  // Random object selection
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    // once selected remove the object from temp array
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

// Generate matrix with cards
const matrixGenerator = (cardValues, size = 4) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues]; // Duplicate for pairs
  // simple shuffle
  cardValues.sort(() => Math.random() - 0.5);
  for (let i = 0; i < size * size; i++) {
    gameContainer.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i].name}">
        <div class="card-before">?</div>
        <div class="card-after">
          <img src="${cardValues[i].image}" class="image"/>
        </div>
      </div>
    `;
  }
  // Grid
  gameContainer.style.gridTemplateColumns = `repeat(${size},auto)`;
  // Cards
  cards = document.querySelectorAll(".card-container");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // If selected card is not matched yet, then only run (i.e already matched card when clicked would be ignored)
      if (!card.classList.contains("matched")) {
        // Flip the clicked card
        card.classList.add("flipped");
        // If it is the firstCard (!firstCard since firstCard is initially false)
        if (!firstCard) {
          // So the current card will become firstCard
          firstCard = card;
          // Current card's value becomes firstCardValue
          firstCardValue = card.getAttribute("data-card-value");
        } else {
          // Increment moves since user selected second card
          movesCounter();
          // SecondCard and value
          secondCard = card;
          let secondCardValue = card.getAttribute("data-card-value");
          if (firstCardValue === secondCardValue) {
            // If both cards match add matched class so these cards would be ignored next time
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            // Set firstCard to false since next card would be first now
            firstCard = false;
            // winCount increment as user found a correct match
            winCount += 1;
            // Check if winCount == half of cardValues
            if (winCount === Math.floor(cardValues.length / 2)) {
              result.innerHTML = `<h2>You Won!</h2>
                <h4>Moves: ${movesCount}</h4>
                <h4>Time: ${minutes < 10 ? "0" + minutes : minutes}:${
                seconds < 10 ? "0" + seconds : seconds
              }</h4>`;
              saveToLeaderboard(); // Save the score to the leaderboard
              displayLeaderboard(); // Display the leaderboard
              stopGame(); // Stop the game
            }
          } else {
            // If the cards don't match
            // Flip the cards back to normal
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            secondCard = false;
            let delay = setTimeout(() => {
              tempFirst.classList.remove("flipped");
              tempSecond.classList.remove("flipped");
            }, 900);
          }
        }
      }
    });
  });
};

// Save to leaderboard (localStorage)
const saveToLeaderboard = () => {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

  const leaderboardEntry = {
    name: playerName,
    time: `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`,
    moves: movesCount,
  };

  leaderboard.push(leaderboardEntry);

  leaderboard.sort((a, b) => {
    if (a.moves === b.moves) {
      return (
        a.time.split(":")[0] - b.time.split(":")[0] || // Compare minutes
        a.time.split(":")[1] - b.time.split(":")[1] // Compare seconds
      );
    }
    return a.moves - b.moves; // Sort by moves
  });

  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 10)));
};

// Display leaderboard
const displayLeaderboard = () => {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  result.innerHTML = `<h2>Leaderboard</h2><ul>${leaderboard
    .map(
      (entry) => `
    <li><strong>${entry.name}</strong> - ${entry.time} - Moves: ${entry.moves}</li>`
    )
    .join("")}</ul>`;
};

// Start game
startButton.addEventListener("click", () => {
  playerName = playerNameInput.value; // Get the player's name from input field
  if (!playerName) {
    alert("Please enter your name to start the game");
    return;
  }

  movesCount = 0;
  seconds = 0;
  minutes = 0;

  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");

  interval = setInterval(timeGenerator, 1000);
  moves.innerHTML = `<span>Moves:</span>${movesCount}`;
  initializer();
});

// Stop game
stopButton.addEventListener("click", () => {
  controls.classList.remove("hide");
  stopButton.classList.add("hide");
  startButton.classList.remove("hide");
  playerNameInput.value = ""; // Reset the name field after the game ends
  clearInterval(interval);
  initializer(); // Add this to reset the game state
  displayLeaderboard(); // Display the leaderboard after game ends
});

// Initialize values and function calls
const initializer = () => {
  result.innerText = "";
  winCount = 0;
  let cardValues = generateRandom();
  matrixGenerator(cardValues);
};
document.getElementById("leaderboard").style.display = "block";

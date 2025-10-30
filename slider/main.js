const moves = document.getElementById("moves");
const container = document.querySelector(".container");
const instructions = document.querySelector(".container");
const buttons = document.querySelector(".buttons");
const gamebuttons = document.querySelector(".game-buttons");
const startButton = document.getElementById("start-button");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
const reshuffle = document.getElementById("reshuffle");
const coverScreen = document.querySelector(".cover-screen");
const right = document.querySelector(".fa-chevron-right");
const left = document.querySelector(".fa-chevron-left");
const result = document.getElementById("result");
const timerDisplay = document.getElementById("timer");
let currentElement = "";
let movesCount,
  imagesArr = [];
let imgFolder = 1;

// Timer variables
let seconds = 0;
let minutes = 0;
let timerInterval = null;

let gameState = {
  currentLevel: 1,
  completedLevels: [],
  bestMoves: {},
  bestTimes: {},
  currentStates: {}, // Store current puzzle state for each level
  moveCounts: {}, // Store move counts for each level
  timerStates: {} // Store timer states for each level
};

const loadProgress = () => {
  const savedProgress = localStorage.getItem('sliderPuzzleProgress');
  if (savedProgress) {
    gameState = JSON.parse(savedProgress);
    imgFolder = gameState.currentLevel;
    
    // Load saved state for current level if it exists
    if (gameState.currentStates && gameState.currentStates[imgFolder]) {
      imagesArr = [...gameState.currentStates[imgFolder]];
      movesCount = gameState.moveCounts[imgFolder] || 0;
      
      // Load timer state if it exists
      if (gameState.timerStates && gameState.timerStates[imgFolder]) {
        const timerState = gameState.timerStates[imgFolder];
        minutes = timerState.minutes || 0;
        seconds = timerState.seconds || 0;
        timerDisplay.innerText = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  }
};

const saveProgress = () => {
  gameState.currentLevel = imgFolder;
  
  // Save current puzzle state
  if (!gameState.currentStates) gameState.currentStates = {};
  gameState.currentStates[imgFolder] = [...imagesArr];
  
  // Save move count
  if (!gameState.moveCounts) gameState.moveCounts = {};
  gameState.moveCounts[imgFolder] = movesCount;
  
  // Save timer state
  if (!gameState.timerStates) gameState.timerStates = {};
  gameState.timerStates[imgFolder] = {
    minutes: minutes,
    seconds: seconds
  };
  
  localStorage.setItem('sliderPuzzleProgress', JSON.stringify(gameState));
};

const completeLevel = () => {
  if (!gameState.completedLevels.includes(imgFolder)) {
    gameState.completedLevels.push(imgFolder);
  }
  
  const currentTime = timerDisplay.innerText.slice(6);
  if (!gameState.bestMoves[imgFolder] || movesCount < gameState.bestMoves[imgFolder]) {
    gameState.bestMoves[imgFolder] = movesCount;
  }
  if (!gameState.bestTimes[imgFolder]) {
    gameState.bestTimes[imgFolder] = currentTime;
  } else {
    // Compare times (format: mm:ss)
    const [bestMin, bestSec] = gameState.bestTimes[imgFolder].split(':').map(Number);
    const [currentMin, currentSec] = currentTime.split(':').map(Number);
    const bestTotal = bestMin * 60 + bestSec;
    const currentTotal = currentMin * 60 + currentSec;
    
    if (currentTotal < bestTotal) {
      gameState.bestTimes[imgFolder] = currentTime;
    }
  }
  
  // Clear the saved state for completed level since it's finished
  if (gameState.currentStates && gameState.currentStates[imgFolder]) {
    delete gameState.currentStates[imgFolder];
  }
  if (gameState.moveCounts && gameState.moveCounts[imgFolder]) {
    delete gameState.moveCounts[imgFolder];
  }
  if (gameState.timerStates && gameState.timerStates[imgFolder]) {
    delete gameState.timerStates[imgFolder];
  }
  
  saveProgress();
};

// Timer functions
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  // Don't reset timer if we're loading a saved state
  if (movesCount === 0) {
    seconds = 0;
    minutes = 0;
  }
  timerInterval = setInterval(updateTimer, 1000);
  timerDisplay.classList.remove('hide');
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

const updateTimer = () => {
  seconds++;
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  timerDisplay.innerText = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  // Auto-save progress every 10 seconds
  if (seconds % 10 === 0) {
    saveProgress();
  }
};

const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

const getInversionCount = (arr) => {
  const puzzleArray = [...arr];
  const withoutBlank = puzzleArray.filter(num => num !== 9);
  let inversions = 0;
  
  for (let i = 0; i < withoutBlank.length - 1; i++) {
    for (let j = i + 1; j < withoutBlank.length; j++) {
      if (withoutBlank[i] > withoutBlank[j]) {
        inversions++;
      }
    }
  }
  
  return inversions;
};

const isSolvable = (arr) => {
  const inversions = getInversionCount(arr);
  return inversions % 2 === 0;
};

const generateSolvableConfig = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  do {
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
  } while (!isSolvable(numbers));
  
  return numbers;
};

const randomImages = () => {
  // Only generate new images if we don't have a saved state
  if (!gameState.currentStates || !gameState.currentStates[imgFolder]) {
    imagesArr = generateSolvableConfig();
  }
  // Otherwise, imagesArr is already loaded from saved state
};

const getCoords = (element) => {
  const [row, col] = element.getAttribute("data-position").split("_");
  return [parseInt(row), parseInt(col)];
};

const checkAdjacent = (row1, row2, col1, col2) => {
  if (row1 == row2) {
    if (col2 == col1 - 1 || col2 == col1 + 1) {
      return true;
    }
  } else if (col1 == col2) {
    if (row2 == row1 - 1 || row2 == row1 + 1) {
      return true;
    }
  }
  return false;
};

const gridGenerator = () => {
  let count = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let div = document.createElement("div");
      div.setAttribute("data-position", `${i}_${j}`);
      div.addEventListener("click", selectImage);
      div.classList.add("image-container");
      div.innerHTML = `<img src="images${imgFolder}/image_part_00${
        imagesArr[count]
      }.png" id="${imagesArr[count]}" class="image ${
        imagesArr[count] == 9 ? "target" : ""
      }" data-index="${imagesArr[count]}"/>`;
      count += 1;
      container.appendChild(div);
    }
  }
};

const selectImage = (e) => {
  e.preventDefault();
  currentElement = e.target;
  let targetElement = document.querySelector(".target");
  let currentParent = currentElement.parentElement;
  let targetParent = targetElement.parentElement;
  
  const [row1, col1] = getCoords(currentParent);
  const [row2, col2] = getCoords(targetParent);
  
  if (checkAdjacent(row1, row2, col1, col2)) {
    currentElement.remove();
    targetElement.remove();
    let currentIndex = parseInt(currentElement.getAttribute("data-index"));
    let targetIndex = parseInt(targetElement.getAttribute("data-index"));
    currentElement.setAttribute("data-index", targetIndex);
    targetElement.setAttribute("data-index", currentIndex);
    currentParent.appendChild(targetElement);
    targetParent.appendChild(currentElement);
    let currentArrIndex = imagesArr.indexOf(currentIndex);
    let targetArrIndex = imagesArr.indexOf(targetIndex);
    [imagesArr[currentArrIndex], imagesArr[targetArrIndex]] = [
      imagesArr[targetArrIndex],
      imagesArr[currentArrIndex],
    ];
    
    let imagesAll = [...document.querySelectorAll('.image')]
    imagesAll = imagesAll.map(image => {
      return image.id
    })
    
    if (imagesAll.join("") == "123456789") {
      setTimeout(() => {
        stopTimer();
        moves.classList.add('hide');
        timerDisplay.classList.add('hide');
        gamebuttons.classList.add('hide'); // Hide game buttons
        nextButton.classList.remove('hide');
        prevButton.classList.remove('hide');
        coverScreen.classList.remove("hide");
        container.classList.add("hide");
        
        // Save progress when level is completed
        completeLevel();
        
        // Show best scores if available
        let bestScoresText = '';
        if (gameState.bestMoves[imgFolder] || gameState.bestTimes[imgFolder]) {
          bestScoresText = `\nBest: ${gameState.bestMoves[imgFolder]} moves, ${gameState.bestTimes[imgFolder]} time`;
        }
        
        result.innerText = `Total Moves: ${movesCount}\nTime: ${timerDisplay.innerText.slice(6)}${bestScoresText}\nGreat Job!`;
        startButton.innerText = "Restart Game";
      }, 1000);
    }
    movesCount += 1;
    moves.innerText = `Moves: ${movesCount}`;
    
    // Save progress after each move
    saveProgress();
  }
};

startButton.addEventListener("click", () => {
  // If restarting, clear saved state for this level
  if (gameState.currentStates && gameState.currentStates[imgFolder]) {
    delete gameState.currentStates[imgFolder];
  }
  if (gameState.moveCounts && gameState.moveCounts[imgFolder]) {
    delete gameState.moveCounts[imgFolder];
  }
  if (gameState.timerStates && gameState.timerStates[imgFolder]) {
    delete gameState.timerStates[imgFolder];
  }
  
  showNew();
  moves.innerText = `Moves: ${movesCount}`;
  startTimer();
  gamebuttons.classList.remove('hide');
});

window.onload = () => {
  loadProgress();
  coverScreen.classList.remove("hide");
  container.classList.add("hide");
  moves.classList.add('hide');
  timerDisplay.classList.add('hide');
  gamebuttons.classList.add('hide'); // Hide game buttons initially
};

nextButton.addEventListener('click', () => {
  if (imgFolder > 8) {
    imgFolder = 8;
    return;
  }
  imgFolder++;
  showNew();
  startTimer();
  saveProgress();
  gamebuttons.classList.remove('hide');
});

right.addEventListener('click', () => {
  if (imgFolder > 8) {
    imgFolder = 8;
    return;
  }
  imgFolder++;
  showNew();
  startTimer();
  saveProgress();
});

prevButton.addEventListener('click', () => {
  if (imgFolder < 2) {
    imgFolder = 1;
    return;
  }
  imgFolder--;
  showNew();
  startTimer();
  saveProgress();
  gamebuttons.classList.remove('hide');
});

left.addEventListener('click', () => {
  if (imgFolder < 2) {
    imgFolder = 1;
    return;
  }
  imgFolder--;
  showNew();
  startTimer();
  saveProgress();
});

reshuffle.addEventListener('click', () => {
  // Clear saved state when reshuffling
  if (gameState.currentStates && gameState.currentStates[imgFolder]) {
    delete gameState.currentStates[imgFolder];
  }
  if (gameState.moveCounts && gameState.moveCounts[imgFolder]) {
    delete gameState.moveCounts[imgFolder];
  }
  if (gameState.timerStates && gameState.timerStates[imgFolder]) {
    delete gameState.timerStates[imgFolder];
  }
  
  container.innerHTML = '';
  moves.innerText = `Moves: 0`;
  movesCount = 0;
  imagesArr = [];
  randomImages();
  gridGenerator();
  startTimer();
  saveProgress();
});

function showNew() {
  container.classList.remove("hide");
  coverScreen.classList.add("hide");
  moves.classList.remove("hide");
  container.innerHTML = "";
  
  // Only reset if we don't have a saved state
  if (!gameState.currentStates || !gameState.currentStates[imgFolder]) {
    imagesArr = [];
    movesCount = 0;
    seconds = 0;
    minutes = 0;
  }
  
  randomImages();
  gridGenerator();
  moves.innerText = `Moves: ${movesCount}`;
  
  // Update timer display if we have saved time
  if (gameState.timerStates && gameState.timerStates[imgFolder]) {
    timerDisplay.innerText = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

const resetProgress = () => {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    localStorage.removeItem('sliderPuzzleProgress');
    gameState = {
      currentLevel: 1,
      completedLevels: [],
      bestMoves: {},
      bestTimes: {},
      currentStates: {},
      moveCounts: {},
      timerStates: {}
    };
    imgFolder = 1;
    imagesArr = [];
    movesCount = 0;
    seconds = 0;
    minutes = 0;
    showNew();
  }
};

// Optional: Add reset button to HTML and uncomment below
// document.getElementById('reset-progress').addEventListener('click', resetProgress);
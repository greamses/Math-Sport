function runGame (sets, mazeLayout){

let workingsets = [...sets]

// Game constants
const CELL_SIZE = 20;
const PACMAN_SPEED = 1;
let currentVocabSetIndex = -1;
const GHOST_SPEED = 0.3;
const GAME_DURATION = 300;
const GHOST_INCREASE_INTERVAL = 30;
const INITIAL_GHOST_COUNT = 2;
const MAX_GHOST_COUNT = 8;
const CAMERA_LERP_FACTOR = 0.1
const CAMERA_VIEW_WIDTH = 320;
const CAMERA_VIEW_HEIGHT = 350;
let canvas, ctx;
let camera = { x: 0, y: 0 };
let pacman = { x: 0, y: 0, radius: 8, direction: 'right', nextDirection: 'right', mouthAngle: 0 };
let ghosts = [];
let walls = [];
let wordCells = [];
let collectedWords = [];
let score = 0;
let timeLeft = GAME_DURATION;
let gameInterval;
let timerInterval;
let isGameRunning = false;
let currentSentence = "";
let correctSynonym = "";
let currentGhostCount = INITIAL_GHOST_COUNT;
let isTeleporting = false;
let teleportProgress = 0;
const TELEPORT_DURATION = 1000;
let teleportStartTime = 0;
let targetPath = [];
let isFollowingPath = false;
let currentPathIndex = 0;
const TOUCH_ZONE_LEFT = 0.3; 
const TOUCH_ZONE_RIGHT = 0.7; 
const TOUCH_ZONE_TOP = 0.3; 
const TOUCH_ZONE_BOTTOM = 0.7; 

const GHOST_BEHAVIORS = {
  CHASER: 0, // Directly chases Pac-Man
  AMBUSHER: 1, // Tries to intercept Pac-Man
  RANDOM: 2, // Moves randomly
  PATROLLER: 3 // Patrols specific areas
};

// Initializations
function initGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  // Set canvas size
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize game elements
  initMaze();
  initPacman();
  initGhosts();
  initWordCells();
  setupTouchControls();
  setupControls();

  // Show start modal
  document.getElementById('startModal').style.display = 'flex';
}

function initMaze() {
  walls = [];
  for (let y = 0; y < mazeLayout.length; y++) {
    for (let x = 0; x < mazeLayout[y].length; x++) {
      if (mazeLayout[y][x] === 1) {
        walls.push({ x, y });
      }
    }
  }
}

function initPacman() {

  for (let y = 0; y < mazeLayout.length; y++) {
    for (let x = 0; x < mazeLayout[y].length; x++) {
      if (mazeLayout[y][x] === 0) {
        pacman.x = x * CELL_SIZE + CELL_SIZE / 2;
        pacman.y = y * CELL_SIZE + CELL_SIZE / 2;
        // Reset movement properties
        resetPathfinding(); // Reset pathfinding when Pacman is initialized
        return;
      }
    }
  }
}

function initWordCells() {
  wordCells = [];
  collectedWords = [];

  if (workingsets.length === 0) {
    workingsets = [...sets];
  }

  currentVocabSetIndex = Math.floor(Math.random() * workingsets.length);
  const vocabSet = workingsets[currentVocabSetIndex];

  // Set current game context
  currentSentence = vocabSet.sentence;
  correctSynonym = vocabSet.correct;

  // Display the current sentence
  const sentenceDisplay = document.getElementById('sentence-display');
  if (sentenceDisplay) {
    sentenceDisplay.textContent = ` "${currentSentence}"`;
  }

  // Get all possible word positions
  const allWordPositions = [];
  for (let y = 0; y < mazeLayout.length; y++) {
    for (let x = 0; x < mazeLayout[y].length; x++) {
      if (mazeLayout[y][x] === 'W') {
        allWordPositions.push({ x, y });
      }
    }
  }

  // Minimum distance between words (in grid cells)
  const MIN_DISTANCE = 3;
  const wordColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#009688'];
  const availableColors = [...wordColors];
  const placedWords = [];

  // Place correct answer first
  if (allWordPositions.length > 0) {
    const correctPos = allWordPositions[Math.floor(Math.random() * allWordPositions.length)];
    const correctColor = availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0];
    wordCells.push({
      x: correctPos.x,
      y: correctPos.y,
      word: correctSynonym,
      isCorrect: true,
      collected: false,
      color: correctColor
    });
    placedWords.push(correctPos);
  }

  // Place incorrect answers with distance check
  const incorrectOptions = vocabSet.incorrect || [];
  for (let optionIndex = 0; optionIndex < incorrectOptions.length; optionIndex++) {
    // Filter positions that are far enough from existing words
    const validPositions = allWordPositions.filter(pos => {
      return !placedWords.some(placed => {
        const dx = Math.abs(pos.x - placed.x);
        const dy = Math.abs(pos.y - placed.y);
        return dx < MIN_DISTANCE && dy < MIN_DISTANCE;
      });
    });

    if (validPositions.length === 0) {
      console.warn("Couldn't find valid position for word - skipping");
      continue;
    }

    const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
    const color = availableColors.length > 0 ?
      availableColors.splice(Math.floor(Math.random() * availableColors.length), 1)[0] :
      '#FFFFFF'; // Fallback color if we run out

    wordCells.push({
      x: randomPos.x,
      y: randomPos.y,
      word: incorrectOptions[optionIndex],
      isCorrect: false,
      collected: false,
      color: color
    });
    placedWords.push(randomPos);
  }
}

function startGame() {
  document.getElementById('startModal').style.display = 'none';
  document.getElementById('backgroundMusic').play();

  // Reset ghost count
  currentGhostCount = INITIAL_GHOST_COUNT;
  score = 0;
  timeLeft = GAME_DURATION;
  updateScore();
  updateTimer(); // This will now show the formatted time

  isGameRunning = true;

  // Start game loop
  gameInterval = setInterval(updateGame, 1000 / 60);

  // Start timer
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function restartGame() {
  document.getElementById('gameOverModal').classList.remove('show');
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  workingsets = [...sets];
  currentGhostCount = INITIAL_GHOST_COUNT;

  resetPathfinding(); // Reset pathfinding state
  initPacman();
  initGhosts();
  initWordCells();

  startGame();
}

function resizeCanvas() {
  // Adjust canvas to fill most of the screen while maintaining aspect ratio
  canvas.width = CAMERA_VIEW_WIDTH;
  canvas.height = CAMERA_VIEW_HEIGHT;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
}

function drawMaze() {
  ctx.fillStyle = '#1a1a6e';
  ctx.strokeStyle = '#3333ff';
  ctx.lineWidth = 2;

  for (const wall of walls) {
    ctx.fillRect(
      wall.x * CELL_SIZE,
      wall.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
    ctx.strokeRect(
      wall.x * CELL_SIZE,
      wall.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }
}

function drawWordCells() {

  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const wordCell of wordCells) {
    if (wordCell.collected) continue;

    const cellX = wordCell.x * CELL_SIZE + CELL_SIZE / 2;
    const cellY = wordCell.y * CELL_SIZE + CELL_SIZE / 2;

    // Measure text width
    const textWidth = ctx.measureText(wordCell.word).width;
    const boxWidth = textWidth + 20;
    const boxHeight = 24;
    const cornerRadius = 12;

    // Use the pre-assigned color
    ctx.fillStyle = wordCell.color;


    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(cellX - boxWidth / 2 + cornerRadius, cellY - boxHeight / 2);
    ctx.lineTo(cellX + boxWidth / 2 - cornerRadius, cellY - boxHeight / 2);
    ctx.quadraticCurveTo(cellX + boxWidth / 2, cellY - boxHeight / 2, cellX + boxWidth / 2, cellY - boxHeight / 2 + cornerRadius);
    ctx.lineTo(cellX + boxWidth / 2, cellY + boxHeight / 2 - cornerRadius);
    ctx.quadraticCurveTo(cellX + boxWidth / 2, cellY + boxHeight / 2, cellX + boxWidth / 2 - cornerRadius, cellY + boxHeight / 2);
    ctx.lineTo(cellX - boxWidth / 2 + cornerRadius, cellY + boxHeight / 2);
    ctx.quadraticCurveTo(cellX - boxWidth / 2, cellY + boxHeight / 2, cellX - boxWidth / 2, cellY + boxHeight / 2 - cornerRadius);
    ctx.lineTo(cellX - boxWidth / 2, cellY - boxHeight / 2 + cornerRadius);
    ctx.quadraticCurveTo(cellX - boxWidth / 2, cellY - boxHeight / 2, cellX - boxWidth / 2 + cornerRadius, cellY - boxHeight / 2);
    ctx.closePath();
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Add a subtle shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw word with white text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(wordCell.word, cellX, cellY);

    // Reset shadow
    ctx.shadowColor = 'transparent';
  }
}

function drawGhosts() {
  for (const ghost of ghosts) {
    // Draw ghost body
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, ghost.radius, Math.PI, 0, false);
    ctx.lineTo(ghost.x + ghost.radius, ghost.y + ghost.radius);

    // Draw ghost bottom waves
    const waveSize = ghost.radius / 3;
    for (let i = 0; i < 3; i++) {
      ctx.lineTo(
        ghost.x + ghost.radius - (i * waveSize * 2) - waveSize,
        ghost.y + ghost.radius
      );
      ctx.lineTo(
        ghost.x + ghost.radius - (i * waveSize * 2) - (waveSize * 2),
        ghost.y + ghost.radius - waveSize
      );
    }
    ctx.lineTo(ghost.x - ghost.radius, ghost.y + ghost.radius);
    ctx.closePath();
    ctx.fill();

    // Draw ghost eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ghost.x - 3, ghost.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(ghost.x + 3, ghost.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.arc(ghost.x - 3, ghost.y - 2, 1, 0, Math.PI * 2);
    ctx.arc(ghost.x + 3, ghost.y - 2, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPacman() {
  if (isTeleporting) {
    // Calculate teleport animation progress (0 to 1)
    const progress = (Date.now() - teleportStartTime) / TELEPORT_DURATION;

    if (progress >= 1) {
      // Teleport complete
      isTeleporting = false;
      teleportProgress = 0;
      drawNormalPacman();
    } else {
      // Draw shrinking Pacman
      ctx.fillStyle = '#ffcc00';
      const currentRadius = pacman.radius * (1 - progress);
      ctx.beginPath();
      ctx.arc(pacman.x, pacman.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    drawNormalPacman();
  }
}

function findPathToWord(targetWord) {
  // Convert positions to grid coordinates
  const startX = Math.floor(pacman.x / CELL_SIZE);
  const startY = Math.floor(pacman.y / CELL_SIZE);
  const targetX = targetWord.x;
  const targetY = targetWord.y;

  // A* pathfinding implementation
  const openSet = [{ x: startX, y: startY, g: 0, h: heuristic(startX, startY, targetX, targetY), parent: null }];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(`${startX},${startY}`, 0);
  fScore.set(`${startX},${startY}`, heuristic(startX, startY, targetX, targetY));

  while (openSet.length > 0) {
    // Sort by fScore and get lowest
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    // Found target
    if (current.x === targetX && current.y === targetY) {
      // Reconstruct path
      const path = [];
      let node = current;
      while (node.parent) {
        path.unshift([node.x, node.y]);
        node = node.parent;
      }
      targetPath = path;
      isFollowingPath = true;
      currentPathIndex = 0;
      return;
    }

    closedSet.add(`${current.x},${current.y}`);

    // Explore neighbors
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // up, down, left, right
    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      // Check bounds and walls
      if (nx >= 0 && nx < mazeLayout[0].length &&
        ny >= 0 && ny < mazeLayout.length &&
        mazeLayout[ny][nx] !== 1 &&
        !closedSet.has(`${nx},${ny}`)) {

        const tentativeG = gScore.get(`${current.x},${current.y}`) + 1;

        if (!gScore.has(`${nx},${ny}`) || tentativeG < gScore.get(`${nx},${ny}`)) {
          cameFrom.set(`${nx},${ny}`, current);
          gScore.set(`${nx},${ny}`, tentativeG);
          fScore.set(`${nx},${ny}`, tentativeG + heuristic(nx, ny, targetX, targetY));

          if (!openSet.some(n => n.x === nx && n.y === ny)) {
            openSet.push({
              x: nx,
              y: ny,
              g: tentativeG,
              h: heuristic(nx, ny, targetX, targetY),
              f: tentativeG + heuristic(nx, ny, targetX, targetY),
              parent: current
            });
          }
        }
      }
    }
  }

}

function heuristic(x1, y1, x2, y2) {
  // Manhattan distance
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function resetPathfinding() {
  targetPath = [];
  isFollowingPath = false;
  currentPathIndex = 0;
  pacman.nextDirection = 'none';
  pacman.direction = 'none';
}

function drawGame() {
  updateCamera();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  ctx.translate(-camera.x, -camera.y);

  drawMaze();

  drawWordCells();

  drawGhosts();

  drawPacman();

  ctx.restore();

  if (isFollowingPath && targetPath.length > 0) {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Draw path dots
    for (let i = currentPathIndex; i < targetPath.length; i++) {
      const [x, y] = targetPath[i];
      ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Draw connecting lines
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pacman.x, pacman.y);

    for (let i = currentPathIndex; i < targetPath.length; i++) {
      const [x, y] = targetPath[i];
      ctx.lineTo(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2
      );
    }

    ctx.stroke();
    ctx.restore();
  }

}

function drawNormalPacman() {
  ctx.fillStyle = '#ffcc00';

  if (pacman.direction === 'none') {
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  let startAngle, endAngle;
  switch (pacman.direction) {
    case 'right':
      startAngle = 0.2 + pacman.mouthAngle;
      endAngle = Math.PI * 2 - 0.2 - pacman.mouthAngle;
      break;
    case 'left':
      startAngle = Math.PI + 0.2 + pacman.mouthAngle;
      endAngle = Math.PI - 0.2 - pacman.mouthAngle;
      break;
    case 'up':
      startAngle = Math.PI * 1.5 + 0.2 + pacman.mouthAngle;
      endAngle = Math.PI * 1.5 - 0.2 - pacman.mouthAngle;
      break;
    case 'down':
      startAngle = Math.PI * 0.5 + 0.2 + pacman.mouthAngle;
      endAngle = Math.PI * 0.5 - 0.2 - pacman.mouthAngle;
      break;
  }

  ctx.beginPath();
  ctx.arc(pacman.x, pacman.y, pacman.radius, startAngle, endAngle);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.closePath();
  ctx.fill();
}

function setupControls() {

  canvas.addEventListener('click', (e) => {
    if (!isGameRunning || isTeleporting) return;

    // Get clicked position in game coordinates
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + camera.x;
    const clickY = e.clientY - rect.top + camera.y;

    // Find which word cell was clicked
    for (const wordCell of wordCells) {
      if (wordCell.collected) continue;

      const cellX = wordCell.x * CELL_SIZE + CELL_SIZE / 2;
      const cellY = wordCell.y * CELL_SIZE + CELL_SIZE / 2;

      // Simple distance check (could use proper collision if needed)
      const distance = Math.sqrt(
        Math.pow(clickX - cellX, 2) +
        Math.pow(clickY - cellY, 2)
      );

      if (distance < 30) { // If clicked near a word
        findPathToWord(wordCell);
        return;
      }
    }
  });


  document.getElementById('up-btn').addEventListener('click', () => pacman.nextDirection = 'up');
  document.getElementById('down-btn').addEventListener('click', () => pacman.nextDirection = 'down');
  document.getElementById('left-btn').addEventListener('click', () => pacman.nextDirection = 'left');
  document.getElementById('right-btn').addEventListener('click', () => pacman.nextDirection = 'right');

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isTeleporting) return;

    switch (e.key) {
      case 'ArrowUp':
        pacman.nextDirection = 'up';
        break;
      case 'ArrowDown':
        pacman.nextDirection = 'down';
        break;
      case 'ArrowLeft':
        pacman.nextDirection = 'left';
        break;
      case 'ArrowRight':
        pacman.nextDirection = 'right';
        break;
    }
  });


  const controlButtons = document.querySelectorAll('.control-btn');
  controlButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (isGameRunning && !isTeleporting) {
        resetPathfinding();
      }
    });
  });

  document.getElementById('startBtn').addEventListener('click', () => {
    resetPathfinding(); // Reset pathfinding when starting new game
    startGame();
  });

  document.getElementById('restartBtn').addEventListener('click', restartGame);

  // Add touch event for canvas
  canvas.addEventListener('click', (e) => {
    if (!isGameRunning || isTeleporting) return;

    // Get clicked position in game coordinates
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + camera.x;
    const clickY = e.clientY - rect.top + camera.y;

    // Find which word cell was clicked
    for (const wordCell of wordCells) {
      if (wordCell.collected) continue;

      const cellX = wordCell.x * CELL_SIZE + CELL_SIZE / 2;
      const cellY = wordCell.y * CELL_SIZE + CELL_SIZE / 2;

      // Simple distance check
      const distance = Math.sqrt(
        Math.pow(clickX - cellX, 2) +
        Math.pow(clickY - cellY, 2)
      );

      if (distance < 30) { // If clicked near a word
        resetPathfinding(); // Clear any existing path
        findPathToWord(wordCell);
        return;
      }
    }
  });

}

function setupTouchControls() {
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (!isGameRunning || isTeleporting) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    touchStartX = e.touches[0].clientX - rect.left;
    touchStartY = e.touches[0].clientY - rect.top;

    // Convert to normalized coordinates (0-1)
    const normalizedX = touchStartX / rect.width;
    const normalizedY = touchStartY / rect.height;

    // Determine direction based on touch position
    if (normalizedX < TOUCH_ZONE_LEFT) {
      pacman.nextDirection = 'left';
    } else if (normalizedX > TOUCH_ZONE_RIGHT) {
      pacman.nextDirection = 'right';
    } else if (normalizedY < TOUCH_ZONE_TOP) {
      pacman.nextDirection = 'up';
    } else if (normalizedY > TOUCH_ZONE_BOTTOM) {
      pacman.nextDirection = 'down';
    }

    resetPathfinding();
  });

  // Optional: Add touchmove for continuous control
  canvas.addEventListener('touchmove', (e) => {
    if (!isGameRunning || isTeleporting) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    // Convert to normalized coordinates (0-1)
    const normalizedX = touchX / rect.width;
    const normalizedY = touchY / rect.height;

    // Calculate movement vector
    const dx = touchX - touchStartX;
    const dy = touchY - touchStartY;

    // Determine primary direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      pacman.nextDirection = dx > 0 ? 'right' : 'left';
    } else {
      pacman.nextDirection = dy > 0 ? 'down' : 'up';
    }

    resetPathfinding();
  });

  canvas.addEventListener('touchend', (e) => {
    // Optional: Clear direction when touch ends
    pacman.nextDirection = 'none';
  });
}

function endGame() {
  isGameRunning = false;
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  document.getElementById('backgroundMusic').pause();
  document.getElementById('backgroundMusic').currentTime = 0;

  document.getElementById('final-score').textContent = score;
  document.getElementById('gameOverModal').classList.add('show');
}

function canMove(x, y, direction, isGhost = false) {
  // Check if entity can move in the given direction without hitting a wall
  const radius = isGhost ? 8 : pacman.radius;
  let nextX = x;
  let nextY = y;
  const speed = isGhost ? GHOST_SPEED : PACMAN_SPEED;

  switch (direction) {
    case 'up':
      nextY -= speed;
      break;
    case 'down':
      nextY += speed;
      break;
    case 'left':
      nextX -= speed;
      break;
    case 'right':
      nextX += speed;
      break;
  }

  // Check against all walls
  for (const wall of walls) {
    const wallLeft = wall.x * CELL_SIZE;
    const wallRight = wallLeft + CELL_SIZE;
    const wallTop = wall.y * CELL_SIZE;
    const wallBottom = wallTop + CELL_SIZE;

    if (
      nextX + radius > wallLeft &&
      nextX - radius < wallRight &&
      nextY + radius > wallTop &&
      nextY - radius < wallBottom
    ) {
      return false;
    }
  }

  return true;
}

function checkCollisions() {
  if (isTeleporting) return;

  for (let i = 0; i < wordCells.length; i++) {
    const wordCell = wordCells[i];
    if (wordCell.collected) continue;

    const cellX = wordCell.x * CELL_SIZE + CELL_SIZE / 2;
    const cellY = wordCell.y * CELL_SIZE + CELL_SIZE / 2;

    // Measure text width for box dimensions
    ctx.font = '14px Arial';
    const textWidth = ctx.measureText(wordCell.word).width;
    const boxWidth = textWidth + 20;
    const boxHeight = 24;

    // Check rectangular collision
    const boxLeft = cellX - boxWidth / 2;
    const boxRight = cellX + boxWidth / 2;
    const boxTop = cellY - boxHeight / 2;
    const boxBottom = cellY + boxHeight / 2;

    if (
      pacman.x + pacman.radius > boxLeft &&
      pacman.x - pacman.radius < boxRight &&
      pacman.y + pacman.radius > boxTop &&
      pacman.y - pacman.radius < boxBottom
    ) {
      wordCell.collected = true;
      collectedWords.push(wordCell.word);

      // Rest of your collision handling code remains the same...
      if (wordCell.isCorrect) {
        score += 10;
        document.getElementById('eatSound').play();
        workingsets.splice(currentVocabSetIndex, 1);
        currentVocabSetIndex = -1;

        startTeleport();

        const allCorrectCollected = wordCells.every(w =>
          !w.isCorrect || w.collected
        );

        if (allCorrectCollected) {
          setTimeout(() => {
            if (!isTeleporting) {
              initMaze();
              initGhosts();
              initWordCells();
              initPacman();
            }
          }, TELEPORT_DURATION);
        }
      } else {
        document.getElementById('ghostSound').play();
        endGame();
        return;
      }

      updateScore();
    }
  }

  // Ghost collision check remains the same
  if (!isTeleporting) {
    for (const ghost of ghosts) {
      const distance = Math.sqrt(
        Math.pow(pacman.x - ghost.x, 2) +
        Math.pow(pacman.y - ghost.y, 2)
      );

      if (distance < pacman.radius + ghost.radius) {
        document.getElementById('ghostSound').play();
        endGame();
        return;
      }
    }
  }
}

// Updates 
function updateGame() {
  updatePacman();
  updateGhosts();
  checkCollisions();
  drawGame();
}

function updateScore() {
  // Update score display
  document.getElementById('score').textContent = score;

  // Increase ghost count every 30 points, up to maximum
  if (score > 0 && score % GHOST_INCREASE_INTERVAL === 0) {
    if (currentGhostCount < MAX_GHOST_COUNT) {
      currentGhostCount++;
      initGhosts(); // Reinitialize ghosts with increased count
    }
  }
}

function updateTimer() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  document.getElementById('timer').textContent = formattedTime;
}

function updatePacman() {
  if (isTeleporting) return;

  // Check if we can move in the next desired direction
  if (pacman.nextDirection !== 'none' && pacman.nextDirection !== pacman.direction) {
    if (canMove(pacman.x, pacman.y, pacman.nextDirection)) {
      pacman.direction = pacman.nextDirection;
    }
  }

  // If we can't move in current direction, stop
  if (!canMove(pacman.x, pacman.y, pacman.direction)) {
    return;
  }

  // Move in current direction
  switch (pacman.direction) {
    case 'up':
      pacman.y -= PACMAN_SPEED;
      break;
    case 'down':
      pacman.y += PACMAN_SPEED;
      break;
    case 'left':
      pacman.x -= PACMAN_SPEED;
      break;
    case 'right':
      pacman.x += PACMAN_SPEED;
      break;
    case 'none':
      return; // Don't move if no direction
  }

  // Update mouth animation
  pacman.mouthAngle = (pacman.mouthAngle + 0.8) % (Math.PI / 4);

  // Keep Pacman within bounds
  const mazeWidth = mazeLayout[0].length * CELL_SIZE;
  const mazeHeight = mazeLayout.length * CELL_SIZE;
  pacman.x = Math.max(pacman.radius, Math.min(pacman.x, mazeWidth - pacman.radius));
  pacman.y = Math.max(pacman.radius, Math.min(pacman.y, mazeHeight - pacman.radius));
}

function initGhosts() {
  ghosts = [];
  const ghostColors = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'];
  const ghostBehaviors = [
    GHOST_BEHAVIORS.CHASER,
    GHOST_BEHAVIORS.AMBUSHER,
    GHOST_BEHAVIORS.RANDOM,
    GHOST_BEHAVIORS.PATROLLER
  ];

  // Find positions for ghosts (W cells)
  let ghostPositions = [];
  for (let y = 0; y < mazeLayout.length; y++) {
    for (let x = 0; x < mazeLayout[y].length; x++) {
      if (mazeLayout[y][x] === 'W') {
        ghostPositions.push({ x, y });
      }
    }
  }

  // Create ghosts with different behaviors
  for (let i = 0; i < Math.min(currentGhostCount, 4, ghostPositions.length); i++) {
    const pos = ghostPositions[i];
    ghosts.push({
      x: pos.x * CELL_SIZE + CELL_SIZE / 2,
      y: pos.y * CELL_SIZE + CELL_SIZE / 2,
      radius: 8,
      color: ghostColors[i % ghostColors.length],
      direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      speed: GHOST_SPEED,
      behavior: ghostBehaviors[i],
      lastDecisionTime: 0,
      decisionInterval: 1000 + Math.random() * 2000 // 1-3 seconds
    });
  }
}

function updateGhosts() {
  const now = Date.now();

  for (const ghost of ghosts) {
    // Only make decisions at intervals or when hitting a wall
    if (now - ghost.lastDecisionTime < ghost.decisionInterval &&
      canMove(ghost.x, ghost.y, ghost.direction, true)) {
      moveGhost(ghost);
      continue;
    }

    ghost.lastDecisionTime = now;

    // Get possible directions (excluding the opposite of current direction unless stuck)
    const possibleDirections = getPossibleDirections(ghost);

    // If ghost is stuck (no possible directions), allow reversing
    if (possibleDirections.length === 0) {
      ghost.direction = getOppositeDirection(ghost.direction);
      moveGhost(ghost);
      continue;
    }

    // Choose direction based on behavior
    switch (ghost.behavior) {
      case GHOST_BEHAVIORS.CHASER:
        ghost.direction = chasePacman(ghost, possibleDirections);
        break;

      case GHOST_BEHAVIORS.AMBUSHER:
        ghost.direction = ambushPacman(ghost, possibleDirections);
        break;

      case GHOST_BEHAVIORS.PATROLLER:
        ghost.direction = patrolArea(ghost, possibleDirections);
        break;

      default: // RANDOM
        ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }

    // Only move if the chosen direction is valid
    if (canMove(ghost.x, ghost.y, ghost.direction, true)) {
      moveGhost(ghost);
    } else {
      // If chosen direction is blocked, try to continue in current direction if possible
      if (canMove(ghost.x, ghost.y, ghost.direction, true)) {
        moveGhost(ghost);
      } else {
        // If completely stuck, choose random valid direction
        ghost.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        moveGhost(ghost);
      }
    }
  }
}

function getOppositeDirection(dir) {
  switch (dir) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return dir;
  }
}

function getPossibleDirections(ghost) {
  const directions = ['up', 'down', 'left', 'right'];
  return directions.filter(dir => canMove(ghost.x, ghost.y, dir, true));
}

function chasePacman(ghost, possibleDirections) {
  // Find direction that gets ghost closest to Pac-Man
  let bestDirection = ghost.direction;
  let minDistance = Infinity;

  for (const dir of possibleDirections) {
    let testX = ghost.x;
    let testY = ghost.y;

    // Predict position after move
    switch (dir) {
      case 'up':
        testY -= CELL_SIZE;
        break;
      case 'down':
        testY += CELL_SIZE;
        break;
      case 'left':
        testX -= CELL_SIZE;
        break;
      case 'right':
        testX += CELL_SIZE;
        break;
    }

    const distance = Math.sqrt(
      Math.pow(testX - pacman.x, 2) +
      Math.pow(testY - pacman.y, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
}

function ambushPacman(ghost, possibleDirections) {
  // Try to predict where Pac-Man is heading
  const pacmanGridX = Math.floor(pacman.x / CELL_SIZE);
  const pacmanGridY = Math.floor(pacman.y / CELL_SIZE);

  // Predict 4 cells ahead in current direction
  let targetX = pacmanGridX;
  let targetY = pacmanGridY;

  switch (pacman.direction) {
    case 'up':
      targetY -= 4;
      break;
    case 'down':
      targetY += 4;
      break;
    case 'left':
      targetX -= 4;
      break;
    case 'right':
      targetX += 4;
      break;
  }

  // Find direction that gets ghost closest to predicted position
  let bestDirection = ghost.direction;
  let minDistance = Infinity;

  for (const dir of possibleDirections) {
    let testX = ghost.x;
    let testY = ghost.y;

    switch (dir) {
      case 'up':
        testY -= CELL_SIZE;
        break;
      case 'down':
        testY += CELL_SIZE;
        break;
      case 'left':
        testX -= CELL_SIZE;
        break;
      case 'right':
        testX += CELL_SIZE;
        break;
    }

    const distance = Math.sqrt(
      Math.pow(testX - targetX * CELL_SIZE, 2) +
      Math.pow(testY - targetY * CELL_SIZE, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
}

function patrolArea(ghost, possibleDirections) {
  // Define patrol points (corners of the maze)
  const patrolPoints = [
    { x: 2, y: 2 },
    { x: mazeLayout[0].length - 3, y: 2 },
    { x: mazeLayout[0].length - 3, y: mazeLayout.length - 3 },
    { x: 2, y: mazeLayout.length - 3 }
  ];

  // Find current patrol target
  const ghostGridX = Math.floor(ghost.x / CELL_SIZE);
  const ghostGridY = Math.floor(ghost.y / CELL_SIZE);

  // If close to current target, pick next one
  if (!ghost.patrolTarget ||
    (Math.abs(ghostGridX - ghost.patrolTarget.x) < 2 &&
      Math.abs(ghostGridY - ghost.patrolTarget.y) < 2)) {
    ghost.patrolTarget = patrolPoints[
      (patrolPoints.indexOf(ghost.patrolTarget) + 1) % patrolPoints.length
    ] || patrolPoints[0];
  }

  // Move toward patrol target
  let bestDirection = ghost.direction;
  let minDistance = Infinity;

  for (const dir of possibleDirections) {
    let testX = ghost.x;
    let testY = ghost.y;

    switch (dir) {
      case 'up':
        testY -= CELL_SIZE;
        break;
      case 'down':
        testY += CELL_SIZE;
        break;
      case 'left':
        testX -= CELL_SIZE;
        break;
      case 'right':
        testX += CELL_SIZE;
        break;
    }

    const distance = Math.sqrt(
      Math.pow(testX - ghost.patrolTarget.x * CELL_SIZE, 2) +
      Math.pow(testY - ghost.patrolTarget.y * CELL_SIZE, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
}

function moveGhost(ghost) {
  // Move ghost in current direction
  switch (ghost.direction) {
    case 'up':
      ghost.y -= ghost.speed;
      break;
    case 'down':
      ghost.y += ghost.speed;
      break;
    case 'left':
      ghost.x -= ghost.speed;
      break;
    case 'right':
      ghost.x += ghost.speed;
      break;
  }

  // Keep ghost within bounds
  const mazeWidth = mazeLayout[0].length * CELL_SIZE;
  const mazeHeight = mazeLayout.length * CELL_SIZE;
  ghost.x = Math.max(ghost.radius, Math.min(ghost.x, mazeWidth - ghost.radius));
  ghost.y = Math.max(ghost.radius, Math.min(ghost.y, mazeHeight - ghost.radius));
}

function updateCamera() {
  // Smoothly move camera to follow Pacman
  const targetX = pacman.x - CAMERA_VIEW_WIDTH / 2;
  const targetY = pacman.y - CAMERA_VIEW_HEIGHT / 2;

  // Lerp (linear interpolation) for smooth camera movement
  camera.x += (targetX - camera.x) * CAMERA_LERP_FACTOR;
  camera.y += (targetY - camera.y) * CAMERA_LERP_FACTOR;

  // Clamp camera to maze boundaries
  camera.x = Math.max(0, Math.min(camera.x, mazeLayout[0].length * CELL_SIZE - CAMERA_VIEW_WIDTH));
  camera.y = Math.max(0, Math.min(camera.y, mazeLayout.length * CELL_SIZE - CAMERA_VIEW_HEIGHT));
}

// Teleportation
function startTeleport() {
  isTeleporting = true;
  teleportStartTime = Date.now();

  const teleportSound = document.getElementById('teleportSound');
  if (teleportSound) {
    teleportSound.currentTime = 0;
    teleportSound.play();
  }

  resetPathfinding();

  setTimeout(() => {
    if (isTeleporting) { // Still teleporting (animation not cancelled)
      teleportPacmanToStart();
      initGhosts(); // This will respawn all ghosts
    }
  }, TELEPORT_DURATION / 2);
}

function teleportPacmanToStart() {
  // Find starting position for Pacman (first 0 in maze)
  for (let y = 0; y < mazeLayout.length; y++) {
    for (let x = 0; x < mazeLayout[y].length; x++) {
      if (mazeLayout[y][x] === 0) {
        pacman.x = x * CELL_SIZE + CELL_SIZE / 2;
        pacman.y = y * CELL_SIZE + CELL_SIZE / 2;
        pacman.direction = 'none';
        pacman.nextDirection = 'none';

        // Schedule end of teleport state
        setTimeout(() => {
          isTeleporting = false;
        }, TELEPORT_DURATION / 2);
        return;
      }
    }
  }
}

window.onload = initGame;
  
}

export default runGame

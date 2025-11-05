const canvas = document.getElementById('game-board');
const arrangementsCanvas = document.getElementById('arrangements-canvas');
const ctx = canvas.getContext('2d');
const arrCtx = arrangementsCanvas.getContext('2d');

// Block sizing
const blockSize = 40;
const miniBlockSize = 20;
const cols = Math.floor(canvas.width / blockSize);
const rows = Math.floor(canvas.height / blockSize);

let baseSpeed = 1000; 
let currentSpeed = baseSpeed;
const speedIncrease = 50;
const minSpeed = 100; 
let level = 1;
let score = 0;
let board = Array(rows).fill().map(() => Array(cols).fill(0));
let currentPiece = null;
let nextPiece = null;
let gameOver = false;

// Continuous movement variables
let keyState = {};
let buttonIntervals = {};

const shapes = [];
const colors = [
    '#FF5733', '#33FF57', '#3380FF', '#FFD700', '#FF33FF',
    '#33FFFF', '#FF8C33', '#D433FF', '#7FFF33', '#FF3333', '#33D4FF'
];

// Very transparent glass colors
const glassColors = [
    'rgba(255, 87, 51, 0.15)',    'rgba(51, 255, 87, 0.15)', 
    'rgba(51, 128, 255, 0.15)',   'rgba(255, 215, 0, 0.15)',
    'rgba(255, 51, 255, 0.15)',   'rgba(51, 255, 255, 0.15)',
    'rgba(255, 140, 51, 0.15)',   'rgba(212, 51, 255, 0.15)',
    'rgba(127, 255, 51, 0.15)',   'rgba(255, 51, 51, 0.15)',
    'rgba(51, 212, 255, 0.15)'
];

function getArrangements(area) {
    const arrangements = [];
    for (let width = 1; width <= area; width++) {
        if (area % width === 0) {
            arrangements.push([width, area / width]);
        }
    }
    return arrangements;
}

function isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

class Piece {
    constructor(shape) {
        this.shape = shape;
        this.arrangementIndex = 0;
        this.arrangement = shape.arrangements[0];
        this.color = shape.color;
        this.glassColor = glassColors[shapes.indexOf(shape)];
        this.x = Math.floor(cols / 2) - Math.floor(this.arrangement[0] / 2);
        this.y = 0;
        this.updatePrimeIndicator();
    }
    
    updatePrimeIndicator() {
        const primeIndicator = document.getElementById('prime-indicator');
        primeIndicator.textContent = `Area: ${this.shape.area} (${this.shape.isPrime ? 'Prime' : 'Not Prime'})`;
        primeIndicator.className = this.shape.isPrime ? 'prime' : 'not-prime';
    }
    
    draw() {
        const [width, height] = this.arrangement;
        
        // Draw current piece only - NO GHOST
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                this.drawGlassyBlock(
                    (this.x + col) * blockSize,
                    (this.y + row) * blockSize,
                    blockSize - 2,
                    blockSize - 2
                );
            }
        }
        
        // Prime indicator border
        if (this.shape.isPrime) {
            ctx.strokeStyle = '#FF4500';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.strokeRect(
                this.x * blockSize + 2,
                this.y * blockSize + 2,
                width * blockSize - 4,
                height * blockSize - 4
            );
            ctx.setLineDash([]);
        }
        
        this.drawArrangements();
    }
    
    drawGlassyBlock(x, y, width, height) {
        // Clear the block area (transparent)
        ctx.clearRect(x, y, width, height);
        
        // Subtle outer neon glow (10px blur)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
        
        // Inner glass border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);
        
        // Glass reflection effect (diagonal gradient)
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
        
        // Corner highlights for glass effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(x + 2, y + 2, 4, 4); // Top-left
        ctx.fillRect(x + width - 6, y + 2, 4, 4); // Top-right
    }
    
    drawArrangements() {
        arrCtx.clearRect(0, 0, arrangementsCanvas.width, arrangementsCanvas.height);
        
        const arrangements = this.shape.arrangements;
        const padding = 20;
        let currentX = padding;
        
        arrangements.forEach((arr, index) => {
            const [width, height] = arr;
            const isCurrent = index === this.arrangementIndex;
            const blockWidth = width * miniBlockSize;
            const blockHeight = height * miniBlockSize;
            
            // Highlight current arrangement
            if (isCurrent) {
                arrCtx.fillStyle = 'rgba(255, 228, 181, 0.3)';
                arrCtx.fillRect(currentX - 4, padding - 4, blockWidth + 8, blockHeight + 8);
            }
            
            // Draw mini glassy blocks
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    this.drawMiniGlassyBlock(
                        currentX + col * miniBlockSize,
                        padding + row * miniBlockSize,
                        miniBlockSize - 2,
                        miniBlockSize - 2
                    );
                }
            }
            
            // Draw dimensions
            arrCtx.fillStyle = '#FFFFFF';
            arrCtx.font = '16px Orbitron';
            arrCtx.fillText(`${width}x${height}`, currentX, padding + blockHeight + 20);
            
            currentX += blockWidth + padding * 2;
        });
        
        document.getElementById('current-arrangement').textContent = 
            `Current arrangement: ${this.arrangementIndex + 1} of ${arrangements.length}`;
    }
    
    drawMiniGlassyBlock(x, y, width, height) {
        // Clear area for transparency
        arrCtx.clearRect(x, y, width, height);
        
        // Mini neon border
        arrCtx.strokeStyle = this.color;
        arrCtx.lineWidth = 1;
        arrCtx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
        
        // Mini glass reflection
        arrCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        arrCtx.fillRect(x + 1, y + 1, width * 0.6, height * 0.6);
    }
    
    canMove(dx, dy) {
        const [width, height] = this.arrangement;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const newX = this.x + col + dx;
                const newY = this.y + row + dy;
                if (newX < 0 || newX >= cols || newY >= rows || 
                    (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
        return true;
    }
    
    changeArrangement(delta) {
        const arrangements = this.shape.arrangements;
        this.arrangementIndex = (this.arrangementIndex + delta + arrangements.length) % arrangements.length;
        const [newWidth, newHeight] = arrangements[this.arrangementIndex];
        
        // Adjust position to fit new arrangement
        this.x = Math.max(0, Math.min(this.x, cols - newWidth));
        
        if (this.canFit(newWidth, newHeight)) {
            this.arrangement = [newWidth, newHeight];
        }
        this.updatePrimeIndicator();
    }
    
    canFit(width, height) {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const newX = this.x + col;
                const newY = this.y + row;
                if (newX < 0 || newX >= cols || newY >= rows || 
                    (newY >= 0 && board[newY][newX])) {
                    return false;
                }
            }
        }
        return true;
    }
}

// Initialize game pieces
for (let area = 2; area <= 12; area++) {
    shapes.push({
        area: area,
        isPrime: isPrime(area),
        arrangements: getArrangements(area),
        color: colors[area - 2]
    });
}

function drawBoard() {
    // COMPLETELY CLEAR the canvas with solid color - no transparency
    ctx.fillStyle = 'rgb(10, 15, 30)'; // Solid dark blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle grid
    ctx.strokeStyle = 'rgba(100, 220, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
        }
    }
    
    // Draw placed blocks as transparent glass
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col]) {
                const colorIndex = colors.indexOf(board[row][col]);
                drawPlacedGlassyBlock(
                    col * blockSize,
                    row * blockSize,
                    blockSize - 2,
                    blockSize - 2,
                    colors[colorIndex]
                );
            }
        }
    }
    
    // Draw current piece ONLY - NO GHOST
    if (currentPiece) {
        currentPiece.draw();
    }
}

function drawPlacedGlassyBlock(x, y, width, height, baseColor) {
    // Clear area for transparency
    ctx.clearRect(x, y, width, height);
    
    // Subtle outer neon glow (10px blur)
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 10;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    
    // Inner glass border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);
    
    // Glass reflection
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    
    // Corner highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x + 2, y + 2, 3, 3);
    ctx.fillRect(x + width - 5, y + 2, 3, 3);
}

function createNewPiece() {
    return new Piece(shapes[Math.floor(Math.random() * shapes.length)]);
}

function updateSpeed() {
    currentSpeed = Math.max(minSpeed, baseSpeed - (level - 1) * speedIncrease);
}

function checkLines() {
    let linesCleared = 0;
    for (let row = rows - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(cols).fill(0));
            linesCleared++;
            score += 100;
        }
    }
    
    if (linesCleared > 0) {
        document.getElementById('score').textContent = `Score: ${score}`;
        level = Math.floor(score / 1000) + 1;
        updateSpeed();
    }
}

function lockPiece() {
    const [width, height] = currentPiece.arrangement;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (currentPiece.y + row >= 0) {
                board[currentPiece.y + row][currentPiece.x + col] = currentPiece.color;
            }
        }
    }
    checkLines();
    currentPiece = nextPiece;
    nextPiece = createNewPiece();
    
    if (!currentPiece.canMove(0, 0)) {
        gameOver = true;
        alert(`Game Over! Final Score: ${score}`);
    }
}

function gameLoop() {
    if (!gameOver) {
        if (currentPiece.canMove(0, 1)) {
            currentPiece.y++;
        } else {
            lockPiece();
        }
        drawBoard();
        setTimeout(gameLoop, currentSpeed);
    }
}

// Overlay Controls with continuous movement
function initOverlayControls() {
    const buttons = ['up', 'left', 'right', 'down', 'rotate', 'm-plus', 'm-minus'];
    
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Mouse/touch start - start continuous movement
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startContinuousAction(buttonId);
            });
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startContinuousAction(buttonId);
            });
            
            // Mouse/touch end - stop continuous movement
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                stopContinuousAction(buttonId);
            });
            
            button.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                stopContinuousAction(buttonId);
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                stopContinuousAction(buttonId);
            });
            
            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                stopContinuousAction(buttonId);
            });
        }
    });
}

function startContinuousAction(buttonId) {
    if (gameOver || !currentPiece) return;
    
    // Clear any existing interval for this button
    if (buttonIntervals[buttonId]) {
        clearInterval(buttonIntervals[buttonId]);
    }
    
    // Execute immediately once
    handleOverlayButton(buttonId);
    
    // Then set up continuous execution
    buttonIntervals[buttonId] = setInterval(() => {
        if (gameOver || !currentPiece) {
            stopContinuousAction(buttonId);
            return;
        }
        handleOverlayButton(buttonId);
    }, 100); // Repeat every 100ms for smooth continuous movement
}

function stopContinuousAction(buttonId) {
    if (buttonIntervals[buttonId]) {
        clearInterval(buttonIntervals[buttonId]);
        buttonIntervals[buttonId] = null;
    }
}

function handleOverlayButton(buttonId) {
    if (gameOver || !currentPiece) return;
    
    switch (buttonId) {
        case 'up':
        case 'rotate':
            currentPiece.changeArrangement(1);
            break;
        case 'left':
            if (currentPiece.canMove(-1, 0)) currentPiece.x--;
            break;
        case 'right':
            if (currentPiece.canMove(1, 0)) currentPiece.x++;
            break;
        case 'down':
            if (currentPiece.canMove(0, 1)) currentPiece.y++;
            break;
        case 'm-plus':
            currentPiece.changeArrangement(1);
            break;
        case 'm-minus':
            currentPiece.changeArrangement(-1);
            break;
    }
    drawBoard();
}

// Keyboard Controls - Continuous movement
document.addEventListener('keydown', (e) => {
    if (gameOver || !currentPiece) return;
    
    // Prevent repeated keydown events from browser auto-repeat
    if (keyState[e.key]) return;
    keyState[e.key] = true;
    
    switch (e.key) {
        case 'ArrowLeft':
            startContinuousKeyAction('ArrowLeft');
            break;
        case 'ArrowRight':
            startContinuousKeyAction('ArrowRight');
            break;
        case 'ArrowDown':
            startContinuousKeyAction('ArrowDown');
            break;
        case ' ':
        case 'r':
            currentPiece.changeArrangement(1);
            break;
        case 'm':
            currentPiece.changeArrangement(-1);
            break;
    }
    drawBoard();
});

document.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
    stopContinuousKeyAction(e.key);
});

function startContinuousKeyAction(key) {
    if (gameOver || !currentPiece) return;
    
    // Clear any existing interval for this key
    if (buttonIntervals[key]) {
        clearInterval(buttonIntervals[key]);
    }
    
    // Execute immediately once
    handleKeyAction(key);
    
    // Then set up continuous execution
    buttonIntervals[key] = setInterval(() => {
        if (gameOver || !currentPiece || !keyState[key]) {
            stopContinuousKeyAction(key);
            return;
        }
        handleKeyAction(key);
    }, 100);
}

function stopContinuousKeyAction(key) {
    if (buttonIntervals[key]) {
        clearInterval(buttonIntervals[key]);
        buttonIntervals[key] = null;
    }
}

function handleKeyAction(key) {
    switch (key) {
        case 'ArrowLeft':
            if (currentPiece.canMove(-1, 0)) currentPiece.x--;
            break;
        case 'ArrowRight':
            if (currentPiece.canMove(1, 0)) currentPiece.x++;
            break;
        case 'ArrowDown':
            if (currentPiece.canMove(0, 1)) currentPiece.y++;
            break;
    }
    drawBoard();
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    initOverlayControls();
    nextPiece = createNewPiece();
    currentPiece = createNewPiece();
    gameLoop();
});
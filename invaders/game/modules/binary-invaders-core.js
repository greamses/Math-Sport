class BinaryInvaderCore {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Load sprites
        this.sprites = {};
        this.loadSprites();
        
        // Game state
        this.score = 0;
        this.health = 100;
        this.gameRunning = true;
        this.currentTarget = this.generateRandomTarget();
        
        // Player with polygon collision
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            width: 98,
            height: 102,
            speed: 12
        };
        
        // Enemy with polygon collision
        this.enemy = {
            x: this.canvas.width / 2,
            y: 100,
            width: 256,
            height: 256,
            speed: 6,
            direction: 1,
            shootTimer: 0,
            shootInterval: 80
        };
        
        // Enemy health - INCREASED TO 1000
        this.enemyHealth = 1000;
        this.maxEnemyHealth = 1000;
        
        // Explosions and game state
        this.explosions = [];
        this.enemiesDestroyed = 0;
        this.gameWon = false;
        
        // Projectiles
        this.enemyBullets = [];
        this.playerBullets = [];
        
        // Binary input
        this.bitState = [0, 0, 0, 0];
        this.setupBinaryInput();
        
        // Direction button controls
        this.setupDirectionButtons();
        
        // Update displays
        this.updateTargetDisplay();
        this.updateHealthText();
        
        this.showCollisionAreas = false;
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.setupDoubleTap();
        
        // NEW: Combo system
        this.consecutiveHits = 0;
        this.bulletSprayActive = false;
        this.bulletSprayEndTime = 0;
        this.comboNumbers = [];
        
        // NEW: Hit counter for player explosion
        this.playerHits = 0;
        this.maxPlayerHits = 50;
        
        // NEW: Additional HUD displays
        this.createAdditionalHUD();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize renderer
        this.renderer = new BinaryInvaderRenderer(this);
    }


    createAdditionalHUD() {
        // Combo display
        const comboDisplay = document.createElement('div');
        comboDisplay.id = 'comboDisplay';
        comboDisplay.style.cssText = `
            position: absolute;
            top: 80px;
            left: 20px;
            color: #ffff00;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(255, 255, 0, 0.6);
            z-index: 10;
        `;
        comboDisplay.textContent = 'Combo: 0/4';
        document.querySelector('.game-container').appendChild(comboDisplay);

        // Hits display
        const hitsDisplay = document.createElement('div');
        hitsDisplay.id = 'hitsDisplay';
        hitsDisplay.classList.add('hits-display') 
            
        hitsDisplay.textContent = 'Hits: 0/50';
        document.querySelector('.game-container').appendChild(hitsDisplay);

        // Spray display
        const sprayDisplay = document.createElement('div');
        sprayDisplay.id = 'sprayDisplay';
        sprayDisplay.classList.add('spray-display') 
        document.querySelector('.game-container').appendChild(sprayDisplay);
    }
    
    loadSprites() {
        const spritePaths = {
            background: 'images/background.png',
            enemy: 'images/enemy.png',
            enemyExplode: 'images/enemy-explode.png',
            enemyLaser: 'images/enemy-laser.png',
            player: 'images/player.png',
            playerExplode: 'images/player-explode.png',
            playerLaser: 'images/player-laser.png'
        };
        
        let loadedCount = 0;
        const totalSprites = Object.keys(spritePaths).length;
        
        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === totalSprites) {
                this.gameLoop();
            }
        };
        
        for (const [key, path] of Object.entries(spritePaths)) {
            const img = new Image();
            img.onload = checkAllLoaded;
            img.onerror = () => {
                console.error(`Failed to load sprite: ${path}`);
                this.createFallbackSprite(key);
                checkAllLoaded();
            };
            img.src = path;
            this.sprites[key] = img;
        }
    }
    
    // NEW: Create fallback sprites for missing images
    createFallbackSprite(key) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        ctx.fillStyle = this.getFallbackColor(key);
        
        switch(key) {
            case 'playerLaser':
                ctx.fillRect(20, 0, 24, 64);
                ctx.fillStyle = '#00ffff';
                ctx.fillRect(22, 0, 20, 64);
                break;
            case 'enemyLaser':
                ctx.fillRect(20, 0, 24, 64);
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(22, 0, 20, 64);
                break;
            case 'player':
                ctx.fillRect(10, 10, 44, 44);
                break;
            case 'enemy':
                ctx.beginPath();
                ctx.arc(32, 32, 30, 0, Math.PI * 2);
                ctx.fill();
                break;
            default:
                ctx.fillRect(0, 0, 64, 64);
        }
        
        const img = new Image();
        img.src = canvas.toDataURL();
        this.sprites[key] = img;
    }
    
    getFallbackColor(key) {
        const colors = {
            playerLaser: '#00ff00',
            enemyLaser: '#ff0000',
            player: '#00ff00',
            enemy: '#ff0000',
            playerExplode: '#ff8800',
            enemyExplode: '#ff0088',
            background: '#001100'
        };
        return colors[key] || '#000000';
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    generateRandomTarget() {
        return Math.floor(Math.random() * 15) + 1;
    }
    
    updateTargetDisplay() {
        document.getElementById('targetNumber').textContent = this.currentTarget;
        document.getElementById('centerTargetNumber').textContent = this.currentTarget;
    }
    
    updateHealthText() {
        document.getElementById('healthText').textContent = this.health + '%';
    }
    
    setupBinaryInput() {
        const bits = document.querySelectorAll('.bit-toggle');
        const attackBtn = document.getElementById('attackBtn');
        
        bits.forEach((btn, index) => {
            const bitPosition = 3 - index;
            btn.addEventListener('click', () => {
                if (!this.gameRunning) return;
                
                this.bitState[bitPosition] = this.bitState[bitPosition] === 0 ? 1 : 0;
                btn.textContent = this.bitState[bitPosition];
                btn.classList.toggle('active', this.bitState[bitPosition] === 1);
            });
        });
        
        attackBtn.addEventListener('click', () => {
            if (!this.gameRunning) return;
            this.firePlayerAttack();
        });
    }
    
    setupDirectionButtons() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        
        this.activeDirections = new Set();
        
        const setupButton = (btn, direction) => {
            btn.addEventListener('mousedown', () => this.startMoving(direction));
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startMoving(direction);
            });
            btn.addEventListener('mouseup', () => this.stopMoving(direction));
            btn.addEventListener('touchend', () => this.stopMoving(direction));
            btn.addEventListener('mouseleave', () => this.stopMoving(direction));
        };
        
        setupButton(leftBtn, 'left');
        setupButton(rightBtn, 'right');
        setupButton(upBtn, 'up');
        setupButton(downBtn, 'down');
        
        [leftBtn, rightBtn, upBtn, downBtn].forEach(btn => {
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
    
    startMoving(direction) {
        if (!this.gameRunning) return;
        this.activeDirections.add(direction);
    }
    
    stopMoving(direction) {
        this.activeDirections.delete(direction);
    }
    
    updatePlayerMovement() {
        if (this.activeDirections.has('left')) {
            this.player.x = Math.max(this.player.width / 2, this.player.x - this.player.speed);
        }
        if (this.activeDirections.has('right')) {
            this.player.x = Math.min(this.canvas.width - this.player.width / 2, this.player.x + this.player.speed);
        }
        if (this.activeDirections.has('up')) {
            this.player.y = Math.max(this.player.height / 2, this.player.y - this.player.speed);
        }
        if (this.activeDirections.has('down')) {
            this.player.y = Math.min(this.canvas.height - this.player.height / 2, this.player.y + this.player.speed);
        }
    }
    
    firePlayerAttack() {
        const decimalValue = this.binaryToDecimal(this.bitState);
        
        if (decimalValue === this.currentTarget) {
            this.showBinaryFeedback('DIRECT HIT!', '#00ff00');
            this.createPlayerBullet();
            this.score += 10;
            this.updateHUD();
            this.resetBinaryInput();
            
            // NEW: Combo system
            this.consecutiveHits++;
            this.checkCombo();
            
            setTimeout(() => {
                this.currentTarget = this.generateRandomTarget();
                this.updateTargetDisplay();
            }, 1000);
            
        } else {
            this.showBinaryFeedback(`WRONG CODE! (${decimalValue})`, '#ff0000');
            this.resetBinaryInput();
            // NEW: Reset combo on miss
            this.consecutiveHits = 0;
            this.updateHUD();
        }
    }
    
    // NEW: Check for combo achievement
    checkCombo() {
        if (this.consecutiveHits === 4) {
            this.activateBulletSpray();
            this.showComboNumbers();
            this.consecutiveHits = 0; // Reset combo
        }
    }
    
    activateBulletSpray() {
        this.bulletSprayActive = true;
        this.bulletSprayEndTime = Date.now() + 20000; // 20 seconds
        
        this.showBinaryFeedback('BULLET SPRAY ACTIVATED!', '#ffff00');
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createExplosion(this.player.x, this.player.y, 1, 'player');
            }, i * 200);
        }
    }
    
    // NEW: Show combo numbers animation
    showComboNumbers() {
        this.comboNumbers = [];
        const numbers = [this.generateRandomTarget(), this.generateRandomTarget(), this.generateRandomTarget()];
        
        numbers.forEach((num, index) => {
            setTimeout(() => {
                this.comboNumbers.push({
                    number: num,
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height * 0.6,
                    duration: 0,
                    maxDuration: 60
                });
            }, index * 500);
        });
    }
    
    // NEW: Update combo numbers
    updateComboNumbers() {
        this.comboNumbers = this.comboNumbers.filter(combo => {
            combo.duration++;
            return combo.duration < combo.maxDuration;
        });
    }
    
    binaryToDecimal(bitArray) {
        return bitArray.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
    }
    
    resetBinaryInput() {
        this.bitState = [0, 0, 0, 0];
        const bits = document.querySelectorAll('.bit-toggle');
        bits.forEach(btn => {
            btn.textContent = '0';
            btn.classList.remove('active');
        });
    }
    
    showBinaryFeedback(message, color) {
        const feedback = document.getElementById('binaryFeedback');
        feedback.textContent = message;
        feedback.style.color = color;
        feedback.style.display = 'block';
        
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 1500);
    }
    
    createPlayerBullet() {
        if (this.bulletSprayActive) {
            this.createBulletSpray();
        } else {
            this.playerBullets.push({
                x: this.player.x,
                y: this.player.y - this.player.height / 2,
                width: 40,
                height: 80,
                speed: -10,
                type: 'player'
            });
        }
    }
    
    createBulletSpray() {
        const patterns = [
            [{x: 0, y: -10}], 
            [{x: -2, y: -10}, {x: 2, y: -10}], 
            [{x: -3, y: -10}, {x: 0, y: -12}, {x: 3, y: -10}], 
            [{x: -4, y: -9}, {x: -2, y: -11}, {x: 2, y: -11}, {x: 4, y: -9}] 
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        pattern.forEach(offset => {
            this.playerBullets.push({
                x: this.player.x + offset.x * 3,
                y: this.player.y - this.player.height / 2 + offset.y,
                width: 40,
                height: 80,
                speed: -10,
                type: 'player'
            });
        });
    }
    
    updateEnemy() {
        this.enemy.x += this.enemy.speed * this.enemy.direction;
        
        if (this.enemy.x <= this.enemy.width / 2 ||
            this.enemy.x >= this.canvas.width - this.enemy.width / 2) {
            this.enemy.direction *= -1;
        }
        
        this.enemy.shootTimer++;
        if (this.enemy.shootTimer >= this.enemy.shootInterval) {
            this.createEnemyBullets();
            this.enemy.shootTimer = 0;
        }
    }
    

    createEnemyBullets() {
        const bulletCount = Math.floor(Math.random() * 3) + 1; 
        
        for (let i = 0; i < bulletCount; i++) {
            const speedVariation = (Math.random() - 0.5) * 3; 
            const baseSpeed = 5;
            
            this.enemyBullets.push({
                x: this.enemy.x + (Math.random() - 0.5) * 40, 
                y: this.enemy.y + this.enemy.height / 2,
                width: 30,
                height: 60,
                speed: baseSpeed + speedVariation,
                type: 'enemy'
            });
        }
    }
    
    updateBullets() {
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            if (this.renderer.checkCollision(bullet, this.player)) {
                this.createExplosion(this.player.x, this.player.y, 1, 'player');
                this.takeDamage(10);

                this.playerHits++;
                this.checkPlayerExplosion();
                return false;
            }
            return bullet.y < this.canvas.height;
        });
        
        this.playerBullets = this.playerBullets.filter(bullet => {
            bullet.y += bullet.speed;
            if (this.renderer.checkCollision(bullet, this.enemy)) {
                this.destroyEnemy();
                return false;
            }
            return bullet.y > 0;
        });
    }
    
    checkPlayerExplosion() {
        if (this.playerHits >= this.maxPlayerHits) {
            this.createExplosion(this.player.x, this.player.y, 3, 'player');
            this.gameOver();
        }
    }
    
    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.duration++;
            return explosion.duration < explosion.maxDuration;
        });
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHUD();
        
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    destroyEnemy() {

        this.enemyHealth -= 10;
        
        if (this.enemyHealth <= 0) {
            this.createExplosion(this.enemy.x, this.enemy.y, 3, 'enemy');
            this.showBinaryFeedback('ENEMY DESTROYED!', '#ffff00');
            this.score += 50;
            this.enemiesDestroyed++;
            this.updateHUD();
            
            if (this.enemiesDestroyed >= 3) {
                this.victory();
            } else {
                setTimeout(() => {
                    this.resetEnemy();
                    this.enemy.speed *= 1.3;
                    this.enemy.shootInterval = Math.max(15, this.enemy.shootInterval - 20);
                }, 1000);
            }
        } else {
            this.createExplosion(this.enemy.x, this.enemy.y, 1, 'enemy');
            this.showBinaryFeedback('ENEMY HIT!', '#ff9900');
            this.score += 10;
            this.updateHUD();
        }
    }
    
    createExplosion(x, y, size, type) {
        const explosion = {
            x: x,
            y: y,
            size: size,
            duration: 0,
            maxDuration: 30,
            type: type
        };
        
        this.explosions.push(explosion);
        
        if (size >= 2) {
            this.createHTMLExplosion(x, y, size, type);
        }
    }
    
    createHTMLExplosion(x, y, size, type) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = (x - 50) + 'px';
        explosion.style.top = (y - 50) + 'px';
        explosion.style.width = (size * 50) + 'px';
        explosion.style.height = (size * 50) + 'px';
        explosion.style.background = `radial-gradient(circle, #ff0000, #ff5500, transparent)`;
        explosion.style.borderRadius = '50%';
        explosion.style.opacity = '1';
        explosion.style.transition = 'all 0.5s ease-out';
        
        document.querySelector('.game-container').appendChild(explosion);
        
        setTimeout(() => {
            explosion.style.transform = 'scale(2)';
            explosion.style.opacity = '0';
            setTimeout(() => {
                if (explosion.parentNode) {
                    explosion.parentNode.removeChild(explosion);
                }
            }, 500);
        }, 10);
    }
    
    resetEnemy() {
        this.enemy.x = this.canvas.width / 2;
        this.enemy.y = 100;
        this.enemyHealth = this.maxEnemyHealth;
    }
    
    victory() {
        this.gameRunning = false;
        this.gameWon = true;
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height * 0.6;
                this.createExplosion(x, y, 2, 'enemy');
            }, i * 200);
        }
        
        setTimeout(() => {
            document.getElementById('victoryScore').textContent = this.score;
            document.getElementById('enemiesDestroyed').textContent = this.enemiesDestroyed;
            document.getElementById('victoryScreen').style.display = 'block';
        }, 1500);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.createExplosion(this.player.x, this.player.y, 3, 'player');
        
        setTimeout(() => {
            document.getElementById('finalScore').textContent = this.score;
            document.getElementById('gameOver').style.display = 'block';
        }, 1000);
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        this.updateHealthText();
        
        // NEW: Update combo display
        const comboDisplay = document.getElementById('comboDisplay');
        if (comboDisplay) {
            comboDisplay.textContent = `Combo: ${this.consecutiveHits}/4`;
        }
        
        const hitsDisplay = document.getElementById('hitsDisplay');
        if (hitsDisplay) {
            hitsDisplay.textContent = `Hits: ${this.playerHits}/${this.maxPlayerHits}`;
        }
        
        const sprayDisplay = document.getElementById('sprayDisplay');
        if (sprayDisplay) {
            if (this.bulletSprayActive) {
                const timeLeft = Math.ceil((this.bulletSprayEndTime - Date.now()) / 1000);
                sprayDisplay.textContent = `Spray: ${timeLeft}s`;
                sprayDisplay.style.color = timeLeft <= 5 ? '#ff0000' : '#ffff00';
            } else {
                sprayDisplay.textContent = '';
            }
        }
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updateEnemy();
            this.updateBullets();
            this.updateExplosions();
            this.updatePlayerMovement();
            
            // NEW: Update combo numbers
            this.updateComboNumbers();
            
            // NEW: Check bullet spray timer
            if (this.bulletSprayActive && Date.now() > this.bulletSprayEndTime) {
                this.bulletSprayActive = false;
                this.showBinaryFeedback('BULLET SPRAY ENDED', '#ff6600');
                this.updateHUD();
            }
        } else {
            this.updateExplosions();
        }
        this.renderer.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    setupDoubleTap() {
        let lastTapTime = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                this.tapCount++;
                
                if (this.tapCount === 2) {
                    this.showCollisionAreas = !this.showCollisionAreas;
                    this.showMobileFeedback(this.showCollisionAreas ? 'Collision: ON' : 'Collision: OFF');
                }
                
                e.preventDefault();
            } else {
                this.tapCount = 1;
            }
            
            lastTapTime = currentTime;
        });
        
        setInterval(() => {
            this.tapCount = 0;
        }, 500);
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        });
    }
    
    showMobileFeedback(message) {
        let feedback = document.getElementById('mobileCollisionFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'mobileCollisionFeedback';
            feedback.classList.add('feedback');
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.style.opacity = '1';
        
        setTimeout(() => {
            feedback.style.opacity = '0';
        }, 2000);
    }
}
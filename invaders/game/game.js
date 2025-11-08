class BinaryInvader {
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
    }

    // NEW: Create additional HUD elements
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
        hitsDisplay.style.cssText = `
            position: absolute;
            top: 100px;
            left: 20px;
            color: #ff4444;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
            z-index: 10;
        `;
        hitsDisplay.textContent = 'Hits: 0/50';
        document.querySelector('.game-container').appendChild(hitsDisplay);

        // Spray display
        const sprayDisplay = document.createElement('div');
        sprayDisplay.id = 'sprayDisplay';
        sprayDisplay.style.cssText = `
            position: absolute;
            top: 120px;
            left: 20px;
            color: #ffff00;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(255, 255, 0, 0.6);
            z-index: 10;
        `;
        document.querySelector('.game-container').appendChild(sprayDisplay);
    }
    
    parsePoints(pointsStr) {
        return pointsStr.trim().split(' ').map(p => {
            const [x, y] = p.split(',').map(Number);
            return { x, y };
        });
    }
    
    polygonsCollide(polyA, polyB) {
        const polygons = [polyA, polyB];
        for (let i = 0; i < polygons.length; i++) {
            const polygon = polygons[i];
            for (let i1 = 0; i1 < polygon.length; i1++) {
                const i2 = (i1 + 1) % polygon.length;
                const p1 = polygon[i1];
                const p2 = polygon[i2];
    
                // Axis perpendicular to polygon edge
                const normal = { x: p2.y - p1.y, y: p1.x - p2.x };
    
                // Project both polygons on the normal
                let [minA, maxA] = this.projectPolygon(normal, polyA);
                let [minB, maxB] = this.projectPolygon(normal, polyB);
    
                // If there's a gap — no collision
                if (maxA < minB || maxB < minA) return false;
            }
        }
        return true;
    }
    
    projectPolygon(axis, polygon) {
        let min = Infinity, max = -Infinity;
        for (const p of polygon) {
            const projection = (p.x * axis.x + p.y * axis.y);
            if (projection < min) min = projection;
            if (projection > max) max = projection;
        }
        return [min, max];
    }
    
    getEnemyPolygon(x, y) {
        const enemyPoints = "120,50 100,100 20,120 100,160 120,210 133,210 156,160 230,120 160,100 140,50";
        const enemyShape = this.parsePoints(enemyPoints);
        const scaledShape = enemyShape.map(p => ({
            x: (p.x - 128) * (this.enemy.width / 256) + x,
            y: (p.y - 128) * (this.enemy.height / 256) + y
        }));
        return scaledShape;
    }
    
    getPlayerPolygon(x, y) {
        const playerPoints = "70,100 80,100 80,50 100,50 100,80 120,80 160,80 160,80 160,50 180,50 180,80 180,100 200,160 200,180 180,220 100,220 70,180 60,150";
        const playerShape = this.parsePoints(playerPoints);

        const scaledShape = playerShape.map(p => ({
            x: (p.x - 128) * (this.player.width / 256) + x,
            y: (p.y - 128) * (this.player.height / 256) + y
        }));
        return scaledShape;
    }
    
    getBulletPolygon(bullet) {
        // Even more precise - just the core of the bullet
        const coreWidth = bullet.width * 0.3; // Only 30% of visual width
        const coreHeight = bullet.height * 0.5; // Only 50% of visual height
        const verticalOffset = bullet.height * 0.2; // Start collision a bit lower
        
        const points = [
            { x: bullet.x - coreWidth / 2, y: bullet.y + verticalOffset },
            { x: bullet.x + coreWidth / 2, y: bullet.y + verticalOffset },
            { x: bullet.x + coreWidth / 2, y: bullet.y + coreHeight },
            { x: bullet.x - coreWidth / 2, y: bullet.y + coreHeight }
        ];
        return points;
    }
    
    checkCollision(obj1, obj2) {
        let poly1, poly2;
    
        // Get polygons based on object types
        if (obj1 === this.player) {
            poly1 = this.getPlayerPolygon(obj1.x, obj1.y);
        } else if (obj1 === this.enemy) {
            poly1 = this.getEnemyPolygon(obj1.x, obj1.y);
        } else if (obj1.type === 'player' || obj1.type === 'enemy') {
            poly1 = this.getBulletPolygon(obj1);
        }
    
        if (obj2 === this.player) {
            poly2 = this.getPlayerPolygon(obj2.x, obj2.y);
        } else if (obj2 === this.enemy) {
            poly2 = this.getEnemyPolygon(obj2.x, obj2.y);
        } else if (obj2.type === 'player' || obj2.type === 'enemy') {
            poly2 = this.getBulletPolygon(obj2);
        }
    
        // Check polygon collision
        if (poly1 && poly2) {
            return this.polygonsCollide(poly1, poly2);
        }
    
        return false;
    }

    drawCollisionPolygons() {
        // Draw player collision polygon
        const playerPoly = this.getPlayerPolygon(this.player.x, this.player.y);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(playerPoly[0].x, playerPoly[0].y);
        for (let i = 1; i < playerPoly.length; i++) {
            this.ctx.lineTo(playerPoly[i].x, playerPoly[i].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        // Fill player polygon
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        this.ctx.fill();
    
        // Draw enemy collision polygon
        if (this.enemyHealth > 0) {
            const enemyPoly = this.getEnemyPolygon(this.enemy.x, this.enemy.y);
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.moveTo(enemyPoly[0].x, enemyPoly[0].y);
            for (let i = 1; i < enemyPoly.length; i++) {
                this.ctx.lineTo(enemyPoly[i].x, enemyPoly[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Fill enemy polygon
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            this.ctx.fill();
        }
        
        // Draw bullet collision polygons
        this.enemyBullets.forEach(bullet => {
            const bulletPoly = this.getBulletPolygon(bullet);
            this.ctx.strokeStyle = '#ff6666';
            this.ctx.beginPath();
            this.ctx.moveTo(bulletPoly[0].x, bulletPoly[0].y);
            for (let i = 1; i < bulletPoly.length; i++) {
                this.ctx.lineTo(bulletPoly[i].x, bulletPoly[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            this.ctx.fill();
        });
        
        this.playerBullets.forEach(bullet => {
            const bulletPoly = this.getBulletPolygon(bullet);
            this.ctx.strokeStyle = '#66ff66';
            this.ctx.beginPath();
            this.ctx.moveTo(bulletPoly[0].x, bulletPoly[0].y);
            for (let i = 1; i < bulletPoly.length; i++) {
                this.ctx.lineTo(bulletPoly[i].x, bulletPoly[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
            this.ctx.fill();
        });
        
        this.ctx.setLineDash([]);
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
                // Create fallback colored rectangle for missing sprites
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
    
    // NEW: Activate bullet spray power-up
    activateBulletSpray() {
        this.bulletSprayActive = true;
        this.bulletSprayEndTime = Date.now() + 20000; // 20 seconds
        
        this.showBinaryFeedback('BULLET SPRAY ACTIVATED!', '#ffff00');
        
        // Visual effect for bullet spray activation
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
        // NEW: Create multiple bullets if bullet spray is active
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
    
    // NEW: Create bullet spray pattern
    createBulletSpray() {
        const patterns = [
            [{x: 0, y: -10}], // Single bullet
            [{x: -2, y: -10}, {x: 2, y: -10}], // Two bullets
            [{x: -3, y: -10}, {x: 0, y: -12}, {x: 3, y: -10}], // Three bullets
            [{x: -4, y: -9}, {x: -2, y: -11}, {x: 2, y: -11}, {x: 4, y: -9}] // Four bullets
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
            if (this.checkCollision(bullet, this.player)) {
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
            if (this.checkCollision(bullet, this.enemy)) {
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
        
        // NEW: Update hits display
        const hitsDisplay = document.getElementById('hitsDisplay');
        if (hitsDisplay) {
            hitsDisplay.textContent = `Hits: ${this.playerHits}/${this.maxPlayerHits}`;
        }
        
        // NEW: Update bullet spray timer
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
    
    render() {
        if (this.sprites.background && this.sprites.background.complete) {
            this.ctx.drawImage(this.sprites.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = 'rgba(0, 10, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.drawGrid();
        
        // Draw enemy first (behind player)
        if (this.enemyHealth > 0) {
            this.drawEnemy();
        }
        
        this.drawBullets();
        
        // NEW: Draw combo numbers
        this.drawComboNumbers();
        
        // Draw player last (on top)
        if (this.gameRunning || (!this.gameRunning && !this.gameWon)) {
            this.drawPlayer();
        }
        
        this.drawExplosions();
        
        if (this.showCollisionAreas) {
            this.drawCollisionPolygons();
        }
    }
    
    // NEW: Draw combo numbers on screen
    drawComboNumbers() {
        this.comboNumbers.forEach(combo => {
            const alpha = 1 - (combo.duration / combo.maxDuration);
            const scale = 1 + (combo.duration / combo.maxDuration) * 0.5;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 24px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.translate(combo.x, combo.y);
            this.ctx.scale(scale, scale);
            this.ctx.fillText(combo.number, 0, 0);
            this.ctx.restore();
        });
    }
    
    drawPlayer() {
        if (this.sprites.player && this.sprites.player.complete) {
            this.ctx.drawImage(
                this.sprites.player,
                this.player.x - this.player.width / 2,
                this.player.y - this.player.height / 2,
                this.player.width,
                this.player.height
            );
        } else {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x, this.player.y - this.player.height / 2);
            this.ctx.lineTo(this.player.x - this.player.width / 2, this.player.y + this.player.height / 2);
            this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.drawPlayerHealthBar();
    }
    
    drawEnemy() {
        if (this.sprites.enemy && this.sprites.enemy.complete) {
            this.ctx.drawImage(
                this.sprites.enemy,
                this.enemy.x - this.enemy.width / 2,
                this.enemy.y - this.enemy.height / 2,
                this.enemy.width,
                this.enemy.height
            );
        } else {
            let enemyColor = '#ff0000';
            if (this.enemyHealth <= 300) enemyColor = '#ff6666';
            else if (this.enemyHealth <= 600) enemyColor = '#ff3333';
            
            this.ctx.fillStyle = enemyColor;
            this.ctx.beginPath();
            this.ctx.arc(this.enemy.x, this.enemy.y, this.enemy.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.drawEnemyHealthBar();
    }
    
    drawBullets() {
        // FIXED: Always draw player bullets with proper fallback
        this.playerBullets.forEach(bullet => {
            if (this.sprites.playerLaser && this.sprites.playerLaser.complete) {
                this.ctx.drawImage(
                    this.sprites.playerLaser,
                    bullet.x - bullet.width / 2,
                    bullet.y,
                    bullet.width,
                    bullet.height
                );
            } else {
                // Fallback: draw green rectangle for player laser
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
                
                // Add glow effect
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.fillRect(bullet.x - bullet.width / 2 - 2, bullet.y - 2, bullet.width + 4, bullet.height + 4);
            }
        });
        
        this.enemyBullets.forEach(bullet => {
            if (this.sprites.enemyLaser && this.sprites.enemyLaser.complete) {
                this.ctx.drawImage(
                    this.sprites.enemyLaser,
                    bullet.x - bullet.width / 2,
                    bullet.y,
                    bullet.width,
                    bullet.height
                );
            } else {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
                
                // Add glow effect
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.fillRect(bullet.x - bullet.width / 2 - 2, bullet.y - 2, bullet.width + 4, bullet.height + 4);
            }
        });
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPlayerHealthBar() {
        const barWidth = 40;
        const barHeight = 6;
        const barX = this.player.x - barWidth / 2;
        const barY = this.player.y - 40;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
        
        const healthPercent = this.health / 100;
        const fillWidth = barWidth * healthPercent;
        
        if (fillWidth > 0) {
            let gradient;
            if (healthPercent > 0.6) {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, '#00ff00');
                gradient.addColorStop(1, '#00ff88');
            } else if (healthPercent > 0.3) {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, '#ffff00');
                gradient.addColorStop(1, '#ffaa00');
            } else {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, '#ff0000');
                gradient.addColorStop(1, '#ff4400');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        }
        
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '8px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.health}%`, this.player.x, barY - 5);
    }
    
    drawEnemyHealthBar() {
        const barWidth = 120; 
        const barHeight = 10;
        const barX = this.enemy.x - barWidth / 2;
        const barY = this.enemy.y - 60;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
        
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        const healthPercent = this.enemyHealth / this.maxEnemyHealth;
        const fillWidth = barWidth * healthPercent;
        
        if (fillWidth > 0) {
            const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 0.8;
            
            let gradient;
            if (healthPercent > 0.6) {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, `rgba(255, 0, 255, ${pulse})`);
                gradient.addColorStop(1, `rgba(255, 200, 255, ${pulse})`);
            } else if (healthPercent > 0.3) {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, `rgba(255, 255, 0, ${pulse})`);
                gradient.addColorStop(1, `rgba(255, 150, 0, ${pulse})`);
            } else {
                gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
                gradient.addColorStop(0, `rgba(255, 0, 0, ${pulse})`);
                gradient.addColorStop(1, `rgba(255, 50, 0, ${pulse})`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        }
        
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.font = '10px "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`TARGET: ${this.enemyHealth}/${this.maxEnemyHealth}`, this.enemy.x, barY - 8);
    }
    
    drawExplosions() {
        this.explosions.forEach(explosion => {
            let sprite;
            if (explosion.type === 'player' && this.sprites.playerExplode && this.sprites.playerExplode.complete) {
                sprite = this.sprites.playerExplode;
            } else if (explosion.type === 'enemy' && this.sprites.enemyExplode && this.sprites.enemyExplode.complete) {
                sprite = this.sprites.enemyExplode;
            }
            
            if (sprite) {
                const size = explosion.size * 20;
                this.ctx.globalAlpha = 1 - (explosion.duration / explosion.maxDuration);
                this.ctx.drawImage(
                    sprite,
                    explosion.x - size / 2,
                    explosion.y - size / 2,
                    size,
                    size
                );
                this.ctx.globalAlpha = 1;
            } else {
                const alpha = 1 - (explosion.duration / explosion.maxDuration);
                this.ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(explosion.x, explosion.y, explosion.size * 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
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
        this.render();
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

// Global functions
function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'none';
    
    document.querySelectorAll('.explosion').forEach(explosion => {
        explosion.remove();
    });
    
    // Remove dynamically created HUD elements
    const comboDisplay = document.getElementById('comboDisplay');
    const hitsDisplay = document.getElementById('hitsDisplay');
    const sprayDisplay = document.getElementById('sprayDisplay');
    
    if (comboDisplay) comboDisplay.remove();
    if (hitsDisplay) hitsDisplay.remove();
    if (sprayDisplay) sprayDisplay.remove();
    
    window.game = new BinaryInvader();
}

// Start the game when page loads
window.addEventListener('load', () => {
    window.game = new BinaryInvader();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        if (window.game) {
            window.game.showCollisionAreas = !window.game.showCollisionAreas;
            console.log('Collision areas:', window.game.showCollisionAreas ? 'ON' : 'OFF');
        }
    }
});

window.addEventListener('load', () => {
    window.game = new BinaryInvader();
    console.log('Press C to toggle collision area visualization');
    console.log('Double-tap on mobile to toggle collision areas');
});
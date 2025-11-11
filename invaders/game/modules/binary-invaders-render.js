class BinaryInvaderRenderer {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.sprites = game.sprites;
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
            x: (p.x - 128) * (this.game.enemy.width / 256) + x,
            y: (p.y - 128) * (this.game.enemy.height / 256) + y
        }));
        return scaledShape;
    }
    
    getPlayerPolygon(x, y) {
        const playerPoints = "70,100 80,100 80,50 100,50 100,80 120,80 160,80 160,80 160,50 180,50 180,80 180,100 200,160 200,180 180,220 100,220 70,180 60,150";
        const playerShape = this.parsePoints(playerPoints);

        const scaledShape = playerShape.map(p => ({
            x: (p.x - 128) * (this.game.player.width / 256) + x,
            y: (p.y - 128) * (this.game.player.height / 256) + y
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
        if (obj1 === this.game.player) {
            poly1 = this.getPlayerPolygon(obj1.x, obj1.y);
        } else if (obj1 === this.game.enemy) {
            poly1 = this.getEnemyPolygon(obj1.x, obj1.y);
        } else if (obj1.type === 'player' || obj1.type === 'enemy') {
            poly1 = this.getBulletPolygon(obj1);
        }
    
        if (obj2 === this.game.player) {
            poly2 = this.getPlayerPolygon(obj2.x, obj2.y);
        } else if (obj2 === this.game.enemy) {
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
        const playerPoly = this.getPlayerPolygon(this.game.player.x, this.game.player.y);
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
        if (this.game.enemyHealth > 0) {
            const enemyPoly = this.getEnemyPolygon(this.game.enemy.x, this.game.enemy.y);
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
        this.game.enemyBullets.forEach(bullet => {
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
        
        this.game.playerBullets.forEach(bullet => {
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
    
    render() {
        if (this.sprites.background && this.sprites.background.complete) {
            this.ctx.drawImage(this.sprites.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = 'rgba(0, 10, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.drawGrid();
        
        // Draw enemy first (behind player)
        if (this.game.enemyHealth > 0) {
            this.drawEnemy();
        }
        
        this.drawBullets();
        
        // NEW: Draw combo numbers
        this.drawComboNumbers();
        
        // Draw player last (on top)
        if (this.game.gameRunning || (!this.game.gameRunning && !this.game.gameWon)) {
            this.drawPlayer();
        }
        
        this.drawExplosions();
        
        if (this.game.showCollisionAreas) {
            this.drawCollisionPolygons();
        }
    }
    
    // NEW: Draw combo numbers on screen
    drawComboNumbers() {
        this.game.comboNumbers.forEach(combo => {
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
                this.game.player.x - this.game.player.width / 2,
                this.game.player.y - this.game.player.height / 2,
                this.game.player.width,
                this.game.player.height
            );
        } else {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.moveTo(this.game.player.x, this.game.player.y - this.game.player.height / 2);
            this.ctx.lineTo(this.game.player.x - this.game.player.width / 2, this.game.player.y + this.game.player.height / 2);
            this.ctx.lineTo(this.game.player.x + this.game.player.width / 2, this.game.player.y + this.game.player.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.drawPlayerHealthBar();
    }
    
    drawEnemy() {
        if (this.sprites.enemy && this.sprites.enemy.complete) {
            this.ctx.drawImage(
                this.sprites.enemy,
                this.game.enemy.x - this.game.enemy.width / 2,
                this.game.enemy.y - this.game.enemy.height / 2,
                this.game.enemy.width,
                this.game.enemy.height
            );
        } else {
            let enemyColor = '#ff0000';
            if (this.game.enemyHealth <= 300) enemyColor = '#ff6666';
            else if (this.game.enemyHealth <= 600) enemyColor = '#ff3333';
            
            this.ctx.fillStyle = enemyColor;
            this.ctx.beginPath();
            this.ctx.arc(this.game.enemy.x, this.game.enemy.y, this.game.enemy.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.drawEnemyHealthBar();
    }
    
    drawBullets() {
        // FIXED: Always draw player bullets with proper fallback
        this.game.playerBullets.forEach(bullet => {
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
        
        this.game.enemyBullets.forEach(bullet => {
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
        const barX = this.game.player.x - barWidth / 2;
        const barY = this.game.player.y - 40;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
        
        const healthPercent = this.game.health / 100;
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
        this.ctx.fillText(`${this.game.health}%`, this.game.player.x, barY - 5);
    }
    
    drawEnemyHealthBar() {
        const barWidth = 120; 
        const barHeight = 10;
        const barX = this.game.enemy.x - barWidth / 2;
        const barY = this.game.enemy.y - 60;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);
        
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        const healthPercent = this.game.enemyHealth / this.game.maxEnemyHealth;
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
        this.ctx.fillText(`TARGET: ${this.game.enemyHealth}/${this.game.maxEnemyHealth}`, this.game.enemy.x, barY - 8);
    }
    
    drawExplosions() {
        this.game.explosions.forEach(explosion => {
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
}

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
  
  window.game = new BinaryInvaderCore();
}

window.addEventListener('load', () => {
  window.game = new BinaryInvaderCore();
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
  window.game = new BinaryInvaderCore();
  console.log('Press C to toggle collision area visualization');
  console.log('Double-tap on mobile to toggle collision areas');
});
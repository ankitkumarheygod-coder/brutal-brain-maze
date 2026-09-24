import { stateManager, GameState } from './game-state.js';
import { Player } from './player.js';

export class GameEngine {
    constructor(canvas, levelManager, quizTimer, quizUI) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.levelManager = levelManager;
        this.quizTimer = quizTimer;
        this.quizUI = quizUI;

        this.lastTime = performance.now();
        this.levelTimer = 0;
        this.DEBUG_MODE = false; // Toggle for dev logs

        this.inputDir = { x: 0, y: 0 };
        this.keys = { up: false, down: false, left: false, right: false };

        this.setupInput();
        this.setupResize();
    }

    initLevel() {
        const maze = this.levelManager.mazeData;
        this.player = new Player(maze.startZone.x, maze.startZone.y, this.levelManager.cellSize);
        this.levelTimer = 0;
        this.resize();
        stateManager.set(GameState.PLAYING);
    }

    setupResize() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.cssWidth = rect.width;
        this.cssHeight = rect.height;
    }

    setupInput() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));

        // Touch (Swipe / Drag)
        let isTouching = false;
        let tStartX = 0, tStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Stop scroll
            if (stateManager.is(GameState.PLAYING)) {
                isTouching = true;
                const touch = e.touches[0];
                tStartX = touch.clientX;
                tStartY = touch.clientY;
            }
        }, {passive: false});

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isTouching && stateManager.is(GameState.PLAYING)) {
                const touch = e.touches[0];
                let dx = touch.clientX - tStartX;
                let dy = touch.clientY - tStartY;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 5) {
                    this.inputDir.x = dx / dist;
                    this.inputDir.y = dy / dist;
                }
            }
        }, {passive: false});

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isTouching = false;
            if (!this.keys.up && !this.keys.down && !this.keys.left && !this.keys.right) {
                this.inputDir.x = 0;
                this.inputDir.y = 0;
            }
        }, {passive: false});
    }

    handleKey(e, isDown) {
        switch(e.key.toLowerCase()) {
            case 'w': case 'arrowup': this.keys.up = isDown; break;
            case 's': case 'arrowdown': this.keys.down = isDown; break;
            case 'a': case 'arrowleft': this.keys.left = isDown; break;
            case 'd': case 'arrowright': this.keys.right = isDown; break;
        }
        if (stateManager.is(GameState.PLAYING)) {
            let dx = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
            let dy = (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0);
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 0) {
                this.inputDir.x = dx / dist;
                this.inputDir.y = dy / dist;
            } else {
                this.inputDir.x = 0;
                this.inputDir.y = 0;
            }
        }
    }

    loop(timestamp) {
        let dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (stateManager.is(GameState.PLAYING) && !document.hidden) {
            this.levelTimer += dt;
            
            // Player Movement
            this.player.update(dt, this.inputDir, this.levelManager.mazeData.lines);

            // Active Gameplay Quiz check (30 seconds)
            if (this.quizTimer.update(dt * 1000)) {
                stateManager.set(GameState.QUIZ_LOCKED);
                this.inputDir.x = 0; this.inputDir.y = 0;
                this.quizUI.open();
            }

            // Check Exit Condition
            this.checkExit();
            
            this.updateUI();
        }

        this.render();

        if (this.DEBUG_MODE) this.renderDebug();

        requestAnimationFrame((t) => this.loop(t));
    }

    checkExit() {
        const ez = this.levelManager.mazeData.exitZone;
        const px = this.player.x;
        const py = this.player.y;
        
        // Simple AABB check if player center is inside Exit Zone
        if (px > ez.x && px < ez.x + ez.w && py > ez.y && py < ez.y + ez.h) {
            stateManager.set(GameState.LEVEL_COMPLETE);
            this.levelManager.completeLevel();
            
            document.getElementById('lc-xp').innerText = this.levelManager.xp;
            document.getElementById('level-complete').classList.remove('hidden');
        }
    }

    updateUI() {
        document.getElementById('ui-level').innerText = String(this.levelManager.currentLevel).padStart(2, '0');
        document.getElementById('ui-time').innerText = this.levelTimer.toFixed(2);
        document.getElementById('ui-moves').innerText = this.player.moveCount;
    }

    render() {
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

        if (!this.levelManager.mazeData || !this.player) return;
        const maze = this.levelManager.mazeData;

        // Calculate Scale to fit maze on screen preserving aspect ratio
        const scale = Math.min(
            (this.cssWidth * 0.95) / maze.logicalWidth,
            (this.cssHeight * 0.85) / maze.logicalHeight
        );
        
        const offsetX = (this.cssWidth - maze.logicalWidth * scale) / 2;
        const offsetY = (this.cssHeight - maze.logicalHeight * scale) / 2 + 20;

        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);
        this.ctx.scale(scale, scale);

        // Draw Start / Exit Zones
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        this.ctx.fillRect(maze.startZone.x, maze.startZone.y, maze.startZone.w, maze.startZone.h);
        
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
        this.ctx.fillRect(maze.exitZone.x, maze.exitZone.y, maze.exitZone.w, maze.exitZone.h);
        this.ctx.strokeStyle = '#f0f';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(maze.exitZone.x, maze.exitZone.y, maze.exitZone.w, maze.exitZone.h);

        // Draw Player
        this.player.draw(this.ctx);

        // Draw Continuous Line-Walls (Neon)
        this.ctx.beginPath();
        for (let line of maze.lines) {
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
        }
        this.ctx.strokeStyle = '#0ff';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#0ff';
        this.ctx.stroke();

        this.ctx.restore();
    }

    renderDebug() {
        const debug = document.getElementById('debug-overlay');
        debug.classList.remove('hidden');
        debug.innerHTML = `
            STATE: ${Object.keys(GameState).find(k => GameState[k] === stateManager.current)}<br>
            ACTIVE TIME: ${(this.quizTimer.activeTimeMs/1000).toFixed(1)} / ${this.quizTimer.thresholdMs/1000}s<br>
            PLAYER X: ${Math.round(this.player?.x || 0)} Y: ${Math.round(this.player?.y || 0)}
        `;
    }
}

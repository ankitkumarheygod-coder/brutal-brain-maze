import { Collision } from './collision.js';

export class Player {
    constructor(startX, startY, cellSize) {
        this.radius = cellSize * 0.35; 
        this.x = startX + cellSize / 2;
        this.y = startY + cellSize / 2;
        this.vx = 0;
        this.vy = 0;
        this.speed = cellSize * 4.0; // Units per second
        this.moveDistance = 0;
        this.moveCount = 0;
        this.cellSize = cellSize;
    }

    update(dt, inputDir, lines) {
        if (dt > 0.1) dt = 0.1; // Clamp huge delta times

        // Apply Input
        this.vx = inputDir.x * this.speed;
        this.vy = inputDir.y * this.speed;

        let startX = this.x;
        let startY = this.y;

        // Move X and resolve
        this.x += this.vx * dt;
        this.resolveCollisions(lines);

        // Move Y and resolve
        this.y += this.vy * dt;
        this.resolveCollisions(lines);

        // Accumulate distance to calculate MOVES
        let dx = this.x - startX;
        let dy = this.y - startY;
        this.moveDistance += Math.sqrt(dx*dx + dy*dy);
        if (this.moveDistance > this.cellSize) {
            this.moveCount++;
            this.moveDistance -= this.cellSize;
        }
    }

    resolveCollisions(lines) {
        // Multi-pass resolution for corners
        for (let pass = 0; pass < 3; pass++) {
            let hitAny = false;
            for (let line of lines) {
                let res = Collision.resolveCircleLine(this.x, this.y, this.radius, line.x1, line.y1, line.x2, line.y2);
                if (res.hit) {
                    this.x += res.pushX;
                    this.y += res.pushY;
                    hitAny = true;
                }
            }
            if (!hitAny) break;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

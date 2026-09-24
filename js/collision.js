export const Collision = {
    // Circle vs Line Segment Continuous Collision Resolution
    resolveCircleLine(cx, cy, radius, x1, y1, x2, y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len2 = dx * dx + dy * dy;
        
        let nx, ny;
        if (len2 === 0) {
            nx = x1; ny = y1;
        } else {
            let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
            t = Math.max(0, Math.min(1, t));
            nx = x1 + t * dx;
            ny = y1 + t * dy;
        }

        let distX = cx - nx;
        let distY = cy - ny;
        let dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < radius && dist > 0.001) {
            let overlap = radius - dist;
            return {
                hit: true,
                pushX: (distX / dist) * overlap,
                pushY: (distY / dist) * overlap
            };
        }
        return { hit: false };
    }
};

function applyLighting(ctx, layer) {
    if (!layer.lights || layer.lights.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen'; 
    layer.lights.forEach(light => {
        const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
        const r = parseInt(light.color.substr(1,2), 16);
        const g = parseInt(light.color.substr(3,2), 16);
        const b = parseInt(light.color.substr(5,2), 16);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${light.intensity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(-layer.width, -layer.height, layer.width * 3, layer.height * 3);
    });
    ctx.restore();
}

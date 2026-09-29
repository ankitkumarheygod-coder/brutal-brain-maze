class CanvasEngine {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.layerManager = new LayerManager();
        this.workspaceWidth = 800;
        this.workspaceHeight = 600;
    }
    setWorkspaceSize(w, h) {
        this.workspaceWidth = w;
        this.workspaceHeight = h;
        this.canvas.width = w;
        this.canvas.height = h;
        const container = document.querySelector('.canvas-area');
        const scale = Math.min((container.clientWidth - 50) / w, (container.clientHeight - 50) / h);
        this.canvas.style.transform = `scale(${scale})`;
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layerManager.layers.forEach(layer => {
            if (!layer.visible) return;
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2 + layer.x, this.canvas.height / 2 + layer.y);
            this.ctx.rotate((layer.rotation * Math.PI) / 180);
            this.ctx.scale(layer.scale, layer.scale);
            
            // 3D CSS-Style Matrix Transform
            if (layer.transform3d.rotX !== 0 || layer.transform3d.rotY !== 0) {
                const skewX = Math.tan(layer.transform3d.rotX * Math.PI / 180);
                const skewY = Math.tan(layer.transform3d.rotY * Math.PI / 180);
                this.ctx.transform(1, skewY, skewX, 1, 0, 0);
            }
            this.ctx.translate(-layer.width / 2, -layer.height / 2);
            this.ctx.globalAlpha = layer.opacity / 100;
            this.ctx.globalCompositeOperation = layer.blendMode;
            
            applyAdjustments(this.ctx, layer); // adjustments.js function
            if (layer.data) this.ctx.drawImage(layer.data, 0, 0, layer.width, layer.height);
            this.ctx.filter = 'none';
            applyLighting(this.ctx, layer); // lighting.js function
            this.ctx.restore();
        });
    }
    updateUI() {} // Attached in App.js
}

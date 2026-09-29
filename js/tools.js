class ToolManager {
    constructor(canvasEngine) {
        this.engine = canvasEngine;
        this.currentTool = 'move';
        this.isDragging = false;
        this.color = '#ffffff';
        this.size = 20;
    }
    setTool(tool) {
        this.currentTool = tool;
        if (tool === 'text') {
            const textStr = prompt("Enter text:", "PixelCraft");
            if (textStr) {
                const tCanvas = document.createElement('canvas');
                const tCtx = tCanvas.getContext('2d');
                tCanvas.width = 800; tCanvas.height = 200;
                tCtx.fillStyle = this.color;
                tCtx.font = "bold 100px Arial";
                tCtx.textAlign = "center";
                tCtx.fillText(textStr, 400, 100);
                this.engine.layerManager.addLayer('text', 'Text Layer', tCanvas, 800, 200);
                this.engine.updateUI();
                this.engine.render();
            }
            this.currentTool = 'move';
        }
    }
    handleMouseDown(mouseX, mouseY) {
        this.isDragging = true;
        this.startX = mouseX; this.startY = mouseY;
        const activeLayer = this.engine.layerManager.getActiveLayer();
        
        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            if (!activeLayer || activeLayer.type !== 'draw') {
                const drawCanvas = document.createElement('canvas');
                drawCanvas.width = this.engine.canvas.width;
                drawCanvas.height = this.engine.canvas.height;
                const newLayer = this.engine.layerManager.addLayer('draw', 'Drawing', drawCanvas, drawCanvas.width, drawCanvas.height);
                this.paint(newLayer, mouseX, mouseY, true);
                this.engine.updateUI();
            } else {
                this.paint(activeLayer, mouseX, mouseY, true);
            }
        }
    }
    handleMouseMove(mouseX, mouseY) {
        if (!this.isDragging) return;
        const activeLayer = this.engine.layerManager.getActiveLayer();
        if (!activeLayer) return;

        if (this.currentTool === 'move') {
            activeLayer.x += (mouseX - this.startX);
            activeLayer.y += (mouseY - this.startY);
            this.startX = mouseX; this.startY = mouseY;
            this.engine.render();
        } else if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.paint(activeLayer, mouseX, mouseY, false);
        }
    }
    paint(layer, x, y, isStart) {
        const ctx = layer.data.getContext('2d');
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = this.size;
        ctx.globalCompositeOperation = (this.currentTool === 'eraser') ? 'destination-out' : 'source-over';
        ctx.strokeStyle = (this.currentTool === 'eraser') ? 'rgba(0,0,0,1)' : this.color;
        
        const relX = x - layer.x - (this.engine.canvas.width / 2) + (layer.width * layer.scale) / 2;
        const relY = y - layer.y - (this.engine.canvas.height / 2) + (layer.height * layer.scale) / 2;
        
        if (isStart) { ctx.beginPath(); ctx.moveTo(relX, relY); }
        else { ctx.lineTo(relX, relY); ctx.stroke(); }
        this.engine.render();
    }
}

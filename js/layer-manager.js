export class Layer {
    constructor(id, type, name, data, width, height) {
        this.id = id;
        this.type = type; // 'image', 'text', 'draw'
        this.name = name;
        this.data = data; // Image object or Canvas
        this.width = width;
        this.height = height;
        
        // Transform
        this.x = 0;
        this.y = 0;
        this.scale = 1;
        this.rotation = 0;
        
        // Properties
        this.visible = true;
        this.opacity = 100;
        this.blendMode = 'source-over';
        
        // Adjustments & 3D
        this.adjustments = { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 };
        this.transform3d = { rotX: 0, rotY: 0 };
        
        // Lighting System
        this.lights = [];
    }
}

export class LayerManager {
    constructor() {
        this.layers = [];
        this.activeLayerId = null;
    }

    addLayer(type, name, data, width, height) {
        const id = 'layer_' + Date.now() + Math.random().toString(16).slice(2);
        const newLayer = new Layer(id, type, name, data, width, height);
        this.layers.push(newLayer);
        this.activeLayerId = id;
        return newLayer;
    }

    getActiveLayer() {
        return this.layers.find(l => l.id === this.activeLayerId);
    }

    deleteActiveLayer() {
        if (!this.activeLayerId) return;
        this.layers = this.layers.filter(l => l.id !== this.activeLayerId);
        this.activeLayerId = this.layers.length ? this.layers[this.layers.length - 1].id : null;
    }
}

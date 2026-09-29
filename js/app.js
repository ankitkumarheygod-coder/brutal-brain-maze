class App {
    constructor() {
        this.engine = new CanvasEngine();
        this.tools = new ToolManager(this.engine);
        this.engine.updateUI = this.updateLayerPanel.bind(this);
        this.initUI();
        initImageLoader(this.engine);
    }
    initUI() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.tab-btn, .panel-content').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).classList.add('active');
            };
        });

        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.onclick = (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('button').classList.add('active');
                this.tools.setTool(e.target.closest('button').dataset.tool);
            };
        });

        document.getElementById('tool-color').onchange = (e) => this.tools.color = e.target.value;
        document.getElementById('tool-size').oninput = (e) => this.tools.size = e.target.value;

        document.querySelectorAll('input[type="range"][data-adj]').forEach(slider => {
            slider.oninput = (e) => {
                const layer = this.engine.layerManager.getActiveLayer();
                if (!layer) return;
                const prop = e.target.dataset.adj;
                const val = parseFloat(e.target.value);
                if (prop === 'rotX' || prop === 'rotY') layer.transform3d[prop] = val;
                else if (prop === 'scale' || prop === 'rotation') layer[prop] = val;
                else layer.adjustments[prop] = val;
                this.engine.render();
            };
        });

        document.getElementById('btn-delete-layer').onclick = () => {
            this.engine.layerManager.deleteActiveLayer();
            this.updateLayerPanel();
            this.engine.render();
        };

        document.getElementById('blend-mode-select').onchange = (e) => {
            const layer = this.engine.layerManager.getActiveLayer();
            if(layer) { layer.blendMode = e.target.value; this.engine.render(); }
        };

        document.getElementById('btn-add-light').onclick = () => {
            const layer = this.engine.layerManager.getActiveLayer();
            if (layer) {
                layer.lights.push({ x: layer.width/2, y: layer.height/2, radius: Math.max(layer.width, layer.height), intensity: 0.8, color: '#ffffff' });
                this.updateLightingPanel();
                this.engine.render();
            }
        };

        document.getElementById('menu-export').onclick = () => exportImage(this.engine.canvas);

        const canvas = this.engine.canvas;
        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
        };

        canvas.onmousedown = (e) => { const pos = getMousePos(e); this.tools.handleMouseDown(pos.x, pos.y); };
        window.onmousemove = (e) => { if (this.tools.isDragging) { const pos = getMousePos(e); this.tools.handleMouseMove(pos.x, pos.y); } };
        window.onmouseup = () => this.tools.isDragging = false;
    }

    updateLayerPanel() {
        const list = document.getElementById('layer-list');
        list.innerHTML = '';
        [...this.engine.layerManager.layers].reverse().forEach(layer => {
            const li = document.createElement('li');
            li.className = `layer-item ${layer.id === this.engine.layerManager.activeLayerId ? 'active' : ''}`;
            li.innerHTML = `<span>${layer.name}</span>`;
            li.onclick = () => {
                this.engine.layerManager.activeLayerId = layer.id;
                this.updateLayerPanel();
                this.updateLightingPanel();
            };
            list.appendChild(li);
        });
    }

    updateLightingPanel() {
        const container = document.getElementById('lights-container');
        container.innerHTML = '';
        const layer = this.engine.layerManager.getActiveLayer();
        if (!layer || !layer.lights) return;
        layer.lights.forEach((light, index) => {
            const div = document.createElement('div');
            div.className = 'light-item';
            div.innerHTML = `<p>Light ${index + 1}</p><input type="color" value="${light.color}" class="l-color"><input type="range" class="l-int" min="0" max="2" step="0.1" value="${light.intensity}">`;
            div.querySelector('.l-color').onchange = (e) => { light.color = e.target.value; this.engine.render(); };
            div.querySelector('.l-int').oninput = (e) => { light.intensity = parseFloat(e.target.value); this.engine.render(); };
            container.appendChild(div);
        });
    }
}

window.onload = () => { window.PixelCraftApp = new App(); };

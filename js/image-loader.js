function initImageLoader(canvasEngine) {
    const fileInput = document.getElementById('file-upload');
    const startUploadBtn = document.getElementById('btn-start-upload');
    
    const handleFiles = (files) => {
        if (!files.length) return;
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('main-canvas').style.display = 'block';

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    if (canvasEngine.layerManager.layers.length === 0) {
                        canvasEngine.setWorkspaceSize(img.width, img.height);
                    }
                    canvasEngine.layerManager.addLayer('image', file.name, img, img.width, img.height);
                    canvasEngine.updateUI();
                    canvasEngine.render();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    startUploadBtn.onclick = () => fileInput.click();
    document.getElementById('menu-upload').onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFiles(e.target.files);
    
    const dropZone = document.getElementById('drop-zone');
    dropZone.ondragover = (e) => { e.preventDefault(); };
    dropZone.ondrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
}

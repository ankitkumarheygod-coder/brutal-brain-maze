function exportImage(canvas) {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `PixelCraft_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

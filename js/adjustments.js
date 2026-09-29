function applyAdjustments(ctx, layer) {
    const adj = layer.adjustments;
    let filterStr = '';
    if (adj.brightness !== 0) filterStr += `brightness(${100 + parseInt(adj.brightness)}%) `;
    if (adj.contrast !== 0) filterStr += `contrast(${100 + parseInt(adj.contrast)}%) `;
    if (adj.saturation !== 0) filterStr += `saturate(${100 + parseInt(adj.saturation)}%) `;
    if (adj.hue !== 0) filterStr += `hue-rotate(${adj.hue}deg) `;
    if (adj.blur > 0) filterStr += `blur(${adj.blur}px) `;
    if (filterStr.trim() !== '') ctx.filter = filterStr.trim();
}

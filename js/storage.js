const NAMESPACE = 'brutalBrainMaze';

export const Storage = {
    save(key, value) {
        try {
            const data = this.getAll();
            data[key] = value;
            localStorage.setItem(NAMESPACE, JSON.stringify(data));
        } catch (e) { console.warn("Storage restricted"); }
    },
    get(key, defaultValue = null) {
        try {
            const data = this.getAll();
            return data[key] !== undefined ? data[key] : defaultValue;
        } catch (e) { return defaultValue; }
    },
    getAll() {
        const data = localStorage.getItem(NAMESPACE);
        return data ? JSON.parse(data) : {};
    },
    reset() {
        localStorage.removeItem(NAMESPACE);
    }
};

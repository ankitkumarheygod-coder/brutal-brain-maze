import { Storage } from './storage.js';
import { Difficulty } from './difficulty.js';
import { MazeGenerator } from './maze-generator.js';

export class LevelManager {
    constructor() {
        this.currentLevel = Storage.get('currentLevel', 1);
        this.xp = Storage.get('xp', 0);
        this.cellSize = 40; 
        this.mazeData = null;
    }

    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        Storage.save('currentLevel', levelNumber);
        
        const params = Difficulty.getParams(levelNumber);
        this.mazeData = MazeGenerator.generate(params.cols, params.rows, params.seed, this.cellSize);
        return this.mazeData;
    }

    completeLevel() {
        this.xp += this.currentLevel * 10;
        Storage.save('xp', this.xp);
        let maxUnlocked = Storage.get('maxUnlocked', 1);
        if (this.currentLevel >= maxUnlocked) {
            Storage.save('maxUnlocked', this.currentLevel + 1);
        }
    }

    nextLevel() {
        return this.loadLevel(this.currentLevel + 1);
    }
}

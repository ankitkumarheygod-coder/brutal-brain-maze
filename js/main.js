import { LevelManager } from './level-manager.js';
import { QuizTimer } from './quiz/quiz-timer.js';
import { QuizLock } from './quiz/quiz-lock.js';
import { QuizUI } from './quiz/quiz-ui.js';
import { GameEngine } from './game.js';
import { stateManager, GameState } from './game-state.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Data Modules
    const levelManager = new LevelManager();
    const quizTimer = new QuizTimer(30); // 30 Seconds Active Gameplay Lock
    const quizLock = new QuizLock();
    
    // 2. Init UI Modules
    const quizUI = new QuizUI(quizLock, () => {
        // On Quiz Success
        quizTimer.reset();
        stateManager.set(GameState.PLAYING);
    });

    // 3. Init Engine
    const canvas = document.getElementById('game-canvas');
    const engine = new GameEngine(canvas, levelManager, quizTimer, quizUI);

    // Initial Load
    levelManager.loadLevel(levelManager.currentLevel);
    engine.initLevel();

    // Next Level Button Handler
    document.getElementById('btn-next-level').addEventListener('click', () => {
        document.getElementById('level-complete').classList.add('hidden');
        levelManager.nextLevel();
        engine.initLevel();
    });

    // Start Loop
    requestAnimationFrame((t) => engine.loop(t));
});

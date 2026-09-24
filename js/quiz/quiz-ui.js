export class QuizUI {
    constructor(quizLock, onCompleteCallback) {
        this.quizLock = quizLock;
        this.onComplete = onCompleteCallback;
        
        this.modal = document.getElementById('quiz-modal');
        this.progressEl = document.getElementById('quiz-progress');
        this.questionEl = document.getElementById('quiz-question');
        this.optionsContainer = document.getElementById('quiz-options');
        this.feedbackEl = document.getElementById('quiz-feedback');
        this.btnContinue = document.getElementById('btn-quiz-continue');

        this.btnContinue.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.onComplete();
        });
    }

    open() {
        this.modal.classList.remove('hidden');
        this.btnContinue.classList.add('hidden');
        this.feedbackEl.innerText = "";
        this.quizLock.generateQuiz();
        this.renderCurrentQuestion();
    }

    renderCurrentQuestion() {
        const q = this.quizLock.getCurrentQuestion();
        const index = this.quizLock.currentIndex;
        
        this.progressEl.innerText = `${index + 1} / 10`;
        this.questionEl.innerText = q.q;
        
        this.optionsContainer.innerHTML = '';
        this.feedbackEl.innerText = "";

        q.shuffledOptions.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerText = opt.text;
            btn.onclick = () => this.handleAnswer(i);
            this.optionsContainer.appendChild(btn);
        });
    }

    handleAnswer(i) {
        const result = this.quizLock.submitAnswer(i);
        
        if (result.correct) {
            if (result.complete) {
                this.optionsContainer.innerHTML = '';
                this.feedbackEl.className = 'quiz-feedback feedback-success';
                this.feedbackEl.innerText = "10/10 सही! गेम अनलॉक हो गया। (10/10 Correct! Game Unlocked.)";
                this.btnContinue.classList.remove('hidden');
            } else {
                this.renderCurrentQuestion();
            }
        } else {
            this.optionsContainer.innerHTML = '';
            this.feedbackEl.className = 'quiz-feedback feedback-error';
            this.feedbackEl.innerText = "गलत उत्तर! प्रश्नोत्तरी फिर से शुरू हो रही है। (Wrong! Restarting...)";
            setTimeout(() => {
                this.quizLock.generateQuiz(); // Force restart
                this.renderCurrentQuestion();
            }, 2000);
        }
    }
}

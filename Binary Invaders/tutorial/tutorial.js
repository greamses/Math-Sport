class CardSystem {
  constructor() {
    this.currentStep = 0;
    this.practiceQuestions = this.generatePracticeQuestions();
    this.totalSteps = 3 + this.practiceQuestions.length + 1; // intro + instructions + questions + completion
    this.correctAnswers = 0;
    this.userAnswers = [];
    this.init();
  }
  
  generatePracticeQuestions() {
    // Generate 10 unique random numbers from 1-15
    const questions = [];
    const usedNumbers = new Set();
    
    while (questions.length < 10) {
      const num = Math.floor(Math.random() * 15) + 1; // 1-15
      if (!usedNumbers.has(num)) {
        questions.push(num);
        usedNumbers.add(num);
      }
    }
    return questions;
  }
  
  init() {
    this.createBinaryBackground();
    this.createPracticeQuestions();
    this.setupNavigation();
    this.setupToggleDemo();
    this.setupPracticeExercises();
    this.updateStep();
  }
  
  createBinaryBackground() {
    const binaryBg = document.getElementById('binary-bg');
    const digits = ['0', '1'];
    
    for (let i = 0; i < 80; i++) {
      const digit = document.createElement('div');
      digit.className = 'binary-digit';
      digit.textContent = digits[Math.floor(Math.random() * digits.length)];
      digit.style.left = `${Math.random() * 100}%`;
      digit.style.animationDelay = `${Math.random() * 15}s`;
      digit.style.fontSize = `${Math.random() * 8 + 10}px`;
      binaryBg.appendChild(digit);
    }
  }
  
  createPracticeQuestions() {
    const container = document.getElementById('practice-questions-container');
    const stepIndicator = document.querySelector('.step-indicator');
    
    // Create step dots for questions
    this.practiceQuestions.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'step-dot';
      dot.setAttribute('data-step', (3 + index).toString());
      stepIndicator.appendChild(dot);
    });
    
    // Create question steps using map
    const questionSteps = this.practiceQuestions.map((question, index) => {
      const stepNumber = 3 + index;
      const isHalfway = index === 4;
      const isFinal = index === 9;
      
      return `
        <div class="tutorial-step" data-step="${stepNumber}">
          <div class="step-content">
            <div class="step-title">${isFinal ? 'FINAL CHALLENGE: ' : ''}QUESTION ${index + 1}</div>
            <div class="step-description">
              ${isHalfway ? 'Halfway there! ' : ''}
              ${isFinal ? 'Last one! ' : ''}
              Convert the number ${question} to 4-bit binary
            </div>
            
            <div class="demo-area">
              <div class="target-label">TARGET NUMBER:</div>
              <div class="target-number" id="target-number-${stepNumber}">${question}</div>
              
              <div class="binary-input" id="practice-container-${stepNumber}">
                <button class="bit-toggle" data-bit="3">0<span class="bit-label">8</span></button>
                <button class="bit-toggle" data-bit="2">0<span class="bit-label">4</span></button>
                <button class="bit-toggle" data-bit="1">0<span class="bit-label">2</span></button>
                <button class="bit-toggle" data-bit="0">0<span class="bit-label">1</span></button>
              </div>
              
              <button class="attack-btn" id="practice-attack-${stepNumber}">
                ${isFinal ? 'FINAL ATTACK!' : 'ATTACK!'}
              </button>
              <div class="feedback" id="practice-feedback-${stepNumber}"></div>
            </div>
            
            ${this.getQuestionInfoBox(index, question)}
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = questionSteps;
  }
  
  getQuestionInfoBox(index, question) {
    if (index === 0) {
      return `
        <div class="info-box">
          <strong>FIRST CHALLENGE:</strong><br>
          • Remember: Bit values are 8, 4, 2, 1<br>
          • Add the values of "1" bits to get ${question}<br>
          • Take your time and think it through!
        </div>
      `;
    } else if (index === 4) {
      return `
        <div class="info-box">
          <strong>HALFWAY POINT:</strong><br>
          • 5 questions completed!<br>
          • 5 more to go!<br>
          • You're getting the hang of binary!
        </div>
      `;
    } else if (index === 9) {
      return `
        <div class="info-box">
          <strong>FINAL MISSION:</strong><br>
          • This is your last practice question<br>
          • Show what you've learned about binary<br>
          • Ready for the main game after this!
        </div>
      `;
    } else if ([2, 7].includes(index)) {
      // Show strategy tips on questions 3 and 8
      const binaryAnswer = question.toString(2).padStart(4, '0');
      return `
        <div class="info-box">
          <strong>STRATEGY TIP:</strong><br>
          • Start with the largest bit (8) and work down<br>
          • For ${question}, the binary is ${binaryAnswer}<br>
          • ${this.getBinaryExplanation(question)}
        </div>
      `;
    }
    return '';
  }
  
  getBinaryExplanation(number) {
    const bits = number.toString(2).padStart(4, '0').split('');
    const values = [8, 4, 2, 1];
    const components = [];
    
    bits.forEach((bit, index) => {
      if (bit === '1') {
        components.push(values[index]);
      }
    });
    
    return `Breakdown: ${number} = ${components.join(' + ')}`;
  }
  
  setupNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    prevBtn.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.updateStep();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.updateStep();
      } else {
        window.location.href = 'index.html';
      }
    });
    
    menuBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  
  setupToggleDemo() {
    const container = document.getElementById('toggle-demo');
    const valueDisplay = document.getElementById('demo-value');
    const bits = container.querySelectorAll('.bit-toggle');
    
    let bitState = [0, 0, 0, 0];
    
    bits.forEach((btn, index) => {
      const bitPosition = 3 - index;
      btn.addEventListener('click', () => {
        bitState[bitPosition] = bitState[bitPosition] === 0 ? 1 : 0;
        btn.textContent = bitState[bitPosition];
        btn.classList.toggle('active', bitState[bitPosition] === 1);
        
        const decimal = this.binaryToDecimal(bitState);
        valueDisplay.textContent = `Current Value: ${decimal}`;
      });
    });
  }
  
  setupPracticeExercises() {
    // Setup all practice questions
    this.practiceQuestions.forEach((_, index) => {
      this.setupPracticeQuestion(3 + index);
    });
  }
  
  setupPracticeQuestion(stepIndex) {
    const questionNum = stepIndex - 3;
    const container = document.getElementById(`practice-container-${stepIndex}`);
    const feedbackEl = document.getElementById(`practice-feedback-${stepIndex}`);
    const attackBtn = document.getElementById(`practice-attack-${stepIndex}`);
    const bits = container.querySelectorAll('.bit-toggle');
    
    let bitState = [0, 0, 0, 0];
    let questionAnswered = false;
    const correctAnswer = this.practiceQuestions[questionNum];
    
    bits.forEach((btn, index) => {
      const bitPosition = 3 - index;
      btn.addEventListener('click', () => {
        if (!questionAnswered) {
          bitState[bitPosition] = bitState[bitPosition] === 0 ? 1 : 0;
          btn.textContent = bitState[bitPosition];
          btn.classList.toggle('active', bitState[bitPosition] === 1);
          feedbackEl.textContent = '';
          feedbackEl.className = 'feedback';
        }
      });
    });
    
    attackBtn.addEventListener('click', () => {
      if (questionAnswered) return;
      
      const decimal = this.binaryToDecimal(bitState);
      
      if (decimal === correctAnswer) {
        this.correctAnswers++;
        feedbackEl.textContent = '✓ CORRECT! Excellent binary conversion!';
        feedbackEl.className = 'feedback success';
        attackBtn.disabled = true;
        bits.forEach(btn => btn.disabled = true);
        questionAnswered = true;
        
        this.updateScoreDisplay();
        
      } else {
        feedbackEl.textContent = `✗ Incorrect. You entered ${decimal}, correct is ${correctAnswer}`;
        feedbackEl.className = 'feedback error';
        
        const binaryHint = correctAnswer.toString(2).padStart(4, '0');
        setTimeout(() => {
          feedbackEl.innerHTML += `<br><small>Binary: ${binaryHint} = ${correctAnswer}</small>`;
        }, 1000);
      }
    });
  }
  
  binaryToDecimal(bitArray) {
    return bitArray.reduce((acc, bit, i) => acc + bit * Math.pow(2, i), 0);
  }
  
  updateStep() {
    document.querySelectorAll('.tutorial-step').forEach((step, index) => {
      step.classList.toggle('active', index === this.currentStep);
    });
    
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentStep);
    });
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = this.currentStep === 0;
    
    if (this.currentStep === this.totalSteps - 1) {
      this.showFinalResults();
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
    } else {
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
    }
  }
  
  updateScoreDisplay() {
    if (this.currentStep === this.totalSteps - 1) {
      this.showFinalResults();
    }
  }
  
  showFinalResults() {
    const score = this.correctAnswers;
    const percentage = Math.round((score / 10) * 100);
    
    let rating = "BEGINNER";
    if (percentage >= 90) {
      rating = "EXPERT";
  
    } else if (percentage >= 70) {
      rating = "ADVANCED";
    
    } else if (percentage >= 50) {
      rating = "INTERMEDIATE";

    }
    
    const finalScoreEl = document.getElementById('final-score');
    const accuracyEl = document.getElementById('accuracy-rating');
    
    if (finalScoreEl && accuracyEl) {
      finalScoreEl.textContent = `${score}/10 Correct`;
      accuracyEl.textContent = `${percentage}% Accuracy - ${rating} ${emoji}`;
    }
    
    const descriptionEl = document.querySelector('[data-step="13"] .step-description');
    if (descriptionEl) {
      if (score === 10) {
        descriptionEl.textContent = "PERFECT SCORE! You've mastered 4-bit binary conversion! Ready for any digital threat!";
      } else if (score >= 7) {
        descriptionEl.textContent = "Excellent work! You have a strong understanding of binary conversion. The digital frontier is safer with you!";
      } else if (score >= 5) {
        descriptionEl.textContent = "Good job! You understand binary basics. With more practice, you'll be unstoppable!";
      } else {
        descriptionEl.textContent = "You've completed the training! Binary takes practice - keep working and you'll improve!";
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cardSystem = new CardSystem();
});
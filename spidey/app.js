const words = [
  {
    word: "ADD",
    hints: [
      "Hundreds place: A",
      "Tens place: D", 
      "Units place: D",
      "What you do with numbers when you put them together"
    ]
  },
  {
    word: "SUM",
    hints: [
      "Hundreds place: S",
      "Tens place: U",
      "Units place: M",
      "The total when you add numbers"
    ]
  },
  {
    word: "EVEN",
    hints: [
      "Thousands place: E",
      "Hundreds place: V", 
      "Tens place: E",
      "Units place: N",
      "Numbers like 2, 4, 6, 8..."
    ]
  },
  {
    word: "AREA",
    hints: [
      "Thousands place: A",
      "Hundreds place: R",
      "Tens place: E",
      "Units place: A",
      "The space inside a shape"
    ]
  },
  {
    word: "PLUS",
    hints: [
      "Thousands place: P",
      "Hundreds place: L",
      "Tens place: U",
      "Units place: S",
      "The mathematical symbol for addition"
    ]
  },
  {
    word: "SINE",
    hints: [
      "Thousands place: S",
      "Hundreds place: I",
      "Tens place: N",
      "Units place: E",
      "A trigonometry function"
    ]
  },
  {
    word: "AXIS",
    hints: [
      "Thousands place: A",
      "Hundreds place: X",
      "Tens place: I",
      "Units place: S",
      "A reference line on a graph"
    ]
  },
  {
    word: "ANGLE",
    hints: [
      "Ten-thousands place: A",
      "Thousands place: N",
      "Hundreds place: G",
      "Tens place: L",
      "Units place: E",
      "Where two lines meet"
    ]
  },
  {
    word: "SOLID",
    hints: [
      "Ten-thousands place: S",
      "Thousands place: O",
      "Hundreds place: L",
      "Tens place: I",
      "Units place: D",
      "A 3D shape"
    ]
  },
  {
    word: "PRIME",
    hints: [
      "Ten-thousands place: P",
      "Thousands place: R",
      "Hundreds place: I",
      "Tens place: M",
      "Units place: E",
      "Numbers like 2, 3, 5, 7..."
    ]
  },
  {
    word: "FACTOR",
    hints: [
      "Hundred-thousands place: F",
      "Ten-thousands place: A",
      "Thousands place: C",
      "Hundreds place: T",
      "Tens place: O",
      "Units place: R",
      "Numbers that divide evenly into another number"
    ]
  },
  {
    word: "TWO",
    hints: [
      "Hundreds place: T",
      "Tens place: W",
      "Units place: O",
      "The number after one"
    ]
  },
  {
    word: "TEN",
    hints: [
      "Hundreds place: T",
      "Tens place: E",
      "Units place: N",
      "The number of fingers you have"
    ]
  },
  {
    word: "SIX",
    hints: [
      "Hundreds place: S",
      "Tens place: I",
      "Units place: X",
      "Half a dozen"
    ]
  },
  {
    word: "FOUR",
    hints: [
      "Thousands place: F",
      "Hundreds place: O",
      "Tens place: U",
      "Units place: R",
      "Number of seasons in a year"
    ]
  },
  {
    word: "FIVE",
    hints: [
      "Thousands place: F",
      "Hundreds place: I",
      "Tens place: V",
      "Units place: E",
      "Number of toes on one foot"
    ]
  },
  {
    word: "NINE",
    hints: [
      "Thousands place: N",
      "Hundreds place: I",
      "Tens place: N",
      "Units place: E",
      "Number of planets in our solar system"
    ]
  },
  {
    word: "ZERO",
    hints: [
      "Thousands place: Z",
      "Hundreds place: E",
      "Tens place: R",
      "Units place: O",
      "The number that means nothing"
    ]
  },
  {
    word: "HALF",
    hints: [
      "Thousands place: H",
      "Hundreds place: A",
      "Tens place: L",
      "Units place: F",
      "Fifty percent of something"
    ]
  },
  {
    word: "WHOLE",
    hints: [
      "Ten-thousands place: W",
      "Thousands place: H",
      "Hundreds place: O",
      "Tens place: L",
      "Units place: E",
      "Complete, not divided"
    ]
  },
  {
    word: "TIMES",
    hints: [
      "Ten-thousands place: T",
      "Thousands place: I",
      "Hundreds place: M",
      "Tens place: E",
      "Units place: S",
      "Another word for multiplication"
    ]
  },
  {
    word: "EQUAL",
    hints: [
      "Ten-thousands place: E",
      "Thousands place: Q",
      "Hundreds place: U",
      "Tens place: A",
      "Units place: L",
      "The same as"
    ]
  },
  {
    word: "MINUS",
    hints: [
      "Ten-thousands place: M",
      "Thousands place: I",
      "Hundreds place: N",
      "Tens place: U",
      "Units place: S",
      "Another word for subtraction"
    ]
  },
  {
    word: "TOTAL",
    hints: [
      "Ten-thousands place: T",
      "Thousands place: O",
      "Hundreds place: T",
      "Tens place: A",
      "Units place: L",
      "The final amount"
    ]
  },
  {
    word: "COUNT",
    hints: [
      "Ten-thousands place: C",
      "Thousands place: O",
      "Hundreds place: U",
      "Tens place: N",
      "Units place: T",
      "Say numbers in order"
    ]
  },
  {
    word: "VALUE",
    hints: [
      "Ten-thousands place: V",
      "Thousands place: A",
      "Hundreds place: L",
      "Tens place: U",
      "Units place: E",
      "How much something is worth"
    ]
  },
  {
    word: "POINT",
    hints: [
      "Ten-thousands place: P",
      "Thousands place: O",
      "Hundreds place: I",
      "Tens place: N",
      "Units place: T",
      "A dot in decimals"
    ]
  },
  {
    word: "SHAPE",
    hints: [
      "Ten-thousands place: S",
      "Thousands place: H",
      "Hundreds place: A",
      "Tens place: P",
      "Units place: E",
      "Circle, square, or triangle"
    ]
  },
  {
    word: "SQUARE",
    hints: [
      "Hundred-thousands place: S",
      "Ten-thousands place: Q",
      "Thousands place: U",
      "Hundreds place: A",
      "Tens place: R",
      "Units place: E",
      "A shape with four equal sides"
    ]
  }
];

let currentWord;
let currentHints;
let shuffledHints;
let currentHintIndex;
let score = 0;
let isMusicPlaying = false;
let wordIndex = 0;
let wordRepeatCount = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initGame() {
  // If we've shown current word twice, move to next word
  if (wordRepeatCount >= 2) {
    wordIndex = (wordIndex + 1) % words.length;
    wordRepeatCount = 0;
  }
  
  currentWord = words[wordIndex].word;
  currentHints = words[wordIndex].hints;
  shuffledHints = shuffleArray([...currentHints]);
  currentHintIndex = 0;
  wordRepeatCount++;
  
  updateDisplay();
}

function updateDisplay() {
  const wordDisplay = document.getElementById('wordDisplay');
  wordDisplay.innerHTML = '';
  for (let i = 0; i < currentWord.length; i++) {
    const letterBox = document.createElement('div');
    letterBox.className = 'letter-box';
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'letter-input';
    input.dataset.index = i;
    input.style.textTransform = 'uppercase';
    letterBox.appendChild(input);
    wordDisplay.appendChild(letterBox);
  }

  document.getElementById('hint').textContent = ` ${shuffledHints[currentHintIndex]}`;
  document.getElementById('message').textContent = '';
  document.getElementById('score').textContent = `Score: ${score}`;
}

function nextHint() {
  currentHintIndex = (currentHintIndex + 1) % shuffledHints.length;
  document.getElementById('hint').textContent = `${shuffledHints[currentHintIndex]}`;
}

function checkWord() {
  const inputs = document.querySelectorAll('.letter-input');
  let guessedWord = '';
  inputs.forEach(input => {
    guessedWord += input.value.toUpperCase();
  });

  if (guessedWord === currentWord) {
    score += 1;
    document.getElementById('message').textContent = 'Correct! Moving to next word...';
    setTimeout(() => {
      initGame();
    }, 1500);
  } else {
    let correctLetters = 0;
    for (let i = 0; i < currentWord.length; i++) {
      if (guessedWord[i] === currentWord[i]) {
        correctLetters++;
      }
    }
    document.getElementById('message').textContent = `Incorrect. You got ${correctLetters} letter(s) right. Try again!`;
  }
}

function playMusic() {
  const backgroundMusic = document.getElementById('backgroundMusic');
  if (!isMusicPlaying) {
    backgroundMusic.play();
    isMusicPlaying = true;
    document.getElementById('playPauseButton').textContent = 'Pause Music';
  } else {
    backgroundMusic.pause();
    isMusicPlaying = false;
    document.getElementById('playPauseButton').textContent = 'Play Music';
  }
}

function changeVolume(value) {
  const backgroundMusic = document.getElementById('backgroundMusic');
  backgroundMusic.volume = value;
  document.getElementById('volumeLabel').textContent = `Volume: ${Math.round(value * 100)}%`;
}

initGame();
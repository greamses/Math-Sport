const words = [
  { // Level 1: Basic Arithmetic (1-5)
    word: "ADD",
    hints: [
      "Hundreds place: Starts and end the word 'alpha'",
      "Tens place: Roman numeral for 500",
      "Units place: Repeats the first letter",
    ]
  },
  {
    word: "SUM",
    hints: [
      "Hundreds place: Last letter in the word 'first'",
      "Tens place: The letter between T and V",
      "Units place: First letter of the word 'moon'",
      "The total when numbers are combined",
    ]
  },
  {
    word: "EVEN",
    hints: [
      "Thousands place: Halfway to 'J' in the alphabet",
      "Hundreds place: Symbol used for voltage",
      "Tens place: First letter in the word 'example'",
      "Units place: Always after a thousand.",
    ]
  },
  {
    word: "AREA",
    hints: [
      "Thousands place: The alphabet wouldn't start without it",
      "Hundreds place: Pronounced as 'are'",
      "Tens place: The most common vowel",
      "Units place: Same as the first letter",
      "The space inside a shape"
    ]
  },
  {
    word: "PLUS",
    hints: [
      "Thousands place: The letter after 'O'",
      "Hundreds place: Romans chose this as number 50",
      "Tens place and Units place: The object for 'we'",
      "The mathematical symbol for addition"
    ]
  },

  { // Level 2: Geometry/Trigonometry (6-10)
    word: "SINE",
    hints: [
      "Thousands place: 'Sunday' starts with it",
      "Hundreds place: The letter between H and J",
      "Tens place: A letter for the word 'eye'",
      "Units place: Bees have two of it.",
    ]
  },
  {
    word: "AXIS",
    hints: [
      "Thousands place: Word used before singular nouns.",
      "Hundreds place:  Roman numeral for 10",
      "Tens place: Center letter of 'pie'",
      "Units place: Last letter in 'his'",
    ]
  },
  {
    word: "ANGLE",
    hints: [
      "Ten-thousands: The starting letter",
      "Thousands: Present in 'think' but not 'thick'",
      "Hundreds: Considered a lucky number",
      "Tens: Letter between K and M",
      "Units: Last letter of 'apple'",
    ]
  },
  {
    word: "SOLID",
    hints: [
      "Ten-thousands: First letter of 'stop'",
      "Thousands: Nigerians think I am zero.",
      "Hundreds: Letter between K and M",
      "Tens: Letter between H and J",
      "Units: First letter of 'day'",
    ]
  },
  {
    word: "PRIME",
    hints: [
      "Ten-thousands: First letter of 'pop'",
      "Thousands: Letter between Q and S",
      "Hundreds: The only pronoun that can be capitalized",
      "Tens and Units: The object of I",
    ]
  },
  {
    word: "FACTOR",
    hints: [
      "Hundred-thousands: Remove me and 'flying' would be 'lying'",
      "Ten-thousands: The first vowel",
      "Thousands: Third letter of alphabet",
      "Hundreds: You can call me a beverage.",
      "Tens: It is in 'nor' but not in 'neither'",
      "Units: Letter between Q and S",
    ]
  },
  
  // {
  //   word: "INTEGER",
  //   hints: [
  //     "Millions: Middle letter of 'pin'",
  //     "Hundred-thousands: Letter before O",
  //     "Ten-thousands: First letter of 'top'",
  //     "Thousands: Last letter of 'bee'",
  //     "Hundreds: Lucky number seven",
  //     "Tens: Last letter of 'bee'",
  //     "Units: Letter between Q and S",
  //     "Whole number (positive or negative)"
  //   ]
  // },
  // {
  //   word: "DECIMAL",
  //   hints: [
  //     "Millions: First letter of 'dog'",
  //     "Hundred-thousands: Last letter of 'bee'",
  //     "Ten-thousands: Third letter of alphabet",
  //     "Thousands: Middle letter of 'pin'",
  //     "Hundreds: Letter before L",
  //     "Tens: The starting letter",
  //     "Units: Letter between K and M",
  //     "Number system based on ten"
  //   ]
  // },
  // {
  //   word: "POLYGON",
  //   hints: [
  //     "Millions: First letter of 'pop'",
  //     "Hundred-thousands: Middle letter of 'lot'",
  //     "Ten-thousands: Letter between U and W",
  //     "Thousands: Lucky number seven",
  //     "Hundreds: First letter of 'go'",
  //     "Tens: Middle letter of 'lot'",
  //     "Units: Letter before O",
  //     "Many-sided plane figure"
  //   ]
  // },
  // { 
  //   // Level 5: Challenging (21-25)
  //   word: "FORMULA",
  //   hints: [
  //     "Millions: First letter of 'fun'",
  //     "Hundred-thousands: Middle letter of 'lot'",
  //     "Ten-thousands: Letter between Q and S",
  //     "Thousands: Letter between K and M",
  //     "Hundreds: Letter between H and J",
  //     "Tens: The starting letter",
  //     "Units: First letter of 'apple'",
  //     "Mathematical relationship expressed in symbols"
  //   ]
  // },
  // {
  //   word: "EQUATION",
  //   hints: [
  //     "Ten-millions: Fifth letter of alphabet",
  //     "Millions: Letter between Q and S",
  //     "Hundred-thousands: Letter between U and W",
  //     "Ten-thousands: First letter of 'apple'",
  //     "Thousands: Letter before O",
  //     "Hundreds: Middle letter of 'pin'",
  //     "Tens: Letter before O",
  //     "Units: Letter before P",
  //     "Mathematical statement of equality"
  //   ]
  // },
  // {
  //   word: "FUNCTION",
  //   hints: [
  //     "Ten-millions: First letter of 'fun'",
  //     "Millions: Letter between U and W",
  //     "Hundred-thousands: Letter before D",
  //     "Ten-thousands: Letter before O",
  //     "Thousands: Third letter of alphabet",
  //     "Hundreds: Letter before O",
  //     "Tens: Middle letter of 'pin'",
  //     "Units: Letter before P",
  //     "Relation between inputs and outputs"
  //   ]
  // },
];

let currentWord;
let currentHints;
let shuffledHints;
let currentHintIndex;
let score = 0;
let isMusicPlaying = false;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initGame() {
  const randomIndex = Math.floor(Math.random() * words.length);
  currentWord = words[randomIndex].word;
  currentHints = words[randomIndex].hints;
  shuffledHints = shuffleArray([...currentHints]);
  currentHintIndex = 0;
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
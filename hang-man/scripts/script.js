// Get DOM elements
const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const questionsText = document.querySelector(".questions-text b");
const timerText = document.querySelector(".timer-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = gameModal.querySelector("button");
const refreshBtn = document.querySelector(".refresh-btn");
const levelCompleteModal = document.querySelector(".level-complete-modal");
const introModal = document.querySelector(".intro-modal");
const startBtn = document.querySelector(".start-btn");
const changeModeBtn = document.querySelector(".change-mode-btn");
const dictionaryBtn = document.querySelector(".dictionary-btn");
const dictionaryModal = document.querySelector(".dictionary-modal");
const closeDictionaryBtn = document.querySelector(".close-dictionary-btn");
const prevWordBtn = document.querySelector(".prev-word-btn");
const nextWordBtn = document.querySelector(".next-word-btn");
const searchInput = document.querySelector(".dictionary-search");
const searchBtn = document.querySelector(".search-btn");
const clearSearchBtn = document.querySelector(".clear-search-btn");

let currentDictionaryIndex = 0;
let filteredDictionary = [];

// Initialize variables
let currentWord, correctLetters = [], wrongGuessCount = 0;
let maxGuesses = 6;
let questionCount = 1;
let questionsPerLevel = 10;
let timer;
let maxTime = 30;
let timeLeft = maxTime;

let currentDifficulty = "easy";
let currentGameMode = "progressive";
let currentTopic = "all";
let selectedDifficulty = "easy";
let selectedTopic = "all";

let completedLevels = {
    easy: { completed: false, score: 0 },
    medium: { completed: false, score: 0 },
    hard: { completed: false, score: 0 }
};

let usedWords = {
    easy: [],
    medium: [],
    hard: [],
    all: []
};

// Game state management
const loadGameState = () => {
    const savedState = localStorage.getItem('hangmanGameState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            currentDifficulty = state.currentDifficulty || "easy";
            questionCount = state.questionCount || 1;
            completedLevels = state.completedLevels || completedLevels;
            usedWords = state.usedWords || {
                easy: [],
                medium: [],
                hard: [],
                all: []
            };
            currentGameMode = state.currentGameMode || "progressive";
            currentTopic = state.currentTopic || "all";
            selectedDifficulty = state.selectedDifficulty || "easy";
            selectedTopic = state.selectedTopic || "all";
            
            // Ensure all difficulty arrays exist
            if (!usedWords.easy) usedWords.easy = [];
            if (!usedWords.medium) usedWords.medium = [];
            if (!usedWords.hard) usedWords.hard = [];
            if (!usedWords.all) usedWords.all = [];
        } catch (e) {
            console.error('Error loading game state:', e);
        }
    }
};

const saveGameState = () => {
    const state = {
        currentDifficulty,
        questionCount,
        completedLevels,
        usedWords,
        currentGameMode,
        currentTopic,
        selectedDifficulty,
        selectedTopic
    };
    localStorage.setItem('hangmanGameState', JSON.stringify(state));
};

// Word filtering and selection
const getWordsForCurrentMode = (resetUsedWords = false) => {
    let filteredWords = [];
    
    if (resetUsedWords) {
        resetUsedWordsForCategory();
    }
    
    console.log('Current game mode:', currentGameMode);
    console.log('Selected difficulty:', selectedDifficulty);
    console.log('Selected topic:', selectedTopic);
    
    switch (currentGameMode) {
        case 'progressive':
            // Filter by level property - case insensitive
            filteredWords = wordList.filter(word => 
                word.level && 
                word.level.toLowerCase() === currentDifficulty.toLowerCase() && 
                !usedWords[currentDifficulty].includes(word.word.toLowerCase())
            );
            console.log('Progressive mode - filtered by level:', currentDifficulty);
            break;
            
        case 'difficulty':
            // Filter ONLY by level property - case insensitive
            // Do NOT filter by topic in this mode
            filteredWords = wordList.filter(word => {
                const hasCorrectLevel = word.level && word.level.toLowerCase() === selectedDifficulty.toLowerCase();
                const notUsed = !usedWords[selectedDifficulty]?.includes(word.word.toLowerCase());
                return hasCorrectLevel && notUsed;
            });
            console.log('Difficulty mode - filtered by level:', selectedDifficulty, 'Found:', filteredWords.length);
            break;
            
        case 'topic':
            // Filter by topic - get words from ALL difficulty levels
            if (selectedTopic === 'all') {
                filteredWords = wordList.filter(word => 
                    !usedWords.all?.includes(word.word.toLowerCase())
                );
            } else {
                filteredWords = wordList.filter(word => {
                    const hasCorrectTopic = word.topic && word.topic === selectedTopic;
                    const notUsed = !usedWords[selectedTopic]?.includes(word.word.toLowerCase());
                    return hasCorrectTopic && notUsed;
                });
            }
            console.log('Topic mode - filtered by topic:', selectedTopic, 'Found:', filteredWords.length);
            break;
    }
    
    console.log('Filtered words count:', filteredWords.length);
    return filteredWords;
};

const resetUsedWordsForCategory = () => {
    switch (currentGameMode) {
        case 'progressive':
            usedWords[currentDifficulty] = [];
            break;
        case 'difficulty':
            if (!usedWords[selectedDifficulty]) usedWords[selectedDifficulty] = [];
            usedWords[selectedDifficulty] = [];
            break;
        case 'topic':
            if (selectedTopic === 'all') {
                usedWords.all = [];
            } else {
                if (!usedWords[selectedTopic]) usedWords[selectedTopic] = [];
                usedWords[selectedTopic] = [];
            }
            break;
    }
    saveGameState();
};

const getRandomWord = () => {
    // First try without resetting used words
    let availableWords = getWordsForCurrentMode(false);
    
    // If no words available, reset used words and try again
    if (availableWords.length === 0) {
        availableWords = getWordsForCurrentMode(true);
    }
    
    // If still no words available after reset, use fallback
    if (availableWords.length === 0) {
        console.log('No words available even after reset, using fallback');
        
        let fallbackWords = [];
        if (currentGameMode === 'difficulty') {
            fallbackWords = wordList.filter(word => word.level && word.level.toLowerCase() === selectedDifficulty.toLowerCase());
        } else if (currentGameMode === 'progressive') {
            fallbackWords = wordList.filter(word => word.level && word.level.toLowerCase() === currentDifficulty.toLowerCase());
        } else if (currentGameMode === 'topic') {
            if (selectedTopic === 'all') {
                fallbackWords = wordList;
            } else {
                fallbackWords = wordList.filter(word => word.topic === selectedTopic);
            }
        } else {
            fallbackWords = wordList;
        }
        
        if (fallbackWords.length === 0) {
            // Ultimate fallback - use any word
            fallbackWords = wordList;
        }
        
        const randomIndex = Math.floor(Math.random() * fallbackWords.length);
        const { word, hint, level } = fallbackWords[randomIndex];
        currentWord = word.toLowerCase();
        
        // Set difficulty based on the word's level for game settings
        if (level) {
            currentDifficulty = level.toLowerCase();
            updateDifficultySettings();
        }
        
        const hintElement = document.querySelector(".hint-text b");
        if (hintElement) {
            hintElement.innerText = hint;
        }
        
        updateGameDisplay();
        resetGame();
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const { word, hint, level, topic } = availableWords[randomIndex];
    currentWord = word.toLowerCase();
    
    // Update current difficulty based on mode and word's level
    if (currentGameMode === 'progressive') {
        // For progressive mode, use the word's level
        currentDifficulty = level ? level.toLowerCase() : currentDifficulty;
        updateDifficultySettings();
    } else if (currentGameMode === 'difficulty') {
        // For difficulty mode, maintain the selected difficulty
        currentDifficulty = selectedDifficulty.toLowerCase();
        updateDifficultySettings();
    } else if (currentGameMode === 'topic') {
        // For topic mode, use the word's actual difficulty for game settings only
        currentDifficulty = level ? level.toLowerCase() : 'easy';
        updateDifficultySettings();
    }
    
    // Add word to used words
    switch (currentGameMode) {
        case 'progressive':
            usedWords[currentDifficulty].push(currentWord);
            break;
        case 'difficulty':
            usedWords[selectedDifficulty].push(currentWord);
            break;
        case 'topic':
            if (selectedTopic === 'all') {
                if (!usedWords.all) usedWords.all = [];
                usedWords.all.push(currentWord);
            } else {
                if (!usedWords[selectedTopic]) usedWords[selectedTopic] = [];
                usedWords[selectedTopic].push(currentWord);
            }
            break;
    }
    
    // Update display
    const hintElement = document.querySelector(".hint-text b");
    if (hintElement) {
        hintElement.innerText = hint;
    }
    
    saveGameState();
    updateGameDisplay();
    resetGame();
};

// Game logic
const gameOver = (isVictory) => {
    clearInterval(timer);
    const modalText = isVictory ? `You found the word:` : 'The correct word was:';
    gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
    gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
    gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
    gameModal.classList.add("show");
    
    if (isVictory) {
        // Update score for current difficulty
        const score = (maxTime - timeLeft) + (maxGuesses - wrongGuessCount) * 10;
        completedLevels[currentDifficulty].score = Math.max(completedLevels[currentDifficulty].score, score);
        
        // Check if level is completed (only for progressive mode)
        if (currentGameMode === 'progressive' && questionCount >= questionsPerLevel && !completedLevels[currentDifficulty].completed) {
            completedLevels[currentDifficulty].completed = true;
            
            // Show level complete notification and progress to next difficulty
            const difficulties = ["easy", "medium", "hard"];
            const currentIndex = difficulties.indexOf(currentDifficulty);
            
            if (currentIndex < difficulties.length - 1) {
                const nextDifficulty = difficulties[currentIndex + 1];
                setTimeout(() => {
                    gameModal.classList.remove("show");
                    showLevelCompleteNotification(currentDifficulty, nextDifficulty);
                }, 2000);
            }
        }
        
        saveGameState();
    } else {
        // If lost, remove the word from used words so it can be tried again
        switch (currentGameMode) {
            case 'progressive':
                const wordIndex = usedWords[currentDifficulty].indexOf(currentWord);
                if (wordIndex > -1) {
                    usedWords[currentDifficulty].splice(wordIndex, 1);
                }
                break;
            case 'difficulty':
                const diffIndex = usedWords[selectedDifficulty]?.indexOf(currentWord);
                if (diffIndex > -1) {
                    usedWords[selectedDifficulty].splice(diffIndex, 1);
                }
                break;
            case 'topic':
                if (selectedTopic === 'all') {
                    const allIndex = usedWords.all?.indexOf(currentWord);
                    if (allIndex > -1) {
                        usedWords.all.splice(allIndex, 1);
                    }
                } else {
                    const topicIndex = usedWords[selectedTopic]?.indexOf(currentWord);
                    if (topicIndex > -1) {
                        usedWords[selectedTopic].splice(topicIndex, 1);
                    }
                }
                break;
        }
        saveGameState();
    }
};

const createKeyboard = () => {
    keyboardDiv.innerHTML = '';
    
    // Standard alphabet letters
    for (let i = 97; i <= 122; i++) {
        const button = document.createElement("button");
        button.innerText = String.fromCharCode(i);
        keyboardDiv.appendChild(button);
        button.addEventListener("click", (e) => initGame(e.target, String.fromCharCode(i)));
    }
    
    // Add dash/hyphen for compound terms
    const dashButton = document.createElement("button");
    dashButton.innerText = "-";
    dashButton.className = "dash-key";
    keyboardDiv.appendChild(dashButton);
    dashButton.addEventListener("click", (e) => initGame(e.target, "-"));
    
    // Add apostrophe for possessive terms
    const apostropheButton = document.createElement("button");
    apostropheButton.innerText = "'";
    apostropheButton.className = "apostrophe-key";
    keyboardDiv.appendChild(apostropheButton);
    apostropheButton.addEventListener("click", (e) => initGame(e.target, "'"));
};

const initGame = (button, clickedLetter) => {
    // Check if the letter exists in the current word
    if (currentWord.includes(clickedLetter)) {
        [...currentWord].forEach((letter, index) => {
            if (letter === clickedLetter) {
                correctLetters.push(letter);
                wordDisplay.querySelectorAll("li")[index].innerText = letter;
                wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
            }
        });
    } else {
        wrongGuessCount++;
        hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
    }
    
    button.disabled = true;
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    
    // Check for game over
    if (wrongGuessCount === maxGuesses) {
        return gameOver(false);
    }
    
    // Check if all letters are guessed (excluding special characters)
    const allLetters = [...currentWord].filter(char =>
        char !== " " && char !== "-" && char !== "'"
    );
    
    // Count how many letters still need to be revealed
    const wordDisplayItems = wordDisplay.querySelectorAll("li");
    let allRevealed = true;
    
    wordDisplayItems.forEach((item, index) => {
        const char = currentWord[index];
        // Check if this is a letter (not space, dash, apostrophe) and if it's been guessed
        if (char !== " " && char !== "-" && char !== "'") {
            if (!item.classList.contains("guessed")) {
                allRevealed = false;
            }
        }
    });
    
    if (allRevealed && allLetters.length > 0) {
        return gameOver(true);
    }
};

const resetGame = () => {
    correctLetters = [];
    wrongGuessCount = 0;
    hangmanImage.src = "images/hangman-0.svg";
    guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
    
    // Create word display with proper handling for special characters
    wordDisplay.innerHTML = currentWord.split("").map((letter) => {
        if (letter === " ") {
            correctLetters.push(" ");
            return `<li class="letter space"></li>`;
        } else if (letter === "-") {
            correctLetters.push("-");
            return `<li class="letter dash">-</li>`;
        } else if (letter === "'") {
            correctLetters.push("'");
            return `<li class="letter apostrophe">'</li>`;
        } else {
            return `<li class="letter"></li>`;
        }
    }).join("");
    
    createKeyboard();
    gameModal.classList.remove("show");
    questionsText.innerText = `${questionCount}`;
    
    // Reset and start the timer
    clearInterval(timer);
    timeLeft = maxTime;
    timerText.innerText = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameOver(false);
        }
    }, 1000);
};

// Game mode and UI management
const updateDifficultySettings = () => {
    const difficultySettings = {
        easy: { guesses: 6, time: 30 },
        medium: { guesses: 6, time: 25 },
        hard: { guesses: 6, time: 30 }
    };
    
    const settings = difficultySettings[currentDifficulty];
    maxGuesses = settings.guesses;
    maxTime = settings.time;
    
    const difficultyText = document.querySelector(".difficulty-text b");
    if (difficultyText) {
        difficultyText.innerText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    }
};

const updateGameDisplay = () => {
    // Update mode indicator with combined mode and selection
    const modeValue = document.querySelector('.mode-value');
    if (modeValue) {
        let displayText = '';
        switch (currentGameMode) {
            case 'progressive':
                displayText = 'Progressive';
                break;
            case 'difficulty':
                displayText = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
                break;
            case 'topic':
                displayText = selectedTopic === 'all' ? 'All Topics' : selectedTopic;
                break;
        }
        modeValue.textContent = displayText;
    }
    
    // Update topic indicator (if separate element exists)
    const topicValue = document.querySelector('.topic-value');
    if (topicValue) {
        topicValue.textContent = currentTopic === 'all' ? 'All Topics' : currentTopic;
    }
    
    // Update difficulty text
    const difficultyText = document.querySelector('.difficulty-text b');
    if (difficultyText) {
        difficultyText.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    }
    
    // Update current selections display
    const currentSelections = document.querySelector('.current-selections');
    if (currentSelections) {
        let selectionsText = '';
        switch (currentGameMode) {
            case 'progressive':
                selectionsText = `Mode: Progressive | Level: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}`;
                break;
            case 'difficulty':
                selectionsText = `Level: ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}`;
                break;
            case 'topic':
                selectionsText = `Topic: ${selectedTopic === 'all' ? 'All Topics' : selectedTopic}`;
                break;
        }
        currentSelections.textContent = selectionsText;
    }
};

const showLevelCompleteNotification = (difficulty, nextDifficulty) => {
    const levelModal = document.querySelector(".level-complete-modal");
    const levelMessage = levelModal.querySelector(".level-message");
    const nextLevelBtn = levelModal.querySelector(".next-level-btn");
    
    levelMessage.innerHTML = `
        <h3>🎉 Level Complete!</h3>
        <p>You've mastered the <strong>${difficulty}</strong> level!</p>
        <p>Get ready for <strong>${nextDifficulty}</strong> challenges!</p>
    `;
    
    levelModal.classList.add("show");
    
    nextLevelBtn.onclick = () => {
        levelModal.classList.remove("show");
        currentDifficulty = nextDifficulty;
        questionCount = 1;
        updateDifficultySettings();
        saveGameState();
        getRandomWord();
    };
};

// Dropdown and modal management
const populateDifficultyDropdown = () => {
    // Only populate difficulty dropdowns (in difficulty settings sections)
    const difficultyDropdowns = document.querySelectorAll('#difficulty-settings .dropdown-options, #change-difficulty-settings .dropdown-options');
    
    difficultyDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '';
        
        const difficulties = [
            { value: 'easy', label: 'Easy (Grades 1-6)' },
            { value: 'medium', label: 'Medium (Grades 7-9)' },
            { value: 'hard', label: 'Hard (Grades 10-12)' }
        ];
        
        difficulties.forEach(diff => {
            const option = document.createElement('div');
            option.className = 'dropdown-option difficulty-option';
            option.setAttribute('data-value', diff.value);
            option.textContent = diff.label;
            dropdown.appendChild(option);
        });
    });
};

const populateTopicDropdown = () => {
    // Only populate topic dropdowns (in topic settings sections)
    const topicDropdowns = document.querySelectorAll('#topic-settings .dropdown-options, #change-topic-settings .dropdown-options');
    
    topicDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '';
        
        // Add "All Topics" option first
        const allOption = document.createElement('div');
        allOption.className = 'dropdown-option topic-option';
        allOption.setAttribute('data-value', 'all');
        allOption.textContent = 'All Topics';
        dropdown.appendChild(allOption);
        
        // Get unique topics from wordList
        const topics = [...new Set(wordList.map(word => word.topic))].sort();
        
        topics.forEach(topic => {
            const option = document.createElement('div');
            option.className = 'dropdown-option topic-option';
            option.setAttribute('data-value', topic);
            option.textContent = topic;
            dropdown.appendChild(option);
        });
    });
};

const initializeDropdowns = () => {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    dropdowns.forEach(dropdown => {
        const selected = dropdown.querySelector('.dropdown-selected');
        const options = dropdown.querySelector('.dropdown-options');
        
        // Toggle dropdown
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            document.querySelectorAll('.dropdown-options').forEach(opt => {
                if (opt !== options) opt.classList.remove('show');
            });
            options.classList.toggle('show');
        });
        
        // Handle option selection
        const optionElements = dropdown.querySelectorAll('.dropdown-option');
        optionElements.forEach(option => {
            option.addEventListener('click', () => {
                selected.textContent = option.textContent;
                options.classList.remove('show');
                
                // Update game state based on which dropdown was changed
                if (dropdown.closest('#difficulty-settings') || dropdown.closest('#change-difficulty-settings')) {
                    selectedDifficulty = option.getAttribute('data-value');
                    saveGameState();
                } else if (dropdown.closest('#topic-settings') || dropdown.closest('#change-topic-settings')) {
                    selectedTopic = option.getAttribute('data-value');
                    saveGameState();
                }
            });
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-options').forEach(opt => opt.classList.remove('show'));
    });
};

const initializeModeSelection = () => {
    const modeOptions = document.querySelectorAll('.intro-modal .mode-option');
    
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            modeOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            
            const mode = option.getAttribute('data-mode');
            currentGameMode = mode;
            
            // Show/hide appropriate settings
            const diffSettings = document.getElementById('difficulty-settings');
            const topicSettings = document.getElementById('topic-settings');
            
            if (diffSettings) diffSettings.classList.toggle('hidden', mode !== 'difficulty');
            if (topicSettings) topicSettings.classList.toggle('hidden', mode !== 'topic');
        });
    });
    
    // Set progressive as default
    const defaultMode = document.querySelector('.intro-modal .mode-option[data-mode="progressive"]');
    if (defaultMode) defaultMode.classList.add('active');
};

const initializeModeModal = () => {
    const modeModal = document.querySelector('.mode-selection-modal');
    const cancelBtn = modeModal.querySelector('.cancel-btn');
    const confirmBtn = modeModal.querySelector('.confirm-mode-btn');
    const modeOptions = modeModal.querySelectorAll('.mode-option');
    
    changeModeBtn.addEventListener('click', () => {
        modeModal.classList.add('show');
        
        // Highlight current mode
        modeOptions.forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-mode') === currentGameMode);
        });
        
        // Show appropriate settings
        const diffSettings = document.getElementById('change-difficulty-settings');
        const topicSettings = document.getElementById('change-topic-settings');
        
        if (diffSettings) diffSettings.classList.toggle('hidden', currentGameMode !== 'difficulty');
        if (topicSettings) topicSettings.classList.toggle('hidden', currentGameMode !== 'topic');
        
        // Set current selections
        const difficultyLabels = {
            'easy': 'Easy (Grades 1-6)',
            'medium': 'Medium (Grades 7-9)',
            'hard': 'Hard (Grades 10-12)'
        };
        
        const diffSelected = modeModal.querySelector('#change-difficulty-settings .dropdown-selected');
        if (diffSelected) diffSelected.textContent = difficultyLabels[selectedDifficulty];
        
        const topicSelected = modeModal.querySelector('#change-topic-settings .dropdown-selected');
        if (topicSelected) topicSelected.textContent = selectedTopic === 'all' ? 'All Topics' : selectedTopic;
    });
    
    cancelBtn.addEventListener('click', () => {
        modeModal.classList.remove('show');
    });
    
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            modeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const mode = option.getAttribute('data-mode');
            const diffSettings = document.getElementById('change-difficulty-settings');
            const topicSettings = document.getElementById('change-topic-settings');
            
            if (diffSettings) diffSettings.classList.toggle('hidden', mode !== 'difficulty');
            if (topicSettings) topicSettings.classList.toggle('hidden', mode !== 'topic');
        });
    });
    
    confirmBtn.addEventListener('click', () => {
        const activeMode = modeModal.querySelector('.mode-option.active');
        if (activeMode) {
            currentGameMode = activeMode.getAttribute('data-mode');
            questionCount = 1;
            
            // Reset used words for the new mode/category
            resetUsedWordsForCategory();
            
            updateGameDisplay();
            saveGameState();
            getRandomWord();
        }
        modeModal.classList.remove('show');
    });
};

const initializeRefreshButton = () => {
    refreshBtn.addEventListener("click", () => {
        // For progressive mode, reset to easy
        if (currentGameMode === 'progressive') {
            currentDifficulty = "easy";
            questionCount = 1;
        }
        
        resetUsedWordsForCategory();
        updateDifficultySettings();
        updateGameDisplay();
        saveGameState();
        getRandomWord();
    });
};

// Dictionary management
const initializeDictionary = () => {
    filteredDictionary = [...wordList].sort((a, b) => a.word.localeCompare(b.word));
    currentDictionaryIndex = 0;
};

const displayDictionaryWord = (index) => {
    if (filteredDictionary.length === 0) {
        const wordTitle = document.querySelector(".dictionary-word-title");
        const wordHint = document.querySelector(".dictionary-word-hint");
        const wordLevel = document.querySelector(".dictionary-word-level");
        const wordTopic = document.querySelector(".dictionary-word-topic");
        const wordCounter = document.querySelector(".dictionary-counter");
        
        wordTitle.textContent = "No words found";
        wordHint.textContent = "Try a different search term";
        wordLevel.textContent = "";
        wordTopic.textContent = "";
        wordCounter.textContent = "0 / 0";
        return;
    }
    
    // Ensure index is within bounds
    if (index < 0) index = 0;
    if (index >= filteredDictionary.length) index = filteredDictionary.length - 1;
    
    currentDictionaryIndex = index;
    
    const word = filteredDictionary[index];
    const wordTitle = document.querySelector(".dictionary-word-title");
    const wordHint = document.querySelector(".dictionary-word-hint");
    const wordLevel = document.querySelector(".dictionary-word-level");
    const wordTopic = document.querySelector(".dictionary-word-topic");
    const wordCounter = document.querySelector(".dictionary-counter");
    
    wordTitle.textContent = word.word;
    wordHint.textContent = word.hint;
    wordLevel.textContent = `Level: ${word.level.charAt(0).toUpperCase() + word.level.slice(1)}`;
    wordTopic.textContent = `Topic: ${word.topic}`;
    wordCounter.textContent = `${index + 1} / ${filteredDictionary.length}`;
    
    // Update button states
    prevWordBtn.disabled = index === 0;
    nextWordBtn.disabled = index === filteredDictionary.length - 1;
};

const searchDictionary = (searchTerm) => {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredDictionary = [...wordList].sort((a, b) => a.word.localeCompare(b.word));
    } else {
        filteredDictionary = wordList.filter(word => 
            word.word.toLowerCase().includes(term) || 
            word.hint.toLowerCase().includes(term)
        ).sort((a, b) => a.word.localeCompare(b.word));
    }
    
    currentDictionaryIndex = 0;
    displayDictionaryWord(0);
};

const initializeDictionaryModal = () => {
    dictionaryBtn.addEventListener("click", () => {
        initializeDictionary();
        displayDictionaryWord(0);
        dictionaryModal.classList.add("show");
    });
    
    closeDictionaryBtn.addEventListener("click", () => {
        dictionaryModal.classList.remove("show");
        searchInput.value = "";
    });
    
    prevWordBtn.addEventListener("click", () => {
        if (currentDictionaryIndex > 0) {
            displayDictionaryWord(currentDictionaryIndex - 1);
        }
    });
    
    nextWordBtn.addEventListener("click", () => {
        if (currentDictionaryIndex < filteredDictionary.length - 1) {
            displayDictionaryWord(currentDictionaryIndex + 1);
        }
    });
    
    searchBtn.addEventListener("click", () => {
        searchDictionary(searchInput.value);
    });
    
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchDictionary("");
    });
    
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchDictionary(searchInput.value);
        }
    });
    
    // Close modal when clicking outside
    dictionaryModal.addEventListener("click", (e) => {
        if (e.target === dictionaryModal) {
            dictionaryModal.classList.remove("show");
            searchInput.value = "";
        }
    });
};

// Game initialization
const startGame = () => {
    introModal.classList.remove("show");
    populateDifficultyDropdown();
    populateTopicDropdown();
    initializeDropdowns();
    initializeModeSelection();
    initializeModeModal();
    initializeRefreshButton();
    initializeDictionaryModal();
    createKeyboard();
    updateDifficultySettings();
    updateGameDisplay();
    getRandomWord();
};

// Event listeners
startBtn.addEventListener("click", startGame);

playAgainBtn.addEventListener("click", () => {
    if (questionCount < questionsPerLevel) {
        questionCount++;
    } else {
        questionCount = 1;
    }
    saveGameState();
    gameModal.classList.remove("show");
    getRandomWord();
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    loadGameState();
    populateDifficultyDropdown();
    populateTopicDropdown();
    
    const savedGame = localStorage.getItem('hangmanGameState');
    if (savedGame) {
        setTimeout(() => {
            introModal.classList.remove("show");
            initializeDropdowns();
            initializeModeModal();
            initializeRefreshButton();
            initializeDictionaryModal();
            createKeyboard();
            updateDifficultySettings();
            updateGameDisplay();
            getRandomWord();
        }, 500);
    } else {
        introModal.classList.add("show");
    }
});

// Keyboard support for intro modal
document.addEventListener("keydown", (e) => {
    if (introModal.classList.contains("show") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        startGame();
    }
});
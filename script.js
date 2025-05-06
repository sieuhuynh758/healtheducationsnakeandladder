// Game Configuration
const config = {
  totalPlayers: 4,
  boardSize: 100,
  difficulty: 'hard' // 'easy', 'medium', 'hard'
};

// Game State
const players = Array.from({length: config.totalPlayers}, (_, i) => ({
  id: i + 1,
  name: `Player ${i + 1}`,
  pos: 0,
  score: 0
}));

let currentPlayer = 0;
let pendingRoll = 0;
let gameActive = true;

// Board Elements
const ladders = { 
  3: 22, 8: 34, 20: 42, 27: 74, 50: 67, 66: 87, 80: 100 
};
const snakes = { 
  25: 5, 41: 20, 49: 36, 63: 18, 87: 24, 95: 72, 99: 78 
};
const messages = {
  5: "Avoid peer pressure on Alcohol!",
  10: "Did you know? Tobacco kills 8M/year.",
  15: "Balance screen time to stay healthy.",
  20: "Alcohol affects your brain and liver.",
  30: "Quit smoking = Longer life.",
  45: "Digital detox boosts mental health.",
  65: "Healthy habits = Happy life.",
  87: "Oh no! Addiction relapse! Slide down!",
  100: "You win! Healthy life ahead!"
};

// Questions Database (Hard Difficulty)
const questions = [
  // Alcohol-related questions
  {
    q: "What is the primary mechanism by which alcohol affects neurotransmitter systems?",
    a: [
      "Enhancing GABA inhibition and reducing glutamate excitation",
      "Increasing dopamine production only",
      "Blocking all neurotransmitter activity",
      "Converting neurotransmitters into toxins"
    ],
    correct: 0,
    explanation: "Alcohol primarily enhances GABA (inhibitory) neurotransmission and reduces glutamate (excitatory) activity, leading to CNS depression."
  },
  {
    q: "Which brain region is most vulnerable to adolescent alcohol exposure?",
    a: [
      "Prefrontal cortex",
      "Occipital lobe",
      "Brain stem",
      "Cerebellum only"
    ],
    correct: 0,
    explanation: "The prefrontal cortex, responsible for decision-making and impulse control, continues developing until mid-20s and is particularly vulnerable."
  },
  // Tobacco-related questions
  {
    q: "What makes nicotine more addictive than many other substances?",
    a: [
      "Rapid dopamine release combined with short half-life",
      "Its ability to permanently alter DNA",
      "Physical withdrawal symptoms only",
      "The pleasant taste of tobacco products"
    ],
    correct: 0,
    explanation: "Nicotine causes rapid dopamine release (reward) but has short half-life (quick craving return), creating strong addiction cycles."
  },
  {
    q: "Which compound in tobacco smoke is primarily responsible for lung cancer?",
    a: [
      "Polycyclic aromatic hydrocarbons",
      "Nicotine",
      "Carbon monoxide",
      "Formaldehyde"
    ],
    correct: 0,
    explanation: "PAHs are carcinogenic compounds formed during tobacco combustion that directly damage DNA in lung cells."
  },
  // Digital wellness questions
  {
    q: "What is the 'blue light effect' on sleep?",
    a: [
      "Suppresses melatonin production, disrupting circadian rhythm",
      "Causes permanent retina damage",
      "Makes dreams more vivid",
      "Has no proven biological effects"
    ],
    correct: 0,
    explanation: "Blue light from screens inhibits melatonin, the sleep hormone, making it harder to fall asleep and reducing sleep quality."
  },
  {
    q: "What is the recommended maximum daily screen time for adults?",
    a: [
      "2 hours recreational (beyond work)",
      "8 hours total including work",
      "No limits if it doesn't interfere with sleep",
      "12 hours with regular breaks"
    ],
    correct: 0,
    explanation: "Experts recommend ≤2hr recreational screen time to maintain physical activity and social interaction."
  },
  // Advanced health questions
  {
    q: "What is the 'harm reduction' approach to substance abuse?",
    a: [
      "Reducing negative consequences without requiring abstinence",
      "Complete immediate cessation of all substances",
      "Replacing one substance with another",
      "Only treating physical addiction symptoms"
    ],
    correct: 0,
    explanation: "Harm reduction focuses on minimizing health/social consequences while recognizing abstinence may not be immediately achievable."
  },
  {
    q: "Which neurotransmitter system is primarily involved in digital addiction?",
    a: [
      "Dopaminergic reward pathway",
      "Serotonergic system only",
      "Endorphin release",
      "Acetylcholine transmission"
    ],
    correct: 0,
    explanation: "Like substance addictions, digital addiction primarily involves dopamine release in the brain's reward circuitry."
  }
];

// DOM Elements
const rollButton = document.getElementById('rollButton');
const messageElement = document.getElementById('message');
const rollDisplay = document.getElementById('roll');

// Initialize Game
function initGame() {
  createBoard();
  updatePlayerStatus();
  
  // Smooth page load
  document.body.style.opacity = 0;
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease-in';
    document.body.style.opacity = 1;
  }, 100);
}

// Create Game Board
function createBoard() {
  const boardDiv = document.getElementById("board");
  let html = "<table>";
  let num = config.boardSize;
  
  for (let row = 0; row < 10; row++) {
    html += "<tr>";
    let rowCells = [];
    
    for (let col = 0; col < 10; col++) {
      let cellClass = "";
      if (ladders[num]) cellClass = "ladder-start";
      if (snakes[num]) cellClass = "snake-start";
      if (messages[num]) cellClass = "message-cell";
      
      let square = `<td id="cell${num}" class="${cellClass}">${num}<br><div id="p${num}"></div>`;
      
      // Add icons for special cells
      if (ladders[num]) square += '<div class="cell-icon">🪜</div>';
      if (snakes[num]) square += '<div class="cell-icon">🐍</div>';
      
      square += '</td>';
      rowCells.push(square);
      num--;
    }
    
    if (row % 2 === 0) rowCells.reverse();
    html += rowCells.join("");
    html += "</tr>";
  }
  
  html += "</table>";
  boardDiv.innerHTML = html;
  updatePlayers();
}

// Roll Dice Function
function rollDice() {
  if (!gameActive) return;
  
  rollButton.disabled = true;
  document.getElementById('rulesButton').disabled = true;
  
  // Dice rolling animation
  const diceElement = document.querySelector('#dice');
  diceElement.classList.add('dice-rolling');
  
  // Generate random roll after animation
  setTimeout(() => {
    diceElement.classList.remove('dice-rolling');
    pendingRoll = Math.floor(Math.random() * 6) + 1;
    rollDisplay.textContent = pendingRoll;
    
    messageElement.innerHTML = 
      `<span class="win11-accent">${players[currentPlayer].name}</span> rolled a ${pendingRoll}. ` +
      `<span class="health-tip">Answer correctly to move forward!</span>`;
    
    showQuestion();
  }, 600);
}

// Show Question Modal
function showQuestion() {
  const qIndex = Math.floor(Math.random() * questions.length);
  const q = questions[qIndex];
  const box = document.getElementById("questionBox");
  document.getElementById("questionText").textContent = q.q;

  const optsDiv = document.getElementById("options");
  optsDiv.innerHTML = "";
  
  // Shuffle options
  const shuffledOptions = [...q.a].sort(() => Math.random() - 0.5);
  
  shuffledOptions.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => checkAnswer(opt === q.a[q.correct], q.explanation);
    optsDiv.appendChild(btn);
  });

  showModal('questionBox');
}

// Check Answer
function checkAnswer(correct, explanation) {
  closeModal('questionBox');
  
  const player = players[currentPlayer];
  let newPos = player.pos;
  let msg = "";
  
  if (correct) {
    newPos = player.pos + pendingRoll;
    
    // Handle board overflow
    if (newPos > config.boardSize) {
      newPos = config.boardSize - (newPos - config.boardSize);
    }
    
    // Check for special cells
    if (ladders[newPos]) {
      msg = `<span class="win11-accent">${player.name}</span> climbed a ladder from ${newPos} to ${ladders[newPos]}!`;
      newPos = ladders[newPos];
    } 
    else if (snakes[newPos]) {
      msg = `<span class="win11-accent">${player.name}</span> got bitten by a snake! Slide down to ${snakes[newPos]}`;
      newPos = snakes[newPos];
    } 
    else if (messages[newPos]) {
      msg = `<span class="win11-accent">${player.name}</span> on ${newPos}: ${messages[newPos]}`;
    } 
    else {
      msg = `<span class="win11-accent">${player.name}</span> moved to ${newPos}`;
    }
    
    player.pos = newPos;
    player.score += pendingRoll;
    
    // Check for win condition
    if (newPos === config.boardSize) {
      gameActive = false;
      msg = `<span class="win11-accent">${player.name}</span> reached 100 and <strong>WON</strong> the game!`;
      
      setTimeout(() => {
        const winMessage = `${player.name} wins!\n\nFinal Score: ${player.score}\n\n` +
                          `Health Tip: ${explanation || "Maintaining healthy habits leads to a happier, longer life."}`;
        alert(winMessage);
        if (confirm('Would you like to play again?')) {
          resetGame();
        }
      }, 100);
    } 
    else if (explanation) {
      msg += `<br><span class="health-tip">Health Tip: ${explanation}</span>`;
    }
  } 
  else {
    msg = `<span class="win11-accent">${player.name}</span> answered wrong and stays at ${player.pos}`;
    if (explanation) {
      const correctQuestion = questions.find(q => q.explanation === explanation);
      msg += `<br><span class="health-tip">Correct Answer: ${correctQuestion.a[correctQuestion.correct]}</span>`;
      msg += `<br><span class="health-tip">Explanation: ${explanation}</span>`;
    }
  }
  
  messageElement.innerHTML = msg;
  updatePlayers();
  
  if (gameActive) {
    currentPlayer = (currentPlayer + 1) % config.totalPlayers;
    updatePlayerStatus();
  }
  
  rollButton.disabled = false;
  document.getElementById('rulesButton').disabled = false;
}

// Update Player Positions on Board
function updatePlayers() {
  // Clear all player markers
  for (let i = 1; i <= config.boardSize; i++) {
    const cell = document.getElementById(`p${i}`);
    if (cell) cell.innerHTML = '';
  }
  
  // Place players on their current positions
  players.forEach(player => {
    if (player.pos > 0) {
      const cell = document.getElementById(`p${player.pos}`);
      if (cell) {
        cell.innerHTML += `<div class="player p${player.id}">P${player.id}</div>`;
      }
    }
  });
}

// Update Player Status Cards
function updatePlayerStatus() {
  const statusDiv = document.getElementById("playerStatus");
  statusDiv.innerHTML = "";
  
  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = `player-card ${index === currentPlayer ? 'active' : ''}`;
    card.innerHTML = `
      <div class="player-name p${player.id}">${player.name}</div>
      <div class="player-pos">Position: ${player.pos}</div>
      <div class="player-score">Score: ${player.score}</div>
    `;
    statusDiv.appendChild(card);
  });
}

// Modal Functions
function showModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function showRules() {
  showModal('rulesBox');
}

// Game Reset
function resetGame() {
  players.forEach(player => {
    player.pos = 0;
    player.score = 0;
  });
  
  currentPlayer = 0;
  gameActive = true;
  pendingRoll = 0;
  
  rollDisplay.textContent = '-';
  messageElement.innerHTML = 'Game reset! Player 1 starts first.';
  
  updatePlayers();
  updatePlayerStatus();
}

// Initialize the game when window loads
window.onload = initGame;
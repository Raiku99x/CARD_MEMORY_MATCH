// Game State
let gameState = {
    mode: null, // 'single' or 'multi'
    difficulty: 'easy', // Default to easy
    theme: 'emojis',
    numCards: 16,
    players: [],
    currentPlayerIndex: 0,
    cards: [],
    flippedCards: [],
    moves: 0,
    matches: 0,
    startTime: null,
    gameTimer: null,
    turnTimer: null,
    timePerMove: 0,
    gameEndTime: 0,
    isPaused: false,
    numPlayers: 1
};

// Card Themes
const themes = {
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
    colors: ['🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '🟤', '⚫', '⚪', '🟥', '🟦', '🟩', '🟨', '🟧', '🟪', '🟫', '⬛', '⬜', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔲', '🔳', '⭐', '🌟', '✨', '💫', '🌙', '☀️', '⛅', '🌈', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '💐', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃']
};

// Initialize
function startGame() {
    hideScreen('splash-screen');
    showScreen('menu-screen');
}

function showSetup(mode) {
    gameState.mode = mode;
    hideScreen('menu-screen');
    showScreen('setup-screen');
    
    document.getElementById('setup-title').textContent = 
        mode === 'single' ? 'Single Player Setup' : 'Multiplayer Setup';
    
    setupPlayerInputs(mode);
    document.getElementById('time-settings').style.display = 
        mode === 'multi' ? 'block' : 'none';
}

function setupPlayerInputs(mode) {
    const container = document.getElementById('player-inputs');
    container.innerHTML = '';
    
    if (mode === 'single') {
        container.innerHTML = `
            <div class="player-input">
                <label>Your Name:</label>
                <input type="text" id="player1-name" placeholder="Enter your name" value="Player 1">
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="player-input">
                <label>Number of Players:</label>
                <select id="num-players" onchange="updatePlayerInputs()">
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4 Players</option>
                </select>
            </div>
            <div id="player-names-multi"></div>
        `;
        updatePlayerInputs();
    }
}

function updatePlayerInputs() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    const container = document.getElementById('player-names-multi');
    container.innerHTML = '';
    
    for (let i = 1; i <= numPlayers; i++) {
        container.innerHTML += `
            <div class="player-input">
                <label>Player ${i}:</label>
                <input type="text" id="player${i}-name" placeholder="Enter name" value="Player ${i}">
            </div>
        `;
    }
}

function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
    document.getElementById('custom-cards-input').style.display = 
        difficulty === 'custom' ? 'block' : 'none';
    
    const cardCounts = { easy: 16, medium: 36, hard: 64, custom: 64 };
    gameState.numCards = cardCounts[difficulty];
}

function selectTheme(theme) {
    gameState.theme = theme;
    
    document.querySelectorAll('.btn-theme').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

function startGameplay() {
    if (!gameState.difficulty) {
        alert('Please select a difficulty level!');
        return;
    }
    
    if (gameState.difficulty === 'custom') {
        const customCards = parseInt(document.getElementById('custom-cards').value);
        if (customCards < 64 || customCards > 100 || customCards % 2 !== 0) {
            alert('Please enter an even number between 64 and 100!');
            return;
        }
        gameState.numCards = customCards;
    }
    
    gameState.players = [];
    if (gameState.mode === 'single') {
        const name = document.getElementById('player1-name').value.trim() || 'Player 1';
        gameState.players.push({ name, score: 0, matches: [] });
        gameState.numPlayers = 1;
    } else {
        const numPlayers = parseInt(document.getElementById('num-players').value);
        gameState.numPlayers = numPlayers;
        for (let i = 1; i <= numPlayers; i++) {
            const name = document.getElementById(`player${i}-name`).value.trim() || `Player ${i}`;
            gameState.players.push({ name, score: 0, matches: [] });
        }
        
        gameState.timePerMove = parseInt(document.getElementById('time-per-move').value) || 0;
        gameState.gameEndTime = parseInt(document.getElementById('game-end-time').value) * 60 || 0;
    }
    
    initializeGame();
    hideScreen('setup-screen');
    showScreen('game-screen');
}

function initializeGame() {
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.currentPlayerIndex = 0;
    gameState.flippedCards = [];
    gameState.startTime = Date.now();
    gameState.isPaused = false;
    
    createCards();
    setupBoard();
    updatePlayersInfo();
    updateGameInfo();
    updateTurnIndicator();
    startGameTimer();
    
    if (gameState.mode === 'multi' && gameState.timePerMove > 0) {
        startTurnTimer();
    }
    
    updatePlayerTurnBackground();
}

function createCards() {
    const numPairs = gameState.numCards / 2;
    const themeCards = themes[gameState.theme];
    const selectedCards = themeCards.slice(0, numPairs);
    
    gameState.cards = [];
    selectedCards.forEach((value, index) => {
        gameState.cards.push({ id: index * 2, value, matched: false });
        gameState.cards.push({ id: index * 2 + 1, value, matched: false });
    });
    
    for (let i = gameState.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.cards[i], gameState.cards[j]] = [gameState.cards[j], gameState.cards[i]];
    }
}

function setupBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    const gridClass = gameState.difficulty === 'easy' ? 'board-easy' :
                     gameState.difficulty === 'medium' ? 'board-medium' : 'board-hard';
    board.className = gridClass;
    
    if (gameState.difficulty === 'custom') {
        const cols = Math.ceil(Math.sqrt(gameState.numCards));
        const cardSize = Math.max(35, Math.min(80, 800 / cols));
        board.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
    }
    
    gameState.cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.id = card.id;
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-face card-back">?</div>
                <div class="card-face card-front">${card.value}</div>
            </div>
        `;
        cardEl.addEventListener('click', () => flipCard(card.id));
        board.appendChild(cardEl);
    });
}

function flipCard(cardId) {
    if (gameState.isPaused) return;
    if (gameState.flippedCards.length >= 2) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.matched) return;
    
    const cardEl = document.querySelector(`[data-id="${cardId}"]`);
    if (cardEl.classList.contains('flipped')) return;
    
    cardEl.classList.add('flipped');
    gameState.flippedCards.push({ id: cardId, value: card.value, element: cardEl });
    
    if (gameState.flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    
    if (card1.value === card2.value) {
        setTimeout(() => {
            card1.element.classList.add('matched', 'highlight');
            card2.element.classList.add('matched', 'highlight');
            
            gameState.cards.find(c => c.id === card1.id).matched = true;
            gameState.cards.find(c => c.id === card2.id).matched = true;
            gameState.matches++;
            
            const currentPlayer = gameState.players[gameState.currentPlayerIndex];
            currentPlayer.score++;
            currentPlayer.matches.push(card1.value);
            
            createCelebration();
            updatePlayersInfo();
            
            setTimeout(() => {
                card1.element.classList.remove('highlight');
                card2.element.classList.remove('highlight');
            }, 500);
            
            gameState.flippedCards = [];
            
            if (gameState.matches === gameState.numCards / 2) {
                endGame();
                return;
            }
            
            if (gameState.mode === 'multi') {
                updateTurnIndicator();
                if (gameState.timePerMove > 0) {
                    resetTurnTimer();
                }
            } else {
                gameState.moves++;
                updateGameInfo();
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            gameState.flippedCards = [];
            
            if (gameState.mode === 'multi') {
                nextPlayer();
            } else {
                gameState.moves++;
                updateGameInfo();
            }
        }, 1000);
    }
}

function nextPlayer() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.numPlayers;
    updatePlayersInfo();
    updateTurnIndicator();
    updatePlayerTurnBackground();
    
    if (gameState.timePerMove > 0) {
        resetTurnTimer();
    }
}

function updatePlayersInfo() {
    const container = document.getElementById('players-info');
    
    if (gameState.mode === 'single') {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'grid';
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
    const isActive = index === gameState.currentPlayerIndex;
    const playerCard = document.createElement('div');
    playerCard.className = `player-card player-${index + 1} ${isActive ? 'active' : ''}`;
    playerCard.innerHTML = `
        <h3>🎮 ${player.name}</h3>
        <div class="player-score">Score: ${player.score}</div>
        <div class="player-matches">
            ${player.matches.map(m => `<div class="matched-card-mini">${m}</div>`).join('')}
        </div>
    `;
    container.appendChild(playerCard);
});
}

function updateGameInfo() {
    const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    
    document.getElementById('timer-display').textContent = `${minutes}:${seconds}`;
    document.getElementById('moves-display').textContent = `Moves: ${gameState.moves}`;
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    
    if (gameState.mode === 'single') {
        indicator.style.display = 'none';
    } else {
        indicator.style.display = 'block';
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        indicator.textContent = `${currentPlayer.name}'s Turn`;
    }
}

function updatePlayerTurnBackground() {
    document.body.className = '';
    if (gameState.mode === 'multi') {
        document.body.classList.add(`player${gameState.currentPlayerIndex + 1}-turn`);
    }
}

function startGameTimer() {
    gameState.gameTimer = setInterval(() => {
        if (!gameState.isPaused) {
            updateGameInfo();
            
            if (gameState.gameEndTime > 0) {
                const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
                if (elapsed >= gameState.gameEndTime) {
                    endGame();
                }
            }
        }
    }, 1000);
}

function startTurnTimer() {
    let timeLeft = gameState.timePerMove;
    
    gameState.turnTimer = setInterval(() => {
        if (!gameState.isPaused) {
            timeLeft--;
            
            if (timeLeft <= 0) {
                gameState.flippedCards.forEach(card => {
                    card.element.classList.remove('flipped');
                });
                gameState.flippedCards = [];
                nextPlayer();
                timeLeft = gameState.timePerMove;
            }
        }
    }, 1000);
}

function resetTurnTimer() {
    if (gameState.turnTimer) {
        clearInterval(gameState.turnTimer);
    }
    if (gameState.timePerMove > 0) {
        startTurnTimer();
    }
}

function pauseGame() {
    gameState.isPaused = true;
    document.getElementById('pause-menu').classList.add('active');
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-menu').classList.remove('active');
}

function quitGame() {
    if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    if (gameState.turnTimer) clearInterval(gameState.turnTimer);
    
    document.getElementById('pause-menu').classList.remove('active');
    hideScreen('game-screen');
    document.body.className = '';
    showScreen('menu-screen');
}

function endGame() {
    if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    if (gameState.turnTimer) clearInterval(gameState.turnTimer);
    
    const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    if (gameState.mode === 'single') {
        saveToLeaderboard(gameState.players[0].name, gameState.difficulty, gameState.moves, elapsedTime);
    }
    
    showEndScreen(elapsedTime);
}

function showEndScreen(elapsedTime) {
    const modal = document.getElementById('end-screen');
    const summary = document.getElementById('end-summary');
    
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    if (gameState.mode === 'single') {
        summary.innerHTML = `
            <div class="end-stat winner-stat">
                🎉 Congratulations ${gameState.players[0].name}! 🎉
            </div>
            <div class="end-stat">⏱️ Time: ${minutes}m ${seconds}s</div>
            <div class="end-stat">🎯 Moves: ${gameState.moves}</div>
            <div class="end-stat">⭐ Matches: ${gameState.matches}</div>
        `;
    } else {
        const maxScore = Math.max(...gameState.players.map(p => p.score));
        const winners = gameState.players.filter(p => p.score === maxScore);
        
        const winnerText = winners.length > 1 
            ? `It's a tie between ${winners.map(w => w.name).join(', ')}!`
            : `${winners[0].name} wins!`;
        
        summary.innerHTML = `
            <div class="end-stat winner-stat">
                🏆 ${winnerText} 🏆
            </div>
            ${gameState.players.map((p, i) => `
                <div class="end-stat">
                    ${p.name}: ${p.score} ${p.score === 1 ? 'match' : 'matches'}
                </div>
            `).join('')}
            <div class="end-stat">⏱️ Total Time: ${minutes}m ${seconds}s</div>
        `;
    }
    
    modal.classList.add('active');
    createMegaCelebration();
}

function playAgain() {
    document.getElementById('end-screen').classList.remove('active');
    initializeGame();
}

function createCelebration() {
    const container = document.getElementById('celebration-container');
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A29BFE', '#FFA502'];
    
    for (let i = 0; i < 10; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function createMegaCelebration() {
    const container = document.getElementById('celebration-container');
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A29BFE', '#FFA502'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

// Leaderboard Functions
async function saveToLeaderboard(playerName, difficulty, moves, time) {
    const score = calculateScore(moves, time);
    const entry = {
        name: playerName,
        difficulty: difficulty,
        moves: moves,
        time: time,
        score: score,
        date: new Date().toISOString()
    };
    
    try {
        const key = `leaderboard_${difficulty}`;
        let leaderboard = [];
        
        try {
            const result = await window.storage.get(key, true);
            if (result && result.value) {
                leaderboard = JSON.parse(result.value);
            }
        } catch (e) {
            leaderboard = [];
        }
        
        leaderboard.push(entry);
        leaderboard.sort((a, b) => a.score - b.score);
        leaderboard = leaderboard.slice(0, 100);
        
        await window.storage.set(key, JSON.stringify(leaderboard), true);
    } catch (error) {
        console.error('Error saving to leaderboard:', error);
    }
}

function calculateScore(moves, time) {
    return (moves * 100) + time;
}

let currentLeaderboardDifficulty = 'easy';
let currentLeaderboardSort = 'score';

async function showLeaderboard() {
    hideScreen('menu-screen');
    hideScreen('end-screen');
    showScreen('leaderboard-screen');
    
    await loadLeaderboard(currentLeaderboardDifficulty, currentLeaderboardSort);
}

async function filterLeaderboard(difficulty, buttonElement) {
    currentLeaderboardDifficulty = difficulty;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    await loadLeaderboard(difficulty, currentLeaderboardSort);
}

async function sortLeaderboard(sortBy, buttonElement) {
    currentLeaderboardSort = sortBy;
    
    // Update active sort button
    document.querySelectorAll('.btn-sort').forEach(btn => btn.classList.remove('active'));
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    await loadLeaderboard(currentLeaderboardDifficulty, sortBy);
}

async function loadLeaderboard(difficulty, sortBy) {
    const tableDiv = document.getElementById('leaderboard-table');
    
    try {
        const key = `leaderboard_${difficulty}`;
        let leaderboard = [];
        
        try {
            const result = await window.storage.get(key, true);
            if (result && result.value) {
                leaderboard = JSON.parse(result.value);
            }
        } catch (e) {
            leaderboard = [];
        }
        
        if (leaderboard.length === 0) {
            tableDiv.innerHTML = '<p style="text-align:center; padding:20px; color:#7f8c8d;">No records yet!</p>';
            return;
        }
        
        if (sortBy === 'moves') {
            leaderboard.sort((a, b) => a.moves - b.moves);
        } else if (sortBy === 'time') {
            leaderboard.sort((a, b) => a.time - b.time);
        } else {
            leaderboard.sort((a, b) => a.score - b.score);
        }
        
        tableDiv.innerHTML = leaderboard.map((entry, index) => {
            const minutes = Math.floor(entry.time / 60);
            const seconds = entry.time % 60;
            const isTop3 = index < 3;
            
            return `
                <div class="leaderboard-entry ${isTop3 ? 'top3' : ''}">
                    <div class="entry-rank">${index + 1}</div>
                    <div class="entry-name">${entry.name}</div>
                    <div class="entry-stats">
                        <span>🎯 ${entry.moves}</span>
                        <span>⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}</span>
                        <span>⭐ ${entry.score}</span>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tableDiv.innerHTML = '<p style="text-align:center; padding:20px; color:#e74c3c;">Error loading</p>';
    }
}

// Screen Management
function showScreen(screenId) {
    document.getElementById(screenId).classList.add('active');
}

function hideScreen(screenId) {
    document.getElementById(screenId).classList.remove('active');
}

function backToMenu() {
    hideScreen('setup-screen');
    hideScreen('end-screen');
    hideScreen('leaderboard-screen');
    hideScreen('game-screen');
    document.body.className = '';
    showScreen('menu-screen');
    
    if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    if (gameState.turnTimer) clearInterval(gameState.turnTimer);
}
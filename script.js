// Game elements
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const turnIndicator = document.getElementById("turn-indicator");
const currentPlayerSpan = document.querySelector(".current-player");
const scoreX = document.getElementById("score-x");
scoreDraw = document.getElementById("score-draw");
const scoreO = document.getElementById("score-o");
const winModal = document.getElementById("winModal");
const winnerText = document.getElementById("winnerText");
const winMessage = document.getElementById("winMessage");
const playerHighlight = document.querySelector(".player-highlight");

// Game state
let currentPlayer = "X";
let gameActive = true;
let gameMode = "2player"; // "2player" or "computer"
let scores = { X: 0, O: 0, draw: 0 };
let board = ["", "", "", "", "", "", "", "", ""];

// Win conditions
const winConditions = [
    [0,1,2], [3,4,5], [6,7,8], // Rows
    [0,3,6], [1,4,7], [2,5,8], // Columns
    [0,4,8], [2,4,6]           // Diagonals
];

// Sound effects (using Web Audio API for simple beeps)
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === "click") {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === "win") {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } else if (type === "draw") {
            oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    } catch (e) {
        // Fallback if Web Audio API is not supported
        console.log("Audio not supported");
    }
}

// Initialize game
function initGame() {
    // Load scores from localStorage
    const savedScores = localStorage.getItem("ticTacToeScores");
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
    
    // Add click listeners to cells
    cells.forEach(cell => {
        cell.addEventListener("click", handleCellClick);
    });
    
    // Update UI
    updateTurnIndicator();
    updateStatus();
    
    // Set initial game mode
    setGameMode("2player");
}

// Handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute("data-index"));
    
    // Check if cell is empty and game is active
    if (board[index] !== "" || !gameActive) return;
    
    // Play click sound
    playSound("click");
    
    // Make move
    makeMove(index, currentPlayer);
    
    // Check for winner or draw
    checkGameResult();
    
    // If playing against computer and game is still active
    if (gameMode === "computer" && gameActive && currentPlayer === "O") {
        setTimeout(makeComputerMove, 500); // Delay for better UX
    }
}

// Make a move
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    
    // Add animation class
    cell.classList.add("animate");
    cell.textContent = player;
    cell.classList.add(player);
    
    // Remove animation class after animation completes
    setTimeout(() => {
        cell.classList.remove("animate");
    }, 300);
}

// Check game result
function checkGameResult() {
    let roundWon = false;
    let winningCombo = [];
    
    // Check all win conditions
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCombo = condition;
            break;
        }
    }
    
    // If there's a winner
    if (roundWon) {
        gameActive = false;
        
        // Highlight winning cells
        winningCombo.forEach(index => {
            cells[index].classList.add("win");
        });
        
        // Update scores
        scores[currentPlayer]++;
        updateScoreDisplay();
        saveScores();
        
        // Show win modal
        showWinModal(`${currentPlayer} Wins!`, `Player ${currentPlayer} has won the game!`);
        
        // Play win sound
        playSound("win");
        
        return;
    }
    
    // Check for draw
    if (!board.includes("")) {
        gameActive = false;
        scores.draw++;
        updateScoreDisplay();
        saveScores();
        
        // Show draw modal
        showWinModal("It's a Draw!", "The game ended in a tie!");
        
        // Play draw sound
        playSound("draw");
        
        return;
    }
    
    // Switch player if game is still active
    if (gameActive) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateTurnIndicator();
        updateStatus();
    }
}

// Computer move (simple AI)
function makeComputerMove() {
    if (!gameActive) return;
    
    // Strategy: Try to win, then block, then take center, then random
    let moveIndex = -1;
    
    // 1. Try to win
    moveIndex = findWinningMove("O");
    
    // 2. Block player's winning move
    if (moveIndex === -1) {
        moveIndex = findWinningMove("X");
    }
    
    // 3. Take center if available
    if (moveIndex === -1 && board[4] === "") {
        moveIndex = 4;
    }
    
    // 4. Take corners if available
    if (moveIndex === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => board[index] === "");
        if (availableCorners.length > 0) {
            moveIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
    }
    
    // 5. Take any available cell
    if (moveIndex === -1) {
        const availableCells = board.map((cell, index) => cell === "" ? index : null)
                                   .filter(index => index !== null);
        if (availableCells.length > 0) {
            moveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
        }
    }
    
    // Make the move
    if (moveIndex !== -1) {
        playSound("click");
        makeMove(moveIndex, "O");
        checkGameResult();
    }
}

// Find winning move for a player
function findWinningMove(player) {
    for (let condition of winConditions) {
        const [a, b, c] = condition;
        const cellsInCombo = [board[a], board[b], board[c]];
        
        // Count how many cells are occupied by the player and how many are empty
        const playerCount = cellsInCombo.filter(cell => cell === player).length;
        const emptyCount = cellsInCombo.filter(cell => cell === "").length;
        
        // If player has 2 in a row and there's an empty cell, that's the winning move
        if (playerCount === 2 && emptyCount === 1) {
            const emptyIndex = condition[cellsInCombo.indexOf("")];
            return emptyIndex;
        }
    }
    return -1;
}

// Update turn indicator
function updateTurnIndicator() {
    turnIndicator.className = `player-turn ${currentPlayer.toLowerCase()}-turn`;
    const icon = turnIndicator.querySelector("i");
    icon.className = currentPlayer === "X" ? "fas fa-times" : "far fa-circle";
    currentPlayerSpan.textContent = currentPlayer;
    playerHighlight.textContent = currentPlayer;
}

// Update status message
function updateStatus() {
    statusText.innerHTML = `Player <span class="player-highlight">${currentPlayer}</span>'s turn`;
}

// Update score display
function updateScoreDisplay() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
}

// Show win modal
function showWinModal(title, message) {
    winnerText.textContent = title;
    winMessage.textContent = message;
    winModal.style.display = "flex";
}

// Close modal
function closeModal() {
    winModal.style.display = "none";
}

// Reset game (keep scores)
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    
    // Clear cells
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("X", "O", "win", "animate");
    });
    
    // Update UI
    updateTurnIndicator();
    updateStatus();
    
    // Play reset sound
    playSound("click");
}

// New game (reset scores too)
function newGame() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreDisplay();
    saveScores();
    resetGame();
}

// Toggle game mode
function toggleMode() {
    const newMode = gameMode === "2player" ? "computer" : "2player";
    setGameMode(newMode);
    resetGame();
}

// Set game mode
function setGameMode(mode) {
    gameMode = mode;
    
    // Update mode buttons
    const mode2player = document.getElementById("mode-2player");
    const modeComputer = document.getElementById("mode-computer");
    
    mode2player.classList.toggle("active", mode === "2player");
    modeComputer.classList.toggle("active", mode === "computer");
    
    // Update mode button text
    const modeBtn = document.querySelector(".btn-mode");
    modeBtn.innerHTML = mode === "2player" 
        ? '<i class="fas fa-robot"></i> vs Computer' 
        : '<i class="fas fa-users"></i> 2 Players';
    
    // Reset game when changing mode
    resetGame();
}

// Add animation class to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% { transform: scale(0); opacity: 0; }
        70% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
    }
    
    .cell.animate {
        animation: popIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.addEventListener("DOMContentLoaded", initGame);

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === winModal) {
        closeModal();
    }
});

// Game elements
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');

// Game variables
let currentPlayer = 'X';
let gameActive = true;
let board = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0 };

// Winning combinations
const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // columns
    [0,4,8], [2,4,6]           // diagonals
];

// Load scores from storage
function loadScores() {
    const saved = localStorage.getItem('ticTacToeScores');
    if (saved) {
        scores = JSON.parse(saved);
        updateScoreDisplay();
    }
}

// Save scores to storage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// Update score display
function updateScoreDisplay() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
}

// Handle cell click
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        
        // Check if cell is empty and game is active
        if (board[index] !== '' || !gameActive) return;
        
        // Mark cell
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);
        
        // Check for win or draw
        checkResult();
    });
});

// Check game result
function checkResult() {
    let roundWon = false;
    
    // Check for win
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            
            // Highlight winning cells
            pattern.forEach(i => cells[i].classList.add('win'));
            break;
        }
    }
    
    // If won
    if (roundWon) {
        status.textContent = `Player ${currentPlayer} Wins!`;
        scores[currentPlayer]++;
        updateScoreDisplay();
        saveScores();
        gameActive = false;
        return;
    }
    
    // Check for draw
    if (!board.includes('')) {
        status.textContent = "Game Draw!";
        gameActive = false;
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s Turn`;
}

// Reset game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    status.textContent = "Player X's Turn";
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'win');
    });
}

// Clear scores
function clearScores() {
    scores = { X: 0, O: 0 };
    updateScoreDisplay();
    saveScores();
    resetGame();
}

// Initialize game
loadScores();

// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const game = {
    width: canvas.width,
    height: canvas.height,
    running: true
};

const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

// Player Paddle (Left)
const playerPaddle = {
    x: 15,
    y: game.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer Paddle (Right)
const computerPaddle = {
    x: game.width - paddleWidth - 15,
    y: game.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Ball
const ball = {
    x: game.width / 2,
    y: game.height / 2,
    size: ballSize,
    dx: 5,
    dy: 5,
    speed: 5
};

// Score
let playerScore = 0;
let computerScore = 0;

// Input Handling
const keys = {};
let mouseY = game.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Reset Button
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Game Functions
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    resetBall();
    updateScore();
}

function resetBall() {
    ball.x = game.width / 2;
    ball.y = game.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 8;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function updatePlayerPaddle() {
    // Arrow key controls
    if (keys['ArrowUp']) {
        playerPaddle.dy = -playerPaddle.speed;
    } else if (keys['ArrowDown']) {
        playerPaddle.dy = playerPaddle.speed;
    } else {
        playerPaddle.dy = 0;
    }

    // Mouse control
    if (mouseY - playerPaddle.height / 2 !== playerPaddle.y) {
        playerPaddle.y += (mouseY - (playerPaddle.y + playerPaddle.height / 2)) * 0.1;
    }

    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > game.height) {
        playerPaddle.y = game.height - playerPaddle.height;
    }
}

function updateComputerPaddle() {
    // AI logic - follow the ball
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;

    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }

    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > game.height) {
        computerPaddle.y = game.height - computerPaddle.height;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > game.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.size, Math.min(game.height - ball.size, ball.y));
    }

    // Paddle collision - Player
    if (
        ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height &&
        ball.dx < 0
    ) {
        ball.dx *= -1.05; // Increase speed slightly
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy = hitPos * 8;
    }

    // Paddle collision - Computer
    if (
        ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height &&
        ball.dx > 0
    ) {
        ball.dx *= -1.05; // Increase speed slightly
        ball.x = computerPaddle.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy = hitPos * 8;
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x > game.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, game.width, game.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(game.width / 2, 0);
    ctx.lineTo(game.width / 2, game.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    
    ctx.fillStyle = '#ff0080';
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, game.width, game.height);
}

function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
updateScore();
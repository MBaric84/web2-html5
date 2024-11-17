// Selektiranje canvas elementa i postavljanje konteksta za crtanje
const canvas = document.getElementById('arkanoidCanvas');
const ctx = canvas.getContext('2d');

// Lopta
let ballRadius = 10;
let ballX, ballY, ballDX, ballDY;

// Palica
const paddleHeight = 10;
const paddleWidth = 100;
let paddleX;
const paddleSpeed = 7;
let rightPressed = false;
let leftPressed = false;

// Cigle
let brickRowCount, brickColumnCount, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
let bricks = [];

// Rezultat
let score;
let maxScore;
let gameOver = false;

// Varijabla praćenja pobjede igrača
let gameWon = false;

// Najbolji rezultat (localStorage)
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

// Funkcija za inicijalizaciju dimenzija cigli
function initializeBricks() {
    brickRowCount = 2;
    brickColumnCount = 5;
    brickWidth = canvas.width / brickColumnCount - 10; // Širina
    brickHeight = 20; // Visina
    brickPadding = 10;
    brickOffsetTop = 30; 
    brickOffsetLeft = 5;

    // Resetiranje niza za cigle
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; 
        }
    }

    // Update max score
    maxScore = brickRowCount * brickColumnCount;
}

// Funkcija za inicijalizaciju igre
function resetGame() {
    ballX = paddleX + paddleWidth / 2; // Lopta na sredini palice
    ballY = canvas.height - paddleHeight - ballRadius;
    ballDX = 2 * (Math.random() > 0.5 ? 1 : -1); // Random smjer
    ballDY = -2;

    paddleX = (canvas.width - paddleWidth) / 2;

    initializeBricks();
    score = 0;
    gameOver = false;

    document.removeEventListener('keydown', handleRestart);
}

// Funkcija za crtanje lopte
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#f00';
    ctx.fill();
    ctx.closePath();
}

// Funkcija za crtanje palice
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// Funkcija za crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0f0';
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Funkcija za crtanje rezultata
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Rezultat: ${score} / ${maxScore}`, canvas.width - 200, 20);
    ctx.fillText(`Najbolji rezultat: ${highScore}`, canvas.width - 200, 40);
}

// Funkcija za prikaz "YOU WON"
function drawVictoryScreen() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#00ff00'; // Zeleni tekst za pobjedu
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('YOU WON', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ffffff'; // Bijeli tekst za upute
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 30);
}

// Funkcija za prikaz "GAME OVER"
function drawGameOver() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 50);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    document.addEventListener('keydown', handleRestart);
}

// Funkcija za restart igre
function handleRestart() {
    resetGame();
    draw();
}

// Detekcija sudara lopte s ciglama
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY;
                    brick.status = 0;
                    score++;
                    if (score === maxScore) {
                        gameWon = true; 
                    }
                }
            }
        }
    }
}

// Glavna funkcija za crtanje
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (gameOver) {
        drawGameOver();
        return;
    }

    if (gameWon) {
        drawVictoryScreen();
        return;
    }

    // Pomicanje loptice
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballDY = -ballDY;
        } else {
            gameOver = true;
        }
    }

    ballX += ballDX;
    ballY += ballDY;

    // Pomicanje palice
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    requestAnimationFrame(draw);
}

// Event listeneri za tipke
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

document.addEventListener('keydown', function handleRestart(e) {
    if (gameOver || gameWon) {
        resetGame();
        gameOver = false;
        gameWon = false;
        draw();
    }
});

function keyDownHandler(e) {
    if (e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Dinamično mijenjanje dimenzija canvasa
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame();
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Selektiranje canvas elementa i postavljanje konteksta za crtanje
const canvas = document.getElementById('arkanoidCanvas');
const ctx = canvas.getContext('2d');

// Lopta
let ballRadius = 10;
let ballX, ballY, ballDX, ballDY; // Pozicija i brzina lopte

// Palica
const paddleHeight = 10;
const paddleWidth = 100;
let paddleX; // Pozicija palice
const paddleSpeed = 7; // Brzina palice
let rightPressed = false; // Provjera da li je desna tipka pritisnuta
let leftPressed = false; // Provjera da li je lijeva tipka pritisnuta

// Cigle
let brickRowCount, brickColumnCount, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
let bricks = []; // Polje cigli

// Rezultat
let score; // Trenutni rezultat
let maxScore; // Maksimalni rezultat (broj cigli)
let gameOver = false; // Status igre (da li je igra gotova)

// Varijabla praćenja pobjede igrača
let gameWon = false;

// Najbolji rezultat (localStorage)
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // Preuzimanje najboljeg rezultata iz localStorage

// Funkcija za inicijalizaciju dimenzija cigli
function initializeBricks() {
    brickRowCount = 2; // Broj redova cigli
    brickColumnCount = 5; // Broj stupaca cigli
    brickWidth = canvas.width / brickColumnCount - 10; // Širina cigli
    brickHeight = 20; // Visina cigli
    brickPadding = 10; // Razmak između cigli
    brickOffsetTop = 30; // Razmak od vrha canvasa
    brickOffsetLeft = 5; // Razmak od lijevog ruba canvasa

    // Resetiranje niza za cigle
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 }; // Status 1 znači da je cigla aktivna
        }
    }

    // Update max score (maksimalni broj cigli)
    maxScore = brickRowCount * brickColumnCount;
}

// Funkcija za inicijalizaciju igre
function resetGame() {
    ballX = paddleX + paddleWidth / 2; // Lopta se postavlja u sredinu palice
    ballY = canvas.height - paddleHeight - ballRadius; // Lopta je postavljena iznad palice
    ballDX = 2 * (Math.random() > 0.5 ? 1 : -1); // Lopta kreće u nasumičnom smjeru (lijevo ili desno)
    ballDY = -2; // Početni smjer lopte prema gore

    paddleX = (canvas.width - paddleWidth) / 2; // Postavljanje palice na sredinu ekrana

    initializeBricks(); // Inicijalizacija cigli
    score = 0; // Resetiranje rezultata
    gameOver = false; // Igre još nisu gotove

    document.removeEventListener('keydown', handleRestart); // Uklanjanje event listenera za restart
}

// Funkcija za crtanje lopte
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2); // Crtanje lopte kao kruga
    ctx.fillStyle = '#f00'; // Crvena boja
    ctx.fill(); 
    ctx.closePath();
}

// Funkcija za crtanje palice
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); // Crtanje pravokutnika za palicu
    ctx.fillStyle = '#ff0000'; // Crvena boja
    ctx.fill(); // Ispunjavanje pravokutnika
    ctx.strokeStyle = '#000'; // Crna boja za okvir
    ctx.lineWidth = 2; // Debljina okvira
    ctx.stroke(); // Crtanje okvira
    ctx.closePath();
}

// Funkcija za crtanje cigli
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) { // Ako je cigla aktivna
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft; // Izračunaj poziciju cigle na X
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop; // Izračunaj poziciju cigle na Y
                bricks[c][r].x = brickX; // Spremi X poziciju
                bricks[c][r].y = brickY; // Spremi Y poziciju
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight); // Crtanje cigle
                ctx.fillStyle = '#0f0'; // Zelena boja
                ctx.fill(); // Ispunjavanje cigle
                ctx.strokeStyle = '#000'; // Crna boja za okvir
                ctx.lineWidth = 2; // Debljina okvira
                ctx.stroke(); // Crtanje okvira
                ctx.closePath(); // Zatvaranje puta
            }
        }
    }
}

// Funkcija za crtanje rezultata
function drawScore() {
    ctx.font = '16px Arial'; // Postavljanje fonta
    ctx.fillStyle = '#fff'; // Bijela boja za tekst
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
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 30); // Upute za restart
}

// Funkcija za prikaz "GAME OVER"
function drawGameOver() {
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ff0000'; // Crveni tekst za 'GAME OVER'
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2); // Prikazivanje poruke 'GAME OVER'

    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff'; // Bijeli tekst za upute
    ctx.fillText('Press any key to restart', canvas.width / 2, canvas.height / 2 + 50); // Upute za restart

    if (score > highScore) { // Ako je trenutni rezultat bolji od najboljeg
        highScore = score;
        localStorage.setItem('highScore', highScore); // Spremi novi najbolji rezultat
    }

    document.addEventListener('keydown', handleRestart); // Dodaj event listener za restart
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
            if (brick.status === 1) { // Ako je cigla aktivna
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY; // Promjena smjera lopte
                    brick.status = 0; // Oznaka cigle kao uništene
                    score++; // Povećanje rezultata
                    if (score === maxScore) { // Ako su sve cigle uništene
                        gameWon = true; // Igrač je pobijedio
                    }
                }
            }
        }
    }
}

// Glavna funkcija za crtanje
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Očisti canvas
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    collisionDetection();

    if (gameOver) {
        drawGameOver(); // Ako je igra gotova, prikazi "GAME OVER"
        return;
    }

    if (gameWon) {
        drawVictoryScreen(); // Ako je igrač pobijedio, prikazi "YOU WON"
        return;
    }

    // Pomicanje loptice
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX; // Promjena smjera lopte po X osi
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY; // Promjena smjera lopte po Y osi
    } else if (ballY + ballDY > canvas.height - ballRadius) { // Ako lopta padne ispod palice
        if (ballX > paddleX && ballX < paddleX + paddleWidth) { // Ako lopta pogodi palicu
            ballDY = -ballDY; // Promjena smjera lopte
        } else {
            gameOver = true; // Igra je gotova
        }
    }

    ballX += ballDX;
    ballY += ballDY;

    // Pomicanje palice
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed; // Pomicanje palice prema desno
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed; // Pomicanje palice prema lijevo
    }

    requestAnimationFrame(draw); // Ponovno pozivanje funkcije za crtanje
}

// Event listeneri za tipke
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

document.addEventListener('keydown', function handleRestart(e) {
    if (gameOver || gameWon) {
        resetGame(); // Restart igre kad je igra gotova ili igrač pobijedio
        gameOver = false;
        gameWon = false;
        draw();
    }
});

// Funkcija za detektiranje pritisnutih tipki
function keyDownHandler(e) {
    if (e.key === 'ArrowRight') {
        rightPressed = true; // Desna tipka je pritisnuta
    } else if (e.key === 'ArrowLeft') {
        leftPressed = true; // Lijeva tipka je pritisnuta
    }
}

// Funkcija za detektiranje otpuštenih tipki
function keyUpHandler(e) {
    if (e.key === 'ArrowRight') {
        rightPressed = false; // Desna tipka više nije pritisnuta
    } else if (e.key === 'ArrowLeft') {
        leftPressed = false; // Lijeva tipka više nije pritisnuta
    }
}

// Dinamično mijenjanje dimenzija canvasa
function resizeCanvas() {
    canvas.width = window.innerWidth; // Širina canvasa jednaka širini prozora
    canvas.height = window.innerHeight; // Visina canvasa jednaka visini prozora
    resetGame(); // Resetiranje igre kada se promijeni veličina
    draw(); // Ponovno crtanje igre
}

window.addEventListener('resize', resizeCanvas); // Dodavanje event listenera za promjenu veličine prozora
resizeCanvas(); // Pozivanje funkcije za inicijalno postavljanje dimenzija

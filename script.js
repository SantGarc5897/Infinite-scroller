// --- Elementos del DOM ---
const gameContainer = document.getElementById('game-container');
const character = document.getElementById('character');
const scoreDisplay = document.getElementById('score');
const moneyDisplay = document.getElementById('money-count');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// --- Configuración del Juego ---
const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;
const gravity = 0.5;
const jumpStrength = 12;
const maxJumps = 2;
let characterY = 0;
let characterVelocityY = 0;
let score = 0;
let gameSpeed = 10; // MODIFICADO: Velocidad inicial duplicada
let isGameRunning = false;
let moneyCollected = 0;
let jumpCount = 0;
let lastScoreCelebration = 0;

// --- Arrays para guardar elementos ---
let obstacles = [];
let collectibles = [];

// --- Función Principal de Actualización (Game Loop) ---
function gameLoop() {
    if (!isGameRunning) return;

    characterVelocityY -= gravity;
    characterY += characterVelocityY;

    if (characterY < 0) {
        characterY = 0;
        characterVelocityY = 0;
        jumpCount = 0;
    }
    character.style.bottom = `${characterY}px`;

    moveGameElements(obstacles);
    moveGameElements(collectibles);
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// --- Función para mover elementos (carpetas y dinero) ---
function moveGameElements(elements) {
    for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        let currentRight = parseFloat(element.style.right);
        currentRight += gameSpeed;
        element.style.right = `${currentRight}px`;

        if (currentRight > gameWidth) {
            element.remove();
            elements.splice(i, 1);
        }
    }
}

// --- Generación de Obstáculos y Coleccionables ---
function createObstacle() {
    if (!isGameRunning) return;
    const newObstacle = document.createElement('div');
    newObstacle.classList.add('obstacle');
    newObstacle.style.right = '-60px';

    if (Math.random() > 0.5) {
        newObstacle.style.bottom = '0px';
    } else {
        newObstacle.style.top = '0px';
        newObstacle.style.transform = 'rotate(180deg)';
    }
    gameContainer.appendChild(newObstacle);
    obstacles.push(newObstacle);
}

function createCollectible() {
    if (!isGameRunning) return;
    const newCollectible = document.createElement('div');
    newCollectible.classList.add('collectible');
    newCollectible.style.right = '-50px';
    const randomHeight = Math.random() * (gameHeight - 100) + 50;
    newCollectible.style.bottom = `${randomHeight}px`;
    gameContainer.appendChild(newCollectible);
    collectibles.push(newCollectible);
}

// --- Detección de Colisiones ---
function checkCollisions() {
    const charRect = character.getBoundingClientRect();

    for (const obstacle of obstacles) {
        if (isColliding(charRect, obstacle.getBoundingClientRect())) {
            endGame();
            return;
        }
    }

    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        if (isColliding(charRect, collectible.getBoundingClientRect())) {
            score += 50;
            scoreDisplay.textContent = score;
            moneyCollected++;
            moneyDisplay.textContent = moneyCollected;
            collectible.remove();
            collectibles.splice(i, 1);
        }
    }
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

// --- Puntuación ---
function updateScore() {
    if (!isGameRunning) return;
    score++;
    scoreDisplay.textContent = score;

    if (score > 0 && score % 100 === 0) {
        gameSpeed += 0.5;
    }

    // MODIFICADO: Lógica de celebración de confeti cada 500 puntos
    if (score > 0 && Math.floor(score / 500) > lastScoreCelebration) {
        lastScoreCelebration = Math.floor(score / 500);
        showConfetti();
    }
}

// --- Función para mostrar confeti (sin cambios en su lógica interna) ---
function showConfetti() {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.top = '0';
    confetti.style.left = '0';
    confetti.style.width = '100%';
    confetti.style.height = '100%';
    confetti.style.backgroundImage = 'url("confeti.png")'; // ¡ASEGÚRATE DE QUE ESTE ARCHIVO EXISTA!
    confetti.style.backgroundSize = 'cover';
    confetti.style.zIndex = '50';
    confetti.style.pointerEvents = 'none';
    
    gameContainer.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 1500);
}

// --- Control del Personaje ---
function handleJump(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!isGameRunning) {
            startGame();
        } else if (jumpCount < maxJumps) {
            characterVelocityY = jumpStrength;
            jumpCount++;
        }
    }
}

// --- Funciones de Estado del Juego ---
function startGame() {
    // Resetear variables
    characterY = 0;
    characterVelocityY = 0;
    score = 0;
    gameSpeed = 10; // MODIFICADO: Velocidad inicial duplicada
    moneyCollected = 0;
    jumpCount = 0;
    lastScoreCelebration = 0;

    scoreDisplay.textContent = 0;
    moneyDisplay.textContent = 0;

    [...obstacles, ...collectibles].forEach(el => el.remove());
    obstacles = [];
    collectibles = [];

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    isGameRunning = true;

    // MODIFICADO: Duplica la frecuencia de aparición de obstáculos y premios
    const obstacleInterval = setInterval(createObstacle, 1000); // Antes 2000
    const collectibleInterval = setInterval(createCollectible, 1750); // Antes 3500
    const scoreInterval = setInterval(updateScore, 100);
    
    window.gameIntervals = [obstacleInterval, collectibleInterval, scoreInterval];
    
    requestAnimationFrame(gameLoop);
}

function endGame() {
    isGameRunning = false;
    window.gameIntervals.forEach(interval => clearInterval(interval));
    
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
}

// --- Event Listeners ---
document.addEventListener('keydown', handleJump);
restartButton.addEventListener('click', startGame);
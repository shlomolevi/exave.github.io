const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');

// Настройки
canvas.width = 800;
canvas.height = 500;
const ASTEROID_SPEED = 3;
const SPAWN_RATE = 500; // мс
let score = 0;
let timeLeft = 30;
let gameInterval;
let asteroids = [];

class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = Math.random() * 30 + 20;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    update() {
        this.y += ASTEROID_SPEED;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isClicked(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx*dx + dy*dy) < this.size;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Обновление и отрисовка астероидов
    asteroids.forEach((asteroid, index) => {
        asteroid.update();
        asteroid.draw();
        
        if(asteroid.y > canvas.height + 100) {
            asteroids.splice(index, 1);
        }
    });
}

function spawnAsteroid() {
    asteroids.push(new Asteroid());
}

function startGame() {
    // Сброс параметров
    score = 0;
    timeLeft = 30;
    asteroids = [];
    scoreElement.textContent = '0';
    timerElement.textContent = '00:30';
    startBtn.disabled = true;
    
    // Запуск игровых интервалов
    gameInterval = setInterval(gameLoop, 1000/60);
    const spawnInterval = setInterval(spawnAsteroid, SPAWN_RATE);
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
        
        if(timeLeft <= 0) {
            clearInterval(gameInterval);
            clearInterval(spawnInterval);
            clearInterval(timerInterval);
            startBtn.disabled = false;
            alert(`Игра окончена! Очки: ${score}`);
        }
    }, 1000);
}

// Обработка кликов
canvas.addEventListener('click', (e) => {
    if(timeLeft <= 0) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    asteroids.forEach((asteroid, index) => {
        if(asteroid.isClicked(clickX, clickY)) {
            asteroids.splice(index, 1);
            score += Math.round(100 - asteroid.size);
            scoreElement.textContent = score;
        }
    });
});

startBtn.addEventListener('click', startGame);
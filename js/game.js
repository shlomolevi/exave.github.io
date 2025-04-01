const playerImg = new Image();
playerImg.src = 'assets/player.png';

const enemyImg = new Image();
enemyImg.src = 'assets/enemy.png';

const bulletImg = new Image();
bulletImg.src = 'assets/bullet.png';

// Получаем элементы
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

// Загружаем музыку
const bgMusic = new Audio('assets/music.mp3');
bgMusic.loop = true; // Музыка будет зациклена

// Функция запуска игры и музыки
function startGame() {
    // Скрываем стартовый экран
    startScreen.style.display = 'none';
    // Показываем канвас
    canvas.style.display = 'block';
    // Запускаем музыку
    bgMusic.play();
    // Запускаем игровой цикл (если он есть)
    gameLoop();
}

// Привязываем функцию к кнопке
startButton.addEventListener('click', startGame);

// Игровой цикл (пример)
function gameLoop() {
    // Здесь будет логика вашей игры
    requestAnimationFrame(gameLoop);
}
// Объект игрока
const player = {
    x: canvas.width / 2 - 16,
    y: canvas.height - 50,
    width: 32,
    height: 48,
    speed: 5,
    fireRate: 200,
    lastFired: 0,
    health: 3
};

let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let score = 0;

// Спавн случайного количества врагов
setInterval(() => {
    const numEnemies = Math.floor(Math.random() * 3) + 1; // От 1 до 3
    for (let i = 0; i < numEnemies; i++) {
        const enemy = {
            x: Math.random() * (canvas.width - 32),
            y: 0,
            width: 32,
            height: 48,
            speedY: 2,
            speedX: (Math.random() - 0.5) * 2,
            fireRate: 1000,
            lastFired: 0
        };
        enemies.push(enemy);
    }
}, 2000);

// Отслеживание клавиш
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
};

// Основной игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка игрока
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Отрисовка врагов
    enemies.forEach(enemy => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Отрисовка пуль игрока
    playerBullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Отрисовка пуль врагов
    enemyBullets.forEach(bullet => {
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Отрисовка жизней
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    let hearts = '';
    for (let i = 0; i < player.health; i++) {
        hearts += '❤️';
    }
    ctx.fillText(hearts, 10, 30);

    // Отрисовка очков
    ctx.fillText('Очки: ' + score, 10, 60);

    // Управление игроком
    if (keys.ArrowLeft) player.x -= player.speed;
    if (keys.ArrowRight) player.x += player.speed;
    if (keys.ArrowUp) player.y -= player.speed;
    if (keys.ArrowDown) player.y += player.speed;

    // Ограничение движения игрока
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // Обновление врагов
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speedY;
        enemy.x += enemy.speedX;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
        if (Date.now() - enemy.lastFired > enemy.fireRate) {
            const bullet = {
                x: enemy.x + enemy.width / 2 - 2.5,
                y: enemy.y + enemy.height,
                width: 5,
                height: 10,
                dy: 5
            };
            enemyBullets.push(bullet);
            enemy.lastFired = Date.now();
        }
    });

    // Движение пуль игрока
    playerBullets.forEach((bullet, index) => {
        bullet.y -= bullet.dy;
        if (bullet.y < 0) playerBullets.splice(index, 1);
    });

    // Движение пуль врагов
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.dy;
        if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
    });

    // Столкновения пуль игрока с врагами
    playerBullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (isColliding(bullet, enemy)) {
                enemies.splice(eIndex, 1);
                playerBullets.splice(bIndex, 1);
                score += 10; // Увеличиваем очки за уничтожение врага
            }
        });
    });

    // Столкновения пуль врагов с игроком
    enemyBullets.forEach((bullet, bIndex) => {
        if (isColliding(bullet, player)) {
            player.health--;
            enemyBullets.splice(bIndex, 1);
            if (player.health <= 0) {
                alert('Игра окончена! Счет: ' + score);
                document.location.reload();
            }
        }
    });

    // Столкновения игрока с врагами
    enemies.forEach((enemy, index) => {
        if (isColliding(player, enemy)) {
            player.health--;
            enemies.splice(index, 1);
            if (player.health <= 0) {
                alert('Игра окончена! Счет: ' + score);
                document.location.reload();
            }
        }
    });

    // Стрельба игрока
    if (keys[' '] && Date.now() - player.lastFired > player.fireRate) {
        const bullet = {
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 10,
            dy: 7
        };
        playerBullets.push(bullet);
        player.lastFired = Date.now();
    }

    requestAnimationFrame(gameLoop);
}

// Управление клавишами
document.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
});

// Проверка столкновений
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

gameLoop();
// Игровые переменные
let peer;
let conn;
let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let playerRole = null; // "X" или "O"
let gameActive = false;

// Инициализация PeerJS
function initPeer() {
    peer = new Peer();

    peer.on("open", (id) => {
        document.getElementById("yourId").textContent = id;
    });

    peer.on("connection", (connection) => {
        conn = connection;
        setupConnection();
        playerRole = "O"; // Второй игрок = "O"
        gameActive = true;
        updateStatus("Вы играете за O. Ожидание хода X...");
    });
}

// Настройка соединения
function setupConnection() {
    conn.on("data", (data) => {
        if (data.type === "move") {
            handleRemoteMove(data.index);
        } else if (data.type === "restart") {
            restartGame();
            updateStatus(`Вы играете за ${playerRole}. Ход: ${currentPlayer}`);
        }
    });

    conn.on("close", () => {
        updateStatus("Соперник отключился.");
        gameActive = false;
    });
}

// Подключение к другому игроку
function connectToPeer(peerId) {
    conn = peer.connect(peerId);
    setupConnection();
    playerRole = "X"; // Первый игрок = "X"
    gameActive = true;
    updateStatus(`Вы играете за X. Ваш ход!`);
}

// Обработка хода
function makeMove(index) {
    if (!gameActive || gameBoard[index] !== "" || currentPlayer !== playerRole) return;

    gameBoard[index] = playerRole;
    document.querySelector(`[data-index="${index}"]`).classList.add(playerRole.toLowerCase());
    
    const winner = checkWinner();
    if (winner) {
        updateStatus(winner === "draw" ? "Ничья!" : `Победил ${winner}!`);
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus(`Ход: ${currentPlayer}`);
    }

    // Отправляем ход сопернику
    if (conn && conn.open) {
        conn.send({ type: "move", index });
    }
}

// Обработка хода соперника
function handleRemoteMove(index) {
    const opponentRole = playerRole === "X" ? "O" : "X";
    gameBoard[index] = opponentRole;
    document.querySelector(`[data-index="${index}"]`).classList.add(opponentRole.toLowerCase());
    
    const winner = checkWinner();
    if (winner) {
        updateStatus(winner === "draw" ? "Ничья!" : `Победил ${winner}!`);
        gameActive = false;
    } else {
        currentPlayer = playerRole; // Теперь ваш ход
        updateStatus(`Ваш ход (${playerRole})!`);
    }
}

// Проверка победы
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // строки
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // столбцы
        [0, 4, 8], [2, 4, 6]             // диагонали
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return gameBoard[a];
        }
    }

    return gameBoard.includes("") ? null : "draw";
}

// Перезапуск игры
function restartGame() {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    document.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("x", "o");
    });
    gameActive = true;
}

// Обновление статуса
function updateStatus(message) {
    document.getElementById("status").textContent = message;
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    initPeer();

    // Подключение к другому игроку
    document.getElementById("connectBtn").addEventListener("click", () => {
        const peerId = document.getElementById("peerIdInput").value.trim();
        if (!peerId) return alert("Введите ID соперника!");
        connectToPeer(peerId);
    });

    // Новая игра
    document.getElementById("startNewBtn").addEventListener("click", () => {
        if (conn && conn.open) {
            conn.send({ type: "restart" });
        }
        restartGame();
        updateStatus(playerRole ? `Вы играете за ${playerRole}. Ход: ${currentPlayer}` : "Ожидание подключения...");
    });

    // Клики по клеткам
    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", () => {
            const index = parseInt(cell.getAttribute("data-index"));
            makeMove(index);
        });
    });
});
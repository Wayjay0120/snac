const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const startButton = document.getElementById('startButton');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartButton = document.getElementById('restartButton');

const gridSize = 20; // 蛇和食物的單位大小
const tileCount = canvas.width / gridSize; // 畫布上有多少個單位方塊

let snake = [{ x: 10, y: 10 }]; // 蛇的初始位置 (方塊座標)
let food = {}; // 食物的座標
let dx = 0; // 蛇在 X 軸方向的移動量
let dy = 0; // 蛇在 Y 軸方向的移動量
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameSpeed = 150; // 遊戲速度 (毫秒，越小越快)
let isGameRunning = false;

highScoreDisplay.textContent = highScore;

// 生成食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // 避免食物生成在蛇的身上
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            generateFood(); // 重新生成
            return;
        }
    }
}

// 繪製遊戲內容
function draw() {
    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製食物 (顏色鮮豔)
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'darkred';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    // 繪製蛇
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? 'green' : 'lime'; // 蛇頭和蛇身不同顏色
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
}

// 更新遊戲狀態
function update() {
    if (!isGameRunning) return;

    // 蛇頭的新位置
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 檢查遊戲結束條件
    // 1. 撞牆
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    // 2. 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    // 將新蛇頭加入蛇的陣列
    snake.unshift(head);

    // 檢查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        generateFood(); // 重新生成食物
        // 吃到食物後稍微加速
        if (gameSpeed > 50) { // 限制最低速度，避免太快
            gameSpeed -= 5;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop(); // 沒吃到食物，移除蛇尾
    }

    draw();
}

// 遊戲主循環
function gameLoop() {
    update();
}

// 處理鍵盤輸入
function changeDirection(event) {
    if (!isGameRunning) return; // 遊戲未開始時不響應按鍵

    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    // 避免蛇立即反方向移動 (例如往右時不能立即往左)
    if (keyPressed === LEFT && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

// 遊戲開始
function startGame() {
    isGameRunning = true;
    startButton.classList.add('hidden');
    gameOverMessage.classList.add('hidden');
    score = 0;
    scoreDisplay.textContent = score;
    snake = [{ x: 10, y: 10 }]; // 重置蛇的位置
    dx = 0; // 重置方向
    dy = 0;
    gameSpeed = 150; // 重置速度

    generateFood();
    draw();
    clearInterval(gameInterval); // 清除可能存在的舊遊戲循環
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 遊戲結束
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval); // 停止遊戲循環
    gameOverMessage.classList.remove('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
}

// 事件監聽器
document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// 首次載入時顯示開始按鈕，並初始化高分
window.onload = () => {
    highScoreDisplay.textContent = localStorage.getItem('snakeHighScore') || 0;
    draw(); // 首次繪製空白畫布和初始蛇身
};
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 50,
    y: 550,
    width: 50,
    height: 50,
    radius: 10,
    color: '#000000',
    speed: 3,
    vy: 0,
    jumpPower: -10,
    onGround: false
};

const balls = [
    { x: 300, y: 500, radius: 10, color: '#000000', collected: false, collectedAt: { x: 300, y: 500 } },
    { x: 500, y: 400, radius: 10, color: '#000000', collected: false, collectedAt: { x: 500, y: 400 } },
    { x: 600, y: 300, radius: 10, color: '#000000', collected: false, collectedAt: { x: 600, y: 300 } },
    { x: 720, y: 450, radius: 10, color: '#000000', collected: false, collectedAt: { x: 720, y: 450 } },
    { x: 880, y: 350, radius: 10, color: '#000000', collected: false, collectedAt: { x: 880, y: 350 } }
];

const door = { x: 1200, y: 200, width: 50, height: 30, color: '#4e4f48', open: false, opening: false };

const platforms = [
    { x: 0, y: canvas.height - 40, width: 1600, height: 40, color: '#4e4f48' },
    { x: 250, y: 520, width: 100, height: 10, color: '#4e4f48' },
    { x: 450, y: 420, width: 100, height: 10, color: '#4e4f48' },
    { x: 650, y: 520, width: 100, height: 10, color: '#4e4f48' },
    { x: 850, y: 420, width: 100, height: 10, color: '#4e4f48' },
    { x: 1050, y: 320, width: 100, height: 10, color: '#4e4f48' },
    { x: 1250, y: 220, width: 100, height: 10, color: '#4e4f48' }
];

const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
};

let score = 0;

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key === ' ') playerJump();
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function playerJump() {
    if (player.onGround) {
        player.vy = player.jumpPower;
        player.onGround = false;
        playSound('jump');
    }
}

function playSound(effect) {
    let audio;
    if (effect === 'jump') {
        audio = new Audio('button-7.wav');
    } else if (effect === 'collect') {
        audio = new Audio('coin-drop-1.wav');
    }
    if (audio) audio.play();
}

function update() {
    if ((keys.a || keys.ArrowLeft) && player.x > 0) player.x -= player.speed;
    if ((keys.d || keys.ArrowRight) && player.x < canvas.width - player.width) player.x += player.speed;

    player.vy += 0.4;
    player.y += player.vy;

    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height + player.vy) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.onGround = true;
        }
    });

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.onGround = true;
        player.vy = 0;
    }

    balls.forEach(ball => {
        if (!ball.collected && player.x < ball.x + ball.radius &&
            player.x + player.width > ball.x &&
            player.y < ball.y + ball.radius &&
            player.y + player.height > ball.y) {
            ball.collected = true;
            playSound('collect');
            score += 10;
            document.getElementById('score').innerText = score;
        }

        if (ball.collected) {
            const targetX = door.x + door.width / 2 - ball.radius;
            const targetY = door.y - ball.radius;
            const distX = targetX - ball.x;
            const distY = targetY - ball.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance > 1) {
                const speed = 10;
                ball.x += (distX / distance) * speed;
                ball.y += (distY / distance) * speed;
            } else {
                ball.x = -100;
            }
        }
    });

    if (balls.every(ball => ball.collected) && !door.opening) {
        door.opening = true;
        door.height = 130;
    }

    if (door.opening) {
        if (door.y > 500) {
            door.y -= 1;
        } else {
            door.open = true;
            playSound('win');
        }
    }

    if (door.open && player.x < door.x + door.width &&
        player.x + player.width > door.x &&
        player.y < door.y + door.height &&
        player.y + player.height > door.y) {
        setTimeout(resetGame, 1000);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    balls.forEach(ball => {
        if (!ball.collected || (ball.collected && ball.x !== -100)) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
        }
    });

    ctx.fillStyle = door.color;
    ctx.globalAlpha = door.open ? 1.0 : 0.5;
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(update);
}

function resetGame() {
    player.x = 50;
    player.y = 550;
    player.vy = 0;
    balls.forEach(ball => {
        ball.collected = false;
        ball.x = ball.collectedAt.x;
        ball.y = ball.collectedAt.y;
    });
    door.open = false;
    door.opening = false;
    door.y = 200;
    door.height = 30;
    score = 0;
    document.getElementById('score').innerText = score;
}

async function fetchWeather() {
    const apiKey = '1448db4312fb1780edee73c278266ceb';
    const city = 'Baku';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const weatherInfo = `City: ${data.name}, Temp: ${data.main.temp}°C, ${data.weather[0].description}`;
        document.getElementById('weather-info').innerText = weatherInfo;

    } catch (error) {
        document.getElementById('weather-info').innerText = 'Failed to load weather data';
        console.error('Fetch error:', error);
    }
}

fetchWeather();
update();
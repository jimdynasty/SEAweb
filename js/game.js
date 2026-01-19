const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let score = 0;
let highScore = 0;
let gameSpeed = 5;
let animationId = null;
let frames = 0; // Effectively "Time elapsed in 60hz frames"

// Delta Time Logic
let lastTime = 0;
const TARGET_FPS = 60;
const OPTIMAL_TIME = 1000 / TARGET_FPS;

// Physics Constants
const GRAVITY = 0.6;
const GROUND_HEIGHT = 30;
const JUMP_FORCE = 12;

// Player (Pudding)
const pudding = {
    x: 50,
    y: 0,
    width: 80,
    height: 40,
    dy: 0,
    grounded: false,
    frame: 0,
    frameTimer: 0
};

// ASSETS LOAD
const assets = {
    pudding: new Image(),
    page: new Image(),
    obLow: new Image(),
    obMid: new Image(),
    obHigh: new Image(),
    bgFar: new Image(),
    bgMid: new Image(),
    fg: new Image()
};

assets.pudding.src = '/assets/images/game/pudding-run.png';
assets.page.src = '/assets/images/game/pages.png';
assets.obLow.src = '/assets/images/game/ob-low.png';
assets.obMid.src = '/assets/images/game/ob-mid.png';
assets.obHigh.src = '/assets/images/game/ob-high.png';
assets.bgFar.src = '/assets/images/game/bg-far.png';
assets.bgMid.src = '/assets/images/game/bg-mid.png';
assets.fg.src = '/assets/images/game/foreground.png';


// Parallax Layers
class Layer {
    constructor(image, speedModifier) {
        this.image = image;
        this.speedModifier = speedModifier;
        this.x = 0;
        this.width = 1200;
    }

    update(dt) {
        const speed = gameSpeed * this.speedModifier;
        this.x = (this.x - speed * dt) % this.width;
    }

    draw() {
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.x, 0, this.width, canvas.height);
            ctx.drawImage(this.image, this.x + this.width, 0, this.width, canvas.height);
        }
    }
}

// Updated Speeds (0.2 / 0.5)
const bgFarLayer = new Layer(assets.bgFar, 0.2);
const bgMidLayer = new Layer(assets.bgMid, 0.5);
const fgLayer = new Layer(assets.fg, 1.0);


// Entities
let obstacles = [];
let collectibles = [];
let particles = [];
let nextSpawnFrame = 0;
let isPressed = false;

// ---------------------------------------------------------
// INPUT HANDLERS
// ---------------------------------------------------------
function handleInputStart(code) {
    if (code === 'Space' || code === 'Touch') {
        if (!gameRunning) {
            const startMsg = document.getElementById('startMsg');
            if (startMsg && !startMsg.classList.contains('hidden')) {
                startGame();
            }
        } else {
            if (pudding.grounded) {
                pudding.dy = -JUMP_FORCE;
                pudding.grounded = false;
                isPressed = true;
            }
        }
    }
}

function handleInputEnd(code) {
    if (code === 'Space' || code === 'Touch') {
        isPressed = false;
        if (pudding.dy < -4) pudding.dy = -4;
    }
}

document.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (e.code === 'Space') {
        handleInputStart('Space');
    }
});
document.addEventListener('keyup', (e) => { if (e.code === 'Space') handleInputEnd('Space'); });
document.addEventListener('touchstart', (e) => {
    if (e.target === canvas) e.preventDefault();
    handleInputStart('Touch');
}, { passive: false });
document.addEventListener('touchend', () => handleInputEnd('Touch'));

// ---------------------------------------------------------
// GAME CONTROL
// ---------------------------------------------------------
function startGame() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (gameRunning) return;

    gameRunning = true;
    score = 0;
    obstacles = [];
    collectibles = [];
    particles = [];
    frames = 0;
    gameSpeed = 5;

    pudding.y = canvas.height - GROUND_HEIGHT - pudding.height;
    pudding.dy = 0;
    pudding.grounded = true;
    isPressed = false;

    bgFarLayer.x = 0;
    bgMidLayer.x = 0;
    fgLayer.x = 0;

    nextSpawnFrame = 50;
    lastTime = performance.now();

    document.getElementById('startMsg').classList.add('hidden');
    document.getElementById('startMsg').style.display = 'none';

    animationId = requestAnimationFrame(animate);
}

function spawnEntity() {
    if (Math.random() > 0.7) {
        const pageTier = Math.random();
        let flyHeight;

        if (pageTier < 0.2) {
            flyHeight = 50;
        } else if (pageTier < 0.6) {
            flyHeight = 90;
        } else {
            flyHeight = 140;
        }

        collectibles.push({
            x: canvas.width,
            y: canvas.height - GROUND_HEIGHT - flyHeight,
            baseY: canvas.height - GROUND_HEIGHT - flyHeight,
            width: 30,
            height: 40,
            img: assets.page,
            collected: false,
            floatOffset: Math.random() * Math.PI * 2
        });
    } else {
        const tier = Math.random();
        let height, width, img;

        if (tier < 0.33) {
            height = 25; width = 40; img = assets.obLow;
        } else if (tier < 0.66) {
            height = 45; width = 30; img = assets.obMid;
        } else {
            height = 65; width = 25; img = assets.obHigh;
        }

        obstacles.push({
            x: canvas.width,
            y: canvas.height - GROUND_HEIGHT - height,
            width: width,
            height: height,
            img: img
        });
    }

    const minGap = 35 + (gameSpeed * 1.5);
    const variance = Math.random() * 90;
    nextSpawnFrame = frames + minGap + variance;
}

function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 3 + 2,
            color: `rgba(251, 191, 36, ${Math.random()})`, // Gold
            life: 1.0
        });
    }
}

// Global Speed Check Function
function checkSpeedIncrease() {
    // Check purely based on Total Score
    // Every 10 points, increase speed (max 20)
    // We calculate "target speed" based on score to be consistent
    const targetSpeed = 5 + Math.floor(score / 10) * 0.5;

    // Smoothly ramp up or just set it? Setting is safer for direct feedback
    // Ensure we don't exceed max
    if (targetSpeed > 20) {
        gameSpeed = 20;
    } else if (targetSpeed > gameSpeed) {
        gameSpeed = targetSpeed;
    }
}


// ---------------------------------------------------------
// RESTART LOGIC
// ---------------------------------------------------------
function gameOver() {
    if (!gameRunning) return;
    gameRunning = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (score > highScore) highScore = score;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.font = '30px Italiana';
    ctx.fillText('GAME OVER', cx, cy - 40);
    ctx.font = '16px Inter';
    ctx.fillText(`SCORE: ${score}`, cx, cy);
    ctx.fillStyle = '#e91e8c';
    ctx.font = '14px Inter';
    ctx.fillText(`BEST: ${highScore}`, cx, cy + 25);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter';
    ctx.fillText('PRESS SPACE OR TAP TO RESTART', cx, cy + 55);
    ctx.textAlign = 'left';

    setTimeout(() => {
        document.addEventListener('keydown', restartHandler);
        document.addEventListener('touchstart', restartHandler);
    }, 500);
}

function restartHandler(e) {
    if (e.code === 'Space' || e.type === 'touchstart') {
        e.preventDefault();
        e.stopPropagation();
        document.removeEventListener('keydown', restartHandler);
        document.removeEventListener('touchstart', restartHandler);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startGame();
    }
}

// ---------------------------------------------------------
// MAIN LOOP with DELTA TIME
// ---------------------------------------------------------
function animate(currentTime) {
    if (!gameRunning) return;
    animationId = requestAnimationFrame(animate);

    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    let dt = deltaTime / OPTIMAL_TIME;
    if (dt > 3.0) dt = 3.0;

    // GAME UPDATES
    frames += dt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frames >= nextSpawnFrame) spawnEntity();

    // 1. BACKGROUND
    bgFarLayer.update(dt);
    bgFarLayer.draw();
    bgMidLayer.update(dt);
    bgMidLayer.draw();

    // Player Physics
    pudding.dy += GRAVITY * dt;
    pudding.y += pudding.dy * dt;

    if (pudding.y + pudding.height > canvas.height - GROUND_HEIGHT) {
        pudding.y = canvas.height - GROUND_HEIGHT - pudding.height;
        pudding.dy = 0;
        pudding.grounded = true;
    }

    // Animation
    if (pudding.grounded) {
        pudding.frameTimer += dt;
        if (pudding.frameTimer > 8) {
            pudding.frame = (pudding.frame + 1) % 3;
            pudding.frameTimer = 0;
        }
    } else {
        pudding.frame = 0;
    }

    // 2. GAMEPLAY
    if (assets.pudding.complete && assets.pudding.naturalWidth !== 0) {
        ctx.drawImage(assets.pudding, pudding.frame * 160, 0, 160, 80, pudding.x, pudding.y, pudding.width, pudding.height);
    } else {
        ctx.fillStyle = '#e91e8c';
        ctx.fillRect(pudding.x, pudding.y, pudding.width, pudding.height);
    }

    // Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let page = collectibles[i];
        page.x -= gameSpeed * dt;
        page.y = page.baseY + Math.sin(frames * 0.05 + page.floatOffset) * 5;

        if (!page.collected) {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
            if (page.img && page.img.complete) {
                ctx.drawImage(page.img, page.x, page.y, page.width, page.height);
            } else {
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(page.x, page.y, page.width, page.height);
            }
            ctx.restore();

            if (pudding.x < page.x + page.width && pudding.x + pudding.width > page.x && pudding.y < page.y + page.height && pudding.y + pudding.height > page.y) {
                page.collected = true;
                score += 5;
                createParticles(page.x + page.width / 2, page.y + page.height / 2);
                checkSpeedIncrease(); // CHECK SPEED ON COLLECT
            }
        }
        if (page.x + page.width < 0) collectibles.splice(i, 1);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.globalAlpha = 1.0;
        }
    }

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= gameSpeed * dt;
        if (obs.img && obs.img.complete) {
            ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        const margin = 4;
        if (pudding.x + margin < obs.x + obs.width - margin && pudding.x + pudding.width - margin > obs.x + margin && pudding.y + margin < obs.y + obs.height - margin && pudding.y + pudding.height - margin > obs.y + margin) {
            gameOver();
            return;
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            checkSpeedIncrease(); // CHECK SPEED ON PASS
        }
    }

    // 3. FOREGROUND & HUD
    fgLayer.update(dt);
    fgLayer.draw();

    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#f8fafc';
    let hiText = `HI: ${highScore > score ? highScore : score}`;
    ctx.fillText(hiText, canvas.width - 20, 30);
    let hiWidth = ctx.measureText(hiText).width;
    ctx.fillStyle = '#e91e8c';
    ctx.fillText(`SCORE: ${score}   `, canvas.width - 20 - hiWidth, 30);

    ctx.textAlign = 'left';
}

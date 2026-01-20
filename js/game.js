const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = false;
let score = 0;
let highScore = 0;
let gameSpeed = 5;
let animationId = null;
let frames = 0; // Effectively "Time elapsed in 60hz frames"
let gamePhase = 1; // 1 = Phase 1 (Pudding), 2 = Transition, 3 = Phase 2 (Noodle)
let nextSpeedThreshold = 10;

// Delta Time Logic
let lastTime = 0;
const TARGET_FPS = 60;
const OPTIMAL_TIME = 1000 / TARGET_FPS;

// Physics Constants
const GRAVITY = 0.6;
const GROUND_HEIGHT = 30;
const JUMP_FORCE = 12;

// Player 1 (Pudding)
const pudding = {
    x: 50,
    y: 0,
    width: 80,
    height: 40,
    dy: 0,
    grounded: false,
    frame: 0,
    frameTimer: 0,
    visible: true
};

// Player 2 (Noodle)
const noodle = {
    x: -150, // Starts off-screen w/ offset
    y: 0,
    width: 80, // Adjust if noodle sprite is diff size
    height: 40,
    dy: 0,
    grounded: false,
    frame: 0,
    frameTimer: 0,
    visible: false
};

// ASSETS LOAD
// We define sources constants to allow easy re-assignment on reset
const SRC = {
    pudding: '/assets/images/game/pudding-run.png',
    page: '/assets/images/game/pages.png',
    obLow: '/assets/images/game/ob-low.png',
    obMid: '/assets/images/game/ob-mid.png',
    obHigh: '/assets/images/game/ob-high.png',
    bgFar: '/assets/images/game/bg-far.png',
    bgMid: '/assets/images/game/bg-mid.png',
    fg: '/assets/images/game/foreground.png',

    // Phase 2
    noodle: '/assets/images/game/phase-2/noodle-run.png',
    p2_bgFar: '/assets/images/game/phase-2/p2-bg-far.png',
    p2_bgMid: '/assets/images/game/phase-2/p2-bg-mid.png',
    p2_fg: '/assets/images/game/phase-2/p2-foreground.png',
    p2_obLow: '/assets/images/game/phase-2/p2-ob-low.png',
    p2_obMid: '/assets/images/game/phase-2/p2-ob-mid.png',
    p2_obHigh: '/assets/images/game/phase-2/p2-ob-high.png',

    // Transition
    tr_bgFar: '/assets/images/game/phase-2/tr-bg-far.png',
    tr_bgMid: '/assets/images/game/phase-2/tr-bg-mid.png',
    tr_fg: '/assets/images/game/phase-2/tr-foreground.png'
};

const assets = {
    pudding: new Image(),
    page: new Image(),
    obLow: new Image(),
    obMid: new Image(),
    obHigh: new Image(),
    bgFar: new Image(),
    bgMid: new Image(),
    fg: new Image(),

    noodle: new Image(),
    p2_bgFar: new Image(),
    p2_bgMid: new Image(),
    p2_fg: new Image(),
    p2_obLow: new Image(),
    p2_obMid: new Image(),
    p2_obHigh: new Image(),

    tr_bgFar: new Image(),
    tr_bgMid: new Image(),
    tr_fg: new Image()
};

// Start Loading
Object.keys(SRC).forEach(key => {
    assets[key].src = SRC[key];
});


// Parallax Layers with Active/Buffer Queue Logic
class Layer {
    constructor(image, speedModifier) {
        this.activeImage = image;
        this.bufferImage = image; // Loops itself by default
        this.queue = []; // Future images
        this.speedModifier = speedModifier;
        this.x = 0;
        this.width = 1200;
        this.hasSwapped = false; // Flag to tell game loop a swap occurred
    }

    queueTransition(trImage, p2Image) {
        this.queue.push(trImage);
        this.queue.push(p2Image);
    }

    reset(defaultImage) {
        this.activeImage = defaultImage;
        this.bufferImage = defaultImage;
        this.queue = [];
        this.x = 0;
    }

    update(dt) {
        const speed = gameSpeed * this.speedModifier;
        this.x -= speed * dt;

        // Wrap around logic
        if (this.x <= -this.width) {
            this.x += this.width;

            // Shift Buffer to Active
            this.activeImage = this.bufferImage;
            this.hasSwapped = true;

            // Load next from Queue or keep looping current
            if (this.queue.length > 0) {
                this.bufferImage = this.queue.shift();
            } else {
                this.bufferImage = this.activeImage; // Infinite loop of current
            }
        } else {
            this.hasSwapped = false;
        }
    }

    draw() {
        // Draw Active (Left/Main segment)
        // Floats allowed for smoothness; Seam fixed via overlap
        if (this.activeImage && this.activeImage.complete && this.activeImage.naturalWidth !== 0) {
            ctx.drawImage(this.activeImage, this.x, 0, this.width, canvas.height); // Removed Math.floor
        }

        // Draw Buffer (Right/Incoming segment)
        // Overlap by 1px to seal gaps without snapping
        if (this.bufferImage && this.bufferImage.complete && this.bufferImage.naturalWidth !== 0) {
            ctx.drawImage(this.bufferImage, this.x + this.width - 1, 0, this.width, canvas.height); // Removed Math.floor but kept overlap
        }
    }
}

// Layers
const bgFarLayer = new Layer(assets.bgFar, 0.2);
const bgMidLayer = new Layer(assets.bgMid, 0.5);
const fgLayer = new Layer(assets.fg, 1.0);


// ---------------------------------------------------------
// DIALOGUE SYSTEM
// ---------------------------------------------------------
const DIALOGUE_SCRIPT = [
    { actor: 'p', text: "Late again, Noodle?", duration: 100 },
    { actor: 'n', text: "A wizard arrives precisely when she means to.", duration: 120 },
    { actor: 'p', text: "You were asleep in the laundry.", duration: 120 },
    { actor: 'n', text: "Strategising! I was strategising!", duration: 120 },
    { actor: 'p', text: "Whatever. Tag! You're it!", duration: 100 },
    { actor: 'n', text: "I better get treats for this...", duration: 120 }
];

const PHASE_1_DIALOGUE = [
    { score: 1, text: "Let's grab those pages, Noodle!", duration: 120, shown: false },
    { score: 10, text: "Wait, where is Noodle?!", duration: 100, shown: false },
    { score: 55, text: "Noodle! A little help, please.", duration: 120, shown: false },
    { score: 80, text: "NOODLE!", duration: 100, shown: false }
];

function drawSpeechBubble(ctx, text, x, y, isLeft, textColor = '#000000') {
    ctx.save();
    ctx.font = 'bold 14px "Courier New", monospace';
    const padding = 10;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 24 + padding;

    // Position bubble above actor
    // Updated Logic: Use x+65 (Front Edge) as anchor
    // Sprite center is 40. Mouth is ~70.
    // Tail is at bx+5. So if bx = x+65, Tail = x+70. Perfect.
    // User Update: x+75 for better alignment
    let bx = isLeft ? x - boxWidth + 20 : x + 75;
    let by = y - 40;

    // Keep on screen
    if (bx < 10) bx = 10;
    if (bx + boxWidth > canvas.width - 10) bx = canvas.width - boxWidth - 10;

    // Bubble
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    if (isLeft) {
        ctx.moveTo(bx + boxWidth - 15, by + boxHeight);
        ctx.lineTo(bx + boxWidth - 5, by + boxHeight + 10);
        ctx.lineTo(bx + boxWidth - 5, by + boxHeight);
    } else {
        ctx.moveTo(bx + 5, by + boxHeight);
        ctx.lineTo(bx + 5, by + boxHeight + 10);
        ctx.lineTo(bx + 15, by + boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = textColor;
    ctx.fillText(text, bx + padding, by + 20); // y is baseline, approx logic

    ctx.restore();
}
// ---------------------------------------------------------

// Entities
let obstacles = [];
let collectibles = [];
let particles = [];
let nextSpawnFrame = 0;
let isPressed = false;
let phaseTransitionTimer = 0;
let phase3Timer = 0; // Timer for Phase 3 buffer
let dialogueIndex = 0;
let dialogueTimer = 0;
let p1DialogueTimer = 0;
let p1ActiveLine = null;

// ---------------------------------------------------------
// INPUT HANDLERS
// ---------------------------------------------------------
function handleInputStart(code) {
    if (code === 'Space' || code === 'Touch') {
        if (!gameRunning) {
            // Check Start or Game Over Screen
            const startMsg = document.getElementById('startMsg');
            const gameOverMsg = document.getElementById('gameOverMsg');

            // If either screen is visible (not hidden), start game
            if ((startMsg && !startMsg.classList.contains('hidden')) ||
                (gameOverMsg && !gameOverMsg.classList.contains('hidden'))) {
                startGame();
                return;
            }
        }

        // Jump Logic (Phase-aware)
        if (gameRunning) {
            const activeActor = (gamePhase === 3 && !pudding.visible) ? noodle : pudding;

            // Standard Jump
            if ((activeActor === pudding && pudding.grounded) || (activeActor === noodle && noodle.grounded)) {
                activeActor.dy = -JUMP_FORCE;
                activeActor.grounded = false;

                // If Transitioning (P2), Noodle mimics Pudding with Delay
                if (gamePhase === 2 && activeActor === pudding) {
                    setTimeout(() => {
                        if (gamePhase === 2 && noodle.grounded) {
                            noodle.dy = -JUMP_FORCE;
                            noodle.grounded = false;
                        }
                    }, 150); // 150ms Delay
                }
            }
        }
        isPressed = true;
    }
}

function handleInputEnd(code) {
    if (code === 'Space' || code === 'Touch') {
        isPressed = false;

        // Variable Jump Height
        const activeActor = (gamePhase === 3 && !pudding.visible) ? noodle : pudding;

        if (activeActor.dy < -3) {
            activeActor.dy = -3;
        }
        // If transitioning, cut noodle jump too (immediate cut for responsiveness)
        if (gamePhase === 2 && noodle.dy < -3) {
            noodle.dy = -3;
        }
    }
}

// ---------------------------------------------------------
// GAME FUNCTIONS
// ---------------------------------------------------------
function startGame() {
    gameRunning = true;
    score = 0;
    frames = 0;
    gameSpeed = 5;
    nextSpawnFrame = 0;
    phaseTransitionTimer = 0;
    phase3Timer = 0;

    // Reset Dialogue
    dialogueIndex = 0;
    dialogueTimer = 0;

    // Reset Phase 1 Dialogue
    PHASE_1_DIALOGUE.forEach(l => l.shown = false);
    p1DialogueTimer = 0;
    p1ActiveLine = null;

    // Reset Phase
    gamePhase = 1;
    nextSpeedThreshold = 10;

    // Reset Actors (Start on Ground)
    const startY = canvas.height - GROUND_HEIGHT - 40; // 40 is height
    pudding.y = startY;
    pudding.dy = 0;
    pudding.x = 50;
    pudding.visible = true;
    pudding.grounded = true;
    pudding.frame = 1; // Stand/Run frame

    noodle.y = startY;
    noodle.dy = 0;
    noodle.x = -150;
    noodle.visible = false;
    noodle.grounded = true;

    obstacles = [];
    collectibles = [];
    particles = [];

    // Reset Layers Explicitly
    bgFarLayer.reset(assets.bgFar); bgFarLayer.speedModifier = 0.2;
    bgMidLayer.reset(assets.bgMid); bgMidLayer.speedModifier = 0.5;
    fgLayer.reset(assets.fg); fgLayer.speedModifier = 1.0;

    // Hide All Overlays
    const startMsg = document.getElementById('startMsg');
    if (startMsg) startMsg.classList.add('hidden');

    const gameOverMsg = document.getElementById('gameOverMsg');
    if (gameOverMsg) gameOverMsg.classList.add('hidden');

    if (animationId) cancelAnimationFrame(animationId);
    lastTime = 0;
    animate(0);
}

function gameOver() {
    gameRunning = false;

    // Save High Score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('puddingHighScore', highScore);
    }

    // Show Game Over Overlay
    const gameOverMsg = document.getElementById('gameOverMsg');
    if (gameOverMsg) {
        gameOverMsg.classList.remove('hidden');
        const scoreSpan = document.getElementById('finalScore');
        if (scoreSpan) scoreSpan.innerText = score;
        const hiSpan = document.getElementById('finalHighScore');
        if (hiSpan) hiSpan.innerText = highScore;
    }
}

function spawnEntity() {
    const useP2Assets = (gamePhase === 3);

    // Safety Logic:
    // Safety Logic:
    // 1. Transitioning (Phase 2) -> Unsafe
    // 2. Early Phase 3 (Handover Buffer) -> Unsafe (first 180 frames / ~3s)
    const isTransitioning = (gamePhase === 2) || (gamePhase === 3 && phase3Timer < 180);

    // User Request: Skip ALL spawns during transition so dialogue is clear
    if (isTransitioning) {
        const minGap = 40;
        const variance = Math.random() * Math.max(20, 100 - gameSpeed * 4);
        nextSpawnFrame = frames + minGap + variance;
        return;
    }

    // Determine type: Page or Obstacle?
    // 25% chance for Page. 
    let spawnType = 'obstacle'; // default
    if (Math.random() < 0.25) {
        spawnType = 'collectible';
    }

    if (spawnType === 'collectible') {
        // Collectible Spawn with Variable Heights
        // Low: No jump needed (~45px)
        // Mid: Jump (~90px)
        // High: High jump (~140px)
        const tier = Math.random();
        let flyHeight = 100; // default mid

        if (tier < 0.20) flyHeight = 45;        // Low
        else if (tier < 0.60) flyHeight = 90;  // Mid
        else flyHeight = 140;                   // High

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
        // Obstacle Spawn (Only if NOT transitioning)
        if (!isTransitioning) {
            const tier = Math.random();
            let height, width, img;

            if (useP2Assets) {
                // Phase 2 Obstacles
                if (tier < 0.33) {
                    height = 25; width = 40; img = assets.p2_obLow;
                } else if (tier < 0.66) {
                    height = 45; width = 30; img = assets.p2_obMid;
                } else {
                    height = 65; width = 25; img = assets.p2_obHigh;
                }
            } else {
                // Phase 1 Obstacles
                if (tier < 0.33) {
                    height = 25; width = 40; img = assets.obLow;
                } else if (tier < 0.66) {
                    height = 45; width = 30; img = assets.obMid;
                } else {
                    height = 65; width = 25; img = assets.obHigh;
                }
            }

            obstacles.push({
                x: canvas.width,
                y: canvas.height - GROUND_HEIGHT - height,
                width: width,
                height: height,
                img: img
            });
        }
    }

    // Dynamic Gap: Keep density constant as speed increases
    // 300px / speed = time. Speed 5 -> 60 frames. Speed 20 -> 15 frames.
    const minGap = 300 / gameSpeed;
    // Lowered variance ceiling (100 -> 60) to compensate for larger minGap
    const variance = Math.random() * Math.max(20, 60 - gameSpeed * 2);
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
            color: '#fbbf24', // Explicit Hex Color
            life: 1.0
        });
    }
}

function checkSpeedIncrease() {
    // Increase speed every 10 points (Threshold Check)
    // Using >= ensures we catch it even if a +5 page jumps us past the exact number
    if (score >= nextSpeedThreshold) {
        if (gameSpeed < 20) {
            gameSpeed += 0.25;
            nextSpeedThreshold += 10;
        }
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

    frames += dt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // -------------------
    // PHASE LOGIC
    // -------------------

    // TRIGGER TRANSITION (Score 100)
    if (gamePhase === 1 && score >= 100) {
        gamePhase = 2; // Start Transition
        noodle.visible = true;
        noodle.x = -80; // Start off screen left

        // Speed Up Parallax for Transition (Faster effect) - Slowed slightly per user request
        bgFarLayer.speedModifier = 0.3;
        bgMidLayer.speedModifier = 0.5;

        // Force Clear Phase 1 Dialogue on Transition
        p1ActiveLine = null;

        // Safety Clean: Remove existing obstacles so Noodle enters safely
        obstacles = [];

        // Queue Assets: Next Wrap = Transition, Following = Phase 2
        bgFarLayer.queueTransition(assets.tr_bgFar, assets.p2_bgFar);
        bgMidLayer.queueTransition(assets.tr_bgMid, assets.p2_bgMid);
        fgLayer.queueTransition(assets.tr_fg, assets.p2_fg);
    }

    // HANDLE TRANSITION STATE
    if (gamePhase === 2) {
        // 1. Move Noodle into position (behind Pudding)
        if (noodle.x < pudding.x - 50) {
            noodle.x += 2 * dt; // Slide in
        } else {
            noodle.x = pudding.x - 50; // Lock pos
        }

        // 3. Check for End of Transition (Handover)
        if (bgMidLayer.activeImage === assets.p2_bgMid) {
            // Handover time!
            gamePhase = 3; // Noodle Mode

            // Reset Parallax Speeds
            bgFarLayer.speedModifier = 0.2;
            bgMidLayer.speedModifier = 0.5;
        }
    }

    // HANDLE PHASE 3 (Handover / Noodle Solo)
    if (gamePhase === 3) {
        phase3Timer += dt; // Increment Timer

        // Pudding slows down and disappears
        if (pudding.visible) {
            pudding.x -= 2 * dt; // Slide back
            if (pudding.x + pudding.width < 0) {
                pudding.visible = false;

            }
        } else {
            // Pudding gone, Noodle takes main stage
            if (noodle.x < 50) {
                noodle.x += 1 * dt;
            }
        }
    }

    // UPDATE DIALOGUE (Global for P2/P3)
    // Run if transition started (P2) or continuing (P3)
    if ((gamePhase === 2 || gamePhase === 3) && dialogueIndex < DIALOGUE_SCRIPT.length) {
        // Check trigger condition (Noodle roughly in place)
        if (noodle.visible && noodle.x > -100) {
            dialogueTimer += dt;
            // If current line finished, advance
            if (dialogueTimer > DIALOGUE_SCRIPT[dialogueIndex].duration) {
                dialogueIndex++;
                dialogueTimer = 0;
            }
        }
    }


    if (frames >= nextSpawnFrame) spawnEntity();

    // 1. BACKGROUND LAYERS
    bgFarLayer.update(dt);
    bgFarLayer.draw();
    bgMidLayer.update(dt);
    bgMidLayer.draw();


    // 2. PLAYER PHYSICS & DRAWING
    const actors = [pudding, noodle];

    actors.forEach(actor => {
        if (!actor.visible) return;

        // Physics
        actor.dy += GRAVITY * dt;
        actor.y += actor.dy * dt;
        if (actor.y + actor.height > canvas.height - GROUND_HEIGHT) {
            actor.y = canvas.height - GROUND_HEIGHT - actor.height;
            actor.dy = 0;
            actor.grounded = true;
        }

        // Animation
        if (actor.grounded) {
            actor.frameTimer += dt;
            if (actor.frameTimer > 8) {
                actor.frame = (actor.frame + 1) % 3;
                actor.frameTimer = 0;
            }
        } else {
            actor.frame = 0; // Jump frame 0
        }

        // Draw
        let sprite = (actor === pudding) ? assets.pudding : assets.noodle;
        if (sprite.complete && sprite.naturalWidth !== 0) {
            ctx.drawImage(sprite, actor.frame * 160, 0, 160, 80, actor.x, actor.y, actor.width, actor.height);
        } else {
            ctx.fillStyle = (actor === pudding) ? '#e91e8c' : '#fbbf24';
            ctx.fillRect(actor.x, actor.y, actor.width, actor.height);
        }
    });

    // Render Dialogue Bubbles (Phase 2 AND Phase 3)
    // Always render bubble to the RIGHT of the actor to keep it on-screen
    if ((gamePhase === 2 || gamePhase === 3) && dialogueIndex < DIALOGUE_SCRIPT.length && noodle.x > -100) {
        const line = DIALOGUE_SCRIPT[dialogueIndex];
        const actor = line.actor === 'p' ? pudding : noodle;

        if (actor.visible) {
            const textColor = (line.actor === 'p') ? '#654321' : '#374151'; // Brown for Pudding, Grey for Noodle
            drawSpeechBubble(ctx, line.text, actor.x, actor.y, false, textColor);
        }
    }

    // Render Phase 1 Dialogue (Pudding Only)
    // Runs inside animate loop during gamePhase === 1
    if (gamePhase === 1) {
        // Check Triggers
        PHASE_1_DIALOGUE.forEach(line => {
            if (!line.shown && score >= line.score) {
                line.shown = true;
                p1ActiveLine = line;
                p1DialogueTimer = line.duration;
            }
        });

        // Update Timer
        if (p1ActiveLine) {
            p1DialogueTimer -= dt;
            if (p1DialogueTimer <= 0) {
                p1ActiveLine = null;
            }
        }

        // Render
        if (p1ActiveLine && pudding.visible) {
            // Always Pudding, so use Brown #654321
            drawSpeechBubble(ctx, p1ActiveLine.text, pudding.x, pudding.y, false, '#654321');
        }
    }


    // 3. OBJECTS (Collectibles/Obstacles)
    // Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let page = collectibles[i];
        page.x -= gameSpeed * dt;
        page.y = page.baseY + Math.sin(frames * 0.05 + page.floatOffset) * 5;

        // Check active player for collection
        const activeActor = (gamePhase === 3 && !pudding.visible) ? noodle : pudding;

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

            if (activeActor.x < page.x + page.width && activeActor.x + activeActor.width > page.x && activeActor.y < page.y + page.height && activeActor.y + activeActor.height > page.y) {
                page.collected = true;
                score += 5;
                createParticles(page.x + page.width / 2, page.y + page.height / 2);
                checkSpeedIncrease(); // CHECK SPEED ON COLLECT
            }
        }
        if (page.x + page.width < 0) collectibles.splice(i, 1);
    }

    // Particles System
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.02 * dt;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.restore();
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

        const activeActor = (gamePhase === 3 && !pudding.visible) ? noodle : pudding;
        const margin = 4;

        // Collision against Active Player
        if (activeActor.x + margin < obs.x + obs.width - margin && activeActor.x + activeActor.width - margin > obs.x + margin && activeActor.y + margin < obs.y + obs.height - margin && activeActor.y + activeActor.height - margin > obs.y + margin) {
            gameOver();
            return;
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            checkSpeedIncrease(); // CHECK SPEED ON PASS
        }
    }


    // 4. FOREGROUND & HUD
    fgLayer.update(dt);
    fgLayer.draw();

    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#f8fafc';
    let hiText = `HI: ${highScore > score ? highScore : score}`;
    ctx.fillText(hiText, canvas.width - 20, 30);
    let hiWidth = ctx.measureText(hiText).width;
    ctx.fillStyle = gamePhase === 2 ? '#fbbf24' : '#e91e8c'; // Gold score in Phase 2
    ctx.fillText(`SCORE: ${score}   `, canvas.width - 20 - hiWidth, 30);

    ctx.textAlign = 'left';

    // Transition Flash
    if (phaseTransitionTimer > 0) {
        ctx.save();
        ctx.globalAlpha = phaseTransitionTimer;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

// Listeners
window.addEventListener('keydown', (e) => handleInputStart(e.code));
window.addEventListener('keyup', (e) => handleInputEnd(e.code));
window.addEventListener('touchstart', (e) => handleInputStart('Touch'));
window.addEventListener('touchend', (e) => handleInputEnd('Touch'));

// First Load Init
if (localStorage.getItem('puddingHighScore')) {
    highScore = parseInt(localStorage.getItem('puddingHighScore'));
}
const startMsg = document.getElementById('startMsg');
if (startMsg) startMsg.classList.remove('hidden');

// Pre-Draw Background Once
if (assets.bgFar.complete) {
    ctx.drawImage(assets.bgFar, 0, 0, canvas.width, canvas.height);
} else {
    assets.bgFar.onload = () => { ctx.drawImage(assets.bgFar, 0, 0, canvas.width, canvas.height); };
}

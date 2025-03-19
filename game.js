// Game Constants
const WIDTH = 400;
const HEIGHT = 600;
const PLAYER_SIZE = 16;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

// Initialize Canvases
const drawCanvas = document.getElementById("drawCanvas");
const playCanvas = document.getElementById("playCanvas");
const drawCtx = drawCanvas.getContext("2d");
const playCtx = playCanvas.getContext("2d");

[drawCanvas, playCanvas].forEach((c) => {
  c.width = WIDTH;
  c.height = HEIGHT;
});

// Game State
let gameState = {
  isDrawing: false,
  isPlaying: false,
  doodlePoints: [],
  player: {
    x: 50,
    y: HEIGHT / 2,
    vy: 0,
    sprite: new Image(),
    frame: 0,
  },
  particles: [],
  score: 0,
  brushColor: "#FFFFFF",
};

// Sound Effects
const sounds = {
  jump: new Howl({ src: ["assets/jump.wav"] }),
  collision: new Howl({ src: ["assets/explosion.wav"] }),
  draw: new Howl({ src: ["assets/sketch.wav"], volume: 0.3 }),
};

// Sprite Loading
gameState.player.sprite.src = "assets/bird-sprite.png";

// Drawing Mechanics
function startDrawing(e) {
  const rect = drawCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;

  gameState.isDrawing = true;
  gameState.doodlePoints = [];
  drawCtx.beginPath();
  drawCtx.moveTo(x, y);
}

function draw(e) {
  if (!gameState.isDrawing) return;

  const rect = drawCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;

  gameState.doodlePoints.push({ x, y });
  drawCtx.lineTo(x, y);
  drawCtx.strokeStyle = gameState.brushColor;
  drawCtx.lineWidth = 3;
  drawCtx.stroke();

  if (gameState.doodlePoints.length % 5 === 0) sounds.draw.play();
}

function endDrawing() {
  gameState.isDrawing = false;
  document.getElementById("playButton").classList.remove("hidden");
}

// Gameplay Functions
function updatePlayer() {
  gameState.player.vy += GRAVITY;
  gameState.player.y += gameState.player.vy;
}

function checkCollisions() {
  return gameState.doodlePoints.some((p) => {
    const dx = p.x - gameState.player.x;
    const dy = p.y - gameState.player.y;
    return Math.sqrt(dx * dx + dy * dy) < PLAYER_SIZE + 3;
  });
}

function createParticles() {
  for (let i = 0; i < 20; i++) {
    gameState.particles.push({
      x: gameState.player.x,
      y: gameState.player.y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      life: 1,
    });
  }
}

function gameLoop() {
  if (!gameState.isPlaying) return;

  playCtx.clearRect(0, 0, WIDTH, HEIGHT);

  // Update game state
  updatePlayer();
  gameState.score++;
  document.getElementById("score").textContent = gameState.score;

  // Collision check
  if (
    checkCollisions() ||
    gameState.player.y > HEIGHT ||
    gameState.player.y < 0
  ) {
    sounds.collision.play();
    gameState.isPlaying = false;
    alert(`Game Over! Score: ${gameState.score}`);
    return;
  }

  // Draw elements
  drawDoodle();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

function drawPlayer() {
  const spriteWidth = 32;
  gameState.player.frame = (gameState.player.frame + 0.2) % 3;

  playCtx.drawImage(
    gameState.player.sprite,
    Math.floor(gameState.player.frame) * spriteWidth,
    0,
    spriteWidth,
    spriteWidth,
    gameState.player.x - PLAYER_SIZE,
    gameState.player.y - PLAYER_SIZE,
    PLAYER_SIZE * 2,
    PLAYER_SIZE * 2
  );
}

function drawDoodle() {
  playCtx.beginPath();
  gameState.doodlePoints.forEach((p, i) => {
    i === 0 ? playCtx.moveTo(p.x, p.y) : playCtx.lineTo(p.x, p.y);
  });
  playCtx.strokeStyle = gameState.brushColor;
  playCtx.lineWidth = 3;
  playCtx.stroke();
}

// Event Listeners
document.getElementById("brushColor").addEventListener("input", (e) => {
  gameState.brushColor = e.target.value;
});

document.getElementById("playButton").addEventListener("click", () => {
  drawCanvas.classList.add("hidden");
  playCanvas.classList.remove("hidden");
  gameState.isPlaying = true;
  gameLoop();
});

// Input Handling
document.addEventListener("mousedown", startDrawing);
document.addEventListener("mousemove", draw);
document.addEventListener("mouseup", endDrawing);
document.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startDrawing(e.touches[0]);
});
document.addEventListener("touchmove", (e) => {
  e.preventDefault();
  draw(e.touches[0]);
});
document.addEventListener("touchend", endDrawing);

document.addEventListener("click", () => {
  if (gameState.isPlaying) {
    gameState.player.vy = JUMP_FORCE;
    sounds.jump.play();
  }
});

// Mobile Controls
let touchStartX = 0;
document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  if (gameState.isPlaying) {
    gameState.player.vy = JUMP_FORCE;
    sounds.jump.play();
  }
});

// Initialize
document.getElementById("playButton").classList.add("hidden");

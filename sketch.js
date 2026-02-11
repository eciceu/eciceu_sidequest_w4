/*
GBDA 302 — Side Quest Week 4 (Celeste / Codenames)
Celeste-lite platformer using array-driven level generation.

Fixes included:
- ONLY tile 1 is solid (prevents spawn/goal being treated as walls)
- Safe spawn fallback if spawn tile missing or invalid
- Failsafe respawn if player becomes NaN/off-screen

Features:
- Start screen + Win screen
- 2 levels (bonus auto-load)
- Movement + gravity + jump + collisions
- Dash (SHIFT) 1 per airtime
- Spikes respawn
- Goal loads next level / win
- White HUD text
- Restart with R
*/

const TS = 32;

// TILE LEGEND:
// 0 = empty/air
// 1 = solid block (ONLY THIS IS SOLID)
// 2 = spikes
// 3 = goal
// 4 = spawn

const levels = [
  // ======================
  // LEVEL 1 (BIGGER)
  // ======================
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 2, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // LEVEL 2 (24 x 16) — more vertical platforming + spikes, beatable
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
];

let gameState = "start"; // "start" | "play" | "win"

let currentLevel = 0;
let grid = levels[currentLevel];

let spawn = { x: TS, y: TS };

let p = {
  x: 0,
  y: 0,
  w: 22,
  h: 26,
  vx: 0,
  vy: 0,
  speed: 3.0,
  jump: 9.5,
  gravity: 0.55,
  maxFall: 12,
  onGround: false,
  facing: 1,
  canDash: true,
  dashTimer: 0,
  dashTimeMax: 10,
  dashSpeed: 8.5,
};

let prevShift = false;
let prevSpace = false;

function setup() {
  createCanvas(grid[0].length * TS, grid.length * TS);
  noStroke();
  textFont("sans-serif");
  loadLevel(0);
}

function draw() {
  background(15);

  if (gameState === "start") {
    drawStartScreen();
    return;
  }
  if (gameState === "win") {
    drawWinScreen();
    return;
  }

  // failsafe: if player ever becomes invalid/offscreen, recover
  if (
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y) ||
    p.x < -TS ||
    p.x > width + TS ||
    p.y < -TS ||
    p.y > height + TS
  ) {
    forceSafeSpawn();
  }

  drawLevel();
  updatePlayer();
  drawPlayer();
  drawHUD();
}

/* -------------------------
   SCREENS + INPUT
--------------------------*/

function drawStartScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("CELESTE-LITE", width / 2, height / 2 - 50);

  textSize(16);
  text("Move: A/D or ←/→", width / 2, height / 2 + 10);
  text("Jump: SPACE   Dash: SHIFT", width / 2, height / 2 + 35);
  text("Press ENTER (or SPACE) to start", width / 2, height / 2 + 75);
}

function drawWinScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  text("YOU WIN!", width / 2, height / 2 - 30);

  textSize(16);
  text("You beat both levels.", width / 2, height / 2 + 10);
  text("Press R to restart", width / 2, height / 2 + 45);
}

function keyPressed() {
  if (gameState === "start" && (keyCode === ENTER || keyCode === 32)) {
    gameState = "play";
    return;
  }

  if (key === "r" || key === "R") {
    restartGame();
    return;
  }
}

function restartGame() {
  gameState = "start";
  loadLevel(0);
}

/* -------------------------
   LEVEL LOAD / SPAWN
--------------------------*/

function loadLevel(idx) {
  currentLevel = constrain(idx, 0, levels.length - 1);
  grid = levels[currentLevel];

  resizeCanvas(grid[0].length * TS, grid.length * TS);

  // find spawn tile (4)
  let foundSpawn = false;
  spawn = { x: TS, y: TS };

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 4) {
        foundSpawn = true;
        spawn.x = c * TS + (TS - p.w) / 2;
        spawn.y = r * TS + (TS - p.h);
      }
    }
  }

  // if spawn tile is missing, fall back to an empty tile
  if (!foundSpawn) {
    setSpawnToFirstEmpty();
  }

  // reset edge detection
  prevShift = keyIsDown(SHIFT);
  prevSpace = keyIsDown(32);

  respawn();

  // extra safety: if spawn is weird, force safe spawn
  if (
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y) ||
    p.x < 0 ||
    p.x > width ||
    p.y < 0 ||
    p.y > height
  ) {
    forceSafeSpawn();
  }
}

function setSpawnToFirstEmpty() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 0) {
        spawn.x = c * TS + (TS - p.w) / 2;
        spawn.y = r * TS + (TS - p.h);
        return;
      }
    }
  }
  // worst case
  spawn.x = TS;
  spawn.y = TS;
}

function respawn() {
  p.x = spawn.x;
  p.y = spawn.y;
  p.vx = 0;
  p.vy = 0;
  p.dashTimer = 0;
  p.canDash = true;
  p.onGround = false;

  p.x = constrain(p.x, 0, width - p.w);
  p.y = constrain(p.y, 0, height - p.h);
}

// used if player becomes invalid or offscreen
function forceSafeSpawn() {
  setSpawnToFirstEmpty();
  respawn();
}

/* -------------------------
   TILE HELPERS
--------------------------*/

function isSolid(t) {
  return t === 1;
} // ✅ crucial fix
function isSpike(t) {
  return t === 2;
}
function isGoal(t) {
  return t === 3;
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function getOverlappingSolidTiles(px, py, pw, ph) {
  const tiles = [];
  const left = floor(px / TS);
  const right = floor((px + pw) / TS);
  const top = floor(py / TS);
  const bottom = floor((py + ph) / TS);

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) {
        tiles.push({ x: c * TS, y: r * TS });
        continue;
      }
      const t = grid[r][c];
      if (isSolid(t)) tiles.push({ x: c * TS, y: r * TS });
    }
  }
  return tiles;
}

function touchingTileType(testFn) {
  const left = floor(p.x / TS);
  const right = floor((p.x + p.w) / TS);
  const top = floor(p.y / TS);
  const bottom = floor((p.y + p.h) / TS);

  for (let r = top; r <= bottom; r++) {
    for (let c = left; c <= right; c++) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) continue;
      const t = grid[r][c];
      if (!testFn(t)) continue;

      const tx = c * TS,
        ty = r * TS;
      if (rectsOverlap(p.x, p.y, p.w, p.h, tx, ty, TS, TS)) return true;
    }
  }
  return false;
}

/* -------------------------
   DRAW LEVEL (ARRAY + LOOPS)
--------------------------*/

function drawLevel() {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const t = grid[r][c];

      if (t === 1) fill(35, 70, 95);
      else fill(18);
      rect(c * TS, r * TS, TS, TS);

      if (t === 2) {
        fill(220, 70, 70);
        const x = c * TS,
          y = r * TS;
        triangle(x + 6, y + TS - 6, x + TS / 2, y + 6, x + TS - 6, y + TS - 6);
      }

      if (t === 3) {
        fill(80, 200, 120);
        rect(c * TS + 8, r * TS + 8, TS - 16, TS - 16, 6);
      }

      if (t === 4) {
        fill(120, 180, 255, 80);
        rect(c * TS + 10, r * TS + 10, TS - 20, TS - 20, 6);
      }
    }
  }
}

/* ------------------
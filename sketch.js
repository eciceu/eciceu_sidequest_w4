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

/* -------------------------
   PLAYER UPDATE
--------------------------*/

function updatePlayer() {
  const left = keyIsDown(LEFT_ARROW) || keyIsDown(65);
  const right = keyIsDown(RIGHT_ARROW) || keyIsDown(68);
  const jumpPressed = keyIsDown(32);
  const shiftPressed = keyIsDown(SHIFT);

  let move = 0;
  if (left) move -= 1;
  if (right) move += 1;
  if (move !== 0) p.facing = move;

  const dashJustPressed = shiftPressed && !prevShift;
  const jumpJustPressed = jumpPressed && !prevSpace;

  prevShift = shiftPressed;
  prevSpace = jumpPressed;

  // dash
  if (dashJustPressed && p.canDash) {
    p.canDash = false;
    p.dashTimer = p.dashTimeMax;

    let dir = p.facing;
    if (move !== 0) dir = move;

    p.vx = dir * p.dashSpeed;
    p.vy = 0;
  }

  if (p.dashTimer <= 0) {
    p.vx = move * p.speed;

    if (jumpJustPressed && p.onGround) {
      p.vy = -p.jump;
      p.onGround = false;
    }

    p.vy += p.gravity;
    p.vy = min(p.vy, p.maxFall);
  } else {
    p.dashTimer--;
    p.vx *= 0.98;
  }

  moveAndCollideX();
  moveAndCollideY();

  // spikes
  if (touchingTileType(isSpike)) {
    respawn();
    return;
  }

  // goal
  if (touchingTileType(isGoal)) {
    if (currentLevel < levels.length - 1) {
      loadLevel(currentLevel + 1);
      return;
    } else {
      gameState = "win";
      return;
    }
  }

  if (p.onGround) p.canDash = true;
}

function moveAndCollideX() {
  p.x += p.vx;

  const hits = getOverlappingSolidTiles(p.x, p.y, p.w, p.h);
  if (hits.length > 0) {
    if (p.vx > 0) {
      const minTileX = Math.min(...hits.map((h) => h.x));
      p.x = minTileX - p.w - 0.001;
    } else if (p.vx < 0) {
      const maxTileX = Math.max(...hits.map((h) => h.x + TS));
      p.x = maxTileX + 0.001;
    }
    p.vx = 0;
  }
}

function moveAndCollideY() {
  p.y += p.vy;
  p.onGround = false;

  const hits = getOverlappingSolidTiles(p.x, p.y, p.w, p.h);
  if (hits.length > 0) {
    if (p.vy > 0) {
      const minTileY = Math.min(...hits.map((h) => h.y));
      p.y = minTileY - p.h - 0.001;
      p.onGround = true;
    } else if (p.vy < 0) {
      const maxTileY = Math.max(...hits.map((h) => h.y + TS));
      p.y = maxTileY + 0.001;
    }
    p.vy = 0;
  }
}

/* -------------------------
   DRAW PLAYER + HUD
--------------------------*/

function drawPlayer() {
  if (p.dashTimer > 0) {
    fill(120, 180, 255, 120);
    rect(p.x - p.facing * 10, p.y + 4, p.w, p.h - 8, 6);
  }

  fill(120, 180, 255);
  rect(p.x, p.y, p.w, p.h, 6);

  fill(255);
  const eyeX = p.facing === 1 ? p.x + p.w - 7 : p.x + 4;
  rect(eyeX, p.y + 8, 3, 3);
}

function drawHUD() {
  fill(255);
  textAlign(LEFT, TOP);
  textSize(14);
  text(`Level: ${currentLevel + 1}/${levels.length}`, 10, 10);
  text(`Dash: ${p.canDash ? "READY" : "USED"}`, 10, 28);

  textAlign(LEFT, BOTTOM);
  text(
    "Move: A/D or ←/→ | Jump: SPACE | Dash: SHIFT | Restart: R",
    10,
    height - 10,
  );
}

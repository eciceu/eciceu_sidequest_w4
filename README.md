# Celeste-Lite Platformer  
Side Quest Week 4 – Array-Based Level Design  

---

## Group Number  
N/A (Individual Work)

---

## Description  

This project is a Celeste-inspired 2D platformer built using p5.js. The game uses nested arrays to generate tile-based levels, demonstrating how data structures can be used to drive environment design and game logic.

The player controls a small character (“blob”) that can:

- Move left and right  
- Jump  
- Perform a single mid-air dash  
- Restart the level  

The game contains two distinct levels. Level 1 emphasizes horizontal routing and maze-like traversal, while Level 2 introduces more vertical movement and spike hazards. Both levels are generated entirely through arrays and rendered using nested `for` loops.

Rather than hardcoding platforms manually, the map is constructed from tile values that define solid blocks, spikes, goal tiles, and spawn positions.

---

## Interaction Instructions  

**Move:**  
A / D or Left / Right Arrow  

**Jump:**  
Space  

**Dash:**  
Shift (one dash per airtime)  

**Restart:**  
R  

**Start Game:**  
Press Enter or Space  

Reach the green goal tile to advance to the next level. Avoid red spike tiles — touching them respawns the player at the level’s spawn point.

---

## Controls & Mechanics  

### Movement  
- Horizontal movement is controlled using keyboard input.  
- Gravity and fall speed are simulated using velocity variables.  
- Collision detection prevents the player from passing through solid tiles.  

### Jumping  
- Jumping is only allowed when the player is grounded.  
- Ground detection occurs through collision checks with solid tiles.  

### Dash  
- The player can dash once while airborne.  
- The dash resets when the player lands on the ground.  
- Dash temporarily overrides gravity and increases horizontal velocity.  

---

## Tile System  

The level layout is driven by a 2D array. Each number represents a tile type:


Nested loops iterate through the array and render tiles dynamically. This allows entire levels to be modified simply by changing the array values.

---

## Key Design Decisions  

- **Array-Driven Environment:**  
  All levels are generated using nested arrays and loops rather than manually placed shapes.  

- **Reusable Level Loader:**  
  A `loadLevel()` function handles resizing the canvas, locating the spawn tile, and resetting the player state.  

- **State-Based Structure:**  
  The game uses three states:  
  - `start`  
  - `play`  
  - `win`  

- **Beatable Level Design:**  
  Level 2 was iteratively adjusted to ensure it was challenging but reachable using the dash mechanic.  

---

## Development Process Highlights  

- Implemented tile rendering using nested loops.  
- Built collision detection based on tile coordinates.  
- Debugged spawn positioning when switching between levels.  
- Resolved keyboard input issues by reverting to a stable control system.  
- Iteratively redesigned Level 2 to ensure fair difficulty.  
- Expanded both arrays to better fill the screen and differentiate level structure.  

---

## What I Learned  

- How arrays can drive spatial layout in interactive systems.  
- The importance of separating mechanics from level data.  
- How small changes in tile placement drastically affect playability.  
- The importance of iterative debugging and playtesting.  

---

## Future Improvements  

If expanded further, this project could include:  

- Vertical dash (true Celeste-style)  
- Wall jumping  
- Camera scrolling for larger levels  
- Moving platforms  
- Particle effects or sound design  
- More complex hazard patterns  

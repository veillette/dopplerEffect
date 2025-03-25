// Doppler Effect Simulation in P5.js
// This simulation demonstrates the Doppler effect with:
// - Moving source or observer (controlled by mouse)
// - Visualization of circular waves
// - Graphs showing emitted and observed frequencies/sounds
// - Physically accurate wave propagation and frequency calculations
// - Smooth phase transitions for realistic waveform visualization

// PHYSICAL CONSTANTS (SI UNITS)
const CONSTANTS = {
  // Physical constants in SI units
  PHYSICS: {
    SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
    METERS_TO_PIXELS: 1, // Conversion factor (pixels per meter)
    PIXELS_TO_METERS: 1, // Inverse conversion factor (meters per pixel) --- SEE ABOVE
    REAL_TIME_FACTOR: 0.5, // Slows down real-time for better visualization
    EMITTED_FREQ: 4, // Base frequency of emitted sound (Hz)
    FREQ_MIN: 0.1, // Minimum allowable frequency (Hz)
    FREQ_MAX_FACTOR: 5, // Maximum frequency as factor of emitted
    FREQ_SMOOTHING: 0.5, // Smoothing factor for frequency transitions
    FREQ_CHANGE_THRESHOLD: 0.001, // Threshold for frequency updates
    VELOCITY_DECAY: 0.5, // Decay factor for velocity when not dragging
    MIN_VELOCITY_MAG: 0.01, // Minimum velocity magnitude to display vector (m/s)
    TIME_STEP_MAX: 0.05, // Maximum time step (seconds) to prevent jumps
  },

  // Wave visualization properties
  WAVE: {
    MAX_AGE: 10, // Maximum age of a wave in seconds
    STROKE_WEIGHT: 2, // Line thickness for wave circles
    OPACITY_MAX: 150, // Maximum opacity for wave visualization
    OPACITY_MIN: 0, // Minimum opacity for wave visualization
  },

  // UI properties (in pixels for display)
  UI: {
    SOURCE_RADIUS: 10, // Radius of the source circle (pixels)
    OBSERVER_RADIUS: 10, // Radius of the observer circle (pixels)
    VELOCITY_SMOOTHING: 0.01, // Lower value = more smoothing
    VECTOR_SCALE: 0.2, // Scale factor for velocity vectors
    VELOCITY_STROKE_WEIGHT: 2, // Line thickness for velocity vectors
    ARROWHEAD_SIZE: 5, // Size of velocity vector arrowheads
    ARROWHEAD_LENGTH: 10, // Length of arrowhead
    CONNECTING_LINE_WEIGHT: 1, // Weight of line connecting source and observer
    SOURCE_COLOR: [255, 0, 0], // RGB color for source
    OBSERVER_COLOR: [0, 128, 0], // RGB color for observer
    CONNECTING_LINE_COLOR: [100, 100, 100], // RGB color for connecting line
    WAVE_COLOR: [0, 0, 255], // RGB color for waves
    BACKGROUND_COLOR: [240, 240, 240], // RGB color for background
    SELECTION_COLOR: [255, 0, 255], // RGB color for selection highlight
  },

  // Graph properties
  GRAPH: {
    HEIGHT: 100, // Height of frequency graphs
    WIDTH: 300, // Width of frequency graphs
    MARGIN: 20, // Margin for graphs from edge
    SPACING: 10, // Spacing between graphs
    SPACING_FACTOR: 4, // Multiplier for spacing between graphs
    HISTORY_LENGTH: 200, // Length of graph history
    AMPLITUDE: 30, // Amplitude of waveform in graphs
    BACKGROUND_COLOR: [250, 250, 250], // RGB for graph background
    GRID_COLOR: [200, 200, 200], // RGB for graph grid lines
    BORDER_WEIGHT: 1, // Weight of graph border
    WAVE_WEIGHT: 2, // Weight of waveform line
    TEXT_PADDING_X: 5, // X padding for text in graph
    TEXT_PADDING_Y: 15, // Y padding for text in graph
    TEXT_RIGHT_MARGIN: 150, // Right margin for text in graphs
  },

  // Text properties
  TEXT: {
    FONT_SIZE_SMALL: 12, // Small font size for graph titles
    FONT_SIZE_NORMAL: 14, // Normal font size for instructions
    TEXT_COLOR: [0, 0, 0], // RGB for normal text
  sourceVel = createVector(0, 0); // Stationary
  observerVel = createVector(-5, 0); // Move left (toward source) at 5 m/s
  sourceMoving = false;
  observerMoving = true;
}

function setupScenario3() {
  // Source and observer moving away (in m/s)
  resetSimulation();
  sourceVel = createVector(-5, 0); // Move left at 5 m/s
  observerVel = createVector(5, 0); // Move right at 5 m/s
  sourceMoving = true;
  observerMoving = true;
}

function setupScenario4() {
  // Source and observer moving perpendicular (in m/s)
  resetSimulation();
  sourceVel = createVector(0, 3); // Move down at 3 m/s
  observerVel = createVector(0, -3); // Move up at 3 m/s
  sourceMoving = true;
  observerMoving = true;
}

function handleKeyboardNavigation(dt) {
  // Only process navigation if not paused
  if (isPaused) return;

  let targetPos, targetVel;

  // Determine which object to control
  if (selectedObject === "source") {
    targetPos = sourcePos;
    targetVel = sourceVel;
  } else {
    targetPos = observerPos;
    targetVel = observerVel;
  }

  // Move the selected object with arrow keys (in m/s)
  if (keyIsDown(LEFT_ARROW)) {
    targetPos.x -= CONSTANTS.KEYBOARD.MOVE_STEP * dt;
    targetVel.x = -CONSTANTS.KEYBOARD.MOVE_STEP; // Set velocity for visual feedback
    if (selectedObject === "source") {
      sourceMoving = true;
    } else {
      observerMoving = true;
    }
  } else if (keyIsDown(RIGHT_ARROW)) {
    targetPos.x += CONSTANTS.KEYBOARD.MOVE_STEP * dt;
    targetVel.x = CONSTANTS.KEYBOARD.MOVE_STEP;
    if (selectedObject === "source") {
      sourceMoving = true;
    } else {
      observerMoving = true;
    }
  } else {
    targetVel.x = 0;
  }

  if (keyIsDown(UP_ARROW)) {
    targetPos.y -= CONSTANTS.KEYBOARD.MOVE_STEP * dt;
    targetVel.y = -CONSTANTS.KEYBOARD.MOVE_STEP;
    if (selectedObject === "source") {
      sourceMoving = true;
    } else {
      observerMoving = true;
    }
  } else if (keyIsDown(DOWN_ARROW)) {
    targetPos.y += CONSTANTS.KEYBOARD.MOVE_STEP * dt;
    targetVel.y = CONSTANTS.KEYBOARD.MOVE_STEP;
    if (selectedObject === "source") {
      sourceMoving = true;
    } else {
      observerMoving = true;
    }
  } else {
    targetVel.y = 0;
  }

  // Adjust emitted frequency with '+' and '-' keys (in Hz)
  if (keyIsDown(187)) {
    // '+' key
    CONSTANTS.PHYSICS.EMITTED_FREQ += CONSTANTS.KEYBOARD.EMITTED_FREQ_STEP;
  } else if (keyIsDown(189)) {
    // '-' key
    CONSTANTS.PHYSICS.EMITTED_FREQ = max(
      CONSTANTS.KEYBOARD.EMITTED_FREQ_STEP,
      CONSTANTS.PHYSICS.EMITTED_FREQ - CONSTANTS.KEYBOARD.EMITTED_FREQ_STEP
    );
  }

  // Adjust sound speed with '.' and ',' keys (in m/s)
  if (keyIsDown(190)) {
    // '.' key
    CONSTANTS.PHYSICS.SOUND_SPEED += CONSTANTS.KEYBOARD.SOUND_SPEED_STEP;
  } else if (keyIsDown(188)) {
    // ',' key
    CONSTANTS.PHYSICS.SOUND_SPEED = max(
      CONSTANTS.KEYBOARD.SOUND_SPEED_STEP,
      CONSTANTS.PHYSICS.SOUND_SPEED - CONSTANTS.KEYBOARD.SOUND_SPEED_STEP
    );
  }
}

function drawGraph(x, y, w, h, data, title, col) {
  // Draw graph background
  fill(CONSTANTS.GRAPH.BACKGROUND_COLOR);
  stroke(CONSTANTS.GRAPH.GRID_COLOR);
  strokeWeight(CONSTANTS.GRAPH.BORDER_WEIGHT);
  rect(x, y, w, h);

  // Draw horizontal center line
  stroke(CONSTANTS.GRAPH.GRID_COLOR);
  line(x, y + h / 2, x + w, y + h / 2);

  // Draw the waveform
  stroke(col);
  strokeWeight(CONSTANTS.GRAPH.WAVE_WEIGHT);
  noFill();
  beginShape();
  for (let i = 0; i < data.length; i++) {
    let xPos = x + (i * w) / data.length;
    let yPos = y + h / 2 - data[i];
    vertex(xPos, yPos);
  }
  endShape();

  // Draw title
  fill(CONSTANTS.TEXT.TEXT_COLOR);
  noStroke();
  textAlign(LEFT);
  textSize(CONSTANTS.TEXT.FONT_SIZE_SMALL);
  text(
    title,
    x + CONSTANTS.GRAPH.TEXT_PADDING_X,
    y + CONSTANTS.GRAPH.TEXT_PADDING_Y
  );
}

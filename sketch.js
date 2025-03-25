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
    REDSHIFT_COLOR: [255, 0, 0], // RGB for redshift text
    BLUESHIFT_COLOR: [0, 0, 255], // RGB for blueshift text
    INSTRUCTION_X: 15, // X position for instruction text
    INSTRUCTION_Y1: 40, // Y position for first instruction line
    INSTRUCTION_Y2: 60, // Y position for second instruction line
  },

  // Keyboard properties
  KEYBOARD: {
    MOVE_STEP: 0.2, // Speed of keyboard movement (m/s)
    SOUND_SPEED_STEP: 1.0, // Step size for sound speed adjustment (m/s)
    EMITTED_FREQ_STEP: 0.01, // Step size for frequency adjustment (Hz)
    TOGGLE_PAUSE: 32, // Space bar
    RESET_KEY: 82, // 'R' key
    SOURCE_SELECT: 83, // 'S' key
    OBSERVER_SELECT: 79, // 'O' key
    HELP_TOGGLE: 72, // 'H' key
    NUMBER_1: 49, // '1' key
    NUMBER_2: 50, // '2' key
    NUMBER_3: 51, // '3' key
    NUMBER_4: 52, // '4' key
  },
};

// State variables
let waves = []; // Array to store waves with source velocity info
let sourcePos; // Position of sound source (in meters)
let observerPos; // Position of observer (in meters)
let sourceVel; // Velocity of sound source (in m/s)
let observerVel; // Velocity of observer (in m/s)
let prevSourcePos; // Previous position of source (in meters)
let prevObserverPos; // Previous position of observer (in meters)
let lastWaveTime = 0; // Time since last wave was created (in seconds)
let observedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ; // Frequency observed by observer (Hz)
let smoothedObservedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ; // Smoothed version for transitions
let emittedSoundData = []; // Data for emitted sound graph
let observedSoundData = []; // Data for observed sound graph
let draggingSource = false; // Flag for when source is being dragged
let draggingObserver = false; // Flag for when observer is being dragged
let emittedPhase = 0; // Phase accumulator for emitted sound
let observedPhase = 0; // Phase accumulator for observed sound
let lastFrameTime = 0; // Time of last frame for delta time calculation (in seconds)
let simulationTime = 0; // Total simulation time (in seconds)
let sourceMoving = false; // Flag for source moving by script
let observerMoving = false; // Flag for observer moving by script
let selectedObject = "source"; // 'source' or 'observer'
let isPaused = false;
let showHelp = true;

/**
 * Initializes all colors in the CONSTANTS object as p5.js color objects
 * Must be called in setup() after p5.js is initialized
 */
function initializeColors() {
  // Convert all RGB arrays in CONSTANTS to p5.js color objects
  CONSTANTS.UI.SOURCE_COLOR = color(CONSTANTS.UI.SOURCE_COLOR[0], CONSTANTS.UI.SOURCE_COLOR[1], CONSTANTS.UI.SOURCE_COLOR[2]);
  CONSTANTS.UI.OBSERVER_COLOR = color(CONSTANTS.UI.OBSERVER_COLOR[0], CONSTANTS.UI.OBSERVER_COLOR[1], CONSTANTS.UI.OBSERVER_COLOR[2]);
  CONSTANTS.UI.CONNECTING_LINE_COLOR = color(CONSTANTS.UI.CONNECTING_LINE_COLOR[0], CONSTANTS.UI.CONNECTING_LINE_COLOR[1], CONSTANTS.UI.CONNECTING_LINE_COLOR[2]);
  CONSTANTS.UI.WAVE_COLOR = color(CONSTANTS.UI.WAVE_COLOR[0], CONSTANTS.UI.WAVE_COLOR[1], CONSTANTS.UI.WAVE_COLOR[2]);
  CONSTANTS.UI.BACKGROUND_COLOR = color(CONSTANTS.UI.BACKGROUND_COLOR[0], CONSTANTS.UI.BACKGROUND_COLOR[1], CONSTANTS.UI.BACKGROUND_COLOR[2]);
  CONSTANTS.UI.SELECTION_COLOR = color(CONSTANTS.UI.SELECTION_COLOR[0], CONSTANTS.UI.SELECTION_COLOR[1], CONSTANTS.UI.SELECTION_COLOR[2]);
  
  CONSTANTS.GRAPH.BACKGROUND_COLOR = color(CONSTANTS.GRAPH.BACKGROUND_COLOR[0], CONSTANTS.GRAPH.BACKGROUND_COLOR[1], CONSTANTS.GRAPH.BACKGROUND_COLOR[2]);
  CONSTANTS.GRAPH.GRID_COLOR = color(CONSTANTS.GRAPH.GRID_COLOR[0], CONSTANTS.GRAPH.GRID_COLOR[1], CONSTANTS.GRAPH.GRID_COLOR[2]);
  
  CONSTANTS.TEXT.TEXT_COLOR = color(CONSTANTS.TEXT.TEXT_COLOR[0], CONSTANTS.TEXT.TEXT_COLOR[1], CONSTANTS.TEXT.TEXT_COLOR[2]);
  CONSTANTS.TEXT.REDSHIFT_COLOR = color(CONSTANTS.TEXT.REDSHIFT_COLOR[0], CONSTANTS.TEXT.REDSHIFT_COLOR[1], CONSTANTS.TEXT.REDSHIFT_COLOR[2]);
  CONSTANTS.TEXT.BLUESHIFT_COLOR = color(CONSTANTS.TEXT.BLUESHIFT_COLOR[0], CONSTANTS.TEXT.BLUESHIFT_COLOR[1], CONSTANTS.TEXT.BLUESHIFT_COLOR[2]);
}

/**
 * Creates a new color with the same RGB values as the input color but with a specified alpha
 * @param {p5.Color} inputColor - Original p5.js color object
 * @param {Number} alpha - Alpha value (0-255)
 * @returns {p5.Color} - New color with specified alpha
 */
function colorWithAlpha(inputColor, alpha) {
  return color(red(inputColor), green(inputColor), blue(inputColor), alpha);
}

function setup() {
  createCanvas(800, 600);

  // Initialize all colors
  initializeColors();

  // Initialize positions in meters (convert from pixels)
  sourcePos = createVector(
    (width / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
    (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
  );
  observerPos = createVector(
    ((3 * width) / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
    (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
  );

  // Initialize velocities in m/s
  sourceVel = createVector(0, 0);
  observerVel = createVector(0, 0);

  // Store previous positions
  prevSourcePos = sourcePos.copy();
  prevObserverPos = observerPos.copy();

  // Initialize sound data arrays
  for (let i = 0; i < CONSTANTS.GRAPH.HISTORY_LENGTH; i++) {
    emittedSoundData.push(0);
    observedSoundData.push(0);
  }

  // Initialize last frame time (in seconds)
  lastFrameTime = millis() / 1000;
}

function draw() {
  background(CONSTANTS.UI.BACKGROUND_COLOR);

  // Calculate delta time for smooth, frame-rate independent animations (in seconds)
  let currentTime = millis() / 1000;
  let dt = (currentTime - lastFrameTime) * CONSTANTS.PHYSICS.REAL_TIME_FACTOR;
  lastFrameTime = currentTime;

  // Clamp dt to reasonable values to prevent jumps
  dt = constrain(dt, 0, CONSTANTS.PHYSICS.TIME_STEP_MAX);

  if (!isPaused) {
    // Update simulation time
    simulationTime += dt;

    // Handle keyboard navigation
    handleKeyboardNavigation(dt);

    // Define target positions (in meters)
    let targetSourcePos = sourcePos.copy();
    let targetObserverPos = observerPos.copy();

    // Check for mouse interactions
    if (mouseIsPressed) {
      // Convert mouse position to meters
      let mouseXMeters = mouseX * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
      let mouseYMeters = mouseY * CONSTANTS.PHYSICS.PIXELS_TO_METERS;

      // Calculate distances to source and observer (in meters)
      let distToSource = dist(
        mouseXMeters,
        mouseYMeters,
        sourcePos.x,
        sourcePos.y
      );

      let distToObserver = dist(
        mouseXMeters,
        mouseYMeters,
        observerPos.x,
        observerPos.y
      );

      // Source radius in meters
      let sourceRadiusMeters =
        CONSTANTS.UI.SOURCE_RADIUS * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
      let observerRadiusMeters =
        CONSTANTS.UI.OBSERVER_RADIUS * CONSTANTS.PHYSICS.PIXELS_TO_METERS;

      // Determine which object to move based on initial click
      if (!draggingSource && !draggingObserver) {
        if (distToSource < sourceRadiusMeters) {
          draggingSource = true;
        } else if (distToObserver < observerRadiusMeters) {
          draggingObserver = true;
        }
      }

      // Set target positions based on mouse (in meters)
      if (draggingSource) {
        targetSourcePos.set(mouseXMeters, mouseYMeters);
      } else if (draggingObserver) {
        targetObserverPos.set(mouseXMeters, mouseYMeters);
      }
    } else {
      // Reset dragging flags when mouse is released
      draggingSource = false;
      draggingObserver = false;
    }

    // Handle source movement (in meters)
    if (draggingSource) {
      // Store previous position for velocity calculation
      prevSourcePos = sourcePos.copy();

      // Move towards target with smoothing
      sourcePos.x +=
        (targetSourcePos.x - sourcePos.x) * CONSTANTS.UI.VELOCITY_SMOOTHING;
      sourcePos.y +=
        (targetSourcePos.y - sourcePos.y) * CONSTANTS.UI.VELOCITY_SMOOTHING;

      // Calculate smoothed velocity (in m/s)
      sourceVel = p5.Vector.sub(sourcePos, prevSourcePos);
      sourceVel.div(dt); // Scale by dt to get true velocity

      // Set moving flag to false since we're now dragging
      sourceMoving = false;
    } else if (sourceMoving) {
      // Update position based on current velocity (in meters)
      prevSourcePos = sourcePos.copy();
      sourcePos.add(p5.Vector.mult(sourceVel, dt));

      // Check if velocity is too small and stop movement if needed
      if (sourceVel.mag() < CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
        sourceMoving = false;
      }
    } else {
      // Gradually reduce velocity when not dragging or moving
      sourceVel.mult(CONSTANTS.PHYSICS.VELOCITY_DECAY);
    }

    // Handle observer movement (in meters)
    if (draggingObserver) {
      // Store previous position for velocity calculation
      prevObserverPos = observerPos.copy();

      // Move towards target with smoothing
      observerPos.x +=
        (targetObserverPos.x - observerPos.x) * CONSTANTS.UI.VELOCITY_SMOOTHING;
      observerPos.y +=
        (targetObserverPos.y - observerPos.y) * CONSTANTS.UI.VELOCITY_SMOOTHING;

      // Calculate smoothed velocity (in m/s)
      observerVel = p5.Vector.sub(observerPos, prevObserverPos);
      observerVel.div(dt); // Scale by dt to get true velocity

      // Set moving flag to false since we're now dragging
      observerMoving = false;
    } else if (observerMoving) {
      // Update position based on current velocity (in meters)
      prevObserverPos = observerPos.copy();
      observerPos.add(p5.Vector.mult(observerVel, dt));

      // Check if velocity is too small and stop movement if needed
      if (observerVel.mag() < CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
        observerMoving = false;
      }
    } else {
      // Gradually reduce velocity when not dragging or moving
      observerVel.mult(CONSTANTS.PHYSICS.VELOCITY_DECAY);
    }

    // Generate new wave at intervals based on emitted frequency
    let waveInterval = 1.0 / CONSTANTS.PHYSICS.EMITTED_FREQ; // in seconds
    if (simulationTime - lastWaveTime > waveInterval) {
      waves.push({
        pos: sourcePos.copy(), // Position in meters
        radius: 0, // Radius in meters
        birthTime: simulationTime, // Birth time in seconds
        sourceVel: sourceVel.copy(), // Source velocity in m/s
        sourceFreq: CONSTANTS.PHYSICS.EMITTED_FREQ, // Emitted frequency in Hz
        phaseAtEmission: emittedPhase, // Phase at emission time
      });
      lastWaveTime = simulationTime;
    }

    // Calculate Doppler effect
    calculateDopplerEffect(dt);
  }

  // Always update and display waves
  updateAndDisplayWaves();

  // Draw source and observer
  drawSourceAndObserver();

  // Draw graphs
  drawGraphs();

  // Display instructions
  displayInstructions();

  // Display simulation status
  displaySimulationStatus();
}

function updateAndDisplayWaves() {
  // Update wave radii and draw them
  for (let i = waves.length - 1; i >= 0; i--) {
    let wave = waves[i];

    // Calculate time since wave creation (in seconds)
    let age = simulationTime - wave.birthTime;

    // Update radius based on age and sound speed (in meters)
    wave.radius = age * CONSTANTS.PHYSICS.SOUND_SPEED;

    // Calculate opacity based on age (fade out with age)
    let opacity =
      CONSTANTS.WAVE.OPACITY_MAX -
      (age * CONSTANTS.WAVE.OPACITY_MAX) / CONSTANTS.WAVE.MAX_AGE;
    opacity = constrain(
      opacity,
      CONSTANTS.WAVE.OPACITY_MIN,
      CONSTANTS.WAVE.OPACITY_MAX
    );

    // Draw the wave as a circle (convert from meters to pixels for display)
    let radiusPixels = wave.radius * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    let posXPixels = wave.pos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    let posYPixels = wave.pos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;

    noFill();
    // Apply opacity to wave color using our utility function
    stroke(colorWithAlpha(CONSTANTS.UI.WAVE_COLOR, opacity));
    strokeWeight(CONSTANTS.WAVE.STROKE_WEIGHT);
    circle(posXPixels, posYPixels, radiusPixels * 2);

    // Remove waves that are too old or too large
    let maxRadius = max(width, height) * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
    if (age > CONSTANTS.WAVE.MAX_AGE || wave.radius > maxRadius) {
      waves.splice(i, 1);
    }
  }
}

function calculateDopplerEffect(dt) {
  // Accumulate emitted phase (this is always at the base frequency)
  emittedPhase += CONSTANTS.PHYSICS.EMITTED_FREQ * dt * TWO_PI;

  // Update emitted waveform data
  emittedSoundData.push(sin(emittedPhase) * CONSTANTS.GRAPH.AMPLITUDE);
  emittedSoundData.shift();

  // Find the wave currently affecting the observer
  let wavesAtObserver = [];

  for (let wave of waves) {
    // Distance in meters
    let distToObserver = p5.Vector.dist(wave.pos, observerPos);

    // Check if this wave has reached the observer
    if (wave.radius >= distToObserver) {
      // Calculate the time when this wave reached the observer (in seconds)
      let travelTime = distToObserver / CONSTANTS.PHYSICS.SOUND_SPEED;
      let arrivalTime = wave.birthTime + travelTime;

      wavesAtObserver.push({
        wave: wave,
        arrivalTime: arrivalTime,
      });
    }
  }

  // If no waves have reached the observer yet, set amplitude to zero
  if (wavesAtObserver.length === 0) {
    observedSoundData.push(0);
    observedSoundData.shift();
    return;
  }

  // Sort by arrival time (most recent first)
  wavesAtObserver.sort((a, b) => b.arrivalTime - a.arrivalTime);

  // Use the most recently arrived wave
  let currentWave = wavesAtObserver[0].wave;
  let arrivalTime = wavesAtObserver[0].arrivalTime;

  // Calculate how much time has passed since this wave arrived (in seconds)
  let timeSinceArrival = simulationTime - arrivalTime;

  // Set the observed phase based on the original wave's phase at emission
  // plus the phase accumulated since the wave arrived at the observer
  let phaseAtArrival = currentWave.phaseAtEmission;

  // Calculate the Doppler shifted frequency
  let dopplerFrequency = calculateApparentDopplerEffect(currentWave);

  // Store the smoothed frequency
  smoothedObservedFreq = calculateObserverDopplerEffect(currentWave);

  // Calculate additional phase based on observed frequency
  let additionalPhase = timeSinceArrival * dopplerFrequency * TWO_PI;
  observedPhase = phaseAtArrival + additionalPhase;

  // Update observed waveform data with actual wave amplitude
  observedSoundData.push(sin(observedPhase) * CONSTANTS.GRAPH.AMPLITUDE);
  observedSoundData.shift();
}

function calculateObserverDopplerEffect(currentWave) {
  // Calculate unit vector from source to observer (dimensionless)
  let directionVector = p5.Vector.sub(observerPos, currentWave.pos).normalize();

  // Calculate dot product of source velocity and direction vector (in m/s)
  let sourceVelocityComponent = p5.Vector.dot(
    currentWave.sourceVel,
    directionVector
  );

  // Calculate dot product of observer velocity and direction vector (in m/s)
  let observerVelocityComponent = p5.Vector.dot(observerVel, directionVector);

  // Calculate observed frequency using the Doppler formula (in Hz)
  // f' = f * (v - vo)/(v - vs)
  // Where f is emitted frequency, v is speed of sound,
  // vo is observer velocity component, vs is source velocity component
  let observedFreq =
    (currentWave.sourceFreq *
      (CONSTANTS.PHYSICS.SOUND_SPEED - observerVelocityComponent)) /
    (CONSTANTS.PHYSICS.SOUND_SPEED - sourceVelocityComponent);

  // Constrain to reasonable limits
  observedFreq = constrain(
    observedFreq,
    CONSTANTS.PHYSICS.FREQ_MIN,
    currentWave.sourceFreq * CONSTANTS.PHYSICS.FREQ_MAX_FACTOR
  );

  return observedFreq;
}

function calculateApparentDopplerEffect(currentWave) {
  // Calculate unit vector from source to observer (dimensionless)
  let directionVector = p5.Vector.sub(observerPos, currentWave.pos).normalize();

  // Calculate dot product of source velocity and direction vector (in m/s)
  let sourceVelocityComponent = p5.Vector.dot(
    currentWave.sourceVel,
    directionVector
  );

  observedFreq =
    (currentWave.sourceFreq * CONSTANTS.PHYSICS.SOUND_SPEED) /
    (CONSTANTS.PHYSICS.SOUND_SPEED - sourceVelocityComponent);

  // Constrain to reasonable limits
  observedFreq = constrain(
    observedFreq,
    CONSTANTS.PHYSICS.FREQ_MIN,
    currentWave.sourceFreq * CONSTANTS.PHYSICS.FREQ_MAX_FACTOR
  );

  return observedFreq;
}

function drawSourceAndObserver() {
  // Convert meters to pixels for display
  let sourcePosX = sourcePos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
  let sourcePosY = sourcePos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
  let observerPosX = observerPos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
  let observerPosY = observerPos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;

  // Draw source
  fill(CONSTANTS.UI.SOURCE_COLOR);
  noStroke();
  ellipse(
    sourcePosX,
    sourcePosY,
    CONSTANTS.UI.SOURCE_RADIUS * 2,
    CONSTANTS.UI.SOURCE_RADIUS * 2
  );

  // Draw velocity vector for source
  if (sourceVel.mag() > CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
    drawVelocityVector(
      createVector(sourcePosX, sourcePosY),
      sourceVel,
      CONSTANTS.UI.SOURCE_COLOR
    );
  }

  // Draw observer
  fill(CONSTANTS.UI.OBSERVER_COLOR);
  noStroke();
  ellipse(
    observerPosX,
    observerPosY,
    CONSTANTS.UI.OBSERVER_RADIUS * 2,
    CONSTANTS.UI.OBSERVER_RADIUS * 2
  );

  // Draw velocity vector for observer
  if (observerVel.mag() > CONSTANTS.PHYSICS.MIN_VELOCITY_MAG) {
    drawVelocityVector(
      createVector(observerPosX, observerPosY),
      observerVel,
      CONSTANTS.UI.OBSERVER_COLOR
    );
  }

  // Draw line connecting source and observer
  stroke(CONSTANTS.UI.CONNECTING_LINE_COLOR);
  strokeWeight(CONSTANTS.UI.CONNECTING_LINE_WEIGHT);
  line(sourcePosX, sourcePosY, observerPosX, observerPosY);

  // Highlight the currently selected object
  strokeWeight(2);
  stroke(CONSTANTS.UI.SELECTION_COLOR);
  noFill();
  if (selectedObject === "source") {
    circle(sourcePosX, sourcePosY, CONSTANTS.UI.SOURCE_RADIUS * 2 + 10);
  } else {
    circle(observerPosX, observerPosY, CONSTANTS.UI.OBSERVER_RADIUS * 2 + 10);
  }
}

function drawVelocityVector(pixelPos, velocityVector, col) {
  // Display velocity vector (scale for visibility)
  // Note: velocityVector is in m/s, we need to scale it to pixels
  let scaledVel = velocityVector.copy().mult(CONSTANTS.UI.VECTOR_SCALE);

  stroke(col);
  strokeWeight(CONSTANTS.UI.VELOCITY_STROKE_WEIGHT);
  line(
    pixelPos.x,
    pixelPos.y,
    pixelPos.x + scaledVel.x,
    pixelPos.y + scaledVel.y
  );

  // Draw arrowhead
  push();
  translate(pixelPos.x + scaledVel.x, pixelPos.y + scaledVel.y);
  rotate(scaledVel.heading());
  triangle(
    0,
    0,
    -CONSTANTS.UI.ARROWHEAD_LENGTH,
    CONSTANTS.UI.ARROWHEAD_SIZE,
    -CONSTANTS.UI.ARROWHEAD_LENGTH,
    -CONSTANTS.UI.ARROWHEAD_SIZE
  );
  pop();
}

function drawGraphs() {
  // Set up graph area
  let graphY1 = 30;
  let graphY2 =
    graphY1 +
    CONSTANTS.GRAPH.HEIGHT +
    CONSTANTS.GRAPH.SPACING_FACTOR * CONSTANTS.GRAPH.SPACING;
  let graphX = width - CONSTANTS.GRAPH.WIDTH - CONSTANTS.GRAPH.MARGIN;

  // Draw emitted sound graph
  drawGraph(
    graphX,
    graphY1,
    CONSTANTS.GRAPH.WIDTH,
    CONSTANTS.GRAPH.HEIGHT,
    emittedSoundData,
    "Emitted Sound",
    CONSTANTS.UI.SOURCE_COLOR
  );

  // Draw observed sound graph
  drawGraph(
    graphX,
    graphY2,
    CONSTANTS.GRAPH.WIDTH,
    CONSTANTS.GRAPH.HEIGHT,
    observedSoundData,
    "Observed Sound",
    CONSTANTS.UI.OBSERVER_COLOR
  );

  // Display frequency values
  fill(CONSTANTS.TEXT.TEXT_COLOR);
  noStroke();
  textAlign(LEFT);
  textSize(CONSTANTS.TEXT.FONT_SIZE_NORMAL);
  text(
    `Emitted Freq.: ${CONSTANTS.PHYSICS.EMITTED_FREQ.toFixed(2)} Hz`,
    graphX,
    graphY1 - 10
  );
  text(
    `Observed Freq.: ${smoothedObservedFreq.toFixed(2)} Hz`,
    graphX,
    graphY2 - 10
  );

  // Display if sound is blueshifted or redshifted
  if (smoothedObservedFreq > CONSTANTS.PHYSICS.EMITTED_FREQ) {
    fill(CONSTANTS.TEXT.BLUESHIFT_COLOR);
    text(
      "Blueshifted (approaching)",
      graphX + CONSTANTS.GRAPH.WIDTH - CONSTANTS.GRAPH.TEXT_RIGHT_MARGIN,
      graphY2 - 10
    );
  } else if (smoothedObservedFreq < CONSTANTS.PHYSICS.EMITTED_FREQ) {
    fill(CONSTANTS.TEXT.REDSHIFT_COLOR);
    text(
      "Redshifted (receding)",
      graphX + CONSTANTS.GRAPH.WIDTH - CONSTANTS.GRAPH.TEXT_RIGHT_MARGIN,
      graphY2 - 10
    );
  }
}

function displayInstructions() {
  if (!showHelp) return;

  fill(CONSTANTS.TEXT.TEXT_COLOR);
  noStroke();
  textAlign(LEFT);
  textSize(CONSTANTS.TEXT.FONT_SIZE_NORMAL);

  let instructY = CONSTANTS.TEXT.INSTRUCTION_Y1;
  let lineHeight = CONSTANTS.TEXT.FONT_SIZE_NORMAL * 1.5;

  // Basic instructions
  text(
    "Click and drag source (red) or observer (green) to move them",
    CONSTANTS.TEXT.INSTRUCTION_X,
    instructY
  );
  instructY += lineHeight;

  // Keyboard controls
  text("Keyboard Controls:", CONSTANTS.TEXT.INSTRUCTION_X, instructY);
  instructY += lineHeight;

  text(
    "S: Select source | O: Select observer | Arrow keys: Move selected object",
    CONSTANTS.TEXT.INSTRUCTION_X + 10,
    instructY
  );
  instructY += lineHeight;

  text(
    "Space: Pause/Resume | R: Reset | H: Toggle help",
    CONSTANTS.TEXT.INSTRUCTION_X + 10,
    instructY
  );
  instructY += lineHeight;

  text(
    "+/-: Adjust emitted frequency | ,/.: Adjust sound speed",
    CONSTANTS.TEXT.INSTRUCTION_X + 10,
    instructY
  );
  instructY += lineHeight;

  text(
    "1-4: Load preset scenarios (1: approaching source, 2: approaching observer, etc.)",
    CONSTANTS.TEXT.INSTRUCTION_X + 10,
    instructY
  );
  instructY += lineHeight;
}

function displaySimulationStatus() {
  fill(CONSTANTS.TEXT.TEXT_COLOR);
  noStroke();
  textAlign(LEFT);
  textSize(CONSTANTS.TEXT.FONT_SIZE_NORMAL);

  // Display pause status
  if (isPaused) {
    fill(color(255, 0, 0)); // Red for pause
    text("PAUSED", 15, height - 15);
  }

  // Display selected object
  fill(CONSTANTS.UI.SELECTION_COLOR);
  text(
    "Selected: " + (selectedObject === "source" ? "Source" : "Observer"),
    120,
    height - 15
  );

  // Display current parameters
  fill(CONSTANTS.TEXT.TEXT_COLOR);
  text(
    `Sound Speed: ${CONSTANTS.PHYSICS.SOUND_SPEED.toFixed(2)} m/s`,
    300,
    height - 15
  );
  text(
    `Wave Interval: ${(1000 / CONSTANTS.PHYSICS.EMITTED_FREQ).toFixed(0)}ms`,
    500,
    height - 15
  );
}

function keyPressed() {
  // Toggle pause with spacebar
  if (keyCode === CONSTANTS.KEYBOARD.TOGGLE_PAUSE) {
    isPaused = !isPaused;
    return false;
  }

  // Reset simulation with 'R' key
  if (keyCode === CONSTANTS.KEYBOARD.RESET_KEY) {
    resetSimulation();
    return false;
  }

  // Select source with 'S' key
  if (keyCode === CONSTANTS.KEYBOARD.SOURCE_SELECT) {
    selectedObject = "source";
    return false;
  }

  // Select observer with 'O' key
  if (keyCode === CONSTANTS.KEYBOARD.OBSERVER_SELECT) {
    selectedObject = "observer";
    return false;
  }

  // Toggle help display with 'H' key
  if (keyCode === CONSTANTS.KEYBOARD.HELP_TOGGLE) {
    showHelp = !showHelp;
    return false;
  }

  // Preset scenarios
  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_1) {
    // Scenario 1: Source moving toward observer
    setupScenario1();
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_2) {
    // Scenario 2: Observer moving toward source
    setupScenario2();
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_3) {
    // Scenario 3: Source and observer moving away
    setupScenario3();
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_4) {
    // Scenario 4: Source and observer moving perpendicular
    setupScenario4();
    return false;
  }

  return true;
}

function resetSimulation() {
  // Reset positions in meters
  sourcePos = createVector(
    (width / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
    (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
  );
  observerPos = createVector(
    ((3 * width) / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
    (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
  );

  // Reset velocities (m/s)
  sourceVel = createVector(0, 0);
  observerVel = createVector(0, 0);

  // Reset movement flags
  sourceMoving = false;
  observerMoving = false;

  // Reset waves
  waves = [];

  // Reset frequencies
  smoothedObservedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;

  // Reset simulation time
  simulationTime = 0;
  lastWaveTime = 0;

  // Reset other states
  isPaused = false;
}

function setupScenario1() {
  // Source moving toward observer (in m/s)
  resetSimulation();
  sourceVel = createVector(5, 0); // Move right (toward observer) at 5 m/s
  observerVel = createVector(0, 0); // Stationary
  sourceMoving = true;
  observerMoving = false;
}

function setupScenario2() {
  // Observer moving toward source (in m/s)
  resetSimulation();
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

import { CONSTANTS } from './constants.js';
import { Wave } from './Wave.js';
import { Simulation } from './Simulation.js';
import { UI } from './UI.js';

let simulation;
let ui;
let lastFrameTime = 0;

function setup() {
  createCanvas(800, 600);

  // Initialize simulation and UI
  simulation = new Simulation();
  ui = new UI();

  // Initialize colors
  ui.initializeColors();

  // Initialize simulation
  simulation.initialize(width, height);

  // Initialize last frame time
  lastFrameTime = millis() / 1000;
}

function draw() {
  background(CONSTANTS.UI.BACKGROUND_COLOR);

  // Calculate delta time for smooth, frame-rate independent animations (in seconds)
  const currentTime = millis() / 1000;
  let dt = (currentTime - lastFrameTime) * CONSTANTS.PHYSICS.REAL_TIME_FACTOR;
  lastFrameTime = currentTime;

  // Clamp dt to reasonable values to prevent jumps
  dt = constrain(dt, 0, CONSTANTS.PHYSICS.TIME_STEP_MAX);

  // Update simulation
  simulation.update(dt);

  // Get current simulation state
  const state = simulation.getState();

  // Draw waves
  for (const wave of state.waves) {
    wave.draw();
  }

  // Draw source, observer, and graphs
  ui.drawSourceAndObserver(
    state.sourcePos,
    state.observerPos,
    state.sourceVel,
    state.observerVel
  );

  ui.drawGraphs(
    state.emittedSoundData,
    state.observedSoundData,
    state.smoothedObservedFreq
  );

  // Display instructions and status
  ui.displayInstructions();
  ui.displaySimulationStatus(state.isPaused);

  // Handle keyboard navigation
  ui.handleKeyboardNavigation(
    dt,
    state.sourcePos,
    state.observerPos,
    state.sourceVel,
    state.observerVel,
    state.isPaused
  );
}

function mousePressed() {
  simulation.handleMouseInteraction(mouseX, mouseY, true);
}

function mouseReleased() {
  simulation.handleMouseInteraction(mouseX, mouseY, false);
}

function keyPressed() {
  // Toggle pause with spacebar
  if (keyCode === CONSTANTS.KEYBOARD.TOGGLE_PAUSE) {
    simulation.togglePause();
    return false;
  }

  // Reset simulation with 'R' key
  if (keyCode === CONSTANTS.KEYBOARD.RESET_KEY) {
    simulation.reset();
    return false;
  }

  // Handle UI-specific key presses
  if (!ui.handleKeyPressed()) {
    return false;
  }

  // Preset scenarios
  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_1) {
    simulation.setupScenario(1);
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_2) {
    simulation.setupScenario(2);
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_3) {
    simulation.setupScenario(3);
    return false;
  }

  if (keyCode === CONSTANTS.KEYBOARD.NUMBER_4) {
    simulation.setupScenario(4);
    return false;
  }

  return true;
}
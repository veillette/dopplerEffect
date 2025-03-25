import { CONSTANTS } from './constants.js';
import { Wave } from './Wave.js';
import { DopplerEffect } from './DopplerEffect.js';

export class Simulation {
  constructor() {
    this.waves = [];
    this.sourcePos = createVector(0, 0);
    this.observerPos = createVector(0, 0);
    this.sourceVel = createVector(0, 0);
    this.observerVel = createVector(0, 0);
    this.prevSourcePos = createVector(0, 0);
    this.prevObserverPos = createVector(0, 0);
    this.lastWaveTime = 0;
    this.observedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;
    this.smoothedObservedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;
    this.emittedSoundData = [];
    this.observedSoundData = [];
    this.draggingSource = false;
    this.draggingObserver = false;
    this.emittedPhase = 0;
    this.observedPhase = 0;
    this.lastFrameTime = 0;
    this.simulationTime = 0;
    this.sourceMoving = false;
    this.observerMoving = false;
    this.isPaused = false;

    // Initialize sound data arrays
    for (let i = 0; i < CONSTANTS.GRAPH.HISTORY_LENGTH; i++) {
      this.emittedSoundData.push(0);
      this.observedSoundData.push(0);
    }
  }

  initialize(width, height) {
    // Initialize positions in meters (convert from pixels)
    this.sourcePos = createVector(
      (width / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
      (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
    );
    this.observerPos = createVector(
      ((3 * width) / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
      (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
    );

    // Initialize velocities in m/s
    this.sourceVel = createVector(0, 0);
    this.observerVel = createVector(0, 0);

    // Store previous positions
    this.prevSourcePos = this.sourcePos.copy();
    this.prevObserverPos = this.observerPos.copy();

    // Initialize last frame time (in seconds)
    this.lastFrameTime = millis() / 1000;
  }

  update(dt) {
    if (this.isPaused) return;

    // Update simulation time
    this.simulationTime += dt;

    // Generate new wave at intervals based on emitted frequency
    const waveInterval = 1.0 / CONSTANTS.PHYSICS.EMITTED_FREQ; // in seconds
    if (this.simulationTime - this.lastWaveTime > waveInterval) {
      this.waves.push(new Wave(
        this.sourcePos,
        this.sourceVel,
        CONSTANTS.PHYSICS.EMITTED_FREQ,
        this.emittedPhase
      ));
      this.lastWaveTime = this.simulationTime;
    }

    // Update waves
    this.waves = this.waves.filter(wave => !wave.isExpired(this.simulationTime));

    // Calculate Doppler effect
    const dopplerResult = DopplerEffect.calculateDopplerEffect(
      this.waves,
      this.observerPos,
      this.observerVel,
      this.simulationTime,
      this.emittedPhase
    );

    // Update observed frequency and sound data
    this.smoothedObservedFreq = dopplerResult.frequency;
    this.observedPhase = dopplerResult.phase;
    this.emittedSoundData.push(sin(this.emittedPhase) * CONSTANTS.GRAPH.AMPLITUDE);
    this.emittedSoundData.shift();
    this.observedSoundData.push(dopplerResult.amplitude);
    this.observedSoundData.shift();

    // Update emitted phase
    this.emittedPhase += CONSTANTS.PHYSICS.EMITTED_FREQ * dt * TWO_PI;
  }

  handleMouseInteraction(mouseX, mouseY, isPressed) {
    // Convert mouse position to meters
    const mouseXMeters = mouseX * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
    const mouseYMeters = mouseY * CONSTANTS.PHYSICS.PIXELS_TO_METERS;

    // Calculate distances to source and observer (in meters)
    const distToSource = dist(
      mouseXMeters,
      mouseYMeters,
      this.sourcePos.x,
      this.sourcePos.y
    );

    const distToObserver = dist(
      mouseXMeters,
      mouseYMeters,
      this.observerPos.x,
      this.observerPos.y
    );

    // Source radius in meters
    const sourceRadiusMeters = CONSTANTS.UI.SOURCE_RADIUS * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
    const observerRadiusMeters = CONSTANTS.UI.OBSERVER_RADIUS * CONSTANTS.PHYSICS.PIXELS_TO_METERS;

    if (isPressed) {
      // Determine which object to move based on initial click
      if (!this.draggingSource && !this.draggingObserver) {
        if (distToSource < sourceRadiusMeters) {
          this.draggingSource = true;
        } else if (distToObserver < observerRadiusMeters) {
          this.draggingObserver = true;
        }
      }

      // Set target positions based on mouse (in meters)
      if (this.draggingSource) {
        this.prevSourcePos = this.sourcePos.copy();
        this.sourcePos.set(mouseXMeters, mouseYMeters);
        this.sourceVel = p5.Vector.sub(this.sourcePos, this.prevSourcePos);
        this.sourceMoving = false;
      } else if (this.draggingObserver) {
        this.prevObserverPos = this.observerPos.copy();
        this.observerPos.set(mouseXMeters, mouseYMeters);
        this.observerVel = p5.Vector.sub(this.observerPos, this.prevObserverPos);
        this.observerMoving = false;
      }
    } else {
      // Reset dragging flags when mouse is released
      this.draggingSource = false;
      this.draggingObserver = false;
    }
  }

  reset() {
    // Reset positions in meters
    this.sourcePos = createVector(
      (width / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
      (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
    );
    this.observerPos = createVector(
      ((3 * width) / 4) * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
      (height / 2) * CONSTANTS.PHYSICS.PIXELS_TO_METERS
    );

    // Reset velocities (m/s)
    this.sourceVel = createVector(0, 0);
    this.observerVel = createVector(0, 0);

    // Reset movement flags
    this.sourceMoving = false;
    this.observerMoving = false;

    // Reset waves
    this.waves = [];

    // Reset frequencies
    this.smoothedObservedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;

    // Reset simulation time
    this.simulationTime = 0;
    this.lastWaveTime = 0;

    // Reset other states
    this.isPaused = false;
  }

  setupScenario(scenarioNumber) {
    this.reset();

    switch (scenarioNumber) {
      case 1:
        // Source moving toward observer
        this.sourceVel = createVector(5, 0); // Move right (toward observer) at 5 m/s
        this.sourceMoving = true;
        break;
      case 2:
        // Observer moving toward source
        this.observerVel = createVector(-5, 0); // Move left (toward source) at 5 m/s
        this.observerMoving = true;
        break;
      case 3:
        // Source and observer moving away
        this.sourceVel = createVector(-5, 0); // Move left at 5 m/s
        this.observerVel = createVector(5, 0); // Move right at 5 m/s
        this.sourceMoving = true;
        this.observerMoving = true;
        break;
      case 4:
        // Source and observer moving perpendicular
        this.sourceVel = createVector(0, 3); // Move down at 3 m/s
        this.observerVel = createVector(0, -3); // Move up at 3 m/s
        this.sourceMoving = true;
        this.observerMoving = true;
        break;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  getState() {
    return {
      waves: this.waves,
      sourcePos: this.sourcePos,
      observerPos: this.observerPos,
      sourceVel: this.sourceVel,
      observerVel: this.observerVel,
      emittedSoundData: this.emittedSoundData,
      observedSoundData: this.observedSoundData,
      smoothedObservedFreq: this.smoothedObservedFreq,
      isPaused: this.isPaused
    };
  }
} 
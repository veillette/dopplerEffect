import { CONSTANTS } from '../constants.js';
import { Wave } from './Wave.js';

export class DopplerModel {
  constructor() {
    // Physics state
    this.waves = [];
    this.sourcePos = createVector(0, 0);
    this.observerPos = createVector(0, 0);
    this.sourceVel = createVector(0, 0);
    this.observerVel = createVector(0, 0);
    this.emittedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;
    this.observedFreq = CONSTANTS.PHYSICS.EMITTED_FREQ;
    this.emittedPhase = 0;
    this.observedPhase = 0;
    this.simulationTime = 0;
    this.lastWaveTime = 0;
    this.isPaused = false;

    // Sound data for visualization
    this.emittedSoundData = new Array(CONSTANTS.GRAPH.HISTORY_LENGTH).fill(0);
    this.observedSoundData = new Array(CONSTANTS.GRAPH.HISTORY_LENGTH).fill(0);
  }

  calculateDopplerEffect() {
    // Calculate unit vector from source to observer
    const directionVector = p5.Vector.sub(this.observerPos, this.sourcePos).normalize();
    
    // Calculate velocity components
    const sourceVelocityComponent = p5.Vector.dot(this.sourceVel, directionVector);
    const observerVelocityComponent = p5.Vector.dot(this.observerVel, directionVector);

    // Calculate observed frequency using the Doppler formula
    let observedFreq = (this.emittedFreq * 
      (CONSTANTS.PHYSICS.SOUND_SPEED - observerVelocityComponent)) /
      (CONSTANTS.PHYSICS.SOUND_SPEED - sourceVelocityComponent);

    // Constrain frequency to reasonable limits
    return constrain(
      observedFreq,
      CONSTANTS.PHYSICS.FREQ_MIN,
      this.emittedFreq * CONSTANTS.PHYSICS.FREQ_MAX_FACTOR
    );
  }

  update(dt) {
    if (this.isPaused) return;

    this.simulationTime += dt;

    // Generate new waves
    const waveInterval = 1.0 / this.emittedFreq;
    if (this.simulationTime - this.lastWaveTime > waveInterval) {
      this.waves.push(new Wave(
        this.sourcePos,
        this.sourceVel,
        this.emittedFreq,
        this.emittedPhase
      ));
      this.lastWaveTime = this.simulationTime;
    }

    // Update waves and remove expired ones
    this.waves = this.waves.filter(wave => !wave.isExpired(this.simulationTime));

    // Update frequencies and phases
    this.observedFreq = this.calculateDopplerEffect();
    this.emittedPhase += this.emittedFreq * dt * TWO_PI;
    this.observedPhase += this.observedFreq * dt * TWO_PI;

    // Update sound data
    this.emittedSoundData.push(sin(this.emittedPhase) * CONSTANTS.GRAPH.AMPLITUDE);
    this.emittedSoundData.shift();
    this.observedSoundData.push(sin(this.observedPhase) * CONSTANTS.GRAPH.AMPLITUDE);
    this.observedSoundData.shift();
  }

  // ... other model methods (reset, setupScenario, etc.)
} 
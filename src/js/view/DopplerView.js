import { CONSTANTS } from '../constants.js';

export class DopplerView {
  constructor() {
    this.initializeColors();
  }

  initializeColors() {
    // Convert RGB arrays to p5.js colors
    // ... (same as before)
  }

  render(model) {
    background(CONSTANTS.UI.BACKGROUND_COLOR);
    
    // Draw waves
    for (const wave of model.waves) {
      this.drawWave(wave);
    }

    // Draw source and observer
    this.drawSourceAndObserver(
      model.sourcePos,
      model.observerPos,
      model.sourceVel,
      model.observerVel
    );

    // Draw graphs
    this.drawGraphs(
      model.emittedSoundData,
      model.observedSoundData,
      model.observedFreq
    );

    // Draw UI elements
    this.drawInstructions();
    this.drawSimulationStatus(model.isPaused);
  }

  // ... other view methods (drawWave, drawGraphs, etc.)
} 
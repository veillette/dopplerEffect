import { CONSTANTS } from '../constants.js';

export class DopplerController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.lastFrameTime = 0;
    this.draggingSource = false;
    this.draggingObserver = false;
  }

  update() {
    const currentTime = millis() / 1000;
    let dt = (currentTime - this.lastFrameTime) * CONSTANTS.PHYSICS.REAL_TIME_FACTOR;
    this.lastFrameTime = currentTime;

    // Clamp dt to prevent jumps
    dt = constrain(dt, 0, CONSTANTS.PHYSICS.TIME_STEP_MAX);

    // Update model
    this.model.update(dt);

    // Update view
    this.view.render(this.model);
  }

  handleMouseInteraction(mouseX, mouseY, isPressed) {
    // Convert mouse coordinates to model space
    const mousePos = createVector(
      mouseX * CONSTANTS.PHYSICS.PIXELS_TO_METERS,
      mouseY * CONSTANTS.PHYSICS.PIXELS_TO_METERS
    );

    if (isPressed) {
      this.handleMousePress(mousePos);
    } else {
      this.handleMouseRelease();
    }
  }

  handleKeyPress(keyCode) {
    // Handle keyboard input
    switch (keyCode) {
      case CONSTANTS.KEYBOARD.TOGGLE_PAUSE:
        this.model.isPaused = !this.model.isPaused;
        return false;
      case CONSTANTS.KEYBOARD.RESET_KEY:
        this.model.reset();
        return false;
      // ... other key handlers
    }
    return true;
  }

  // ... other controller methods
} 
import { CONSTANTS } from './constants.js';

export class UI {
  constructor() {
    this.showHelp = true;
    this.selectedObject = "source";
  }

  initializeColors() {
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

  drawSourceAndObserver(sourcePos, observerPos, sourceVel, observerVel) {
    // Convert meters to pixels for display
    const sourcePosX = sourcePos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    const sourcePosY = sourcePos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    const observerPosX = observerPos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    const observerPosY = observerPos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;

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
      this.drawVelocityVector(
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
      this.drawVelocityVector(
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
    if (this.selectedObject === "source") {
      circle(sourcePosX, sourcePosY, CONSTANTS.UI.SOURCE_RADIUS * 2 + 10);
    } else {
      circle(observerPosX, observerPosY, CONSTANTS.UI.OBSERVER_RADIUS * 2 + 10);
    }
  }

  drawVelocityVector(pixelPos, velocityVector, col) {
    // Display velocity vector (scale for visibility)
    const scaledVel = velocityVector.copy().mult(CONSTANTS.UI.VECTOR_SCALE);

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

  drawGraph(x, y, w, h, data, title, col) {
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
      const xPos = x + (i * w) / data.length;
      const yPos = y + h / 2 - data[i];
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

  drawGraphs(emittedSoundData, observedSoundData, smoothedObservedFreq) {
    // Set up graph area
    const graphY1 = 30;
    const graphY2 =
      graphY1 +
      CONSTANTS.GRAPH.HEIGHT +
      CONSTANTS.GRAPH.SPACING_FACTOR * CONSTANTS.GRAPH.SPACING;
    const graphX = width - CONSTANTS.GRAPH.WIDTH - CONSTANTS.GRAPH.MARGIN;

    // Draw emitted sound graph
    this.drawGraph(
      graphX,
      graphY1,
      CONSTANTS.GRAPH.WIDTH,
      CONSTANTS.GRAPH.HEIGHT,
      emittedSoundData,
      "Emitted Sound",
      CONSTANTS.UI.SOURCE_COLOR
    );

    // Draw observed sound graph
    this.drawGraph(
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

  displayInstructions() {
    if (!this.showHelp) return;

    fill(CONSTANTS.TEXT.TEXT_COLOR);
    noStroke();
    textAlign(LEFT);
    textSize(CONSTANTS.TEXT.FONT_SIZE_NORMAL);

    let instructY = CONSTANTS.TEXT.INSTRUCTION_Y1;
    const lineHeight = CONSTANTS.TEXT.FONT_SIZE_NORMAL * 1.5;

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
  }

  displaySimulationStatus(isPaused) {
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
      "Selected: " + (this.selectedObject === "source" ? "Source" : "Observer"),
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

  handleKeyboardNavigation(dt, sourcePos, observerPos, sourceVel, observerVel, isPaused) {
    if (isPaused) return;

    let targetPos, targetVel;

    // Determine which object to control
    if (this.selectedObject === "source") {
      targetPos = sourcePos;
      targetVel = sourceVel;
    } else {
      targetPos = observerPos;
      targetVel = observerVel;
    }

    // Move the selected object with arrow keys (in m/s)
    if (keyIsDown(LEFT_ARROW)) {
      targetPos.x -= CONSTANTS.KEYBOARD.MOVE_STEP * dt;
      targetVel.x = -CONSTANTS.KEYBOARD.MOVE_STEP;
    } else if (keyIsDown(RIGHT_ARROW)) {
      targetPos.x += CONSTANTS.KEYBOARD.MOVE_STEP * dt;
      targetVel.x = CONSTANTS.KEYBOARD.MOVE_STEP;
    } else {
      targetVel.x = 0;
    }

    if (keyIsDown(UP_ARROW)) {
      targetPos.y -= CONSTANTS.KEYBOARD.MOVE_STEP * dt;
      targetVel.y = -CONSTANTS.KEYBOARD.MOVE_STEP;
    } else if (keyIsDown(DOWN_ARROW)) {
      targetPos.y += CONSTANTS.KEYBOARD.MOVE_STEP * dt;
      targetVel.y = CONSTANTS.KEYBOARD.MOVE_STEP;
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

  handleKeyPressed() {
    // Select source with 'S' key
    if (keyCode === CONSTANTS.KEYBOARD.SOURCE_SELECT) {
      this.selectedObject = "source";
      return false;
    }

    // Select observer with 'O' key
    if (keyCode === CONSTANTS.KEYBOARD.OBSERVER_SELECT) {
      this.selectedObject = "observer";
      return false;
    }

    // Toggle help display with 'H' key
    if (keyCode === CONSTANTS.KEYBOARD.HELP_TOGGLE) {
      this.showHelp = !this.showHelp;
      return false;
    }

    return true;
  }
} 
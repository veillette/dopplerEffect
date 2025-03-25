import { CONSTANTS } from './constants.js';

export class Wave {
  constructor(pos, sourceVel, sourceFreq, phaseAtEmission) {
    this.pos = pos.copy();
    this.radius = 0;
    this.birthTime = simulationTime;
    this.sourceVel = sourceVel.copy();
    this.sourceFreq = sourceFreq;
    this.phaseAtEmission = phaseAtEmission;
  }

  update(simulationTime) {
    const age = simulationTime - this.birthTime;
    this.radius = age * CONSTANTS.PHYSICS.SOUND_SPEED;
    return age;
  }

  draw() {
    const age = this.update(simulationTime);
    const opacity = CONSTANTS.WAVE.OPACITY_MAX - 
      (age * CONSTANTS.WAVE.OPACITY_MAX) / CONSTANTS.WAVE.MAX_AGE;
    const constrainedOpacity = constrain(
      opacity,
      CONSTANTS.WAVE.OPACITY_MIN,
      CONSTANTS.WAVE.OPACITY_MAX
    );

    const radiusPixels = this.radius * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    const posXPixels = this.pos.x * CONSTANTS.PHYSICS.METERS_TO_PIXELS;
    const posYPixels = this.pos.y * CONSTANTS.PHYSICS.METERS_TO_PIXELS;

    noFill();
    stroke(colorWithAlpha(CONSTANTS.UI.WAVE_COLOR, constrainedOpacity));
    strokeWeight(CONSTANTS.WAVE.STROKE_WEIGHT);
    circle(posXPixels, posYPixels, radiusPixels * 2);
  }

  isExpired(simulationTime) {
    const age = simulationTime - this.birthTime;
    const maxRadius = max(width, height) * CONSTANTS.PHYSICS.PIXELS_TO_METERS;
    return age > CONSTANTS.WAVE.MAX_AGE || this.radius > maxRadius;
  }
}

export function colorWithAlpha(inputColor, alpha) {
  return color(red(inputColor), green(inputColor), blue(inputColor), alpha);
} 
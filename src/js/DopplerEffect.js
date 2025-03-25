import { CONSTANTS } from './constants.js';

export class DopplerEffect {
  static calculateObserverDopplerEffect(currentWave, observerPos, observerVel) {
    // Calculate unit vector from source to observer (dimensionless)
    const directionVector = p5.Vector.sub(observerPos, currentWave.pos).normalize();

    // Calculate dot product of source velocity and direction vector (in m/s)
    const sourceVelocityComponent = p5.Vector.dot(
      currentWave.sourceVel,
      directionVector
    );

    // Calculate dot product of observer velocity and direction vector (in m/s)
    const observerVelocityComponent = p5.Vector.dot(observerVel, directionVector);

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

  static calculateApparentDopplerEffect(currentWave, observerPos) {
    // Calculate unit vector from source to observer (dimensionless)
    const directionVector = p5.Vector.sub(observerPos, currentWave.pos).normalize();

    // Calculate dot product of source velocity and direction vector (in m/s)
    const sourceVelocityComponent = p5.Vector.dot(
      currentWave.sourceVel,
      directionVector
    );

    let observedFreq =
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

  static calculateDopplerEffect(waves, observerPos, observerVel, simulationTime, emittedPhase) {
    // Find the wave currently affecting the observer
    const wavesAtObserver = [];

    for (const wave of waves) {
      // Distance in meters
      const distToObserver = p5.Vector.dist(wave.pos, observerPos);

      // Check if this wave has reached the observer
      if (wave.radius >= distToObserver) {
        // Calculate the time when this wave reached the observer (in seconds)
        const travelTime = distToObserver / CONSTANTS.PHYSICS.SOUND_SPEED;
        const arrivalTime = wave.birthTime + travelTime;

        wavesAtObserver.push({
          wave: wave,
          arrivalTime: arrivalTime,
        });
      }
    }

    // If no waves have reached the observer yet, return zero amplitude
    if (wavesAtObserver.length === 0) {
      return {
        amplitude: 0,
        frequency: CONSTANTS.PHYSICS.EMITTED_FREQ,
        phase: emittedPhase
      };
    }

    // Sort by arrival time (most recent first)
    wavesAtObserver.sort((a, b) => b.arrivalTime - a.arrivalTime);

    // Use the most recently arrived wave
    const currentWave = wavesAtObserver[0].wave;
    const arrivalTime = wavesAtObserver[0].arrivalTime;

    // Calculate how much time has passed since this wave arrived (in seconds)
    const timeSinceArrival = simulationTime - arrivalTime;

    // Calculate the Doppler shifted frequency
    const dopplerFrequency = this.calculateApparentDopplerEffect(currentWave, observerPos);
    const smoothedObservedFreq = this.calculateObserverDopplerEffect(currentWave, observerPos, observerVel);

    // Calculate additional phase based on observed frequency
    const additionalPhase = timeSinceArrival * dopplerFrequency * TWO_PI;
    const observedPhase = currentWave.phaseAtEmission + additionalPhase;

    return {
      amplitude: sin(observedPhase) * CONSTANTS.GRAPH.AMPLITUDE,
      frequency: smoothedObservedFreq,
      phase: observedPhase
    };
  }
} 
// Physical constants and configuration for the Doppler Effect simulation

export const CONSTANTS = {
  // Physical constants in SI units
  PHYSICS: {
    SOUND_SPEED: 343.0, // Speed of sound in air (m/s) at room temperature
    METERS_TO_PIXELS: 1, // Conversion factor (pixels per meter)
    PIXELS_TO_METERS: 1, // Inverse conversion factor (meters per pixel)
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
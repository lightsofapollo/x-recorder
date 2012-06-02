var childProcess = require('child_process');

/**
 * Wrapper around ffmpeg for capturing
 * x11 output and saving it to a video.
 */
function Capture(options) {
  var key;
  if (typeof(options) === 'undefined') {
    options = {};
  }

  for (key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key];
    }
  }
}

Capture.prototype = {

  /**
   * X11 display port to record.
   *
   * @type Numeric
   */
  display: 99,

  /**
   * Output file.
   */
  output: '/tmp/ffmpeg.mov',

  /**
   * Size of ouput video
   */
  dimensions: '1280x1024',

  /**
   * Reference to ffmpeg process.
   */
  process: null,

  /**
   * ouput codec
   *
   * @type {String}
   */
  codec: 'qtrle',

  /**
   * Begins video capture
   */
  start: function() {
    var errorBuffer = '',
        args;

    args = [
      '-y', '-r', '30', '-g', '600',
      '-s', this.dimensions, '-f','x11grab', '-i',
      ':' + String(this.display), '-vcodec', this.codec,
      this.output
    ];

    this.process = childProcess.spawn('ffmpeg', args);

    if (!this.process.pid) {
      throw new Error('ffmpeg failed to start');
    }

    return this.process;
  },

  /**
   * Stops video capture
   */
  stop: function() {
    this.process.kill();
  }

};

module.exports = Capture;

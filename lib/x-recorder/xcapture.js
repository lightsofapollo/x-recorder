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
   *
   * @param {Function} callback node style.
   */
  start: function(callback) {
    var buffer = '',
        args,
        proc,
        timeout;

    args = [
      '-y', '-r', '30', '-g', '600',
      '-s', this.dimensions, '-f', 'x11grab', '-i',
      ':' + String(this.display), '-vcodec', this.codec,
      this.output
    ];

    proc = this.process = childProcess.spawn('ffmpeg', args);
    proc.stderr.on('data', checkBuffer);

    function checkBuffer(data) {
      buffer += data.toString();

      if (buffer.indexOf('frame=') !== -1) {
        buffer = undefined;
        proc.stderr.removeListener('data', checkBuffer);
        clearTimeout(timeout);
        callback(null);
      }
    }

    timeout = setTimeout(function() {
      callback(new Error('ffmpeg failed to start'));
      proc.stderr.removeListener('data', checkBuffer);
    }, 1000);
  },

  /**
   * Stops video capture
   *
   * @param {Function} callback node style.
   */
  stop: function(callback) {
    var buffer = '',
        timeout;

    timeout = setTimeout(function() {
      process.stderr.removeListener('data', bufferOutput);
      callback(new Error('ffmpeg did not close cleanly.'));
    }, 1000);

    function bufferOutput(data) {
      buffer += data.toString();

      clearTimeout(timeout);

      if (buffer.indexOf('signal 15') !== -1) {
        callback(null);
      }
    }

    if (this.process) {
      this.process.stderr.on('data', bufferOutput);
      this.process.stdout.on('data', bufferOutput);
      this.process.kill('SIGTERM');
    }
  }
};

module.exports = Capture;

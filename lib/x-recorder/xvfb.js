var fs = require('fs'),
    fsPath = require('path'),
    childProcess = require('child_process');

function Xvfb(options) {
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

Xvfb.prototype = {
  /**
   * X11 DISPLAY.
   *
   * When null will attempt
   * to find an available port
   *
   * @type Numeric
   */
  display: null,

  dimensions: '1280x1024x24',

  /**
   * Directory to check for x11 locks in.
   *
   * @type String
   */
  x11LockRoot: '/tmp/',

  process: null,

  /**
   * Attempts to start Xvfb instance.
   *
   * @param {Function} callback node style.
   */
  start: function(callback) {
    var display = this.display,
        self = this;

    function startXvfb(display) {
      self._startXvfb(display, function(err, proc) {
        var timeout, buffer = '';

        if (err) {
          return callback(err);
        }

        if (proc.pid !== 0 && !proc.pid) {
          return callback(
            new Error('Xvfb failed to start on display :' + display)
          );
        }

        function bufferErr(data) {
          buffer += data.toString();
        }

        proc.stderr.on('data', bufferErr);

        function onExit() {
          clearTimeout(timeout);
          proc.stderr.removeListener('data', bufferErr);
          console.error(buffer);
          callback(new Error('Xvfb exited prematurely'));
        }

        proc.on('exit', onExit);

        timeout = setTimeout(function() {
          proc.removeListener('exit', onExit);
          proc.stderr.removeListener('data', bufferErr);
          callback(null, proc);
        }, 500);
      });
    }

    if (!display) {
      this._availableDisplay(function(err, display) {
        if (err) {
          callback(err);
        } else {
          startXvfb(display);
        }
      });
    } else {
      startXvfb(display);
    }
  },

  /**
   * Stops Xvfb instance.
   *
   * @param {Function} callback node style.
   */
  stop: function(callback) {
    this.process.once('exit', function(code) {
      callback(null, code);
    });
    this.process.kill();
    this.pid = null;
  },

  /**
   * Starts Xvfb server and sets the
   * current .display
   *
   * @param {Numeric} display DISPLAY.
   * @param {Function} callback node style.
   */
  _startXvfb: function(display, callback) {
    var cmd, self = this, proc;
    cmd = [
      ':' + String(display),
      '-screen',
      '0',
      this.dimensions,
      '-ac'
    ];

    this._availableDisplay(function(err, display) {
      if (err) {
        return callback(err);
      }

      self.display = display;
      self.process = childProcess.spawn('Xvfb', cmd);

      callback(null, self.process);

    }, display, true);
  },

  /**
   * Returns name of the lock file based
   * on its id.
   *
   * @return {String} formatted name of lock.
   */
  _getLockFile: function(id) {
    return '.X' + String(id) + '-lock';
  },

  /**
   * Finds available X11 display
   * by checking the locks.
   *
   * @param {Function} callback node style.
   */
  _availableDisplay: function(callback, display, once) {
    var searchDir = this.x11LockRoot,
        path,
        self = this;

    if (typeof(display) === 'undefined') {
      display = 1;
    }

    path = fsPath.join(searchDir, this._getLockFile(display));
    fs.exists(path, function(exists) {
      if (exists) {
        if (typeof(once) !== 'undefined') {
          callback(new Error('There is a lock on display :' + display));
        } else {
          self._availableDisplay(callback, display + 1);
        }
      } else {
        callback(null, display);
      }
    });
  }

};

module.exports = Xvfb;

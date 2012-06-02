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

  _xvfbProcess: null,

  /**
   * Attempts to start Xvfb instance.
   *
   * @param {Function} callback node style.
   */
  start: function(callback) {
    var display = this.display,
        self = this;

    function startXvfb(display) {
      process.nextTick(function() {
        var proc, timeout;

        proc = self._startXvfb(display);

        if (proc.pid !== 0 && !proc.pid) {
          return callback(
            new Error('Xvfb failed to start on display :' + display)
          );
        }

        function onExit() {
          clearTimeout(timeout);
          callback(new Error('Xvfb exited prematurely'));
        }

        process.on('exit', onExit);

        timeout = setTimeout(function() {
          process.removeListener('exit', onExit);
          callback(null, proc);
        }, 250);

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
  stop: function(cb) {
    this._xvfbProcess.kill();
    this.pid = null;
  },

  /**
   * Starts Xvfb server and sets the
   * current .display
   *
   * @param {Numeric} display DISPLAY.
   * @param {Function} callback node style.
   */
  _startXvfb: function(display) {
    var cmd, self = this, proc;
    cmd = [
      ':' + String(display),
      '-screen',
      '0',
      this.dimensions,
      '-ac'
    ];

    this.display = display;
    this._xvfbProcess = proc = childProcess.spawn('Xvfb', cmd);
    this.pid = proc.pid;
    return proc;
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
  _availableDisplay: function(callback, display) {
    var searchDir = this.x11LockRoot,
        path,
        self = this;

    if (typeof(display) === 'undefined') {
      display = 1;
    }

    path = fsPath.join(searchDir, this._getLockFile(display));
    fsPath.exists(path, function(exists) {
      if (exists) {
        self._availableDisplay(callback, display + 1);
      } else {
        callback(null, display);
      }
    });
  }

};

module.exports = Xvfb;

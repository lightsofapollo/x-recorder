var Script = new require('./script'),
    Recorder = require('../lib/x-recorder'),
    fs = require('fs'),
    fsPath = require('path');


module.exports = new Script({
  desc: 'Begins recording a X display',

  usage: 'start-video [options]',

  options: {

    display: {
      desc: 'X11 display id',
      demand: true
    },

    dimensions: {
      desc: 'Recording dimsensions'
    },

    output: {
      demand: true,
      desc: 'output file'
    },

    pid: {
      desc: 'Location of the pid file'
    }

  }
}, function(argv) {

  var display = argv.display,
      pidFile = argv.pid;

  display = String(display).replace(/[^0-9]/g, '');

  if (!pidFile) {
    pidFile = '/tmp/.x-recorder-vid-' + String(display) + '.pid';
  }

  function checkDisplay() {
    var lockFile,
        pid;

    lockFile = '/tmp/.X' + display + '-lock';

    if (!fsPath.existsSync(lockFile)) {
      console.error('There is no display running on :' + display);
      process.exit(1);
    }
  }

  checkDisplay();

  var capture = new Recorder.XCapture({
    output: argv.output,
    display: display
  });

  if (argv.dimsensions) {
    capture.dimsensions = argv.dimsensions;
  }

  capture.start(function(err, process) {
    if (err) {
      throw err;
    }

    fs.writeFileSync(pidFile, process.pid);
    console.log(pidFile);
    process.exit(1);
  });
});





var Script = new require('./script'),
    Recorder = require('../lib/x-recorder'),
    fs = require('fs'),
    exec = require('child_process').exec,
    fsPath = require('path');


module.exports = new Script({
  desc: 'Starts an Xvfb instance. Will echo display id',

  usage: 'start-xvfb [options]',

  options: {
    display: {
      desc: 'X11 Display default will find an open display',
      demand: true
    }
  }
}, function(argv) {
  var display = String(argv.display).replace(/[^0-9]/g, ''),
      lockFile,
      pid;

  lockFile = '/tmp/.X' + display + '-lock';

  if (fs.existsSync(lockFile)) {
    pid = fs.readFileSync(lockFile, 'utf8').trim();
    exec('kill ' + pid, function(err, stdout, stderr) {
      if (err) {
        throw err;
      }

      process.stdout.write(stdout);
      process.stderr.write(stderr);
      console.log('-- stopped Xvfb display :' + display + '--');
    });
  } else {
    console.log('--', 'x11 is not running on display :' + display, '--');
  }
});




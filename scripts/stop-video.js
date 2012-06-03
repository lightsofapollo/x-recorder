var Script = new require('./script'),
    Recorder = require('../lib/x-recorder'),
    fs = require('fs'),
    fsPath = require('path'),
    exec = require('child_process').exec;


module.exports = new Script({
  desc: 'Stops recording a video and saves output',

  usage: 'stop-video [options]',

  options: {

    pid: {
      desc: 'Location of the pid file',
      demand: true
    }

  }
}, function(argv) {
  var pidFile = argv.pid,
      pid;

  if (!fsPath.existsSync(pidFile)) {
    console.error(pidFile, 'was not found');
    process.exit(1);
  }

  pid = fs.readFileSync(pidFile, 'utf8').trim();

  exec('kill -TERM ' + pid, function(err, stdout, stderr) {
    if (err) {
      throw err;
    }

    process.stdout.write(stdout);
    process.stderr.write(stderr);

    console.log('-- finished video capture --');
  });

});

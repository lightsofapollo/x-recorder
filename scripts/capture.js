var Script = new require('./script'),
    Recorder = require('../lib/x-recorder'),
    childProcess = require('child_process');


module.exports = new Script({
  desc: 'Captures X11 output of a shell script',

  usage: 'capture [options]',

  options: {
    output: {
      desc: 'Movie output file',
      demand: true,
      alias: 'o'
    },

    script: {
      alias: 's',
      desc: 'Shell script to execute (wrap it in quotes)',
      demand: true
    }
  }

}, function(argv) {
  var xvfb,
      xcapture;

  xvfb = new Recorder.Xvfb();
  xvfb.start(onXvfb);

  function onXvfb() {
    xcapture = new Recorder.XCapture({
      display: xvfb.display,
      output: argv.output
    });

    process.env.DISPLAY = ':' + String(xvfb.display);
    xcapture.start(onCapture);
  }

  function onCapture() {
    var userArgs = argv.script.split(' '),
        child = childProcess.spawn(userArgs[0], userArgs.slice(1));

    child.stdout.on('data', function(data) {
      process.stdout.write(data.toString());
    });

    child.stderr.on('data', function(data) {
      process.stderr.write(data.toString());
    });

    //keep process running until child is done.
    function waitForChild() {
      waitForChild();
      setTimeout(waitForChild, 10000000);
    }

    function stopRecording(cb) {
      xcapture.stop(function() {
        xvfb.stop(function() {
          console.log('Stopped recording output:', argv.output);
          if (typeof(cb) === 'function') {
            cb();
          }
        });
      });
    }

    process.on('exit', stopRecording);

    child.on('exit', function(code) {
      stopRecording(function() {
        process.exit(code);
      });
    });
  }

});


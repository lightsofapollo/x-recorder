var Script = new require('./script'),
    Recorder = require('../lib/x-recorder');


module.exports = new Script({
  desc: 'Starts an Xvfb instance. Will echo display id',

  usage: 'start-xvfb [options]',

  options: {
    display: {
      desc: 'X11 Display default will find an open display'
    },

    dimensions: {
      desc: 'Dimensions for X11 server'
    }
  }
}, function(argv) {
  var xvfb = new Recorder.Xvfb({
    display: argv.display
  });

  if (argv.dimensions) {
    xvfb.dimensions = argv.dimensions;
  }

  xvfb.start(function(err) {
    if (err) {
      throw err;
    }

    console.log(':' + xvfb.display);
    process.exit(0);
  });
});



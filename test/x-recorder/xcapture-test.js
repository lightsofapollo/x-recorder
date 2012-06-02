var Capture = requireLib('x-recorder/xcapture'),
    Xvfb = requireLib('x-recorder/xvfb'),
    childProcess = require('child_process'),
    fsPath = require('path'),
    fs = require('fs');

describe('x-recorder/xcapture', function() {

  var subject,
      outFile = __dirname + '/files/out.mov',
      xvfb;

  afterEach(function() {
    if (fsPath.existsSync(outFile)) {
      fs.unlinkSync(outFile);
    }
    xvfb.stop();
  });

  beforeEach(function(done) {
    xvfb = new Xvfb();

    xvfb.start(function() {
      subject = new Capture({
        output: outFile,
        display: xvfb.display
      });
      done();
    });
  });

  describe('.start', function() {
    beforeEach(function() {
      subject.start();
    });

    it('should start ffmpeg progress', function(done) {
      expect(subject.process).to.be.ok();
      childProcess.exec('ps -aef | grep ffmpeg', function(err, out) {
        if (err) {
          done(err);
        }

        expect(out).to.contain(':' + xvfb.display);
        expect(out).to.contain(subject.dimensions);
        expect(out).to.contain(subject.codec);
        done();
      });
    });
  });

  describe('.stop', function() {

    it('should stop ffmpeg process', function(done) {
      subject.start();
      subject.process.on('exit', function() {
        done();
      });
      subject.stop();
    });
  });

});

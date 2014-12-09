var Capture = requireLib('x-recorder/xcapture'),
    Xvfb = requireLib('x-recorder/xvfb'),
    childProcess = require('child_process'),
    fsPath = require('path'),
    fs = require('fs'),
    tmp = require('tmp');

describe('x-recorder/xcapture', function() {

  var subject,
      outFile,
      xvfb,
      doCleanup;

  afterEach(function(done) {
    if (fs.existsSync(outFile)) {
      fs.unlinkSync(outFile);
    }
    xvfb.stop(done);
    doCleanup();
  });

  beforeEach(function(done) {
    tmp.dir(function(err, path, cleanupCallback) {
      doCleanup = cleanupCallback;

      tmp.tmpName({ template: 'tmp-XXXXXX.mov' }, function(err, path) {
        outFile = path;

        xvfb = new Xvfb();

        xvfb.start(function() {
          subject = new Capture({
            output: outFile,
            display: xvfb.display
          });

          done();
        });
      });
    });
  });

  describe('.start', function() {
    beforeEach(function(done) {
      subject.start(done);
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
        subject.stop(function(err) {
          if (err) {
            done(err);
            return;
          }
          expect(fs.existsSync(outFile)).to.be(true);
          done(err);
        });
      });
    });
  });

  describe('.stop', function() {
    beforeEach(function(done) {
      subject.start(done);
    });

    it('should stop ffmpeg process', function(done) {
      var stopped = false;
      subject.process.on('exit', function() {
        expect(fs.existsSync(outFile)).to.be(true);
        if (!stopped) {
          done(new Error('stop never completed.'));
        } else {
          done();
        }
      });

      subject.stop(function(err) {
        stopped = true;
      });
    });
  });

});

var Xvfb = requireLib('x-recorder/xvfb'),
    fs = require('fs'),
    fsPath = require('path'),
    childProcess = require('child_process'),
    tmp = require('tmp');

describe('x-recorder/xvfb', function() {

  var subject,
      tmpPath, 
      doCleanup;

  function lockFile(file, dir) {
    if (typeof(dir) === 'undefined') {
      dir = tmpPath;
    }

    var filePath = '.X' + String(file) + '-lock';
    return fsPath.join(dir, filePath);
  }

  beforeEach(function(done) {
    tmp.dir(function(err, path, cleanupCallback) {
      doCleanup = cleanupCallback;
      tmpPath = path;

      subject = new Xvfb({
        x11LockRoot: tmpPath
      });
      
      done();
    });
  });

  afterEach(function() {
    doCleanup();
  });

  describe('initialization', function() {
    it('should set .x11LockRoot', function() {
      expect(subject.x11LockRoot).to.contain(tmpPath);
    });
  });

  describe('.start', function() {
    var display;

    beforeEach(function() {
      subject.x11LockRoot = '/tmp/';
    });

    function startsXvfbDisplay() {
      it('should start xvfb', function(done) {
        childProcess.exec('ps -aef | grep Xvfb', function(err, out) {
          expect(out).to.contain(':' + display);
          subject.stop(done);
        });
      });
    }


    describe('without a display', function() {
      beforeEach(function(done) {
        subject._availableDisplay(function(err, res) {
          display = res;
          done();
        });
      });

      beforeEach(function(done) {
        subject.start(function() {
          done();
        })
      });

      startsXvfbDisplay(display);
    });

    describe('with a display', function() {
      display = 77;

      beforeEach(function(done) {
        subject.display = display;
        subject.start(function() {
          done();
        });
      });

      startsXvfbDisplay();

      describe('when given display is used already', function() {
        var second;
        beforeEach(function() {
          second = new Xvfb({ display: display });
        });

        it('should send an error in cb', function(done) {
          subject.start(function(err) {
            expect(err).to.be.a(Error);
            done();
          });
        });
      });

    });
  });

  describe('.stop', function() {
    var stopped = false;

    beforeEach(function(done) {
      subject._startXvfb(77, function() {
        subject.process.on('exit', function() {
          stopped = true;
        });

        subject.stop(function() {
          done();
        });
      });
    });

    it('should terminate the xvfb process', function() {
      expect(stopped).to.be(true);
    });

  });

  describe('._getLockFile', function() {
    it('should return lockfile path', function() {
      var expected = '.X99-lock';
      expect(subject._getLockFile(99)).to.be(expected);
    });
  });

  describe('._availableDisplay', function() {
    var list = [1, 2, 3, 4, 5, 6, 7, 9],
        dir = tmpPath;

    afterEach(function() {
      list.forEach(function(lock) {
        fs.unlinkSync(lockFile(lock));
      });
    });

    beforeEach(function() {
      list.forEach(function(lock) {
        fs.writeFileSync(lockFile(lock), lock, 'utf8');
      });
    });

    it('should find first available lock', function(done) {
      subject._availableDisplay(function(err, lock) {
        expect(err).not.to.be.ok();
        expect(lock).to.be(8);
        done();
      });
    });
  });

  describe('._startXvfb', function() {

    afterEach(function() {
      subject.x11LockRoot = '/tmp/';
      subject.process.kill();
    });

    beforeEach(function(done) {
      subject._startXvfb(71, done);
    });

    it('should start Xvfb', function(done) {
      //starts real Xvfb
      var process = subject.process;
      expect(process.pid).to.be.ok();

      childProcess.exec('ps -aef | grep Xvfb', function(err, stdout, stderr) {
        process.kill();
        expect(stdout).to.contain('Xvfb :71 -screen 0 ' + subject.dimensions);
        done();
      });

    });
  });

});

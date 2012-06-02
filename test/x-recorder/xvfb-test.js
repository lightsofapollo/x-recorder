var Xvfb = requireLib('x-recorder/xvfb'),
    fs = require('fs'),
    fsPath = require('path'),
    childProcess = require('child_process');

describe('x-recorder/xvfb', function() {

  var subject;

  function lockFile(file, dir) {
    if (typeof(dir) === 'undefined') {
      dir = __dirname + '/files/';
    }

    var filePath = '.X' + String(file) + '-lock';
    return fsPath.join(dir, filePath);
  }

  beforeEach(function() {
    subject = new Xvfb({
      x11LockRoot: __dirname + '/files/'
    });
  });

  describe('initialization', function() {
    it('should set .x11LockRoot', function() {
      expect(subject.x11LockRoot).to.contain('files');
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

    });
  });

  describe('.stop', function() {
    var stopped = false;

    beforeEach(function(done) {
      subject._startXvfb(77);
      subject.process.on('exit', function() {
        stopped = true;
      });
      subject.stop(function() {
        done();
      });
    });

    it('should terminate the xvfb process', function() {
      expect(stopped).to.be(true);
      expect(subject.pid).to.be(null);
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
        dir = __dirname + '/files/';

    after(function() {
      list.forEach(function(lock) {
        fs.unlinkSync(lockFile(lock));
      });
    });

    before(function() {
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
    it('should start Xvfb', function(done) {
      //starts real Xvfb
      var process = subject._startXvfb(71);
      expect(process.pid).to.be.ok();

      childProcess.exec('ps -aef | grep Xvfb', function(err, stdout, stderr) {
        expect(subject.pid).to.be(process.pid);
        process.kill();
        expect(stdout).to.contain('Xvfb :71 -screen 0 ' + subject.dimensions);
        done();
      });

    });
  });

});

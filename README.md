# X-Recorder

Inspired by headless (the ruby gem) X-Recorder provides utils to 
start Xvfb and record (as in video recording) X11 output based on a X DISPLAY id.

Primarily designed to be used as a bin its backed by a library you can use inside other node 
libaries.

## Install

````sh
npm install x-recorder -g
````

## Comands

See `x-recorder --help` for an up to date list of sub commands.

### capture

Captures output of a shell script. Will create an Xvfb instance and run your script inside it
capturing the X Display via ffmpeg.

This command is useful in a CI environemnt where you want to capture the output of you
test command. The exit status, stdout, stderr output will be exactaly the same as the command
given in -s.

````sh
x-recorder capture -s "firefox google.com" -o $PWD/foo.mov
````

### start-xvfb

Starts Xvfb instance finds an available DISPLAY id.

Will echo display ID back to you.

````sh
x-recorder start-xvfb
````

### stop-xvfb

Stops Xvfb instance. Looks up its pid via /tmp/.X{ID}-lock

````sh
x-recorder stop-xvfb --display :99
````


### start-video

Records video from an already running DISPLAY.

````sh
x-recorder start-video --display :99 --pid $PWD/video.pid --output $PWD/out.mov
````

### stop-video

Stops video recording.

````sh
x-recorder stop-video --pid $PWD/video.pid
````


## LICENSE

MIT - See LICENSE.md
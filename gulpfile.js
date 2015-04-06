'use strict'

var gulp = require('gulp')
var eslint = require('gulp-eslint')
var nodemon = require('gulp-nodemon')
var cp = require('child_process')

gulp.task('lint', function () {
  return gulp.src(['**.js', '**/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError())
})

gulp.task('default', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {'NODE_ENV': 'development'},
    tasks: ['lint']
  })
})

gulp.task('bunyan', function() {
  var bunyan
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {'NODE_ENV': 'development'},
    tasks: ['lint'],
    readable: false,
    stdout: false
  }).on('restart', function() {
    if (bunyan) {
      bunyan && bunyan.kill()
    }
  }).on('readable', function() {
    bunyan && bunyan.kill()

    bunyan = cp.spawn('bunyan', ['--color'])

    bunyan.stdout.pipe(process.stdout)
    bunyan.stderr.pipe(process.stderr)

    this.stdout.pipe(bunyan.stdin)
    this.stderr.pipe(bunyan.stdin)
  })
})

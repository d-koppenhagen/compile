'use strict'

var gulp = require('gulp')
var eslint = require('gulp-eslint')
var nodemon = require('gulp-nodemon')

gulp.task('lint', function () {
  return gulp.src(['**.js', '**/*.js'])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failOnError())
})

gulp.task('default', ['lint'], function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: {'NODE_ENV': 'development'}
  })
})

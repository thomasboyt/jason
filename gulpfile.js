var gulp = require('gulp');
var traceur = require('gulp-traceur');
var clean = require('gulp-clean');

// Build ES6 src to ES5
gulp.task('traceur', function() {
  return gulp.src([traceur.RUNTIME_PATH, './src/**/*.js'])
    .pipe(traceur({
      blockBinding: true
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['traceur']);
gulp.task('default', ['build']);

// Clean built files
gulp.task('clean', function() {
  gulp.src(['./dist'], {read: false}).pipe(clean());
});

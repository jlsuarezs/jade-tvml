var gulp = require('gulp'),
    jade = require('gulp-jade');

gulp.task('templates', function() {
  gulp.src('./templates/**/*.jade')
    .pipe(jade({ client: true }))
    .pipe(gulp.dest('./public/resources/templates/'))
});

gulp.task('default', ['templates']);

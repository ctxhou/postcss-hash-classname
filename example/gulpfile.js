var gulp = require('gulp'),
    postcss = require('gulp-postcss');

var opts = {
  hashType: 'md5',
  digestType: 'base32',
  maxLength: 6,
  outputName: 'yoyo',
  dist: './dest',
  type: '.js'
};
var processors = [
  require('../')(opts)
];

gulp.task('default', function() {
  return gulp.src('./**.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest/'));
});

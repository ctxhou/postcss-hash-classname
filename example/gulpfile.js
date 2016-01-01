var gulp = require('gulp'),
    postcss = require('gulp-postcss');

var opts = {
  hashType: 'md5',
  digestType: 'base32',
  maxLength: 6,
  outputName: 'sdjifjsofsoidj',
  classnameFormat: 'prefix_[classname]-[hash]',
  type: '.json'
};
var processors = [
  require('../')(opts)
];

gulp.task('default', function() {
  return gulp.src(['./component*/*.css'])
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest/'));
});

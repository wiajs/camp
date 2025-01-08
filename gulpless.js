/* eslint no-console: ["error", { allow: ["log"] }] */
/* eslint global-require: "off" */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const gulp = require('gulp');
const buildLess = require('../ui/f7/f7.js');

const env = process.env.NODE_ENV || 'dev';
const prj = 'etrip';

function css(cb) {
  buildLess(prj);
  if (cb)
    cb();
}

// Tasks
gulp.task('core-styles', buildLess);

// eslint-disable-next-line
gulp.task('build-core', gulp.series([
  'core-styles',
  // ...(env === 'dev' ? [] : ['core-lazy-components']),
]));

// Watchers
const watch = {
  core() {
    gulp.watch('./src/**/*.less', gulp.series([
      'core-styles',
      'core-components',
      ...(env === 'dev' ? [] : ['core-lazy-components']),
    ]));
  },
};

gulp.task('watch-core', () => {
  watch.core();
});

exports.default = css;

// gulp.parallel(css, () => {
//   // gulp.watch('src/**/*.html', gulp.series(html));
//   // gulp.watch('./src/**/*.less', css);
// });

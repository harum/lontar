const gulp = require('gulp');
const size = require('gulp-size');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');

const defaultSetting = {
  dest: '',
  src: [],
  minOptions: {
    optimizationLevel: 5,
  },
};

function imageGenerator(customSetting) {
  const setting = {
    ...defaultSetting,
    ...customSetting,
  };

  function generateImage(cb) {
    gulp.src(setting.src)
      .pipe(newer(setting.dest))
      .pipe(imagemin(setting.minOptions))
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(setting.dest));

    cb();
  };

  return {
    generateImage,
    watch(cb) {
      gulp.watch(setting.src, generateImage);
      cb();
    },
  };
};

module.exports = imageGenerator;

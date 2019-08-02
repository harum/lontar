const gulp = require('gulp');
const pagesGenerator = require('./pagesGenerator');
const cssGenerator = require('./cssGenerator');
const imageGenerator = require('./imageGenerator');
const jsGenerator = require('./jsGenerator');

function landingPageGenerator() {
  const pageSetting = {
    dest: 'projects/landingPage/www',
    src: [
      'projects/landingPage/pages/*.{html,hbs}',
      'projects/landingPage/pages/**/*.{html,hbs}',
    ],
    partials: [
      'projects/landingPage/partials/*.{html,hbs}',
      'projects/landingPage/partials/**/*.{html,hbs}',
    ],
    data: [
      'projects/landingPage/data/*.{js,json}',
      'projects/landingPage/data/**/*.{js,json}',
    ],
  };

  const cssSetting = {
    dest: 'projects/landingPage/www/assets/css',
    src: ['projects/landingPage/scss/*.scss'],
    watch: [
      'projects/designSystem/scss/**/*.scss',
      'projects/landingPage/scss/**/*.scss',
    ],
  };

  const imageSetting = {
    dest: 'projects/landingPage/www/assets/images',
    src: ['projects/landingPage/images/*.{jpg,jpeg,png,svg}'],
  };

  const jsSetting = {
    dest: 'projects/landingPage/www/assets/js',
    src: [
      'shared/js/*.js',
      'shared/js/**/*.js',
    ],
    entry: 'shared/js/index.js',
  };

  const swSetting = {
    dest: 'projects/landingPage/www',
    src: [
      'shared/js/serviceWorker.js',
    ],
    entry: 'shared/js/serviceWorker.js',
    moduleFolder: false,
  };

  const page = pagesGenerator(pageSetting);
  const css = cssGenerator(cssSetting);
  const image = imageGenerator(imageSetting);
  const js = jsGenerator(jsSetting);
  const sw = jsGenerator(swSetting);

  return gulp.series(
    gulp.parallel(
      page.generatePage,
      css.generateCss,
      image.generateImage,
      js.generateJsModule,
      js.generateJsBundle,
      sw.generateJsModule,
    ),
    gulp.parallel(
      page.watch,
      css.watch,
      image.watch,
      js.watch,
      sw.watch,
    ),
  );
};

module.exports = landingPageGenerator;

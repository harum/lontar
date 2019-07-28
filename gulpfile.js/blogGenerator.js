const gulp = require('gulp');
const pagesGenerator = require('./pagesGenerator');
const cssGenerator = require('./cssGenerator');
const imageGenerator = require('./imageGenerator');
const jsGenerator = require('./jsGenerator');

function blogGenerator() {
  const pageSetting = {
    dest: 'projects/blog/www',
    src: [
      'projects/blog/pages/*.{html,hbs}',
      'projects/blog/pages/**/*.{html,hbs}',
    ],
    partials: [
      'projects/blog/partials/*.{html,hbs}',
      'projects/blog/partials/**/*.{html,hbs}',
    ],
    helpers: [
      'projects/blog/helpers/*.js',
      'projects/blog/helpers/**/*.js',
    ],
    data: [
      'projects/blog/data/*.{js,json}',
      'projects/blog/data/**/*.{js,json}',
    ],
  };

  const cssSetting = {
    dest: 'projects/blog/www/assets/css',
    src: ['projects/blog/scss/*.scss'],
    watch: [
      'projects/designSystem/scss/**/*.scss',
      'projects/blog/scss/**/*.scss',
    ],
  };

  const imageSetting = {
    dest: 'projects/blog/www/assets/images',
    src: ['projects/blog/images/*.{jpg,jpeg,png,svg}'],
  };

  const jsSetting = {
    dest: 'projects/blog/www/assets/js',
    src: [
      'shared/js/*.js',
      'shared/js/**/*.js',
    ],
    entry: 'shared/js/index.js',
  };

  const swSetting = {
    dest: 'projects/blog/www',
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

module.exports = blogGenerator;

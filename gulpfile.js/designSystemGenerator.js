const gulp = require('gulp');
const pagesGenerator = require('./pagesGenerator');
const cssGenerator = require('./cssGenerator');
const imageGenerator = require('./imageGenerator');
const jsGenerator = require('./jsGenerator');

function designSystem() {
  const pageSetting = {
    dest: 'projects/designSystem/www',
    src: [
      'projects/designSystem/docs/*.{html,hbs}',
      'projects/designSystem/docs/posts/*.{html,hbs}',
    ],
    partials: [
      'projects/designSystem/docs/partials/*.{html,hbs}',
      'projects/designSystem/docs/partials/**/*.{html,hbs}',
    ],
  };

  const cssSetting = {
    dest: 'projects/designSystem/www/assets/css',
    src: ['projects/designSystem/scss/*.scss'],
    watch: ['projects/designSystem/scss/**/*.scss'],
  };

  const imageSetting = {
    dest: 'projects/designSystem/www/assets/images',
    src: ['projects/designSystem/images/*.{jpg,jpeg,png,svg}'],
  };

  const jsSetting = {
    dest: 'projects/designSystem/www/assets/js',
    src: ['projects/designSystem/js/**/*.js'],
    entry: 'projects/designSystem/js/index.js',
  };

  const page = pagesGenerator(pageSetting);
  const css = cssGenerator(cssSetting);
  const image = imageGenerator(imageSetting);
  const js = jsGenerator(jsSetting);

  return gulp.series(
    gulp.parallel(
      page.generatePage,
      css.generateCss,
      image.generateImage,
      js.generateJsModule,
      js.generateJsBundle,
    ),
    gulp.parallel(
      page.watch,
      css.watch,
      image.watch,
      js.watch,
    ),
  );
};

module.exports = designSystem;

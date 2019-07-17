const pagesGenerator = require('./pagesGenerator');
const cssGenerator = require('./cssGenerator');

function designSystem() {
  const pageSetting = {
    dest: './projects/designSystem/www',
    src: ['./projects/designSystem/docs/*.{html,hbs}'],
    partials: ['./projects/designSystem/docs/partials/**/*.{html,hbs}'],
  };

  const cssSetting = {
    dest: './projects/designSystem/www/css',
    src: ['./projects/designSystem/scss/*.scss'],
    watch: ['./projects/designSystem/scss/**/*.scss'],
  };

  const pg = pagesGenerator(pageSetting);
  const cg = cssGenerator(cssSetting);

  pg.generate();
  pg.watch();
  cg.generate();
  cg.watch();

};

exports.designSystem = designSystem;

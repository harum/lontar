module.exports = (function() {
  return {
    init() {
      const xx = 'rosokA';
      const yy = xx + 'holla';
      console.log('xx', yy);
      const btn = document.getElementById('scroll-top-button');

      btn.addEventListener('click', function(e) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });

      window.addEventListener('scroll', function(e) {
        const action = window.scrollY > 150 ? 'add' : 'remove';
        btn.classList[action]('show');
      });
    }
  };
}());

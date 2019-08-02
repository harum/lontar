export default (function() {
  return {
    init() {
      const btn = document.getElementById('scroll-top-button');
      if (!btn) return;

      btn.addEventListener('click', function(e) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });

      window.addEventListener('scroll', function(e) {
        const action = window.scrollY > 150 ? 'add' : 'remove';
        btn.classList[action]('c-scroll-top-button--visible');
      });
    }
  };
}());

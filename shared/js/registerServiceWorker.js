export default function registerServiceWorker() {
  const refreshCta = document.querySelector('#refresh-cta');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
    .then(function(registration) {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service worker registration failed, error:', error);
    });

    navigator.serviceWorker.onmessage = function receiveMessage(event) {
      const data = JSON.parse(event.data);
      if ( data.type === 'refresh') {
        refreshCta.hidden = false;
      }
    };
  }
};

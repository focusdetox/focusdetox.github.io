(function () {
  // Public client-side token — safe to commit. Get it from
  // Paddle Dashboard → Developer Tools → Authentication → Client-side tokens.
  var PADDLE_CLIENT_TOKEN = 'live_c2c5bc1f4e1a49bcf00dbc74340';

  // 'sandbox' or 'production' — must match your PADDLE_ENV on Convex.
  var PADDLE_ENV = 'production';

  var params = new URLSearchParams(window.location.search);
  var txn = params.get('_ptxn');
  var statusEl = document.getElementById('status');

  function setStatus(s) {
    if (statusEl) statusEl.textContent = s;
  }

  if (!txn) {
    setStatus('Missing transaction id.');
    return;
  }

  try {
    Paddle.Environment.set(PADDLE_ENV);
    Paddle.Initialize({
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: function (ev) {
        if (ev.name === 'checkout.completed') setStatus('Thanks. You can close this window.');
        if (ev.name === 'checkout.closed') setStatus('Closed.');
      }
    });
    Paddle.Checkout.open({ transactionId: txn });
  } catch (e) {
    setStatus('Could not open checkout: ' + (e && e.message ? e.message : e));
  }
})();

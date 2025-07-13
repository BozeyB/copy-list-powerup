const t = TrelloPowerUp.iframe();

document.getElementById('authorize-btn').addEventListener('click', function () {
  const returnUrl = 'https://trello.com/1/authorize?' + new URLSearchParams({
    expiration: 'never',
    name: 'Copy List Power-Up',
    scope: 'read,write',
    response_type: 'token',
    key: 'YOUR_TRELLO_API_KEY',
    return_url: window.location.origin + '/auth/callback'
  });

  window.location.href = returnUrl;
});

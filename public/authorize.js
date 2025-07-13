(async function () {
  try {
    const res = await fetch('/api/get-request-token');
    const data = await res.json();

    const token = new URLSearchParams(data.raw).get('oauth_token');
    const authUrl = `https://trello.com/1/OAuthAuthorizeToken?oauth_token=${token}&name=Copy+List+Power-Up&expiration=never&scope=read,write`;

    // Full browser redirect (not inside iframe)
    window.top.location.href = authUrl;
  } catch (err) {
    console.error("Authorization flow failed:", err);
  }
})();

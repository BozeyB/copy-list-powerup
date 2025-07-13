const t = TrelloPowerUp.iframe();

t.authorize(function(tArg, options) {
  // Return the URL to your server’s auth callback
  const params = new URLSearchParams(window.location.hash.slice(1));
  const secret = params.get("secret");
  
  return `https://copy-list-powerup.vercel.app/auth/callback?secret=${secret}`;
});

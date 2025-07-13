(async () => {
  try {
    // Parse the hash fragment into an object
    const hash = decodeURIComponent(window.location.hash.substring(1));
    const { secret } = JSON.parse(hash);

    // Step 1: Get a request token from your backend
    const response = await fetch(`/api/get-request-token`);
    const { oauth_token } = await response.json();

    // Step 2: Redirect the user to Trello to approve access
    const authorizeUrl = `https://trello.com/1/OAuthAuthorizeToken?oauth_token=${oauth_token}&name=Copy+List+to+Multiple+Boards&expiration=never&scope=read,write`;
    window.location.href = authorizeUrl;
  } catch (err) {
    console.error("Authorization flow failed:", err);
    document.body.innerText = "⚠️ Authorization failed. Check console for details.";
  }
})();

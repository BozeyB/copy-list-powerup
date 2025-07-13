import oauthSignature from "oauth-signature";

export default async function handler(req, res) {
  const oauth = {
    callback: "https://copy-list-powerup.vercel.app/authorized.html",
    consumer_key: process.env.TRELLO_API_KEY,
    consumer_secret: process.env.TRELLO_API_SECRET,
    signature_method: "HMAC-SHA1",
    timestamp: Math.floor(Date.now() / 1000),
    nonce: Math.random().toString(36).substring(2)
  };

  const url = "https://trello.com/1/OAuthGetRequestToken";

  const params = {
    oauth_callback: oauth.callback,
    oauth_consumer_key: oauth.consumer_key,
    oauth_nonce: oauth.nonce,
    oauth_signature_method: oauth.signature_method,
    oauth_timestamp: oauth.timestamp,
    oauth_version: "1.0"
  };

  const signature = oauthSignature.generate("GET", url, params, process.env.TRELLO_API_SECRET);
  const query = new URLSearchParams({ ...params, oauth_signature: signature }).toString();

  try {
    const trelloRes = await fetch(`${url}?${query}`);
    const text = await trelloRes.text();

    const result = Object.fromEntries(new URLSearchParams(text));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch request token", detail: err.message });
  }
}

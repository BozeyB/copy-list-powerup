import oauthSignature from 'oauth-signature';
import crypto from 'crypto';
import fetch from 'node-fetch';

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_SECRET = process.env.TRELLO_API_SECRET;
const CALLBACK_URL = 'https://copy-list-powerup.vercel.app/api/oauth-callback';

export default async function handler(req, res) {
  const oauth = {
    oauth_callback: CALLBACK_URL,
    oauth_consumer_key: TRELLO_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
  };

  const signature = oauthSignature.generate(
    'POST',
    'https://trello.com/1/OAuthGetRequestToken',
    oauth,
    TRELLO_API_SECRET
  );

  const authHeader = `OAuth ${Object.entries({
    ...oauth,
    oauth_signature: signature
  }).map(([k, v]) => `${k}="${encodeURIComponent(v)}"`).join(', ')}`;

  try {
    const response = await fetch('https://trello.com/1/OAuthGetRequestToken', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      }
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Failed Trello OAuth response:", text);
      return res.status(response.status).json({ error: text });
    }

    res.status(200).json({ raw: text });
  } catch (err) {
    console.error("OAuth request failed:", err);
    res.status(500).json({ error: err.message });
  }
}

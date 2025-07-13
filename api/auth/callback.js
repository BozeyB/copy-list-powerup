export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`
    <html>
      <head><title>Authorization Complete</title></head>
      <body>
        <h2>Authorization successful. You may close this window.</h2>
        <script>
          window.TrelloPowerUp && window.TrelloPowerUp.iframe().closeModal();
        </script>
      </body>
    </html>
  `);
}
app.get('/auth/callback', async (req, res) => {
  const secret = req.query.secret;

  if (!secret) {
    return res.status(400).send('Missing secret');
  }

  // You could validate the secret or use it to get a Trello token

  return res.send('Authorization complete. You can close this window.');
});

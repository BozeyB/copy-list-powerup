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

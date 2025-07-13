TrelloPowerUp.initialize({});

TrelloPowerUp.authorize({
  name: "Copy List to Multiple Boards",
  scope: {
    read: true,
    write: true
  },
  expiration: "never",
  return_url: "https://copy-list-powerup.vercel.app/close.html"
});

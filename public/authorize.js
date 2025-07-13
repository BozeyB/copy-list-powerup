const t = TrelloPowerUp.iframe();

t.authorize({
  name: "Copy List to Multiple Boards",
  scope: {
    read: true,
    write: true
  },
  expiration: "never"
});

const t = TrelloPowerUp.iframe();

t.authorize({
  type: 'popup',
  persist: true,
  interactive: true,
  scope: {
    read: true,
    write: true
  },
  expiration: 'never',
  name: 'Copy List to Multiple Boards',
})
.then(() => {
  t.closePopup();
})
.catch((err) => {
  console.error("Authorization failed:", err);
});

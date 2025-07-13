TrelloPowerUp.authorize({
  type: 'popup',
  persist: true,
  interactive: true,
  scope: {
    read: true,
    write: true
  },
  expiration: 'never',
  name: 'Copy List to Multiple Boards'
})
.then(() => {
  window.close(); // or redirect to a "success" page
})
.catch((err) => {
  console.error("Authorization failed:", err);
});

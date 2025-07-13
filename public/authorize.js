window.TrelloPowerUp.authorize({
  type: 'popup',
  scope: {
    read: true,
    write: true
  },
  expiration: 'never',
  name: 'Copy List to Multiple Boards',
  persist: true,
  interactive: true
});

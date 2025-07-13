Trello.authorize({
  type: 'popup',
  name: 'Copy List to Multiple Boards',
  scope: {
    read: true,
    write: true
  },
  expiration: 'never',
  persist: true,
  success: function () {
    const token = Trello.token();
    const t = TrelloPowerUp.iframe();
    t.set('member', 'private', 'authToken', token).then(() => {
      window.close();
    });
  },
  error: function () {
    alert("Authorization failed.");
  }
});

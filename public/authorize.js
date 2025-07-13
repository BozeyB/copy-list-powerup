// This uses the correct Trello client library method
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
    const t = window.TrelloPowerUp.iframe();
    t.set('member', 'private', 'authToken', token).then(() => {
      window.close(); // Close the popup after success
    });
  },
  error: function () {
    alert('Authorization failed. Please try again.');
  }
});

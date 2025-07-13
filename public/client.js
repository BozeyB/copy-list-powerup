const TrelloPowerUp = window.TrelloPowerUp;

function showCopyListPopup(t) {
  return t.popup({
    title: "Copy List to Multiple Boards",
    url: "./popup.html",
    height: 600,
    width: 600
  });
}

TrelloPowerUp.initialize({

  // Board button that checks authorization first
  'board-buttons': function (t) {
    return [
      {
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828859.png",
        text: "Copy List",
        callback: function (t) {
          return t.get('member', 'private', 'authToken')
            .then(function (token) {
              if (token) {
                return showCopyListPopup(t);
              } else {
                return t.popup({
                  title: "Authorize This Power-Up",
                  url: "./authorize.html",
                  height: 140
                });
              }
            });
        }
      }
    ];
  },

  // Trello calls this when Power-Up is enabled on a board
  'on-enable': function (t) {
    return Promise.resolve();
  },

  // Trello calls this when Power-Up is removed from a board
  'on-disable': function (t) {
    return Promise.resolve();
  },

  // Required for OAuth: tells Trello if the user is authorized
  'authorization-status': function (t) {
    return t.get('member', 'private', 'authToken')
      .then(function (token) {
        if (token) {
          return t.authorized(); // Use t.authorized() instead of manually returning object
        } else {
          return t.notAuthorized(); // Likewise, use t.notAuthorized()
        }
      });
  },

  // Required for OAuth: tells Trello how to show the authorization UI
  'show-authorization': function (t) {
    return t.popup({
      title: "Authorize This Power-Up",
      url: "./authorize.html",
      height: 140
    });
  }
});

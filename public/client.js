function showCopyListPopup(t) {
  return t.popup({
    title: "Copy List to Multiple Boards",
    url: "./popup.html",
    height: 600,
    width: 600
  });
}

window.TrelloPowerUp.initialize({

  // Board button
  'board-buttons': function (t, options) {
    return [
      {
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828859.png",
        text: "Copy List",
        callback: function(t) {
          return t.get('member', 'private', 'authToken')
            .then(function(token) {
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
  'on-enable': function (t, opts) {
    // Trello fires this once when the Power-Up is enabled.
    // We don’t need to do anything, just resolve.
    return Promise.resolve();
  },
  'on-disable': function (t) {
  return Promise.resolve(); // No action needed when Power-Up is disabled
},
  // Required by Trello to support OAuth
  'authorization-status': function (t) {
    return t.get('member', 'private', 'authToken')
      .then(function(token) {
        return { authorized: !!token };
      });
  },

  'show-authorization': function (t) {
    return t.popup({
      title: "Authorize This Power-Up",
      url: "./authorize.html",
      height: 140
    });
  }
});

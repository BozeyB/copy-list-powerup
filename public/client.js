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

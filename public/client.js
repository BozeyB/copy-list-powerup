function showCopyListPopup(t) {
  return t.popup({
    title: "Copy List to Multiple Boards",
    url: "./popup.html",
    height: 600,
    width: 600
  });
}

function showSettingsPopup(t) {
  return t.popup({
    title: "Configure Trello API",
    url: "./settings.html",
    height: 200
  });
}

window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    return [
      {
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828859.png",
        text: "Copy List",
        callback: showCopyListPopup
      },
      {
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828859.png",
        text: "Settings",
        callback: showSettingsPopup
      }
    ];
  }
});

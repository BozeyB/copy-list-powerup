function showCopyListPopup(t) {
  return t.popup({
    title: "Copy List to Multiple Boards",
    url: "./popup.html",
    height: 600,
    width: 600
  });
}

window.TrelloPowerUp.initialize({
  "board-buttons": function (t, options) {
    return [
      {
        icon: "https://cdn-icons-png.flaticon.com/512/1828/1828859.png",
        text: "Copy List",
        callback: showCopyListPopup
      }
    ];
  }
});
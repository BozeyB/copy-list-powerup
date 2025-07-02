// This file runs on Trello boards and registers Power-Up capabilities.
// Do NOT include iframe logic here!

function showCopyListPopup(t) {
  return t.popup({
    title: 'Copy List to Another Board',
    url: './popup.html', // this is the separate popup file you will create
    height: 300
  });
}

window.TrelloPowerUp.initialize({
  'board-buttons': function (t, options) {
    return [
      {
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828859.png', // optional: a clipboard icon
        text: 'Copy List',
        callback: showCopyListPopup
      }
    ];
  }
});

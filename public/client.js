window.TrelloPowerUp.initialize({
  'board-buttons': function (t, options) {
    return [{
      text: 'Copy List',
      callback: function(t) {
        return t.popup({
          title: 'Copy List to Another Board',
          url: './index.html',
          height: 300
        });
      }
    }];
  }
});

const t = TrelloPowerUp.iframe();

const form = document.getElementById("copyForm");
const sourceListSelect = document.getElementById("sourceList");
const statusDiv = document.getElementById("status");

// Load the current board’s lists
t.lists("id", "name").then((lists) => {
  lists.forEach((list) => {
    const opt = document.createElement("option");
    opt.value = list.id;
    opt.textContent = list.name;
    sourceListSelect.appendChild(opt);
  });
});

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusDiv.textContent = "Copying cards...";

  const sourceListId = sourceListSelect.value;
  const targetListId = document.getElementById("targetListId").value.trim();

  try {
    const res = await fetch(
      `/copy-list?sourceListId=${sourceListId}&targetListId=${targetListId}`
    );
    const text = await res.text();
    statusDiv.textContent = text;
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "An error occurred. Check the console.";
  }
});

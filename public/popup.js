const t = TrelloPowerUp.iframe();

const form = document.getElementById("copyForm");
const sourceListSelect = document.getElementById("sourceList");
const statusDiv = document.getElementById("status");

t.lists("id", "name").then((lists) => {
  lists.forEach((list) => {
    const opt = document.createElement("option");
    opt.value = list.id;
    opt.textContent = list.name;
    sourceListSelect.appendChild(opt);
  });
});

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
    statusDiv.textContent = "An error occurred.";
  }
});

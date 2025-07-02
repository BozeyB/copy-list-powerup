document.addEventListener("DOMContentLoaded", async function () {
  const t = TrelloPowerUp.iframe();
  const form = document.getElementById("copyForm");
  const sourceListSelect = document.getElementById("sourceList");
  const targetListsDiv = document.getElementById("targetLists");
  const statusDiv = document.getElementById("status");

  // Load source lists from current board
  try {
    const sourceLists = await t.lists("id", "name");
    sourceLists.forEach(list => {
      const opt = document.createElement("option");
      opt.value = list.id;
      opt.textContent = list.name;
      sourceListSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading source lists", err);
    statusDiv.textContent = "Failed to load source lists.";
  }

  // Load all boards/lists from server
  try {
    const res = await fetch("/user-boards");
    const boards = await res.json();

    boards.forEach(board => {
      const boardHeader = document.createElement("h4");
      boardHeader.textContent = board.boardName;
      targetListsDiv.appendChild(boardHeader);

      board.lists.forEach(list => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = list.id;
        checkbox.name = "targetList";
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + list.name));
        targetListsDiv.appendChild(label);
      });
    });
  } catch (err) {
    console.error("Error loading target lists", err);
    statusDiv.textContent = "Could not load target boards/lists.";
  }

  // Submit form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusDiv.textContent = "Copying cards...";

    const sourceListId = sourceListSelect.value;
    const checkboxes = document.querySelectorAll("input[name='targetList']:checked");
    const targetListIds = Array.from(checkboxes).map(cb => cb.value);

    if (targetListIds.length === 0) {
      statusDiv.textContent = "Select at least one target list.";
      return;
    }

    try {
      const res = await fetch("/copy-to-many", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceListId, targetListIds })
      });

      const msg = await res.text();
      statusDiv.textContent = msg;
    } catch (err) {
      console.error(err);
      statusDiv.textContent = "Error during copy.";
    }
  });
});

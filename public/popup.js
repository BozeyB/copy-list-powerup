document.addEventListener("DOMContentLoaded", async function () {
  const t = TrelloPowerUp.iframe();
  const form = document.getElementById("copyForm");
  const sourceListSelect = document.getElementById("sourceList");
  const targetListsDiv = document.getElementById("targetLists");
  const targetBoardsDiv = document.getElementById("targetBoards");
  const statusDiv = document.getElementById("status");

  const modeRadios = document.querySelectorAll("input[name='copyMode']");

  modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const useExisting = radio.value === "existing";
      targetListsDiv.style.display = useExisting ? "block" : "none";
      targetBoardsDiv.style.display = useExisting ? "none" : "block";
    });
  });

  // ✅ Get source list options (from current board)
  const sourceLists = await t.lists("id", "name");
  sourceLists.forEach(list => {
    const opt = document.createElement("option");
    opt.value = list.id;
    opt.textContent = list.name;
    sourceListSelect.appendChild(opt);
  });
 
  try {
    const res = await fetch(`https://copy-list-powerup.vercel.app/api/user-boards?apiKey=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`);
    const boards = await res.json();

    boards.forEach(board => {
      // Existing Target Lists
      const boardLabel = document.createElement("h4");
      boardLabel.textContent = board.boardName;
      targetListsDiv.appendChild(boardLabel);

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

      // New List in Boards
      const boardBoxLabel = document.createElement("label");
      const boardCheckbox = document.createElement("input");
      boardCheckbox.type = "checkbox";
      boardCheckbox.value = board.boardId;
      boardCheckbox.name = "targetBoard";
      boardBoxLabel.appendChild(boardCheckbox);
      boardBoxLabel.appendChild(document.createTextNode(" " + board.boardName));
      targetBoardsDiv.appendChild(boardBoxLabel);
    });
  } catch (err) {
    console.error("Error loading target boards/lists:", err);
    statusDiv.textContent = "Could not load target boards/lists.";
  }

  // Submit Copy Form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusDiv.textContent = "Copying cards...";

    const sourceListId = sourceListSelect.value;
    const copyMode = document.querySelector("input[name='copyMode']:checked").value;

    if (copyMode === "existing") {
      const checkboxes = document.querySelectorAll("input[name='targetList']:checked");
      const targetListIds = Array.from(checkboxes).map(cb => cb.value);

      if (!targetListIds.length) {
        statusDiv.textContent = "Select at least one target list.";
        return;
      }

      const res = await fetch("/api/copy-to-many", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceListId, targetListIds })
      });
      const msg = await res.text();
      statusDiv.textContent = msg;

    } else {
      const checkboxes = document.querySelectorAll("input[name='targetBoard']:checked");
      const targetBoardIds = Array.from(checkboxes).map(cb => cb.value);

      if (!targetBoardIds.length) {
        statusDiv.textContent = "Select at least one board.";
        return;
      }

      const res = await fetch("/api/copy-to-new-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceListId, targetBoardIds })
      });
      const msg = await res.text();
      statusDiv.textContent = msg;
    }
  });
});

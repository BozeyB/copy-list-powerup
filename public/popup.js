document.addEventListener("DOMContentLoaded", async function () {
  const t = TrelloPowerUp.iframe();
  const form = document.getElementById("copyForm");
  const sourceListSelect = document.getElementById("sourceList");
  const targetListsDiv = document.getElementById("targetLists");
  const targetBoardsDiv = document.getElementById("targetBoards");
  const statusDiv = document.getElementById("status");

  const modeRadios = document.querySelectorAll("input[name='copyMode']");

  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "existing" && radio.checked) {
        targetListsDiv.style.display = "block";
        targetBoardsDiv.style.display = "none";
      } else if (radio.value === "new" && radio.checked) {
        targetListsDiv.style.display = "none";
        targetBoardsDiv.style.display = "block";
      }
    });
  });

  // Load current board's source lists
  const sourceLists = await t.lists("id", "name");
  sourceLists.forEach((list) => {
    const opt = document.createElement("option");
    opt.value = list.id;
    opt.textContent = list.name;
    sourceListSelect.appendChild(opt);
  });

  // Load all boards and their lists
  try {
    const res = await fetch("/user-boards");
    const boards = await res.json();

    boards.forEach((board) => {
      // Existing list checkboxes
      const boardLabel = document.createElement("h4");
      boardLabel.textContent = board.boardName;
      targetListsDiv.appendChild(boardLabel);

      board.lists.forEach((list) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = list.id;
        checkbox.name = "targetList";
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + list.name));
        targetListsDiv.appendChild(label);
      });

      // New board checkboxes (just boards, not lists)
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
    console.error("Error loading boards/lists", err);
    statusDiv.textContent = "Could not load target boards/lists.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusDiv.textContent = "Copying cards...";

    const sourceListId = sourceListSelect.value;
    const copyMode = document.querySelector(
      "input[name='copyMode']:checked"
    ).value;

    if (copyMode === "existing") {
      const checkboxes = document.querySelectorAll(
        "input[name='targetList']:checked"
      );
      const targetListIds = Array.from(checkboxes).map((cb) => cb.value);

      if (targetListIds.length === 0) {
        statusDiv.textContent = "Select at least one target list.";
        return;
      }

      try {
        const res = await fetch("/copy-to-many", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceListId, targetListIds }),
        });

        const msg = await res.text();
        statusDiv.textContent = msg;
      } catch (err) {
        console.error(err);
        statusDiv.textContent = "Error during copy.";
      }
    } else if (copyMode === "new") {
      const checkboxes = document.querySelectorAll(
        "input[name='targetBoard']:checked"
      );
      const targetBoardIds = Array.from(checkboxes).map((cb) => cb.value);

      if (targetBoardIds.length === 0) {
        statusDiv.textContent = "Select at least one target board.";
        return;
      }

      try {
        const res = await fetch("/copy-to-new-lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceListId, targetBoardIds }),
        });

        const msg = await res.text();
        statusDiv.textContent = msg;
      } catch (err) {
        console.error(err);
        statusDiv.textContent = "Error during copy.";
      }
    }
  });
});

const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");
require("dotenv").config();

app.use(express.static("public"));
app.use(express.json());

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(__dirname, "manifest.json"));
});

// 🔁 Get all user boards and lists
app.get("/user-boards", async (req, res) => {
  try {
    const boards = await axios.get("https://api.trello.com/1/members/me/boards", {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN,
        fields: "name"
      }
    });

    const results = [];

    for (const board of boards.data) {
      const lists = await axios.get(`https://api.trello.com/1/boards/${board.id}/lists`, {
        params: {
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_TOKEN,
          fields: "name"
        }
      });

      results.push({
        boardName: board.name,
        boardId: board.id,
        lists: lists.data
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching boards/lists");
  }
});

// 🟦 Copy to existing lists (with card details)
app.post("/copy-to-many", async (req, res) => {
  const { sourceListId, targetListIds } = req.body;

  try {
    const cards = await axios.get(`https://api.trello.com/1/lists/${sourceListId}/cards`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });

    for (const targetListId of targetListIds) {
      for (const card of cards.data) {
        const newCard = await axios.post("https://api.trello.com/1/cards", null, {
          params: {
            name: card.name,
            desc: card.desc,
            due: card.due,
            dueComplete: card.dueComplete,
            idLabels: card.idLabels?.join(",") || "",
            idList: targetListId,
            key: process.env.TRELLO_API_KEY,
            token: process.env.TRELLO_TOKEN
          }
        });

        // 🔁 Clone checklists
        const checklists = await axios.get(`https://api.trello.com/1/cards/${card.id}/checklists`, {
          params: {
            key: process.env.TRELLO_API_KEY,
            token: process.env.TRELLO_TOKEN
          }
        });

        for (const checklist of checklists.data) {
          const newChecklist = await axios.post(`https://api.trello.com/1/cards/${newCard.data.id}/checklists`, null, {
            params: {
              name: checklist.name,
              key: process.env.TRELLO_API_KEY,
              token: process.env.TRELLO_TOKEN
            }
          });

          for (const item of checklist.checkItems) {
            await axios.post(`https://api.trello.com/1/checklists/${newChecklist.data.id}/checkItems`, null, {
              params: {
                name: item.name,
                state: item.state,
                pos: item.pos,
                key: process.env.TRELLO_API_KEY,
                token: process.env.TRELLO_TOKEN
              }
            });
          }
        }
      }
    }

    res.send("Cards copied to all target lists.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error copying cards.");
  }
});

// 🟦 Copy by creating a new list on each target board
app.post("/copy-to-new-lists", async (req, res) => {
  const { sourceListId, targetBoardIds } = req.body;

  try {
    const sourceList = await axios.get(`https://api.trello.com/1/lists/${sourceListId}`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });

    const listName = sourceList.data.name;

    const cards = await axios.get(`https://api.trello.com/1/lists/${sourceListId}/cards`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN
      }
    });

    for (const boardId of targetBoardIds) {
      const newList = await axios.post("https://api.trello.com/1/lists", null, {
        params: {
          name: listName,
          idBoard: boardId,
          pos: "bottom",
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_TOKEN
        }
      });

      for (const card of cards.data) {
        const newCard = await axios.post("https://api.trello.com/1/cards", null, {
          params: {
            name: card.name,
            desc: card.desc,
            due: card.due,
            dueComplete: card.dueComplete,
            idLabels: card.idLabels?.join(",") || "",
            idList: newList.data.id,
            key: process.env.TRELLO_API_KEY,
            token: process.env.TRELLO_TOKEN
          }
        });

        // 🔁 Clone checklists
        const checklists = await axios.get(`https://api.trello.com/1/cards/${card.id}/checklists`, {
          params: {
            key: process.env.TRELLO_API_KEY,
            token: process.env.TRELLO_TOKEN
          }
        });

        for (const checklist of checklists.data) {
          const newChecklist = await axios.post(`https://api.trello.com/1/cards/${newCard.data.id}/checklists`, null, {
            params: {
              name: checklist.name,
              key: process.env.TRELLO_API_KEY,
              token: process.env.TRELLO_TOKEN
            }
          });

          for (const item of checklist.checkItems) {
            await axios.post(`https://api.trello.com/1/checklists/${newChecklist.data.id}/checkItems`, null, {
              params: {
                name: item.name,
                state: item.state,
                pos: item.pos,
                key: process.env.TRELLO_API_KEY,
                token: process.env.TRELLO_TOKEN
              }
            });
          }
        }
      }
    }

    res.send("New lists created and cards copied.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating new lists or copying cards.");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + listener.address().port);
});

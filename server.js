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

// Get all boards and lists
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

// Copy cards from source to many target lists
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
        await axios.post("https://api.trello.com/1/cards", null, {
          params: {
            name: card.name,
            desc: card.desc,
            idList: targetListId,
            key: process.env.TRELLO_API_KEY,
            token: process.env.TRELLO_TOKEN
          }
        });
      }
    }

    res.send("Cards copied to all target lists.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error copying cards.");
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + listener.address().port);
});

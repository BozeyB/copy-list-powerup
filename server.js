const express = require("express");
const app = express();
const axios = require("axios");
require("dotenv").config();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Example backend endpoint to copy cards from one list to another
app.get("/copy-list", async (req, res) => {
  const { sourceListId, targetListId } = req.query;

  if (!sourceListId || !targetListId) {
    return res.status(400).send("Missing list IDs");
  }

  try {
    const cards = await axios.get(`https://api.trello.com/1/lists/${sourceListId}/cards`, {
      params: {
        key: process.env.TRELLO_API_KEY,
        token: process.env.TRELLO_TOKEN,
      },
    });

    for (const card of cards.data) {
      await axios.post(`https://api.trello.com/1/cards`, null, {
        params: {
          name: card.name,
          desc: card.desc,
          idList: targetListId,
          key: process.env.TRELLO_API_KEY,
          token: process.env.TRELLO_TOKEN,
        },
      });
    }

    res.send("Cards copied successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error copying cards");
  }
});

const listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Power-Up server is running on port " + listener.address().port);
});
const path = require("path");

// ... keep your existing code ...

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(__dirname, "manifest.json"));
});


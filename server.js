const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(helmet());

// CSP & HSTS headers required by Trello
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://*.trello.com https://p.trellocdn.com; frame-ancestors https://*.trello.com;"
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Serve static frontend
app.use(express.static("public"));

const API_BASE = "https://api.trello.com/1";
const { TRELLO_KEY, TRELLO_TOKEN } = process.env;

// Copy card helper with metadata
async function copyCard(card, targetListId) {
  const cardRes = await axios.post(`${API_BASE}/cards`, null, {
    params: {
      idList: targetListId,
      name: card.name,
      desc: card.desc,
      due: card.due,
      idLabels: card.idLabels.join(","),
      pos: "bottom",
      key: TRELLO_KEY,
      token: TRELLO_TOKEN
    }
  });

  const newCard = cardRes.data;

  const checklistsRes = await axios.get(`${API_BASE}/cards/${card.id}/checklists`, {
    params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
  });

  for (const checklist of checklistsRes.data) {
    const checklistRes = await axios.post(`${API_BASE}/checklists`, null, {
      params: {
        idCard: newCard.id,
        name: checklist.name,
        key: TRELLO_KEY,
        token: TRELLO_TOKEN
      }
    });

    for (const item of checklist.checkItems) {
      await axios.post(`${API_BASE}/checklists/${checklistRes.data.id}/checkItems`, null, {
        params: {
          name: item.name,
          pos: item.pos,
          checked: item.state === "complete",
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      });
    }
  }

  return newCard;
}

// Route: copy to existing lists
app.post("/api/copy-to-many", async (req, res) => {
  const { sourceListId, targetListIds } = req.body;
  try {
    const cardRes = await axios.get(`${API_BASE}/lists/${sourceListId}/cards`, {
      params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    const cards = cardRes.data;

    for (const targetListId of targetListIds) {
      for (const card of cards) {
        await copyCard(card, targetListId);
      }
    }

    res.send("✅ Cards copied to selected lists.");
  } catch (err) {
    res.status(500).send("Error copying cards.");
  }
});

// Route: copy to new lists
app.post("/api/copy-to-new-lists", async (req, res) => {
  const { sourceListId, targetBoardIds } = req.body;
  try {
    const sourceList = await axios.get(`${API_BASE}/lists/${sourceListId}`, {
      params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    const listName = sourceList.data.name;

    const cardRes = await axios.get(`${API_BASE}/lists/${sourceListId}/cards`, {
      params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    const cards = cardRes.data;

    for (const boardId of targetBoardIds) {
      const listRes = await axios.post(`${API_BASE}/lists`, null, {
        params: {
          name: listName,
          idBoard: boardId,
          pos: "bottom",
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      });

      for (const card of cards) {
        await copyCard(card, listRes.data.id);
      }
    }

    res.send("✅ Cards copied into new lists.");
  } catch (err) {
    res.status(500).send("Error copying to new lists.");
  }
});

// Route: return available boards/lists
app.get("/api/user-boards", async (req, res) => {
  try {
    const boardsRes = await axios.get(`${API_BASE}/members/me/boards`, {
      params: {
        key: TRELLO_KEY,
        token: TRELLO_TOKEN,
        fields: "id,name",
        lists: "open"
      }
    });

    const boards = await Promise.all(
      boardsRes.data.map(async (board) => {
        const listsRes = await axios.get(`${API_BASE}/boards/${board.id}/lists`, {
          params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
        });

        return {
          boardId: board.id,
          boardName: board.name,
          lists: listsRes.data
        };
      })
    );

    res.json(boards);
  } catch (err) {
    res.status(500).send("Error loading user boards.");
  }
});

// Route: Trello OAuth callback
app.get("/auth/callback", (req, res) => {
  res.send("Authorization complete. You can close this window.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Power-Up server is running on port ${PORT}`);
});

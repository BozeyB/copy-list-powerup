// api/copy-list.js
import axios from 'axios';

export default async function handler(req, res) {
  const { sourceListId, targetBoardIds, createNewList } = req.query;
  const apiKey = process.env.TRELLO_API_KEY;
  const apiToken = process.env.TRELLO_API_TOKEN;

  if (!apiKey || !apiToken) {
    return res.status(500).send("Missing Trello API credentials");
  }

  try {
    const sourceCardsRes = await axios.get(`https://api.trello.com/1/lists/${sourceListId}/cards`, {
      params: {
        key: apiKey,
        token: apiToken,
        attachments: true,
        checklists: 'all'
      }
    });

    const sourceCards = sourceCardsRes.data;

    for (const boardId of targetBoardIds.split(',')) {
      let targetListId;

      if (createNewList === 'true') {
        // Get source list name
        const sourceListRes = await axios.get(`https://api.trello.com/1/lists/${sourceListId}`, {
          params: { key: apiKey, token: apiToken }
        });

        const newList = await axios.post(`https://api.trello.com/1/boards/${boardId}/lists`, null, {
          params: {
            name: sourceListRes.data.name,
            key: apiKey,
            token: apiToken,
            pos: 'bottom'
          }
        });

        targetListId = newList.data.id;
      } else {
        // Use existing first list
        const targetLists = await axios.get(`https://api.trello.com/1/boards/${boardId}/lists`, {
          params: { key: apiKey, token: apiToken }
        });
        targetListId = targetLists.data[0]?.id;
      }

      for (const card of sourceCards) {
        const newCardRes = await axios.post(`https://api.trello.com/1/cards`, null, {
          params: {
            name: card.name,
            desc: card.desc,
            due: card.due,
            idList: targetListId,
            key: apiKey,
            token: apiToken,
            pos: 'bottom'
          }
        });

        const newCardId = newCardRes.data.id;

        // Copy labels
        for (const label of card.labels) {
          await axios.post(`https://api.trello.com/1/cards/${newCardId}/idLabels`, null, {
            params: {
              value: label.id,
              key: apiKey,
              token: apiToken
            }
          });
        }

        // Copy checklists
        const checklistsRes = await axios.get(`https://api.trello.com/1/cards/${card.id}/checklists`, {
          params: { key: apiKey, token: apiToken }
        });

        for (const checklist of checklistsRes.data) {
          const newChecklist = await axios.post(`https://api.trello.com/1/cards/${newCardId}/checklists`, null, {
            params: {
              name: checklist.name,
              key: apiKey,
              token: apiToken
            }
          });

          for (const item of checklist.checkItems) {
            await axios.post(`https://api.trello.com/1/checklists/${newChecklist.data.id}/checkItems`, null, {
              params: {
                name: item.name,
                checked: item.state === 'complete',
                key: apiKey,
                token: apiToken
              }
            });
          }
        }
      }
    }

    return res.status(200).send("Cards copied successfully to all selected boards!");
  } catch (error) {
    console.error("Error copying cards:", error.response?.data || error.message);
    return res.status(500).send("An error occurred while copying the cards.");
  }
}

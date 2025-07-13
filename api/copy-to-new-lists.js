export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { sourceListId, targetBoardIds, apiKey, token } = req.body;

  if (!sourceListId || !targetBoardIds || !apiKey || !token) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const cardsRes = await fetch(`https://api.trello.com/1/lists/${sourceListId}/cards?key=${apiKey}&token=${token}`);
    const cards = await cardsRes.json();

    for (const boardId of targetBoardIds) {
      const newListRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Copied from ${sourceListId}` })
      });
      const newList = await newListRes.json();

      for (const card of cards) {
        await fetch(`https://api.trello.com/1/cards?key=${apiKey}&token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: card.name,
            desc: card.desc,
            idList: newList.id,
            due: card.due,
            idLabels: card.idLabels
          })
        });
      }
    }

    res.status(200).send("Cards copied to new lists successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error copying to new lists.");
  }
}

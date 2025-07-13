export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { sourceListId, targetListIds, apiKey, token } = req.body;

  if (!sourceListId || !targetListIds || !apiKey || !token) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const cardsRes = await fetch(`https://api.trello.com/1/lists/${sourceListId}/cards?key=${apiKey}&token=${token}`);
    const cards = await cardsRes.json();

    for (const targetListId of targetListIds) {
      for (const card of cards) {
        await fetch(`https://api.trello.com/1/cards?key=${apiKey}&token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: card.name,
            desc: card.desc,
            idList: targetListId,
            due: card.due,
            idLabels: card.idLabels
          })
        });
      }
    }

    res.status(200).send("Cards copied successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error copying cards.");
  }
}

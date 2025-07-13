// api/user-boards.js

export default async function handler(req, res) {
  let token = req.query.token || req.body?.token;
  let apiKey = req.query.apiKey || req.body?.apiKey;

  if (!token || !apiKey) {
    return res.status(400).json({ error: 'Missing Trello credentials.' });
  }

  try {
    const boardsRes = await fetch(`https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}`);
    const boards = await boardsRes.json();

    const results = [];

    for (const board of boards) {
      const listsRes = await fetch(`https://api.trello.com/1/boards/${board.id}/lists?key=${apiKey}&token=${token}`);
      const lists = await listsRes.json();

      results.push({
        boardId: board.id,
        boardName: board.name,
        lists: lists.map(list => ({ id: list.id, name: list.name }))
      });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error("Trello fetch failed:", err);
    return res.status(500).json({ error: 'Failed to fetch boards/lists from Trello.' });
  }
}

// /api/user-boards.js

export default async function handler(req, res) {
  const TRELLO_KEY = process.env.TRELLO_KEY;
  const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

  if (!TRELLO_KEY || !TRELLO_TOKEN) {
    return res.status(500).json({ error: "Missing Trello credentials." });
  }

  try {
    // Fetch boards
    const boardsRes = await fetch(`https://api.trello.com/1/members/me/boards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`);
    const boards = await boardsRes.json();

    const boardsWithLists = await Promise.all(
      boards
        .filter((b) => !b.closed)
        .map(async (board) => {
          const listsRes = await fetch(`https://api.trello.com/1/boards/${board.id}/lists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`);
          const lists = await listsRes.json();

          return {
            boardId: board.id,
            boardName: board.name,
            lists: lists.filter((l) => !l.closed).map((l) => ({
              id: l.id,
              name: l.name
            }))
          };
        })
    );

    res.status(200).json(boardsWithLists);
  } catch (error) {
    console.error("Error fetching Trello boards/lists:", error);
    res.status(500).json({ error: "Failed to fetch boards/lists" });
  }
}

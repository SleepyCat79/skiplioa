import { db } from "../config/firebase.js";

export async function getCards(req, res) {
  try {
    const { boardId } = req.params;
    const snapshot = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
}

export async function getCard(req, res) {
  try {
    const doc = await db.collection("cards").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Card not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch card" });
  }
}

export async function createCard(req, res) {
  try {
    const { boardId } = req.params;
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: "Card name is required" });

    const cardRef = db.collection("cards").doc();
    const card = {
      id: cardRef.id,
      boardId,
      name,
      description: description || "",
      tasksCount: 0,
      listMember: [req.user.userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await cardRef.set(card);
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: "Failed to create card" });
  }
}

export async function updateCard(req, res) {
  try {
    const ref = db.collection("cards").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Card not found" });

    const { name, description } = req.body;
    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    await ref.update(updates);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    res.status(500).json({ error: "Failed to update card" });
  }
}

export async function deleteCard(req, res) {
  try {
    const cardRef = db.collection("cards").doc(req.params.id);
    const doc = await cardRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Card not found" });

    const tasksSnapshot = await db
      .collection("tasks")
      .where("cardId", "==", req.params.id)
      .get();
    const batch = db.batch();
    tasksSnapshot.docs.forEach((taskDoc) => batch.delete(taskDoc.ref));
    batch.delete(cardRef);
    await batch.commit();

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete card" });
  }
}

export async function getCardsByUser(req, res) {
  try {
    const { user_id } = req.params;
    const snapshot = await db
      .collection("cards")
      .where("listMember", "array-contains", user_id)
      .get();

    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user cards" });
  }
}

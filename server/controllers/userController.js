import { db } from "../config/firebase.js";

export async function getUsers(req, res) {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUser(req, res) {
  try {
    const doc = await db.collection("users").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("getUser error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function updateUser(req, res) {
  try {
    const { displayName, avatarUrl } = req.body;
    const ref = db.collection("users").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    await ref.update(updates);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
}

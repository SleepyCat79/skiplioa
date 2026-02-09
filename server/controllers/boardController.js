import { db } from "../config/firebase.js";

export async function createBoard(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Board name is required" });

    const boardRef = db.collection("boards").doc();
    const board = {
      id: boardRef.id,
      name,
      description: description || "",
      ownerId: req.user.userId,
      members: [req.user.userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await boardRef.set(board);
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: "Failed to create board" });
  }
}

export async function getBoards(req, res) {
  try {
    const snapshot = await db
      .collection("boards")
      .where("members", "array-contains", req.user.userId)
      .get();

    const boards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
}

export async function getBoard(req, res) {
  try {
    const doc = await db.collection("boards").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Board not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch board" });
  }
}

export async function updateBoard(req, res) {
  try {
    const { name, description } = req.body;
    const ref = db.collection("boards").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: "Board not found" });

    const updates = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    await ref.update(updates);
    const updated = await ref.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    res.status(500).json({ error: "Failed to update board" });
  }
}

export async function deleteBoard(req, res) {
  try {
    const ref = db.collection("boards").doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Board not found" });

    const cardsSnapshot = await db
      .collection("cards")
      .where("boardId", "==", req.params.id)
      .get();
    const batch = db.batch();

    for (const cardDoc of cardsSnapshot.docs) {
      const tasksSnapshot = await db
        .collection("tasks")
        .where("cardId", "==", cardDoc.id)
        .get();
      tasksSnapshot.docs.forEach((taskDoc) => batch.delete(taskDoc.ref));
      batch.delete(cardDoc.ref);
    }

    batch.delete(ref);
    await batch.commit();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete board" });
  }
}

export async function inviteMember(req, res) {
  try {
    const { boardId } = req.params;
    const { emailMember } = req.body;

    if (!emailMember)
      return res.status(400).json({ error: "Member email is required" });

    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists)
      return res.status(404).json({ error: "Board not found" });

    const board = boardDoc.data();
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", emailMember)
      .get();

    let memberId = null;
    if (!usersSnapshot.empty) {
      memberId = usersSnapshot.docs[0].id;
    }

    const inviteRef = db.collection("invitations").doc();
    const invitation = {
      inviteId: inviteRef.id,
      boardId,
      boardOwnerId: req.user.userId,
      memberId: memberId || "",
      emailMember,
      boardName: board.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await inviteRef.set(invitation);

    try {
      const { sendInvitationEmail } =
        await import("../services/emailService.js");
      await sendInvitationEmail(emailMember, board.name, req.user.email);
    } catch {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send invitation" });
  }
}

export async function respondInvitation(req, res) {
  try {
    const { inviteId, status } = req.body;
    if (!inviteId || !["accepted", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const inviteRef = db.collection("invitations").doc(inviteId);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists)
      return res.status(404).json({ error: "Invitation not found" });

    await inviteRef.update({ status });

    if (status === "accepted") {
      const invite = inviteDoc.data();
      const boardRef = db.collection("boards").doc(invite.boardId);
      const boardDoc = await boardRef.get();

      if (boardDoc.exists) {
        const members = boardDoc.data().members || [];
        if (!members.includes(req.user.userId)) {
          members.push(req.user.userId);
          await boardRef.update({ members });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to respond to invitation" });
  }
}

export async function getInvitations(req, res) {
  try {
    const byMemberId = await db
      .collection("invitations")
      .where("memberId", "==", req.user.userId)
      .where("status", "==", "pending")
      .get();

    const userDoc = await db.collection("users").doc(req.user.userId).get();
    const userEmail = userDoc.exists ? userDoc.data().email : "";

    const byEmail = await db
      .collection("invitations")
      .where("emailMember", "==", userEmail)
      .where("status", "==", "pending")
      .get();

    const map = new Map();
    byMemberId.docs.forEach((doc) =>
      map.set(doc.id, { id: doc.id, ...doc.data() }),
    );
    byEmail.docs.forEach((doc) =>
      map.set(doc.id, { id: doc.id, ...doc.data() }),
    );

    res.json(Array.from(map.values()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
}

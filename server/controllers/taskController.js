import { db } from "../config/firebase.js";
import { emitToBoardRoom } from "../services/socketService.js";

export async function getTasks(req, res) {
  try {
    const { id: cardId } = req.params;
    const snapshot = await db
      .collection("tasks")
      .where("cardId", "==", cardId)
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

export async function getAllBoardTasks(req, res) {
  try {
    const { boardId } = req.params;
    const snapshot = await db
      .collection("tasks")
      .where("boardId", "==", boardId)
      .get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch board tasks" });
  }
}

export async function getTask(req, res) {
  try {
    const doc = await db.collection("tasks").doc(req.params.taskId).get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
}

export async function createTask(req, res) {
  try {
    const { boardId, id: cardId } = req.params;
    const { title, description, status, priority, deadline } = req.body;

    if (!title)
      return res.status(400).json({ error: "Task title is required" });

    const taskRef = db.collection("tasks").doc();
    const task = {
      id: taskRef.id,
      cardId,
      boardId,
      ownerId: req.user.userId,
      title,
      description: description || "",
      status: status || "backlog",
      priority: priority || null,
      deadline: deadline || null,
      assignees: [],
      githubAttachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await taskRef.set(task);

    const cardRef = db.collection("cards").doc(cardId);
    const cardDoc = await cardRef.get();
    if (cardDoc.exists) {
      const currentCount = cardDoc.data().tasksCount || 0;
      await cardRef.update({ tasksCount: currentCount + 1 });
    }

    emitToBoardRoom(boardId, "task:created", task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
}

export async function updateTask(req, res) {
  try {
    const { boardId, taskId } = req.params;
    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const { title, description, status, priority, deadline } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (deadline !== undefined) updates.deadline = deadline;

    await ref.update(updates);
    const updated = await ref.get();
    const taskData = { id: updated.id, ...updated.data() };

    emitToBoardRoom(boardId, "task:updated", taskData);
    res.json(taskData);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
}

export async function deleteTask(req, res) {
  try {
    const { boardId, taskId } = req.params;
    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const taskData = doc.data();
    await ref.delete();

    const cardRef = db.collection("cards").doc(taskData.cardId);
    const cardDoc = await cardRef.get();
    if (cardDoc.exists) {
      const currentCount = cardDoc.data().tasksCount || 0;
      await cardRef.update({ tasksCount: Math.max(0, currentCount - 1) });
    }

    emitToBoardRoom(boardId, "task:deleted", { taskId });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
}

export async function assignMember(req, res) {
  try {
    const { taskId } = req.params;
    const { memberId } = req.body;

    if (!memberId)
      return res.status(400).json({ error: "Member ID is required" });

    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const assignees = doc.data().assignees || [];
    if (!assignees.includes(memberId)) {
      assignees.push(memberId);
      await ref.update({ assignees, updatedAt: new Date().toISOString() });
    }

    res.status(201).json({ taskId, memberId });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign member" });
  }
}

export async function getAssignedMembers(req, res) {
  try {
    const doc = await db.collection("tasks").doc(req.params.taskId).get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const assignees = (doc.data().assignees || []).map((memberId) => ({
      taskId: req.params.taskId,
      memberId,
    }));

    res.json(assignees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assigned members" });
  }
}

export async function removeAssignment(req, res) {
  try {
    const { taskId, memberId } = req.params;
    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();

    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const assignees = (doc.data().assignees || []).filter(
      (id) => id !== memberId,
    );
    await ref.update({ assignees, updatedAt: new Date().toISOString() });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to remove assignment" });
  }
}

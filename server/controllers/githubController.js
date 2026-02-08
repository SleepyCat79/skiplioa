import { githubConfig } from "../config/github.js";
import { db } from "../config/firebase.js";

async function githubFetch(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${githubConfig.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getRepoInfo(req, res) {
  try {
    const repoPath = decodeURIComponent(req.params.repositoryId);

    const [branches, pulls, issues, commits] = await Promise.all([
      githubFetch(`/repos/${repoPath}/branches`).catch(() => []),
      githubFetch(`/repos/${repoPath}/pulls?state=all&per_page=30`).catch(
        () => [],
      ),
      githubFetch(`/repos/${repoPath}/issues?state=all&per_page=30`).catch(
        () => [],
      ),
      githubFetch(`/repos/${repoPath}/commits?per_page=30`).catch(() => []),
    ]);

    res.json({
      repositoryId: repoPath,
      branches: branches.map((b) => ({
        name: b.name,
        lastCommitSha: b.commit?.sha || "",
      })),
      pulls: pulls
        .filter((p) => p.pull_request || p.number)
        .map((p) => ({
          title: p.title,
          pullNumber: String(p.number),
        })),
      issues: issues.map((i) => ({
        title: i.title,
        issueNumber: String(i.number),
      })),
      commits: commits.map((c) => ({
        sha: c.sha,
        message: c.commit?.message || "",
      })),
    });
  } catch (err) {
    console.error("getRepoInfo error:", err);
    res.status(500).json({ error: "Failed to fetch repository info" });
  }
}

export async function attachGitHub(req, res) {
  try {
    const { taskId } = req.params;
    const { type, number, sha } = req.body;

    if (!type) return res.status(400).json({ error: "Type is required" });

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task not found" });

    const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const attachment = { attachmentId, type };
    if (number) attachment.number = number;
    if (sha) attachment.sha = sha;

    const attachments = taskDoc.data().githubAttachments || [];
    attachments.push(attachment);
    await taskRef.update({ githubAttachments: attachments });

    res.status(201).json({ taskId, ...attachment });
  } catch (err) {
    console.error("attachGitHub error:", err);
    res.status(500).json({ error: "Failed to attach GitHub item" });
  }
}

export async function getGitHubAttachments(req, res) {
  try {
    const taskDoc = await db.collection("tasks").doc(req.params.taskId).get();
    if (!taskDoc.exists)
      return res.status(404).json({ error: "Task not found" });

    res.json(taskDoc.data().githubAttachments || []);
  } catch (err) {
    console.error("getGitHubAttachments error:", err);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
}

export async function removeGitHubAttachment(req, res) {
  try {
    const { taskId, attachmentId } = req.params;
    const ref = db.collection("tasks").doc(taskId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: "Task not found" });

    const attachments = (doc.data().githubAttachments || []).filter(
      (a) => a.attachmentId !== attachmentId,
    );
    await ref.update({ githubAttachments: attachments });

    res.status(204).send();
  } catch (err) {
    console.error("removeGitHubAttachment error:", err);
    res.status(500).json({ error: "Failed to remove attachment" });
  }
}

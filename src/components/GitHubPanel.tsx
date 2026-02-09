import { useState, useEffect } from "react";
import { Input, Button, List, Tag, Tabs } from "antd";
import {
  SearchOutlined,
  CloseOutlined,
  BranchesOutlined,
  PullRequestOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import api from "@/services/api";
import type { Task, GitHubRepoInfo, GitHubAttachment } from "@/types";
import { useMessage } from "@/hooks/useMessage";
import useTaskStore from "@/stores/taskStore";

interface Props {
  task: Task;
  boardId: string;
}

export default function GitHubPanel({ task, boardId }: Props) {
  const message = useMessage();
  const { tasks, setTasks } = useTaskStore();
  const [repoUrl, setRepoUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [attachments, setAttachments] = useState<GitHubAttachment[]>(
    task.githubAttachments || [],
  );

  useEffect(() => {
    setAttachments(task.githubAttachments || []);
  }, [task.githubAttachments]);

  const parseGitHubUrl = (url: string): string | null => {
    const input = url.trim();
    if (!input) return null;

    const match = input.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+\/[^\/]+)/,
    );
    if (match) {
      return match[1].replace(/\.git$/, "");
    }

    if (/^[^\/]+\/[^\/]+$/.test(input)) {
      return input;
    }

    return null;
  };

  const fetchRepoInfo = async () => {
    const repoPath = parseGitHubUrl(repoUrl);
    if (!repoPath) {
      message.error("Invalid GitHub URL. Use format: owner/repo");
      return;
    }
    setLoadingInfo(true);
    try {
      const { data } = await api.get(
        `/repositories/${encodeURIComponent(repoPath)}/github-info`,
      );
      setRepoInfo(data);
    } catch {
      message.error("Failed to fetch repository info");
    } finally {
      setLoadingInfo(false);
    }
  };

  const attachItem = async (
    type: GitHubAttachment["type"],
    number?: string,
    sha?: string,
  ) => {
    try {
      const body: Record<string, string> = { type };
      if (number) body.number = number;
      if (sha) body.sha = sha;
      const { data } = await api.post(
        `/boards/${boardId}/cards/${task.cardId}/tasks/${task.id}/github-attach`,
        body,
      );
      const newAttachments = [...attachments, data];
      setAttachments(newAttachments);

      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, githubAttachments: newAttachments } : t,
      );
      setTasks(updatedTasks);

      message.success("Attached");
    } catch {
      message.error("Failed to attach");
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      await api.delete(
        `/boards/${boardId}/cards/${task.cardId}/tasks/${task.id}/github-attachments/${attachmentId}`,
      );
      const newAttachments = attachments.filter(
        (a) => a.attachmentId !== attachmentId,
      );
      setAttachments(newAttachments);

      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, githubAttachments: newAttachments } : t,
      );
      setTasks(updatedTasks);

      message.success("Removed");
    } catch {
      message.error("Failed to remove");
    }
  };

  const tabItems = [];
  if (repoInfo) {
    tabItems.push({
      key: "branches",
      label: "Branches",
      children: (
        <List
          size="small"
          dataSource={repoInfo.branches}
          renderItem={(branch) => (
            <List.Item className="!border-[#1e293b] !px-0">
              <div className="flex items-center gap-2">
                <BranchesOutlined className="text-[#475569]" />
                <Tag color="blue" className="rounded-md! border-0!">
                  {branch.name}
                </Tag>
                <span className="text-xs text-[#475569] font-mono">
                  {branch.lastCommitSha.substring(0, 7)}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "pulls",
      label: "Pull Requests",
      children: (
        <List
          size="small"
          dataSource={repoInfo.pulls}
          renderItem={(pr) => (
            <List.Item
              className="!border-[#1e293b] !px-0"
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("pull_request", pr.pullNumber)}
                  className="text-[#3b82f6]!"
                >
                  Attach
                </Button>,
              ]}
            >
              <div className="flex items-center gap-2 min-w-0">
                <PullRequestOutlined className="text-emerald-400 shrink-0" />
                <span className="text-sm text-[#e2e8f0] truncate">
                  {pr.title}
                </span>
                <span className="text-xs text-[#475569] shrink-0">
                  #{pr.pullNumber}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "issues",
      label: "Issues",
      children: (
        <List
          size="small"
          dataSource={repoInfo.issues}
          renderItem={(issue) => (
            <List.Item
              className="!border-[#1e293b] !px-0"
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("issue", issue.issueNumber)}
                  className="text-[#3b82f6]!"
                >
                  Attach
                </Button>,
              ]}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ExclamationCircleOutlined className="text-orange-400 shrink-0" />
                <span className="text-sm text-[#e2e8f0] truncate">
                  {issue.title}
                </span>
                <span className="text-xs text-[#475569] shrink-0">
                  #{issue.issueNumber}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "commits",
      label: "Commits",
      children: (
        <List
          size="small"
          dataSource={repoInfo.commits.slice(0, 20)}
          renderItem={(commit) => (
            <List.Item
              className="!border-[#1e293b] !px-0"
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("commit", undefined, commit.sha)}
                  className="text-[#3b82f6]!"
                >
                  Attach
                </Button>,
              ]}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-[#3b82f6] shrink-0">
                  {commit.sha.substring(0, 7)}
                </span>
                <span className="text-sm text-[#e2e8f0] truncate">
                  {commit.message}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    });
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input
          prefix={<SearchOutlined className="text-[#475569]" />}
          placeholder="owner/repo (e.g. facebook/react)"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onPressEnter={fetchRepoInfo}
        />
        <Button onClick={fetchRepoInfo} loading={loadingInfo}>
          Fetch
        </Button>
      </div>

      {repoInfo && <Tabs items={tabItems} size="small" />}

      {attachments.length > 0 && (
        <div className="mt-4">
          <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
            Attached Items
          </span>
          <div className="space-y-1.5">
            {attachments.map((att) => (
              <div
                key={att.attachmentId}
                className="flex items-center justify-between px-3 py-2 bg-[#0f1219] rounded-lg border border-[#1e293b]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tag
                    color={
                      att.type === "pull_request"
                        ? "green"
                        : att.type === "issue"
                          ? "orange"
                          : "blue"
                    }
                    className="rounded-md! border-0! text-[11px]!"
                  >
                    {att.type.replace("_", " ")}
                  </Tag>
                  <span className="text-sm text-[#e2e8f0] truncate">
                    {att.title ||
                      (att.number
                        ? `#${att.number}`
                        : att.sha?.substring(0, 7))}
                  </span>
                </div>
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<CloseOutlined className="text-xs" />}
                  onClick={() => removeAttachment(att.attachmentId)}
                  className="!w-6 !h-6 !min-w-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

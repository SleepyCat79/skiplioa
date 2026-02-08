import { useState } from "react";
import {
  Typography,
  Input,
  Button,
  List,
  Tag,
  message,
  Tabs,
  Space,
} from "antd";
import {
  GithubOutlined,
  LinkOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "@/services/api";
import type { Task, GitHubRepoInfo, GitHubAttachment } from "@/types";

interface Props {
  task: Task;
  boardId: string;
}

export default function GitHubPanel({ task, boardId }: Props) {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [attachments, setAttachments] = useState<GitHubAttachment[]>(
    task.githubAttachments || [],
  );

  const fetchRepoInfo = async () => {
    if (!repoUrl.trim()) return;
    setLoadingInfo(true);
    try {
      const { data } = await api.get(
        `/repositories/${encodeURIComponent(repoUrl)}/github-info`,
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
      setAttachments([...attachments, data]);
      message.success("Attached successfully");
    } catch {
      message.error("Failed to attach");
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      await api.delete(
        `/boards/${boardId}/cards/${task.cardId}/tasks/${task.id}/github-attachments/${attachmentId}`,
      );
      setAttachments(
        attachments.filter((a) => a.attachmentId !== attachmentId),
      );
      message.success("Removed");
    } catch {
      message.error("Failed to remove");
    }
  };

  const tabItems = [];
  if (repoInfo) {
    tabItems.push({
      key: "pulls",
      label: `PRs (${repoInfo.pulls.length})`,
      children: (
        <List
          size="small"
          dataSource={repoInfo.pulls}
          renderItem={(pr) => (
            <List.Item
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("pull_request", pr.pullNumber)}
                >
                  Attach
                </Button>,
              ]}
            >
              <span className="text-sm">
                #{pr.pullNumber} {pr.title}
              </span>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "issues",
      label: `Issues (${repoInfo.issues.length})`,
      children: (
        <List
          size="small"
          dataSource={repoInfo.issues}
          renderItem={(issue) => (
            <List.Item
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("issue", issue.issueNumber)}
                >
                  Attach
                </Button>,
              ]}
            >
              <span className="text-sm">
                #{issue.issueNumber} {issue.title}
              </span>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "commits",
      label: `Commits (${repoInfo.commits.length})`,
      children: (
        <List
          size="small"
          dataSource={repoInfo.commits.slice(0, 20)}
          renderItem={(commit) => (
            <List.Item
              actions={[
                <Button
                  key="attach"
                  size="small"
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => attachItem("commit", undefined, commit.sha)}
                >
                  Attach
                </Button>,
              ]}
            >
              <div>
                <Tag className="!mr-1">{commit.sha.substring(0, 7)}</Tag>
                <span className="text-xs">{commit.message}</span>
              </div>
            </List.Item>
          )}
        />
      ),
    });
    tabItems.push({
      key: "branches",
      label: `Branches (${repoInfo.branches.length})`,
      children: (
        <List
          size="small"
          dataSource={repoInfo.branches}
          renderItem={(branch) => (
            <List.Item>
              <Space>
                <Tag color="blue">{branch.name}</Tag>
                <Typography.Text type="secondary" className="text-xs">
                  {branch.lastCommitSha.substring(0, 7)}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      ),
    });
  }

  return (
    <div>
      <Typography.Text strong className="block mb-2">
        <GithubOutlined className="mr-1" />
        GitHub Integration
      </Typography.Text>

      <div className="flex gap-2 mb-4">
        <Input
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
          <Typography.Text strong className="block mb-2 text-sm">
            Attached Items
          </Typography.Text>
          <List
            size="small"
            bordered
            dataSource={attachments}
            renderItem={(att) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeAttachment(att.attachmentId)}
                  />,
                ]}
              >
                <Space>
                  <Tag
                    color={
                      att.type === "pull_request"
                        ? "green"
                        : att.type === "issue"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {att.type.replace("_", " ")}
                  </Tag>
                  <span className="text-sm">
                    {att.number ? `#${att.number}` : att.sha?.substring(0, 7)}
                  </span>
                  {att.title && (
                    <span className="text-xs text-[#94a3b8]">{att.title}</span>
                  )}
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}

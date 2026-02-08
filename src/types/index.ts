export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  githubUsername?: string;
  createdAt?: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Card {
  id: string;
  boardId: string;
  name: string;
  description: string;
  tasksCount?: number;
  listMember?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  cardId: string;
  boardId: string;
  ownerId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  deadline?: string;
  assignees?: string[];
  githubAttachments?: GitHubAttachment[];
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = "icebox" | "backlog" | "ongoing" | "review" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Invitation {
  inviteId: string;
  boardId: string;
  boardOwnerId: string;
  memberId: string;
  emailMember?: string;
  status: "pending" | "accepted" | "declined";
  boardName?: string;
  createdAt?: string;
}

export interface GitHubAttachment {
  attachmentId: string;
  type: "pull_request" | "commit" | "issue";
  number?: string;
  sha?: string;
  title?: string;
  url?: string;
}

export interface GitHubRepoInfo {
  repositoryId: string;
  branches: { name: string; lastCommitSha: string }[];
  pulls: { title: string; pullNumber: string }[];
  issues: { title: string; issueNumber: string }[];
  commits: { sha: string; message: string }[];
}

export const TASK_STATUS_LIST: {
  key: TaskStatus;
  label: string;
  color: string;
}[] = [
  { key: "icebox", label: "Icebox", color: "#8c8c8c" },
  { key: "backlog", label: "Backlog", color: "#faad14" },
  { key: "ongoing", label: "On Going", color: "#1890ff" },
  { key: "review", label: "Waiting for Review", color: "#722ed1" },
  { key: "done", label: "Done", color: "#52c41a" },
];

export const TASK_PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
  color: string;
}[] = [
  { value: "low", label: "Low", color: "#8c8c8c" },
  { value: "medium", label: "Medium", color: "#faad14" },
  { value: "high", label: "High", color: "#fa541c" },
  { value: "urgent", label: "Urgent", color: "#f5222d" },
];

import { useState } from "react";
import {
  Modal,
  Input,
  Select,
  Button,
  Tag,
  Avatar,
  Tooltip,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  UserDeleteOutlined,
  GithubOutlined,
  CalendarOutlined,
  CloseOutlined,
  FolderOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Task } from "@/types";

dayjs.extend(relativeTime);
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_LIST } from "@/types";
import useTaskStore from "@/stores/taskStore";
import GitHubPanel from "./GitHubPanel";
import { useMessage } from "@/hooks/useMessage";
import api from "@/services/api";

interface Props {
  task: Task | null;
  open: boolean;
  boardId: string;
  onClose: () => void;
}

export default function TaskDrawer({ task, open, boardId, onClose }: Props) {
  const message = useMessage();
  const { updateTask, assignMember, removeMember, setTasks, tasks } =
    useTaskStore();
  const [showGithub, setShowGithub] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");

  const handleRemoveAssignee = async (memberId: string) => {
    if (!task) return;
    try {
      await removeMember(boardId, task.cardId, task.id, memberId);
      message.success("Member removed");
    } catch {
      message.error("Failed to remove member");
    }
  };

  const handleAssign = async () => {
    if (!task || !memberEmail.trim()) return;
    try {
      await assignMember(boardId, task.cardId, task.id, memberEmail.trim());
      setMemberEmail("");
      message.success("Member assigned");
    } catch {
      message.error("Failed to assign member");
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!task) return;
    try {
      await api.delete(
        `/boards/${boardId}/cards/${task.cardId}/tasks/${task.id}/github-attachments/${attachmentId}`,
      );
      const updatedTasks = tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              githubAttachments: (t.githubAttachments || []).filter(
                (a) => a.attachmentId !== attachmentId,
              ),
            }
          : t,
      );
      setTasks(updatedTasks);
      message.success("Removed");
    } catch {
      message.error("Failed to remove");
    }
  };

  if (!task) return null;

  const statusConfig = TASK_STATUS_LIST.find((s) => s.key === task.status);
  const priorityConfig = TASK_PRIORITY_OPTIONS.find(
    (p) => p.value === task.priority,
  );
  const shortId = task.id.slice(-6).toUpperCase();

  return (
    <Modal
      title={
        <div className="flex items-center gap-2.5 text-sm">
          <FolderOutlined className="text-[#64748b] text-base" />
          <span className="text-[#94a3b8] font-medium">Project Alpha</span>
          <span className="text-[#334155] font-light">/</span>
          <span className="font-mono text-xs bg-[#1a2332] px-2.5 py-1 rounded-md text-[#3b82f6] font-semibold border border-[#1e293b]">
            PROJ-{shortId}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={920}
      footer={null}
      closeIcon={
        <CloseOutlined className="text-[#64748b] hover:text-[#e2e8f0]" />
      }
      styles={{
        header: {
          backgroundColor: "#0b0e14",
          borderBottom: "1px solid #1e293b",
          padding: "16px 24px",
        },
        body: { padding: 0 },
      }}
      className="dark-modal"
    >
      <div className="flex">
        <div
          className="flex-1 px-8 py-6 overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          <h2 className="text-2xl font-bold text-[#e2e8f0] mb-1">
            {task.title}
          </h2>

          <div className="flex items-center gap-3 mb-8">
            {statusConfig && (
              <span className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-md border border-[#1e293b]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <span className="text-[#cbd5e1] text-xs font-medium">
                  {statusConfig.label}
                </span>
              </span>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <FolderOutlined className="text-[#64748b] text-sm" />
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Description
                </span>
              </div>
              <Button
                type="link"
                size="small"
                icon={isEditingDesc ? <SaveOutlined /> : <EditOutlined />}
                onClick={async () => {
                  if (isEditingDesc) {
                    try {
                      await updateTask(boardId, task.cardId, task.id, {
                        description: editedDesc,
                      });
                      message.success("Description updated");
                      setIsEditingDesc(false);
                    } catch {
                      message.error("Failed to update description");
                    }
                  } else {
                    setEditedDesc(task.description || "");
                    setIsEditingDesc(true);
                  }
                }}
                className="text-[#3b82f6]! text-xs! p-0! h-auto! font-medium!"
              >
                {isEditingDesc ? "Save" : "Edit"}
              </Button>
            </div>
            {isEditingDesc ? (
              <div data-color-mode="dark">
                <MDEditor
                  value={editedDesc}
                  onChange={(val) => setEditedDesc(val || "")}
                  preview="edit"
                  height={200}
                />
              </div>
            ) : (
              <div data-color-mode="dark">
                <MDEditor.Markdown
                  source={task.description || "No description provided."}
                  className="!bg-[#0f1219] !p-4 !rounded-lg !border !border-[#1e293b] !text-[#cbd5e1]"
                  style={{ backgroundColor: "#0f1219", color: "#cbd5e1" }}
                />
              </div>
            )}
          </div>

          <Divider className="!my-8 !border-[#1e293b]" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <GithubOutlined className="text-[#64748b] text-sm" />
                <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">
                  Linked GitHub Activity
                </span>
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => setShowGithub(!showGithub)}
                className="text-[#3b82f6]! text-xs! p-0! h-auto! font-medium!"
              >
                + Link PR or Commit
              </Button>
            </div>

            {task.githubAttachments && task.githubAttachments.length > 0 && (
              <div className="space-y-2 mb-5">
                {task.githubAttachments.map((att) => (
                  <div
                    key={att.attachmentId}
                    className="flex items-center gap-3 px-4 py-3.5 bg-[#0f1219] rounded-lg border border-[#1e293b] hover:border-[#334155] transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <GithubOutlined className="text-[#64748b] text-base shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#e2e8f0]">
                            {att.type === "pull_request" &&
                              "feat: Update Auth Logic for v2 Middleware"}
                            {att.type === "commit" &&
                              "fixed typo in middleware configuration object"}
                            {att.type === "issue" && att.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag
                            color={
                              att.type === "pull_request"
                                ? "green"
                                : att.type === "issue"
                                  ? "orange"
                                  : "blue"
                            }
                            className="rounded-md! border-0! text-[11px]! font-medium! !m-0"
                          >
                            {att.type === "pull_request" && "Open"}
                            {att.type === "commit" && "Committed 2h ago"}
                            {att.type === "issue" && "Issue"}
                          </Tag>
                          {att.number && (
                            <span className="text-xs text-[#64748b]">
                              main <span className="text-[#334155]">←</span>{" "}
                              feat/auth-v2
                            </span>
                          )}
                          {att.type === "pull_request" && (
                            <span className="text-xs text-[#64748b]">
                              #{att.number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined className="text-xs" />}
                      onClick={() => handleRemoveAttachment(att.attachmentId)}
                      className="!w-7 !h-7 !min-w-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}

            {showGithub && (
              <div className="mt-4 p-5 bg-[#0f1219] rounded-xl border border-[#1e293b]">
                <GitHubPanel task={task} boardId={boardId} />
              </div>
            )}
          </div>
        </div>

        <div
          className="w-72 border-l border-[#1e293b] px-6 py-6 shrink-0 space-y-6 bg-[#0b0e14]"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
              Status
            </span>
            <Select
              value={task.status}
              onChange={(value) => {
                updateTask(boardId, task.cardId, task.id, { status: value })
                  .then(() => {
                    message.success("Status updated");
                  })
                  .catch(() => {
                    message.error("Failed to update status");
                  });
              }}
              className="w-full !h-9"
            >
              {TASK_STATUS_LIST.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm">{s.label}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
              Priority
            </span>
            {priorityConfig ? (
              <Tag
                color={priorityConfig.color}
                className="rounded-md! text-xs! font-medium!"
              >
                {priorityConfig.label}
              </Tag>
            ) : (
              <span className="text-sm text-[#64748b]">None</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Assignees
              </span>
              <Tooltip title="Add assignee">
                <Button
                  type="text"
                  size="small"
                  icon={<UserAddOutlined className="text-[#3b82f6] text-xs" />}
                  className="!w-6 !h-6 !min-w-0 hover:!bg-[#1a2332]"
                />
              </Tooltip>
            </div>
            <div className="space-y-2">
              {task.assignees &&
                task.assignees.map((assignee) => (
                  <div
                    key={assignee}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar size={24} className="bg-[#1a1f2e]! text-[10px]!">
                        {assignee[0]?.toUpperCase()}
                      </Avatar>
                      <span className="text-xs text-[#e2e8f0] truncate max-w-32">
                        {assignee}
                      </span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<UserDeleteOutlined className="text-xs" />}
                      onClick={() => handleRemoveAssignee(assignee)}
                      className="opacity-0 group-hover:opacity-100 !w-5 !h-5 !min-w-0"
                    />
                  </div>
                ))}
              <div className="flex gap-1.5 mt-2">
                <Input
                  placeholder="Email"
                  size="small"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onPressEnter={handleAssign}
                  className="text-xs!"
                />
                <Button
                  size="small"
                  icon={<UserAddOutlined className="text-xs" />}
                  onClick={handleAssign}
                  className="!min-w-0 !w-7 !h-6"
                />
              </div>
            </div>
          </div>

          <Divider className="!my-4 !border-[#1e293b]" />

          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
              Labels
            </span>
            <div className="flex flex-wrap gap-2">
              <Tag color="blue" className="rounded-md! text-xs!">
                Backend
              </Tag>
              <Tag color="red" className="rounded-md! text-xs!">
                High Priority
              </Tag>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
              Due Date
            </span>
            {task.deadline ? (
              <div className="flex items-center gap-2 text-sm text-[#cbd5e1] bg-[#131720] px-3 py-2 rounded-md border border-[#1e293b]">
                <CalendarOutlined className="text-[#64748b] text-xs" />
                <span className="font-medium">
                  {dayjs(task.deadline).format("MMM D, YYYY")}
                </span>
              </div>
            ) : (
              <span className="text-sm text-[#64748b]">No due date</span>
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-3">
              Story Points
            </span>
            <div className="flex items-center justify-center w-12 h-12 bg-[#131720] rounded-lg border border-[#1e293b]">
              <span className="text-lg font-bold text-[#3b82f6]">5</span>
            </div>
          </div>

          {task.createdAt && (
            <div className="pt-4 border-t border-[#1e293b]">
              <span className="text-[11px] text-[#64748b] leading-relaxed block">
                Created {dayjs(task.createdAt).format("MMM D")}
              </span>
              {task.updatedAt && (
                <span className="text-[11px] text-[#64748b] leading-relaxed block mt-1">
                  Updated {dayjs(task.updatedAt).fromNow()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

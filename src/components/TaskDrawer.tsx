import { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Popconfirm,
  Avatar,
  Tooltip,
  message,
} from "antd";
import {
  DeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  GithubOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Task } from "@/types";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_LIST } from "@/types";
import useTaskStore from "@/stores/taskStore";
import GitHubPanel from "./GitHubPanel";

interface Props {
  task: Task | null;
  open: boolean;
  boardId: string;
  onClose: () => void;
}

export default function TaskDrawer({ task, open, boardId, onClose }: Props) {
  const { updateTask, deleteTask, assignMember, removeMember } = useTaskStore();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const handleSave = async (values: Record<string, unknown>) => {
    if (!task) return;
    setSaving(true);
    try {
      const updates: Partial<Task> = {
        title: values.title as string,
        description: values.description as string,
        status: values.status as Task["status"],
        priority: values.priority as Task["priority"],
        deadline: values.deadline
          ? (values.deadline as dayjs.Dayjs).toISOString()
          : undefined,
      };
      await updateTask(boardId, task.cardId, task.id, updates);
      message.success("Task updated");
      onClose();
    } catch {
      message.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(boardId, task.cardId, task.id);
      message.success("Task deleted");
      onClose();
    } catch {
      message.error("Failed to delete task");
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

  const handleRemoveAssignee = async (memberId: string) => {
    if (!task) return;
    try {
      await removeMember(boardId, task.cardId, task.id, memberId);
      message.success("Member removed");
    } catch {
      message.error("Failed to remove member");
    }
  };

  if (!task) return null;

  const statusConfig = TASK_STATUS_LIST.find((s) => s.key === task.status);
  const priorityConfig = TASK_PRIORITY_OPTIONS.find(
    (p) => p.value === task.priority,
  );
  const shortId = task.id.slice(-6).toUpperCase();

  return (
    <Drawer
      title={null}
      open={open}
      onClose={onClose}
      width={640}
      closable={false}
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <span className="font-mono text-xs bg-[#0f1219] px-2 py-0.5 rounded text-[#94a3b8]">
              #{shortId}
            </span>
            {statusConfig && (
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: statusConfig.color }}
                />
                <span className="text-[#94a3b8]">{statusConfig.label}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="text"
              size="small"
              icon={<GithubOutlined />}
              onClick={() => setShowGithub(!showGithub)}
              className="text-[#64748b] hover:text-[#e2e8f0]"
            />
            <Popconfirm title="Delete this task?" onConfirm={handleDelete}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-[#64748b] hover:text-[#e2e8f0]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <div className="flex-1 p-6 border-r border-[#1e293b]">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  title: task.title,
                  description: task.description,
                  status: task.status,
                  priority: task.priority,
                  deadline: task.deadline ? dayjs(task.deadline) : null,
                }}
              >
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: "Title is required" }]}
                  className="mb-4"
                >
                  <Input
                    variant="borderless"
                    placeholder="Task title"
                    className="!text-lg !font-semibold !text-[#e2e8f0] !px-0"
                  />
                </Form.Item>

                <div className="mb-5">
                  <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <Form.Item name="description" className="mb-0">
                    <Input.TextArea
                      rows={5}
                      placeholder="Add a detailed description..."
                      className="resize-none"
                    />
                  </Form.Item>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#1e293b]">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    size="small"
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>

              {showGithub && (
                <div className="mt-6 pt-6 border-t border-[#1e293b]">
                  <GitHubPanel task={task} boardId={boardId} />
                </div>
              )}
            </div>

            <div className="w-56 p-5 space-y-5 shrink-0">
              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Status
                </label>
                <Form form={form}>
                  <Form.Item name="status" className="mb-0">
                    <Select size="small" className="w-full">
                      {TASK_STATUS_LIST.map((s) => (
                        <Select.Option key={s.key} value={s.key}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            {s.label}
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div>
                  {priorityConfig ? (
                    <Tag color={priorityConfig.color} className="!rounded-md">
                      {priorityConfig.label}
                    </Tag>
                  ) : (
                    <span className="text-sm text-[#475569]">None</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Assignees
                </label>
                <div className="space-y-2">
                  {task.assignees &&
                    task.assignees.map((assignee) => (
                      <div
                        key={assignee}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            size={24}
                            className="!bg-[#1a1f2e] !text-[10px]"
                          >
                            {assignee[0]?.toUpperCase()}
                          </Avatar>
                          <span className="text-xs text-[#e2e8f0] truncate max-w-25">
                            {assignee}
                          </span>
                        </div>
                        <Tooltip title="Remove">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<UserDeleteOutlined className="text-xs" />}
                            onClick={() => handleRemoveAssignee(assignee)}
                            className="opacity-0 group-hover:opacity-100 !w-5 !h-5 !min-w-0"
                          />
                        </Tooltip>
                      </div>
                    ))}
                  <div className="flex gap-1.5 mt-2">
                    <Input
                      placeholder="Email"
                      size="small"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      onPressEnter={handleAssign}
                      className="!text-xs"
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

              <div>
                <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                  Due Date
                </label>
                {task.deadline ? (
                  <div className="flex items-center gap-2 text-sm text-[#e2e8f0]">
                    <CalendarOutlined className="text-[#64748b] text-xs" />
                    <span>{dayjs(task.deadline).format("MMM D, YYYY")}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#475569]">No due date</span>
                )}
              </div>

              {task.githubAttachments && task.githubAttachments.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-[#64748b] uppercase tracking-wider mb-2">
                    Linked
                  </label>
                  <div className="space-y-1.5">
                    {task.githubAttachments.map((att) => (
                      <div
                        key={att.attachmentId}
                        className="flex items-center gap-2 text-xs text-[#94a3b8] bg-[#0f1219] px-2 py-1.5 rounded-lg"
                      >
                        <GithubOutlined className="text-[#64748b]" />
                        <span className="truncate">
                          {att.title ||
                            (att.number
                              ? `#${att.number}`
                              : att.sha?.substring(0, 7))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

import { useState, useRef } from "react";
import { Modal, Input, Select, Button, DatePicker, Tag, Divider } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { TASK_STATUS_LIST, TASK_PRIORITY_OPTIONS } from "@/types";
import { useMessage } from "@/hooks/useMessage";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  cardId: string;
  boardId: string;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onCreate: (cardId: string, data: Partial<Task>) => Promise<unknown>;
}

export default function CreateTaskModal({
  open,
  cardId,
  defaultStatus,
  onClose,
  onCreate,
}: Props) {
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus || "backlog");
  const [priority, setPriority] = useState<TaskPriority | undefined>();
  const [labels, setLabels] = useState<string[]>([]);
  const [storyPoints, setStoryPoints] = useState<number | undefined>();
  const [dueDate, setDueDate] = useState<string | undefined>();
  const [showGithub, setShowGithub] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (loading || submittingRef.current || !title.trim()) {
      if (!title.trim()) message.error("Title is required");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      await onCreate(cardId, {
        title: title.trim(),
        description: description || "",
        status,
        priority,
      });

      resetForm();
      onClose();
      message.success("Task created");
    } catch {
      message.error("Failed to create task");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus || "backlog");
    setPriority(undefined);
    setLabels([]);
    setStoryPoints(undefined);
    setDueDate(undefined);
    setShowGithub(false);
    setNewLabel("");
  };

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  return (
    <Modal
      title="Create New Task"
      open={open}
      onCancel={() => {
        if (!submittingRef.current) {
          resetForm();
          onClose();
        }
      }}
      onOk={handleSubmit}
      okText="Create Task"
      confirmLoading={loading}
      okButtonProps={{ disabled: loading || submittingRef.current }}
      cancelButtonProps={{ disabled: loading || submittingRef.current }}
      width={880}
      destroyOnHidden
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <div className="pt-4">
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            size="large"
            className="!h-10"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
            Description
          </label>
          <div data-color-mode="dark">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || "")}
              preview="edit"
              height={180}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              Status
            </label>
            <Select
              value={status}
              onChange={setStatus}
              className="w-full !h-10"
            >
              {TASK_STATUS_LIST.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              Priority
            </label>
            <Select
              value={priority}
              onChange={setPriority}
              allowClear
              placeholder="Set priority"
              className="w-full !h-10"
            >
              {TASK_PRIORITY_OPTIONS.map((p) => (
                <Select.Option key={p.value} value={p.value}>
                  {p.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              Story Points
            </label>
            <Select
              value={storyPoints}
              onChange={setStoryPoints}
              allowClear
              placeholder="Estimate effort"
              className="w-full !h-10"
            >
              {[1, 2, 3, 5, 8, 13, 21].map((pt) => (
                <Select.Option key={pt} value={pt}>
                  {pt}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
              Due Date
            </label>
            <DatePicker
              value={dueDate ? dayjs(dueDate) : null}
              onChange={(date) =>
                setDueDate(date ? date.toISOString() : undefined)
              }
              className="w-full !h-10"
              placeholder="Select date"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-[#e2e8f0] mb-2">
            Labels
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add label"
              onPressEnter={addLabel}
              className="!h-9"
            />
            <Button onClick={addLabel} className="!h-9">
              Add
            </Button>
          </div>
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <Tag
                  key={label}
                  closable
                  onClose={() => removeLabel(label)}
                  className="!m-0"
                >
                  {label}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <Divider className="!my-6 !border-[#1e293b]" />

        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#e2e8f0]">
              <GithubOutlined className="mr-2" />
              GitHub Activity
            </label>
            <Button
              type="link"
              size="small"
              onClick={() => setShowGithub(!showGithub)}
              className="text-[#3b82f6] !p-0 !h-auto"
            >
              {showGithub ? "Hide" : "Link PR or Commit"}
            </Button>
          </div>
          {showGithub && (
            <div className="bg-[#0f1219] p-4 rounded-lg border border-[#1e293b]">
              <p className="text-xs text-[#94a3b8] mb-3">
                Link GitHub activity after creating the task
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

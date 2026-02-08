import { useState } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { TASK_STATUS_LIST, TASK_PRIORITY_OPTIONS } from "@/types";

interface Props {
  open: boolean;
  cardId: string;
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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: TaskPriority;
  }) => {
    setLoading(true);
    try {
      await onCreate(cardId, {
        title: values.title,
        description: values.description || "",
        status: values.status,
        priority: values.priority,
      });
      form.resetFields();
      onClose();
    } catch {
      // handled upstream
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Task"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      okText="Create"
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: defaultStatus || "backlog" }}
        className="mt-6"
      >
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: "Please enter a title" }]}
          className="mb-5"
        >
          <Input
            placeholder="What needs to be done?"
            size="large"
            className="!h-10"
          />
        </Form.Item>
        <Form.Item name="description" label="Description" className="mb-5">
          <Input.TextArea placeholder="Add details..." rows={3} />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="status" label="Status" className="!mb-0">
            <Select className="!h-10">
              {TASK_STATUS_LIST.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" className="!mb-0">
            <Select allowClear placeholder="Set priority" className="!h-10">
              {TASK_PRIORITY_OPTIONS.map((p) => (
                <Select.Option key={p.value} value={p.value}>
                  {p.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

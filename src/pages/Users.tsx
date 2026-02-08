import { useEffect, useState } from "react";
import { Table, Avatar, Input, Button, Modal, Form, message, Tag } from "antd";
import { UserOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import api from "@/services/api";
import type { User } from "@/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    form.setFieldsValue({
      displayName: user.displayName || "",
      email: user.email,
    });
    setModalOpen(true);
  };

  const handleSave = async (values: { displayName: string }) => {
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser.id}`, {
        displayName: values.displayName,
      });
      setUsers(
        users.map((u) =>
          u.id === editUser.id ? { ...u, displayName: values.displayName } : u,
        ),
      );
      message.success("User updated");
      setModalOpen(false);
      setEditUser(null);
    } catch {
      message.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<UserOutlined />}
            src={record.avatarUrl}
            className="!bg-[#1a1f2e]"
          />
          <div>
            <span className="text-sm font-medium text-[#e2e8f0] block">
              {record.displayName || "—"}
            </span>
            <span className="text-xs text-[#64748b]">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "GitHub",
      dataIndex: "githubUsername",
      key: "github",
      render: (val: string) =>
        val ? (
          <Tag color="blue" className="!rounded-md">
            {val}
          </Tag>
        ) : (
          <span className="text-[#475569]">—</span>
        ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val: string) =>
        val ? (
          <span className="text-[#94a3b8] text-sm">
            {new Date(val).toLocaleDateString()}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: User) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          className="!text-[#64748b] hover:!text-[#e2e8f0]"
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">
            Team Members
          </h2>
          <p className="text-sm text-[#64748b] mt-1.5 mb-0">
            View and manage your team
          </p>
        </div>
        <Input
          prefix={<SearchOutlined className="text-[#475569]" />}
          placeholder="Search members..."
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </div>

      <div className="border border-[#1e293b] rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="Edit Member"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
        onOk={() => form.submit()}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Email">
            <Input disabled value={editUser?.email} />
          </Form.Item>
          <Form.Item
            name="displayName"
            label="Display Name"
            rules={[{ required: true, message: "Please enter a display name" }]}
          >
            <Input placeholder="Enter display name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Table, Avatar, Tag, Button, Input } from "antd";
import { SearchOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import api from "@/services/api";
import type { User } from "@/types";
import { useMessage } from "@/hooks/useMessage";

export default function TeamSettings() {
  const message = useMessage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch {
      message.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      title: "Member",
      key: "member",
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.avatarUrl}
            className="!bg-[#1a1f2e]"
          />
          <div>
            <p className="text-sm font-medium text-[#e2e8f0] m-0">
              {record.displayName || "—"}
            </p>
            <p className="text-xs text-[#64748b] m-0">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: () => (
        <Tag color="blue" className="!rounded-md">
          Member
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => (
        <span className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-[#94a3b8]">Active</span>
        </span>
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
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">Team</h2>
        <p className="text-sm text-[#64748b] mt-1.5 mb-0">
          Manage your workspace members and their permissions.
        </p>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-[#e2e8f0] m-0">
              Team Members
            </h3>
            <p className="text-sm text-[#64748b] m-0">
              {users.length} total members
            </p>
          </div>
          <div className="flex gap-3">
            <Input
              prefix={<SearchOutlined className="text-[#475569]" />}
              placeholder="Search members..."
              style={{ width: 240 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Button type="primary" icon={<MailOutlined />}>
              Invite Member
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-base font-medium text-[#e2e8f0] mb-2">
          Pending Invitations
        </h3>
        <p className="text-sm text-[#64748b] mb-4">
          View and manage pending workspace invitations.
        </p>
        <div className="text-center py-8 text-[#64748b]">
          No pending invitations
        </div>
      </div>
    </div>
  );
}

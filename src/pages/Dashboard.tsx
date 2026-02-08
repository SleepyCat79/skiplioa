import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Input,
  Empty,
  Spin,
  Dropdown,
  Avatar,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons";
import useBoardStore from "@/stores/boardStore";
import useAuthStore from "@/stores/authStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    boards,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  } = useBoardStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [boardsFilter, setBoardsFilter] = useState<string>("my-boards");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      if (editingBoard) {
        await updateBoard(editingBoard, values);
        message.success("Board updated");
      } else {
        await createBoard(values.name, values.description);
        message.success("Board created");
      }
      setModalOpen(false);
      setEditingBoard(null);
      form.resetFields();
    } catch {
      message.error("Something went wrong");
    }
  };

  const handleEdit = (id: string) => {
    const board = boards.find((b) => b.id === id);
    if (board) {
      form.setFieldsValue({ name: board.name, description: board.description });
      setEditingBoard(id);
      setModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBoard(id);
      message.success("Board deleted");
    } catch {
      message.error("Failed to delete board");
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setEditingBoard(null);
    setModalOpen(true);
  };

  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (board.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading && boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "workspace-1",
                    label: (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#3b82f6] rounded flex items-center justify-center text-xs text-white font-semibold">
                          DB
                        </div>
                        <span>DevBoard</span>
                      </div>
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="flex items-center gap-2 px-3 py-2 bg-[#131720] border border-[#1e293b] rounded-lg hover:border-[#334155] transition-colors cursor-pointer">
                <span className="text-sm font-medium text-[#e2e8f0]">
                  Workspace
                </span>
                <span className="text-xs text-[#64748b]">/</span>
                <span className="text-sm text-[#94a3b8]">Engineering</span>
                <DownOutlined className="text-[#64748b] text-xs" />
              </button>
            </Dropdown>

            {user?.githubUsername && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-emerald-400 font-medium">
                  Synced with GitHub
                </span>
              </div>
            )}
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={openCreateModal}
          >
            New Board
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Input
            prefix={<SearchOutlined className="text-[#64748b]" />}
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            suffixIcon={<DownOutlined className="text-[#64748b]" />}
          >
            <Select.Option value="active">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Active
              </span>
            </Select.Option>
            <Select.Option value="archived">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#64748b]"></span>
                Archived
              </span>
            </Select.Option>
          </Select>

          <Select
            value={boardsFilter}
            onChange={setBoardsFilter}
            style={{ width: 140 }}
            suffixIcon={<DownOutlined className="text-[#64748b]" />}
          >
            <Select.Option value="my-boards">My Boards</Select.Option>
            <Select.Option value="all-boards">All Boards</Select.Option>
          </Select>
        </div>
      </div>

      {filteredBoards.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-64">
          <Empty description="No boards found. Create your first board!" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBoards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/boards/${board.id}`)}
              className="board-card-enter bg-[#131720] border border-[#1e293b] rounded-xl p-5 cursor-pointer group relative hover:border-[#334155] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <h3 className="text-[#e2e8f0] font-medium text-base truncate">
                      {board.name}
                    </h3>
                  </div>
                </div>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "edit",
                        icon: <EditOutlined />,
                        label: "Edit",
                        onClick: ({ domEvent }) => {
                          domEvent.stopPropagation();
                          handleEdit(board.id);
                        },
                      },
                      {
                        key: "delete",
                        icon: <DeleteOutlined />,
                        label: "Delete",
                        danger: true,
                        onClick: ({ domEvent }) => {
                          domEvent.stopPropagation();
                          handleDelete(board.id);
                        },
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#1a1f2e] border-0 cursor-pointer bg-transparent shrink-0"
                  >
                    <MoreOutlined className="text-[#64748b] text-sm" />
                  </button>
                </Dropdown>
              </div>

              <p className="text-[#64748b] text-sm line-clamp-2 mb-4 min-h-10">
                {board.description || "No description provided"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {board.members && board.members.length > 0 ? (
                    <Avatar.Group
                      max={{
                        count: 3,
                        style: {
                          backgroundColor: "#1e293b",
                          color: "#94a3b8",
                          fontSize: 10,
                          width: 24,
                          height: 24,
                        },
                      }}
                      size={24}
                    >
                      {board.members.map((m, i) => (
                        <Avatar
                          key={i}
                          size={24}
                          className="!bg-[#1a1f2e] !text-[#94a3b8] !text-[10px] !border-[#131720]"
                        >
                          {String(m).charAt(0).toUpperCase()}
                        </Avatar>
                      ))}
                    </Avatar.Group>
                  ) : null}
                  {board.members && board.members.length > 3 && (
                    <span className="text-xs text-[#64748b]">
                      +{board.members.length - 3}
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-xs text-[#64748b]">
                  <span className="w-1 h-1 rounded-full bg-[#3b82f6]"></span>
                  In Progress
                </span>
              </div>
            </div>
          ))}

          <div
            onClick={openCreateModal}
            className="border border-dashed border-[#1e293b] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#334155] transition-colors min-h-45 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#131720] flex items-center justify-center mb-3 group-hover:bg-[#1a1f2e] transition-colors border border-[#1e293b]">
              <PlusOutlined className="text-[#64748b] text-xl" />
            </div>
            <span className="text-sm font-medium text-[#64748b] group-hover:text-[#94a3b8] transition-colors mb-1">
              Create new board
            </span>
            <span className="text-xs text-[#475569]">
              Start a new project or sync from GitHub
            </span>
          </div>
        </div>
      )}

      <Modal
        title={editingBoard ? "Edit Board" : "Create New Board"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingBoard(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingBoard ? "Save" : "Create"}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Board Name"
            rules={[{ required: true, message: "Please enter a board name" }]}
          >
            <Input placeholder="e.g. Marketing Campaign" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="What is this board about?" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Select, Modal, Form, Input, Popconfirm } from "antd";
import {
  PlusOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import TaskColumn from "@/components/TaskColumn";
import TaskDrawer from "@/components/TaskDrawer";
import InviteModal from "@/components/InviteModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import useBoardStore from "@/stores/boardStore";
import useTaskStore from "@/stores/taskStore";
import { getSocket, joinBoard, leaveBoard } from "@/services/socket";
import type { Task, TaskStatus } from "@/types";
import { TASK_STATUS_LIST } from "@/types";
import { useMessage } from "@/hooks/useMessage";

export default function BoardDetail() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const message = useMessage();
  const { currentBoard, fetchBoard } = useBoardStore();
  const {
    cards,
    tasks,
    loading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    fetchAllBoardTasks,
    createTask,
    updateTask,
    setTasks,
  } = useTaskStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [defaultTaskStatus, setDefaultTaskStatus] =
    useState<TaskStatus>("backlog");
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const creatingTaskRef = useRef(false);
  const savingCardRef = useRef(false);
  const [cardForm] = Form.useForm();

  useEffect(() => {
    if (!boardId) return;
    fetchBoard(boardId);
    fetchCards(boardId);
    fetchAllBoardTasks(boardId);

    joinBoard(boardId);
    const socket = getSocket();

    const onTaskCreated = (task: Task) => {
      const currentTasks = useTaskStore.getState().tasks;
      const taskExists = currentTasks.some((t) => t.id === task.id);
      if (taskExists) {
        setTasks(currentTasks.map((t) => (t.id === task.id ? task : t)));
      } else {
        setTasks([...currentTasks, task]);
      }
    };
    const onTaskUpdated = (task: Task) => {
      setTasks(
        useTaskStore.getState().tasks.map((t) => (t.id === task.id ? task : t)),
      );
    };
    const onTaskDeleted = (data: { taskId: string }) => {
      setTasks(
        useTaskStore.getState().tasks.filter((t) => t.id !== data.taskId),
      );
    };

    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);

    return () => {
      leaveBoard(boardId);
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
    };
  }, [boardId, fetchBoard, fetchCards, fetchAllBoardTasks, setTasks]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination || !boardId) return;

      const { draggableId, destination } = result;
      const newStatus = destination.droppableId as TaskStatus;
      const task = tasks.find((t) => t.id === draggableId);
      if (!task || task.status === newStatus) return;

      const updatedTasks = tasks.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t,
      );
      setTasks(updatedTasks);

      updateTask(boardId, task.cardId, task.id, { status: newStatus }).catch(
        () => {
          setTasks(tasks);
          message.error("Failed to move task");
        },
      );
    },
    [boardId, tasks, setTasks, updateTask],
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleCreateTask = async (cardId: string, data: Partial<Task>) => {
    if (!boardId || creatingTaskRef.current) return;

    creatingTaskRef.current = true;
    try {
      await createTask(boardId, cardId, data);
      message.success("Task created");
    } finally {
      creatingTaskRef.current = false;
    }
  };

  const openCreateTask = (status?: TaskStatus) => {
    if (cards.length === 0) {
      message.warning("Create a card first");
      return;
    }
    setSelectedCardId(cards[0].id);
    setDefaultTaskStatus(status || "backlog");
    setCreateTaskOpen(true);
  };

  const handleCardSubmit = async (values: {
    name: string;
    description: string;
  }) => {
    if (!boardId || savingCardRef.current) return;

    savingCardRef.current = true;
    try {
      if (editingCardId) {
        await updateCard(boardId, editingCardId, values);
        message.success("Card updated");
      } else {
        await createCard(boardId, values.name, values.description);
        message.success("Card created");
      }
      setCardModalOpen(false);
      setEditingCardId(null);
      cardForm.resetFields();
    } catch {
      message.error(
        editingCardId ? "Failed to update card" : "Failed to create card",
      );
    } finally {
      savingCardRef.current = false;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!boardId) return;
    try {
      await deleteCard(boardId, cardId);
      message.success("Card deleted");
    } catch {
      message.error("Failed to delete card");
    }
  };

  const filteredTasks = selectedCardId
    ? tasks.filter((t) => t.cardId === selectedCardId)
    : tasks;

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-lg bg-[#131720] border border-[#1e293b] flex items-center justify-center cursor-pointer hover:border-[#334155] transition-colors"
          >
            <ArrowLeftOutlined className="text-[#94a3b8] text-xs" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-semibold text-[#e2e8f0] m-0">
                {currentBoard?.name}
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-medium uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            {currentBoard?.description && (
              <p className="text-xs text-[#64748b] m-0 mt-1">
                {currentBoard.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cards.length > 0 && (
            <Select
              value={selectedCardId || undefined}
              onChange={setSelectedCardId}
              placeholder="All Cards"
              allowClear
              onClear={() => setSelectedCardId("")}
              style={{ minWidth: 160 }}
              classNames={{ popup: { root: "dark-select-dropdown" } }}
            >
              {cards.map((card) => (
                <Select.Option key={card.id} value={card.id}>
                  {card.name}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCardId(null);
              cardForm.resetFields();
              setCardModalOpen(true);
            }}
            className="!bg-[#131720] !border-[#1e293b] hover:!border-[#334155]"
          >
            New Card
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openCreateTask()}
          >
            New Task
          </Button>
          <Button
            icon={<UserAddOutlined />}
            onClick={() => setInviteOpen(true)}
            className="!bg-[#131720] !border-[#1e293b] hover:!border-[#334155]"
          >
            Invite
          </Button>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                selectedCardId === card.id
                  ? "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]"
                  : "bg-[#131720] border-[#1e293b] hover:border-[#334155] text-[#e2e8f0]"
              }`}
              onClick={() =>
                setSelectedCardId(selectedCardId === card.id ? "" : card.id)
              }
            >
              <span>{card.name}</span>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                className="!w-5 !h-5 !min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  cardForm.setFieldsValue({
                    name: card.name,
                    description: card.description,
                  });
                  setEditingCardId(card.id);
                  setCardModalOpen(true);
                }}
              />
              <Popconfirm
                title="Delete this card?"
                description="All tasks in this card will be removed."
                onConfirm={() => handleDeleteCard(card.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="!w-5 !h-5 !min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </div>
          ))}
          <button
            onClick={() => {
              setEditingCardId(null);
              cardForm.resetFields();
              setCardModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#1e293b] text-sm text-[#64748b] hover:border-[#334155] hover:text-[#94a3b8] transition-all cursor-pointer bg-transparent"
          >
            <PlusOutlined className="text-xs" />
            New Card
          </button>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {TASK_STATUS_LIST.map((col) => (
            <TaskColumn
              key={col.key}
              status={col.key}
              tasks={filteredTasks.filter((t) => t.status === col.key)}
              onTaskClick={handleTaskClick}
              onAddTask={() => openCreateTask(col.key)}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        boardId={boardId || ""}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTask(null);
        }}
      />

      <InviteModal
        boardId={boardId || ""}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <CreateTaskModal
        open={createTaskOpen}
        cardId={selectedCardId || (cards[0]?.id ?? "")}
        boardId={boardId || ""}
        defaultStatus={defaultTaskStatus}
        onClose={() => setCreateTaskOpen(false)}
        onCreate={handleCreateTask}
      />

      <Modal
        title={editingCardId ? "Edit Card" : "Create New Card"}
        open={cardModalOpen}
        onCancel={() => {
          setCardModalOpen(false);
          setEditingCardId(null);
          cardForm.resetFields();
        }}
        onOk={() => cardForm.submit()}
        okText={editingCardId ? "Save" : "Create"}
        destroyOnHidden
      >
        <Form form={cardForm} layout="vertical" onFinish={handleCardSubmit}>
          <Form.Item
            name="name"
            label="Card Name"
            rules={[{ required: true, message: "Please enter a card name" }]}
          >
            <Input placeholder="e.g. Sprint 1 Tasks" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Describe this card..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

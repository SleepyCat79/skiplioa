import { Badge, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import type { Task, TaskStatus } from "@/types";
import { TASK_STATUS_LIST } from "@/types";

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

export default function TaskColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: Props) {
  const statusConfig = TASK_STATUS_LIST.find((s) => s.key === status);

  return (
    <div className="shrink-0 w-70 bg-[#0f1219] rounded-xl flex flex-col max-h-full border border-[#1e293b]">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusConfig?.color }}
          />
          <span className="text-sm font-medium text-[#e2e8f0]">
            {statusConfig?.label}
          </span>
        </div>
        <Badge
          count={tasks.length}
          showZero
          style={{
            backgroundColor: "#131720",
            color: "#64748b",
            fontSize: 11,
            boxShadow: "none",
          }}
        />
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 min-h-20 transition-colors ${
              snapshot.isDraggingOver ? "bg-[#3b82f6]/5" : ""
            }`}
          >
            {tasks.map((task, idx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={idx}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {onAddTask && (
        <div className="px-2 pb-2">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddTask}
            className="!w-full !text-[#475569] hover:!text-[#94a3b8] hover:!bg-[#131720] !justify-start !text-sm"
          >
            Add Task
          </Button>
        </div>
      )}
    </div>
  );
}

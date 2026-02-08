import { Tag, Avatar, Tooltip, Typography } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import type { Task } from "@/types";
import { TASK_PRIORITY_OPTIONS } from "@/types";

interface Props {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export default function TaskCard({ task, index, onClick }: Props) {
  const priorityOption = TASK_PRIORITY_OPTIONS.find(
    (p) => p.value === task.priority,
  );

  const isOverdue =
    task.deadline && dayjs(task.deadline).isBefore(dayjs(), "day");

  const shortId = task.id.slice(-6).toUpperCase();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-[#131720] rounded-lg p-3 mb-2 border cursor-pointer transition-all ${
            snapshot.isDragging
              ? "shadow-xl border-[#3b82f6]/40 rotate-1"
              : "border-[#1e293b] hover:border-[#334155]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] text-[#475569] bg-[#0f1219] px-1.5 py-0.5 rounded">
              #{shortId}
            </span>
            {task.priority && priorityOption && (
              <Tag
                color={priorityOption.color}
                className="!text-[11px] !px-2 !py-0 !rounded-md !border-0 uppercase !leading-5"
              >
                {priorityOption.label}
              </Tag>
            )}
          </div>

          <p className="text-sm font-medium text-[#e2e8f0] m-0 mb-1">
            {task.title}
          </p>

          {task.description && (
            <Typography.Paragraph
              ellipsis={{ rows: 2 }}
              className="!text-xs !text-[#64748b] !mb-2"
            >
              {task.description}
            </Typography.Paragraph>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              {task.assignees && task.assignees.length > 0 && (
                <Avatar.Group
                  size={22}
                  max={{
                    count: 3,
                    style: {
                      backgroundColor: "#1e293b",
                      color: "#94a3b8",
                      fontSize: 10,
                      width: 22,
                      height: 22,
                    },
                  }}
                >
                  {task.assignees.map((assignee) => (
                    <Tooltip key={assignee} title={assignee}>
                      <Avatar
                        size={22}
                        icon={<UserOutlined />}
                        className="!bg-[#1a1f2e] !text-[10px] !border-[#131720]"
                      />
                    </Tooltip>
                  ))}
                </Avatar.Group>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.githubAttachments && task.githubAttachments.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-[#475569]">
                  <MessageOutlined />
                  {task.githubAttachments.length}
                </span>
              )}
              {task.deadline && (
                <Tooltip title={dayjs(task.deadline).format("MMM D, YYYY")}>
                  <Tag
                    icon={<ClockCircleOutlined />}
                    color={isOverdue ? "error" : "default"}
                    className="!text-[11px] !mr-0 !rounded-md !border-0"
                  >
                    {dayjs(task.deadline).format("MMM D")}
                  </Tag>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

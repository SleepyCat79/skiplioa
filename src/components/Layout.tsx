import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Badge, Button, Popover, List, Tooltip } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  CheckOutlined,
  CloseOutlined,
  CodeOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";
import useBoardStore from "@/stores/boardStore";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { invitations, respondInvitation } = useBoardStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sideNavItems = [
    { key: "/", icon: <AppstoreOutlined />, label: "Boards" },
    { key: "/users", icon: <TeamOutlined />, label: "Team" },
    { key: "/profile/integrations", icon: <CodeOutlined />, label: "GitHub" },
    { key: "/profile", icon: <SettingOutlined />, label: "Settings" },
  ];

  const isActive = (key: string) => {
    if (key === "/")
      return (
        location.pathname === "/" || location.pathname.startsWith("/boards")
      );
    if (key === "/profile")
      return (
        location.pathname.startsWith("/profile") &&
        !location.pathname.startsWith("/profile/integrations")
      );
    return location.pathname.startsWith(key);
  };

  const handleInviteAction = async (
    inviteId: string,
    boardId: string,
    action: "accepted" | "declined",
  ) => {
    try {
      await respondInvitation(inviteId, boardId, action);
    } catch {}
  };

  const invitationContent = (
    <List
      dataSource={invitations}
      locale={{ emptyText: "No new invitations" }}
      style={{ width: 300 }}
      renderItem={(inv) => (
        <List.Item
          actions={[
            <Button
              key="accept"
              type="text"
              size="small"
              icon={<CheckOutlined />}
              className="!text-emerald-400 hover:!text-emerald-300"
              onClick={() =>
                handleInviteAction(inv.inviteId, inv.boardId, "accepted")
              }
            />,
            <Button
              key="decline"
              type="text"
              size="small"
              icon={<CloseOutlined />}
              className="!text-red-400 hover:!text-red-300"
              onClick={() =>
                handleInviteAction(inv.inviteId, inv.boardId, "declined")
              }
            />,
          ]}
        >
          <List.Item.Meta
            title={
              <span className="text-[#e2e8f0]">
                {inv.boardName || "Board Invitation"}
              </span>
            }
            description={
              <span className="text-[#64748b]">
                From {inv.emailMember || "a team member"}
              </span>
            }
          />
        </List.Item>
      )}
    />
  );

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => navigate("/profile"),
      },
      { type: "divider" as const },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Log Out",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <div className="h-screen flex">
      <div className="w-14 bg-[#0b0e14] border-r border-[#1e293b] flex flex-col items-center py-4 shrink-0">
        <div
          className="w-9 h-9 bg-[#3b82f6] rounded-lg flex items-center justify-center cursor-pointer mb-6"
          onClick={() => navigate("/")}
        >
          <AppstoreOutlined className="text-white text-base" />
        </div>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {sideNavItems.map((item) => (
            <Tooltip key={item.key} title={item.label} placement="right">
              <button
                onClick={() => navigate(item.key)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border-0 cursor-pointer text-base ${
                  isActive(item.key)
                    ? "bg-[#1a1f2e] text-[#3b82f6]"
                    : "bg-transparent text-[#475569] hover:bg-[#131720] hover:text-[#94a3b8]"
                }`}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 mt-auto">
          <Popover
            content={invitationContent}
            title={<span className="text-[#e2e8f0]">Notifications</span>}
            trigger="click"
            placement="rightBottom"
          >
            <Badge count={invitations.length} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined className="text-[#475569] text-base" />}
                className="!w-10 !h-10 flex items-center justify-center hover:!bg-[#131720]"
              />
            </Badge>
          </Popover>

          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <div className="cursor-pointer">
              <Avatar
                size={32}
                icon={<UserOutlined />}
                src={user?.avatarUrl}
                className="!bg-[#1e293b]"
              />
            </div>
          </Dropdown>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e293b] bg-[#0b0e14]">
          <div className="flex items-center gap-3">
            <FolderOutlined className="text-[#475569]" />
            <span className="text-sm font-semibold text-[#e2e8f0]">
              {location.pathname === "/" ||
              location.pathname.startsWith("/boards")
                ? "Project Dashboard"
                : location.pathname.startsWith("/users")
                  ? "Team Members"
                  : "Settings"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user?.avatarUrl ? (
              <Avatar.Group size={28}>
                <Avatar
                  src={user.avatarUrl}
                  size={28}
                  className="!border-[#0b0e14]"
                />
              </Avatar.Group>
            ) : null}
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-[#0b0e14] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

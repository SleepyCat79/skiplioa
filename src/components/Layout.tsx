import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Avatar,
  Dropdown,
  Badge,
  Button,
  Popover,
  List,
} from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";
import useBoardStore from "@/stores/boardStore";

const { Header, Content } = AntLayout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { invitations, respondInvitation } = useBoardStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { key: "/", icon: <AppstoreOutlined />, label: "Boards" },
    { key: "/users", icon: <TeamOutlined />, label: "Team" },
    { key: "/profile", icon: <SettingOutlined />, label: "Settings" },
  ];

  const isActive = (key: string) => {
    if (key === "/")
      return (
        location.pathname === "/" || location.pathname.startsWith("/boards")
      );
    return location.pathname.startsWith(key);
  };

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

  const handleInviteAction = async (
    inviteId: string,
    boardId: string,
    action: "accepted" | "declined",
  ) => {
    try {
      await respondInvitation(inviteId, boardId, action);
    } catch {
      /* store handles */
    }
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

  return (
    <AntLayout className="h-screen">
      <Header className="!bg-[#0b0e14] !px-6 flex items-center justify-between border-b border-[#1e293b] !h-14 !leading-14">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 bg-[#3b82f6] rounded-lg flex items-center justify-center">
              <AppstoreOutlined className="text-white text-sm" />
            </div>
            <span className="text-[#e2e8f0] font-semibold text-base tracking-tight">
              DevBoard
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border-0 cursor-pointer ${
                  isActive(item.key)
                    ? "bg-[#1a1f2e] text-[#3b82f6]"
                    : "bg-transparent text-[#64748b] hover:bg-[#131720] hover:text-[#e2e8f0]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Popover
            content={invitationContent}
            title={<span className="text-[#e2e8f0]">Notifications</span>}
            trigger="click"
            placement="bottomRight"
          >
            <Badge count={invitations.length} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined className="text-[#64748b] text-base" />}
                className="!w-9 !h-9 flex items-center justify-center hover:!bg-[#131720]"
              />
            </Badge>
          </Popover>

          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#131720] px-2 py-1 rounded-lg transition-colors ml-1">
              <Avatar
                size={32}
                icon={<UserOutlined />}
                src={user?.avatarUrl}
                className="!bg-[#1e293b]"
              />
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content className="overflow-auto bg-[#0b0e14] p-6">
        <Outlet />
      </Content>
    </AntLayout>
  );
}

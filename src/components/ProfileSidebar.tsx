import { useNavigate, useLocation } from "react-router-dom";
import {
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  ApiOutlined,
  CreditCardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";

export default function ProfileSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { key: "/profile", icon: <UserOutlined />, label: "Profile" },
    {
      key: "/profile/security",
      icon: <LockOutlined />,
      label: "Account Security",
    },
    { key: "/profile/team", icon: <TeamOutlined />, label: "Team" },
    {
      key: "/profile/integrations",
      icon: <ApiOutlined />,
      label: "Integrations",
    },
    { key: "/profile/billing", icon: <CreditCardOutlined />, label: "Billing" },
  ];

  const isActive = (path: string) => {
    if (path === "/profile") return location.pathname === "/profile";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-56 shrink-0">
      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-3">
        <div className="px-3 py-2.5 mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">DB</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#e2e8f0] m-0 leading-tight">
                DevBoard
              </p>
              <p className="text-[11px] text-[#64748b] m-0">Pro Workspace</p>
            </div>
          </div>
        </div>

        <div className="space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all border-0 cursor-pointer ${
                isActive(item.key)
                  ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                  : "bg-transparent text-[#94a3b8] hover:bg-[#0f1219] hover:text-[#e2e8f0]"
              }`}
            >
              <span className="text-[15px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-[#1e293b]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#64748b] hover:text-red-400 hover:bg-red-500/5 transition-all bg-transparent border-0 cursor-pointer"
          >
            <LogoutOutlined className="text-[15px]" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

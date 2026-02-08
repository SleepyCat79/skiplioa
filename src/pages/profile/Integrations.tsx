import { Button } from "antd";
import {
  GithubOutlined,
  CheckCircleFilled,
  ApiOutlined,
} from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";

export default function Integrations() {
  const { user } = useAuthStore();

  const integrations = [
    {
      id: "github",
      name: "GitHub",
      icon: <GithubOutlined className="text-xl" />,
      description:
        "Sync repositories, issues, and pull requests with your boards.",
      connected: !!user?.githubUsername,
      username: user?.githubUsername,
      bgColor: "bg-[#1a1f2e]",
    },
    {
      id: "slack",
      name: "Slack",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 15a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-5z" />
          <path d="M9 6a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5z" />
          <path d="M18 9a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-2V9zm-1 0a2 2 0 0 1-2 2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2a2 2 0 0 1 2 2v5z" />
          <path d="M15 18a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2a2 2 0 0 1-2 2h-5z" />
        </svg>
      ),
      description:
        "Get real-time notifications and updates in your Slack workspace.",
      connected: false,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      id: "figma",
      name: "Figma",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 24a4 4 0 0 0 4-4v-4H8a4 4 0 1 0 0 8z" />
          <path d="M4 12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" />
          <path d="M4 4a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" />
          <path d="M12 0h4a4 4 0 1 1 0 8h-4V0z" />
          <path d="M20 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0z" />
        </svg>
      ),
      description:
        "Import designs and collaborate on UI tasks directly from Figma.",
      connected: false,
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-400",
    },
    {
      id: "linear",
      name: "Linear",
      icon: <ApiOutlined className="text-xl" />,
      description: "Sync issues and project data between Linear and DevBoard.",
      connected: false,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">
          Integrations
        </h2>
        <p className="text-sm text-[#64748b] mt-1.5 mb-0">
          Connect your favorite tools to streamline your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-[#131720] border border-[#1e293b] rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${integration.bgColor} flex items-center justify-center shrink-0`}
                >
                  <span className={integration.iconColor || "text-[#e2e8f0]"}>
                    {integration.icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-[#e2e8f0] m-0">
                      {integration.name}
                    </h3>
                    {integration.connected && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircleFilled />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748b] m-0 mb-3">
                    {integration.description}
                  </p>
                  {integration.connected && integration.username && (
                    <p className="text-xs text-[#94a3b8] bg-[#0f1219] px-2 py-1 rounded inline-block">
                      @{integration.username}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {integration.connected ? (
                  <Button danger size="small">
                    Disconnect
                  </Button>
                ) : (
                  <Button type="primary" size="small">
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

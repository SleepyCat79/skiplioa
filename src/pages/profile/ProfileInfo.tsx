import { useEffect } from "react";
import { Form, Input, Button, Avatar, Spin, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";

export default function ProfileInfo() {
  const { user, loading, fetchProfile, updateProfile } = useAuthStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        displayName: user.displayName || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

  const handleSave = async (values: { displayName: string }) => {
    try {
      await updateProfile({ displayName: values.displayName });
      message.success("Profile updated");
    } catch {
      message.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">
          Profile & Settings
        </h2>
        <p className="text-sm text-[#64748b] mt-1.5 mb-0">
          Manage your personal information, connected accounts, and preferences.
        </p>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mb-6">
        <h3 className="text-sm font-medium text-[#94a3b8] uppercase tracking-wider mb-5">
          Your Avatar
        </h3>

        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-[#1e293b]">
          <Avatar
            size={72}
            icon={<UserOutlined />}
            src={user?.avatarUrl}
            className="!bg-[#1a1f2e]"
          />
          <div>
            <p className="text-sm text-[#94a3b8] mb-2">
              PNG or JPG no bigger than 800px wide.
            </p>
            <div className="flex gap-2">
              <Button size="small">Upload New</Button>
              <Button size="small" danger>
                Remove
              </Button>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-[#94a3b8] uppercase tracking-wider mb-5">
          Personal Information
        </h3>

        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="displayName"
              label="Display Name"
              rules={[
                { required: true, message: "Please enter your display name" },
              ]}
            >
              <Input placeholder="Alex Developer" />
            </Form.Item>
            <Form.Item label="Job Title">
              <Input placeholder="Senior Frontend Engineer" />
            </Form.Item>
          </div>

          <Form.Item label="Email Address">
            <Input
              disabled
              value={user?.email}
              prefix={<span className="text-[#64748b]">✉</span>}
            />
          </Form.Item>

          <Form.Item label="Bio">
            <Input.TextArea
              rows={4}
              placeholder="Full stack developer passionate about React and clean UI design."
              className="resize-none"
            />
          </Form.Item>

          <p className="text-xs text-[#64748b] mb-6">
            Brief description for your profile.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <Button onClick={() => form.resetFields()}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mt-6">
        <h3 className="text-sm font-medium text-[#94a3b8] uppercase tracking-wider mb-4">
          Connected Accounts
        </h3>
        <p className="text-sm text-[#64748b] mb-5">
          Connect your favorite tools to streamline your workflow.
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 px-4 bg-[#0f1219] rounded-lg border border-[#1e293b]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1a1f2e] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#e2e8f0]"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#e2e8f0] m-0">GitHub</p>
                <p className="text-xs text-[#64748b] m-0">
                  {user?.githubUsername
                    ? `@${user.githubUsername}`
                    : "Not connected"}
                </p>
              </div>
            </div>
            {user?.githubUsername ? (
              <Button size="small" danger>
                Disconnect
              </Button>
            ) : (
              <Button size="small" type="primary">
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

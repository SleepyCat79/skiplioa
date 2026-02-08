import { useState } from "react";
import { Form, Input, Button, Switch, message } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";

export default function AccountSecurity() {
  const [passwordForm] = Form.useForm();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = async (_values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      message.success("Password updated successfully");
      passwordForm.resetFields();
    } catch {
      message.error("Failed to update password");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#e2e8f0] m-0">
          Account Security
        </h2>
        <p className="text-sm text-[#64748b] mt-1.5 mb-0">
          Manage your password and enable two-factor authentication.
        </p>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
            <LockOutlined className="text-[#3b82f6] text-lg" />
          </div>
          <div>
            <h3 className="text-base font-medium text-[#e2e8f0] m-0">
              Change Password
            </h3>
            <p className="text-sm text-[#64748b] m-0">
              Update your password regularly to keep your account secure.
            </p>
          </div>
        </div>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please enter a new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm new password" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <Button onClick={() => passwordForm.resetFields()}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Update Password
            </Button>
          </div>
        </Form>
      </div>

      <div className="bg-[#131720] border border-[#1e293b] rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <SafetyOutlined className="text-emerald-400 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#e2e8f0] m-0 mb-1">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-[#64748b] m-0 mb-4">
                Add an extra layer of security to your account by enabling 2FA.
              </p>
              {twoFactorEnabled && (
                <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
                  <SafetyOutlined />
                  <span>2FA is currently enabled</span>
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onChange={(checked) => {
              setTwoFactorEnabled(checked);
              message.success(checked ? "2FA enabled" : "2FA disabled");
            }}
          />
        </div>

        {twoFactorEnabled && (
          <div className="mt-6 pt-6 border-t border-[#1e293b]">
            <Button danger>Disable Two-Factor Authentication</Button>
          </div>
        )}
      </div>
    </div>
  );
}

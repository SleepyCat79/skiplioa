import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Divider } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GithubOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import useAuthStore from "@/stores/authStore";
import { useMessage } from "@/hooks/useMessage";

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "";

export default function Login() {
  const navigate = useNavigate();
  const message = useMessage();
  const { sendCode, signin } = useAuthStore();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async () => {
    if (!email) return;
    setSending(true);
    try {
      await sendCode(email);
      message.success("Verification code sent to your email");
      setStep("code");
    } catch (err: any) {
      message.error(
        err.response?.data?.message || "Failed to send verification code",
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (values: { code: string }) => {
    setVerifying(true);
    try {
      await signin(email, values.code);
      message.success("Signed in successfully");
      navigate("/");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleGitHubLogin = () => {
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email,repo`;
    window.location.href = url;
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 50%, #020617 100%)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-[#3b82f6] rounded-md flex items-center justify-center shrink-0">
          <FlagOutlined className="text-white text-sm" />
        </div>
        <span className="text-[#e2e8f0] font-semibold text-lg">DevBoard</span>
      </div>
      <p className="text-[#64748b] mb-10 text-[13px]">
        Manage your development boards efficiently.
      </p>

      <div className="w-full max-w-[400px] bg-[#1a2332] rounded-xl border border-[#2a3441] p-8">
        <h3 className="text-[#e2e8f0] text-lg font-semibold mb-8 text-center">
          Sign in to your account
        </h3>

        <Button
          icon={<GithubOutlined />}
          block
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-2 h-10 !bg-[#2a3441] !border-[#3a4551] !text-[#e2e8f0] hover:!border-[#4a5561] hover:!bg-[#313a48] mb-5 !text-sm !font-medium"
        >
          Continue with GitHub
        </Button>

        <Divider className="!my-5">
          <span className="text-[#475569] text-[11px] uppercase tracking-wider font-normal">
            or continue with email
          </span>
        </Divider>

        {step === "email" ? (
          <Form layout="vertical" onFinish={handleSendCode}>
            <Form.Item label="Email address" className="mb-5">
              <Input
                prefix={<MailOutlined className="text-[#64748b] text-sm" />}
                placeholder="name@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!h-10 !text-sm"
              />
            </Form.Item>
            <Form.Item className="!mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={sending}
                className="!h-10 !font-medium !text-sm"
              >
                Send Verification Code
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form layout="vertical" onFinish={handleVerify}>
            <div className="mb-5 p-3 bg-[#131720] rounded-lg border border-[#2a3441]">
              <p className="text-[#94a3b8] text-[13px] m-0 leading-tight">
                We&apos;ve sent a 6-digit code to
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[#e2e8f0] font-medium text-sm">
                  {email}
                </span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setStep("email")}
                  className="!text-[#3b82f6] !p-0 !h-auto !text-[13px]"
                >
                  Change
                </Button>
              </div>
            </div>
            <Form.Item
              name="code"
              label="Verification Code"
              className="mb-5"
              rules={[
                { required: true, message: "Enter the code from your email" },
              ]}
            >
              <Input
                prefix={<LockOutlined className="text-[#64748b] text-sm" />}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="!h-10 !text-center !tracking-[0.4em] !text-base !font-mono"
              />
            </Form.Item>
            <Form.Item className="!mb-3">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={verifying}
                className="!h-10 !font-medium !text-sm"
              >
                Verify email
              </Button>
            </Form.Item>
            <div className="text-center">
              <span className="text-[#64748b] text-[13px]">
                Didn&apos;t receive the code?{" "}
              </span>
              <Button
                type="link"
                onClick={handleSendCode}
                loading={sending}
                className="!text-[#3b82f6] !p-0 !h-auto !text-[13px]"
              >
                Click to resend
              </Button>
            </div>
          </Form>
        )}
      </div>
      <div className="text-center mt-6">
        <span className="text-[#64748b] text-[13px]">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#3b82f6] font-medium hover:text-[#5b9ff8]"
          >
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
}

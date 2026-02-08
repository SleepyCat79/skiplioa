import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";
import useAuthStore from "@/stores/authStore";

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { githubLogin } = useAuthStore();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const code = params.get("code");
    if (!code) {
      message.error("GitHub authorization failed");
      navigate("/login");
      return;
    }

    calledRef.current = true;
    githubLogin(code)
      .then(() => {
        message.success("Signed in with GitHub");
        navigate("/");
      })
      .catch(() => {
        message.error("GitHub login failed");
        navigate("/login");
      });
  }, [params, githubLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
      <Spin size="large" fullscreen tip="Signing in with GitHub..." />
    </div>
  );
}

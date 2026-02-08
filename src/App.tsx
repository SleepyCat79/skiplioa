import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import useBoardStore from "@/stores/boardStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/Layout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import GitHubCallback from "@/pages/GitHubCallback";
import Dashboard from "@/pages/Dashboard";
import BoardDetail from "@/pages/BoardDetail";
import Users from "@/pages/Users";
import ProfileLayout from "@/layouts/ProfileLayout";
import ProfileInfo from "@/pages/profile/ProfileInfo";
import AccountSecurity from "@/pages/profile/AccountSecurity";
import TeamSettings from "@/pages/profile/TeamSettings";
import Integrations from "@/pages/profile/Integrations";
import Billing from "@/pages/profile/Billing";

export default function App() {
  const { token, fetchProfile } = useAuthStore();
  const { fetchInvitations } = useBoardStore();

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchInvitations();
    }
  }, [token, fetchProfile, fetchInvitations]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/boards/:boardId" element={<BoardDetail />} />
        <Route path="/users" element={<Users />} />
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<ProfileInfo />} />
          <Route path="security" element={<AccountSecurity />} />
          <Route path="team" element={<TeamSettings />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="billing" element={<Billing />} />
        </Route>
      </Route>
    </Routes>
  );
}

import { Outlet } from "react-router-dom";
import ProfileSidebar from "@/components/ProfileSidebar";

export default function ProfileLayout() {
  return (
    <div className="flex gap-8 h-full">
      <ProfileSidebar />
      <div className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

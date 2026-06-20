import { Navigate } from "react-router-dom";
import { isAdminUser } from "../../lib/admin";
import { useAppStore } from "../../store/useAppStore";
import { AdminDashboardPage } from "./AdminDashboardPage";

export function AdminGuard() {
  const email = useAppStore((state) => state.user?.email);
  if (!isAdminUser(email)) {
    return <Navigate to="/" replace />;
  }
  return <AdminDashboardPage />;
}

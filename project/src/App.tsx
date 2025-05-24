import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "./components/layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Complaints from "./pages/complaints/Complaints";
import ComplaintDetails from "./pages/complaints/ComplaintDetails";
import NewComplaint from "./pages/complaints/NewComplaint";
import Users from "./pages/admin/Users";
import Workers from "./pages/admin/Workers";
import Notifications from "./pages/notifications/Notifications";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import { UserRole } from "./types/auth";

function App() {
  const { isAuthenticated, checkAuth, error } = useAuth();

  useEffect(() => {
    // Check if user is authenticated on app load
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/new" element={<NewComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetails />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin only routes */}
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
                <Users />
              </RoleBasedRoute>
            }
          />

          {/* Admin and worker routes */}
          <Route
            path="/admin/workers"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.WORKER]}>
                <Workers />
              </RoleBasedRoute>
            }
          />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

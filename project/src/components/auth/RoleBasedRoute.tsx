import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import AccessDenied from "../../pages/AccessDenied";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

function RoleBasedRoute({
  children,
  allowedRoles,
  redirectTo = "/dashboard",
}: RoleBasedRouteProps) {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    // If the user doesn't have the required role, show access denied
    return <AccessDenied />;
  }

  return <>{children}</>;
}

export default RoleBasedRoute;

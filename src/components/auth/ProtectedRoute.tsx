
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  restrictedRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRole, restrictedRoles = [] }: ProtectedRouteProps) => {
  const { isLoggedIn, checkAuthAccess, userRole } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (requiredRole && !checkAuthAccess(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // Check if user's role is in restricted roles list
  if (userRole && restrictedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

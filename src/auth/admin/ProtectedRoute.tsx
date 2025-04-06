import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContextType";


// --- ProtectedRoute.tsx ---
interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
  }
  
  const ProtectedAdminRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { roles, isAuthenticated, loading } = useAuth();
  
    if (loading) {
      return <div>Loading...</div>; // Hiển thị màn hình chờ
    }
  
    if (!isAuthenticated) {
      return <Navigate to="/admin/login" />;
    }
  
    const hasPermission = roles.some((role) => allowedRoles.includes(role));
  
    return hasPermission ? children : <Navigate to="/forbidden" />;
  };
  
  export default ProtectedAdminRoute;
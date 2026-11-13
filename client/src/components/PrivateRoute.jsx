import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {
  const [, isAuthenticated, , , initializing] = useAuth();
  const location = useLocation();
  if (initializing) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}

export default PrivateRoute;

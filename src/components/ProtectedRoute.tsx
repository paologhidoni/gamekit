import { useAuth } from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router";

function ProtectedRoute() {
  const { user, loading } = useAuth();

  // 1. While the initial authentication check is running, show a loading indicator.
  // This prevents a redirect to login while state is being checked for already authenticated users.
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // 2. If the check is complete and there is no user, redirect to the login page.
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  // 3. If the check is complete and a user exists, render the nested routes.
  return <Outlet />;
}

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ logged, children }: any) => {
  const { user } = useAuth();
  if (logged) {
    // logic for logged route

    if (!user) {
      return <Navigate to="/login" />;
    }
  } else {
    // logic for not logged route

    if (user) {
      return <Navigate to="/account" />;
    }
  }

  return children;
};

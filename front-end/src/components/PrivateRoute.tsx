import { useSession } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router";

function PrivateRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (!session) return <Navigate to="/" />;

  return <Outlet />;
}

export default PrivateRoute;

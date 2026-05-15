import { useSession } from "@/lib/auth-client";
import { Navigate, Outlet } from "react-router";

function PublicRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;
  if (session) return <Navigate to="/app/analyze" />;

  return <Outlet />;
}

export default PublicRoute;

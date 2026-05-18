import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Analyze from "./pages/Analyze";
import ViewCode from "./pages/ViewCode";
import Results from "./pages/Results/index";
import AppLayout from "./components/AppLayout";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/app/analyze",
            element: <Analyze />,
          },
          {
            path: "/app/view",
            element: <ViewCode />,
          },
          {
            path: "/app/results/:owner/:repo/pull/:prNumber",
            element: <Results />,
          },
        ],
      },
    ],
  },

  {
    element: <PublicRoute />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
    ],
  },
]);

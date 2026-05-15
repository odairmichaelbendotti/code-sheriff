import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Analyze from "./pages/Analyze";
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
            path: "/app/results/:id",
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

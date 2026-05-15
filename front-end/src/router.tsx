import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Analyze from "./pages/Analyze";
import AppLayout from "./components/AppLayout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/app/analyze",
        element: <Analyze />,
      },
    ],
  },

  {
    path: "/",
    element: <Login />,
  },
]);

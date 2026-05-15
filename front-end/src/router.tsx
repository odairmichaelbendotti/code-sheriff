import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results/index";
import AppLayout from "./components/AppLayout";

export const router = createBrowserRouter([
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

  {
    path: "/",
    element: <Login />,
  },
]);

import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import RootLayout from "./components/RootLayout";
import GameDetail from "./pages/GameDetail";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeContextProvider } from "./context/ThemeContext";
import Settings from "./pages/Settings";
import ErrorElement from "./components/ErrorElement";
import Authentication from "./pages/Authentication";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorElement />,
    children: [
      { path: "auth", element: <Authentication /> },
      { index: true, element: <Home /> },
      { path: "game/:id", element: <GameDetail /> },
      // Group all protected routes under a single parent
      {
        element: <ProtectedRoute />,
        children: [{ path: "settings", element: <Settings /> }],
      },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <RouterProvider router={router} />
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}

export default App;

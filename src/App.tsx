import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import Home, { loader as homeLoader } from "./pages/Home";
import RootLayout from "./components/RootLayout";
import GameDetail, { loader as gameDetailLoader } from "./pages/GameDetail";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeContextProvider } from "./context/ThemeContext";
import Settings from "./pages/Settings";
import ErrorElement from "./components/ErrorElement";
import Authentication from "./pages/Authentication";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorElement />,
    children: [
      { path: "auth", element: <Authentication /> },
      { index: true, element: <Home />, loader: homeLoader(queryClient) },
      {
        path: "game/:id",
        element: <GameDetail />,
        loader: gameDetailLoader(queryClient),
      },
      // Group all protected routes under a single parent
      {
        element: <ProtectedRoute />,
        children: [{ path: "settings", element: <Settings /> }],
      },
    ],
  },
]);

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

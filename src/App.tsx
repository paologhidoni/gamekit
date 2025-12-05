import "./App.css";
import { RouterProvider, createHashRouter } from "react-router";
import Home from "./pages/Home";
import RootLayout from "./components/RootLayout";
import GameDetail from "./pages/GameDetail";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeContextProvider } from "./context/ThemeContext";
import Settings from "./pages/Settings";

const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "games/:id", element: <GameDetail /> },
      { path: "settings/", element: <Settings /> },
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

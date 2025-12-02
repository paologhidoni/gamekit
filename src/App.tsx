import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import RootLayout from "./components/RootLayout";
import GameDetail from "./pages/GameDetail";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "games/:gameId", element: <GameDetail /> },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

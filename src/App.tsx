import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import RootLayout from "./components/RootLayout";
import GameDetail from "./pages/GameDetail";

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

function App() {
  return <RouterProvider router={router} />;
}

export default App;

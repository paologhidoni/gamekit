import { Suspense, lazy } from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import RootLayout from "./components/RootLayout";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeContextProvider } from "./context/ThemeContext";
import ErrorElement from "./components/ErrorElement";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { SearchContextProvider } from "./context/SearchContext";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Authentication = lazy(() => import("./pages/Authentication"));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "auth",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Authentication />
          </Suspense>
        ),
      },
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: "game/:id",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <GameDetail />
          </Suspense>
        ),
      },
      // Group all protected routes under a single parent
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "settings",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Settings />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <SearchContextProvider>
          <RouterProvider router={router} />
        </SearchContextProvider>
      </ThemeContextProvider>
    </QueryClientProvider>
  );
}

export default App;

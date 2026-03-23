import { Suspense, lazy } from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router";
import RootLayout from "./components/RootLayout";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ThemeContextProvider } from "./context/ThemeContext";
import ErrorElement from "./components/ErrorElement";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { SearchContextProvider } from "./context/SearchContext";
import { ToastProvider } from "./context/ToastContext";
import {
  queryClient,
  sessionStoragePersister,
  SESSION_QUERY_MAX_AGE,
} from "./lib/queryClient";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Favourites = lazy(() => import("./pages/Favourites"));
const AiSearch = lazy(() => import("./pages/AiSearch"));
const Authentication = lazy(() => import("./pages/Authentication"));

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
        path: "ai-search",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <AiSearch />
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
          {
            path: "favourites",
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Favourites />
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: sessionStoragePersister,
        maxAge: SESSION_QUERY_MAX_AGE,
      }}
    >
      <ThemeContextProvider>
        <SearchContextProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </SearchContextProvider>
      </ThemeContextProvider>
    </PersistQueryClientProvider>
  );
}

export default App;

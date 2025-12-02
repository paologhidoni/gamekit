import { Outlet } from "react-router";
import Navigation from "./Navigation";

export default function RootLayout() {
  return (
    <div className="font-inter">
      <Navigation />

      <main className="py-8 px-2 h-screen bg-(--color-bg-primary) text-(--color-text-primary) transition-colors transition-100md:px-20 lg:px-25  ">
        <Outlet />
      </main>
    </div>
  );
}

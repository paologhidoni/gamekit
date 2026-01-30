import { Outlet } from "react-router";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function RootLayout() {
  return (
    <div className="font-inter">
      <Navigation />

      <main className="pb-8 px-2 min-h-screen bg-(--color-bg-primary) text-(--color-text-primary) transition-colors duration-100 md:px-20 lg:px-24 xl:px-36 2xl:px-56">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

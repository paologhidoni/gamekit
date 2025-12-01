import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="font-inter">
      <h1>Root Layout</h1>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

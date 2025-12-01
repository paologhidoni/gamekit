import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <>
      <h1>Root Layout</h1>

      <main>
        <Outlet />
      </main>
    </>
  );
}

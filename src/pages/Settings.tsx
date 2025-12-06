import { useNavigate } from "react-router";
import ThemeSelector from "../components/ThemeSelector";
// import Button from "../components/Button";
// import { useCallback } from "react";

export default function Settings() {
  const navigate = useNavigate();
  // const handleNavigateBack = useCallback(() => navigate("/"), []);

  return (
    <div className="flex flex-col items-start gap-8">
      <h1 className="text-3xl font-bold text-(--color-text-primary)">
        Settings
      </h1>

      <ThemeSelector />
      {/* <Button text="Back to home" handleOnClick={handleNavigateBack} /> */}
    </div>
  );
}

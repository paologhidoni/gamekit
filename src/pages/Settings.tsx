import ThemeSelector from "../components/ThemeSelector";

export default function Settings() {
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

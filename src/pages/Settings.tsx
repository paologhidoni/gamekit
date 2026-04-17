import ThemeSelector from "../components/ThemeSelector";

export default function Settings() {
  return (
    <div className="flex flex-col items-start gap-8">
      <h1 className="self-center text-center text-3xl font-gonadaltes tracking-wider uppercase font-bold text-(--color-text-primary)">
        Settings
      </h1>

      <ThemeSelector />
    </div>
  );
}

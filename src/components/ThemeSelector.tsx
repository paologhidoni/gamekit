import { type ChangeEvent } from "react";
import { THEMES, useTheme, type ThemeName } from "../context/ThemeContext";
import { ChevronDown } from "lucide-react";

export default function ThemeSelector() {
  const { themeName, setThemeName } = useTheme();
  const availableThemes = Object.keys(THEMES);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setThemeName(e.target.value as ThemeName);
  };

  return (
    <div className="relative w-fit">
      <select
        value={themeName}
        onChange={handleChange}
        className="py-4 px-6 pr-11 relative rounded-xl appearance-none cursor-pointer font-bold text-center text-(--color-text-secondary) bg-(--color-accent-primary) hover:bg-(--color-accent-primary-t2)"
      >
        {availableThemes.map((themeName) => (
          <option key={themeName} value={themeName}>
            {themeName[0].toUpperCase() + themeName.slice(1)} Theme
          </option>
        ))}
      </select>

      <div
        className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none"
        style={{}}
      >
        <ChevronDown className="text-(--color-text-secondary)" />
      </div>
    </div>
  );
}

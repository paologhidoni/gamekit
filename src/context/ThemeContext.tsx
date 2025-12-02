import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// The values now reference the underlying raw color variables defined in CSS (e.g., in App.css).
export const THEMES = {
  // Light Theme
  light: {
    "--color-bg-primary": "var(--color-paper-white)", // Main screen background (Beige)
    "--color-bg-secondary": "var(--color-smoke-gray)", // Main card background (Light Gray)
    "--color-bg-tertiary": "var(--color-dusty-rose)", // Nested panel background (Light Tan)
    "--color-text-primary": "var(--color-ink-black)", // Main text (Dark Gray/Black)
    "--color-text-secondary": "var(--color-white)", // Muted text (using a dark color from your light set)
    // "--color-accent-primary": "var(--color-vibrant-lime)", // Primary CTA/Highlight (Neon Green)
    "--color-accent-primary": "var(--color-dark-green)",
    "--color-accent-primary-hover": "var(--color-dark-green-hover)",
    "--color-accent-secondary": "var(--color-soft-lavender)", // Secondary highlight/Border (Lavender)
  },
  // Dark Theme
  dark: {
    "--color-bg-primary": "var(--color-ink-black)", // Main screen background
    "--color-bg-secondary": "var(--color-jet-black)", // Main card background
    "--color-bg-tertiary": "var(--color-ink-black)", // Nested panel background
    "--color-text-primary": "var(--color-silver)", // Main text
    "--color-text-secondary": "var(--color-white)", // Muted text - buttons & elements
    "--color-accent-primary": "var(--color-malachite)", // Primary CTA/Highlight
    "--color-accent-primary-hover": "var(--color-dark-green-hover)",
    "--color-accent-secondary": "var(--color-wisteria)", // Secondary highlight/Border
  },
  // Sunset Theme
  sunset: {
    "--color-bg-primary": "var(--color-dark-burgundy)", // Main screen background
    "--color-bg-secondary": "var(--color-burnt-red)", // Main card background
    "--color-bg-tertiary": "var(--color-dark-burgundy)", // Nested panel background
    "--color-text-primary": "var(--color-white)", // Main Text
    "--color-text-secondary": "var(--color-gold-yellow)", // Muted text
    "--color-accent-primary": "var(--color-crimson)", // Primary CTA/Highlight
    "--color-accent-primary-hover": "var(--color-dark-green-hover)",
    "--color-accent-secondary": "var(--color-coral)", // Secondary highlight/Border
  },
};

export type ThemeName = keyof typeof THEMES;
type ThemeValues = (typeof THEMES)[ThemeName];

interface ThemeContextType {
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  theme: ThemeValues;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>("dark");

  const theme = THEMES[themeName];

  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const contextValue = { themeName, setThemeName, theme };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
};

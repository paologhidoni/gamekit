import logo from "../assets/logo-tr.webp";
import logoLight from "../assets/logo-light.webp";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router";

interface logoProps {
  extraClasses?: string;
}

export default function Logo({ extraClasses }: logoProps) {
  const { themeName } = useTheme();
  const logoSource = themeName === "light" ? logo : logoLight;

  const classes = `flex ${extraClasses}`;

  return (
    <Link to="/" className={classes}>
      <img
        src={logoSource}
        alt="GameKit Home"
        className="w-32 h-auto md:w-[200px] -ml-3 md:-ml-5"
        fetchPriority="high"
        loading="eager"
        width={200}
        height={60}
      />
    </Link>
  );
}

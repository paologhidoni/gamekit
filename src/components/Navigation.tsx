import SearchBar from "./SearchBar";
import logo from "../assets/logo-tr.png";
import logoLight from "../assets/logo-light.png";
import { NavLink } from "react-router";
import { Cog } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navigation() {
  const { themeName } = useTheme();
  const logoSource = themeName === "light" ? logo : logoLight;

  return (
    <div className="bg-(--color-bg-primary) text-(--color-text-primary) py-4 px-2 flex flex-col items-center gap-2 md:flex-row md:px-20 lg:px-25">
      <div id="logo" className="flex md:w-1/3">
        <img src={logoSource} alt="" className="w-50" />
      </div>

      <div className="flex md:w-1/3 justify-center">
        <SearchBar />
      </div>

      <div className="flex md:w-1/3 justify-end">
        <nav>
          <ul className="flex gap-3 justify-center text-center md:justify-end">
            <li>
              <a href="#">Log in</a>
            </li>

            <li>
              <a href="#">Sign up</a>
            </li>

            <li>
              <NavLink to="/settings">
                <Cog />
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

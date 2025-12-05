// import SearchBar from "./SearchBar";
import logo from "../assets/logo-tr.png";
import logoLight from "../assets/logo-light.png";
import { Link, NavLink } from "react-router";
import { Cog } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navigation() {
  const { themeName } = useTheme();
  const logoSource = themeName === "light" ? logo : logoLight;

  return (
    <div className="bg-(--color-bg-primary) text-(--color-text-primary) py-4 px-2 flex flex-col items-center gap-2 md:flex-row md:px-20 lg:px-25">
      <Link to="/" className="flex md:w-1/3 order-1 md:order-1">
        <img src={logoSource} alt="" className="w-50" />
      </Link>

      <div className="flex md:w-1/3 w-full self-stretch md:self-center order-3 md:order-2">
        {/* <SearchBar /> */}
      </div>

      <div className="flex md:w-1/3 justify-end order-2 md:order-3">
        <nav>
          <ul className="flex gap-3 justify-center text-center md:justify-end">
            {/* <li>
              <a href="#">Log in</a>
            </li>

            <li>
              <a href="#">Sign up</a>
            </li> */}

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

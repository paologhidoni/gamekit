import SearchBar from "./SearchBar";
import logo from "../assets/react.svg";
import { NavLink } from "react-router";
import { Cog } from "lucide-react";

export default function Navigation() {
  return (
    <div className="bg-(--color-bg-primary) text-(--color-text-primary) py-4 px-2 flex flex-col items-center gap-2 md:flex-row md:px-20 lg:px-25">
      <div id="logo" className="flex md:w-1/3">
        <img src={logo} alt="" />
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

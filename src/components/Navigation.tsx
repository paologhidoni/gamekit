// import SearchBar from "./SearchBar";
import { NavLink } from "react-router";
import { Cog, User2 } from "lucide-react";
import Logo from "./Logo";

export default function Navigation() {
  return (
    <div className="bg-(--color-bg-primary) text-(--color-text-primary) py-4 px-2 flex flex-col items-center gap-2 md:flex-row md:px-20 lg:px-25">
      <Logo extraClasses="md:w-1/3 order-1 md:order-1" />

      <div className="flex md:w-1/3 w-full self-stretch md:self-center order-3 md:order-2">
        {/* <SearchBar /> */}
      </div>

      <div className="flex md:w-1/3 justify-end order-2 md:order-3">
        <nav>
          <ul className="flex gap-3 justify-center text-center md:justify-end">
            <li>
              <NavLink to="/auth?mode=login">
                <User2 />
              </NavLink>
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

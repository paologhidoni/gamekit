// import SearchBar from "./SearchBar";
import { NavLink, useNavigate } from "react-router";
import { Cog, User2, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const { user, signOut } = useAuth();
  const AuthIcon = user ? LogOut : User2;
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      const { error } = await signOut();
      if (!error) navigate("/");
    } else {
      navigate("/auth?mode=login");
    }
  };

  return (
    <div className="bg-(--color-bg-primary) text-(--color-text-primary) py-4 px-2 flex flex-col items-center gap-2 md:flex-row md:px-20 lg:px-25">
      <Logo extraClasses="md:w-1/3 order-1 md:order-1" />

      <div className="flex md:w-1/3 w-full self-stretch md:self-center order-3 md:order-2">
        {/* <SearchBar /> */}
      </div>

      <div className="flex md:w-1/3 justify-end order-2 md:order-3">
        <nav>
          <ul className="flex gap-3 justify-center text-center md:justify-end">
            {user && (
              <li>
                <NavLink to="/settings" title="Settings">
                  <Cog />
                  <span className="sr-only">Settings</span>
                </NavLink>
              </li>
            )}
            {/* 
            <li>
              <button
                type="button"
                onClick={handleAuthAction}
                className="cursor-pointer"
                title={user ? "Sign Out" : "Log In"}
              >
                <AuthIcon />
                <span className="sr-only">{user ? "Sign Out" : "Log In"}</span>
              </button>
            </li> */}
          </ul>
        </nav>
      </div>
    </div>
  );
}

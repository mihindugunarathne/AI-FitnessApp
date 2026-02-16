import {
  ActivityIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  UtensilsIcon,
  ZapIcon,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { NavLink } from "react-router-dom"

const navItems = [
  { path: "/", label: "Home", icon: HomeIcon },
  { path: "/food", label: "Food Log", icon: UtensilsIcon },
  { path: "/activity", label: "Activity", icon: ActivityIcon },
  { path: "/profile", label: "Profile", icon: UserIcon },
]

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav
      className="hidden lg:flex flex-col w-64 min-h-screen border-r p-6 transition-colors duration-200 sidebar-nav"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="sidebar-logo">
          <ZapIcon className="size-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          FitTrack
        </h1>
      </div>

      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`sidebar-nav-icon ${isActive ? "sidebar-nav-icon-active" : ""}`}>
                  <item.icon className="size-5" />
                </span>
                <span className="text-base">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <MoonIcon className="size-5 shrink-0" />
          ) : (
            <SunIcon className="size-5 shrink-0" />
          )}
          <span className="text-base font-medium">
            {theme === "light" ? "Midnight Mode" : "Light mode"}
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Sidebar
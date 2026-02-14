import { ActivityIcon, HomeIcon, MoonIcon, PersonStandingIcon, SunIcon, UserIcon, UtensilsIcon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { NavLink } from "react-router-dom"


const Sidebar = () => {

    const navItems = [
      {path: '/', label: 'Home', icon: HomeIcon},
      {path: '/food', label: 'Food', icon: UtensilsIcon},
      {path: '/activity', label: 'Activity', icon: ActivityIcon},
      {path: '/profile', label: 'Profile', icon: UserIcon},
    ]

    const {theme, toggleTheme} = useTheme()
  
  return (
    <nav className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <PersonStandingIcon className="size-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">FitTrack</h1>
      </div>

      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`
            }
          >
            <item.icon className="size-5 shrink-0" />
            <span className="text-base">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "light" ? <MoonIcon className="size-5 shrink-0" /> : <SunIcon className="size-5 shrink-0" />}
          <span className="text-base font-medium">{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
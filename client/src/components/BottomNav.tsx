import { Home, Utensils, Activity, User } from "lucide-react"
import { NavLink } from "react-router-dom"


const BottomNav = () => {

  const navItems = [
    {path: '/', label: 'Home', icon: Home},
    {path: '/food', label: 'Food', icon: Utensils},
    {path: '/activity', label: 'Activity', icon: Activity},
    {path: '/profile', label: 'Profile', icon: User},
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-700/80 px-4 pb-safe lg:hidden transition-colors duration-200">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800"
              }`
            }
          >
            <item.icon className="size-5 shrink-0" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
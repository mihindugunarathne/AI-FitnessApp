import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BottomNav from "../components/BottomNav"



const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-behavior-contain">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
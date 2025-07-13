"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Search, Bell, Mail, Bookmark, User, MoreHorizontal, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import NotificationDropdown from "../Notifications/NotificationDropdown"
import { useState } from "react"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  const menuItems = [
    { icon: Home, label: "Inicio", path: "/home" },
    { icon: Search, label: "Explorar", path: "/explore" },
    { icon: Bookmark, label: "Guardados", path: "/bookmarks" },
    { icon: User, label: "Perfil", path: "/profile" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link
          to="/home"
          className="text-2xl font-bold hover:bg-gray-900 p-2 rounded-full transition-colors inline-block"
        >
          𝕏
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition-colors ${isActive ? "font-bold" : ""
                }`}
            >
              <Icon size={24} />
              <span className="text-xl">{item.label}</span>
            </Link>
          )
        })}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`flex items-center space-x-4 p-3 rounded-full hover:bg-gray-900 transition-colors w-full text-left ${location.pathname === "/notifications" ? "font-bold" : ""
              }`}
          >
            <Bell size={24} />
            <span className="text-xl">Notificaciones</span>
          </button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
      </nav>

      {/* Tweet Button */}
      <button className="w-full bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-6 rounded-full mt-6 transition-colors shadow-lg hover:shadow-xl">
        Postear
      </button>

      {/* User Profile */}
      <div 
      onClick={() => navigate(`/profile/${user?.username}`)}
      className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between p-3 hover:bg-gray-900 rounded-full cursor-pointer transition-colors">
          <div className="flex items-center space-x-3">
            <img
              src={user?.foto ? `https://x-server-9jgv.onrender.com${user.foto}` : "/placeholder.svg?height=40&width=40"}
              alt={user?.nombre}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">{user?.nombre}</p>
              <p className="text-gray-500 text-sm">@{user?.username}</p>
            </div>
          </div>
          <div className="relative">
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 hover:bg-gray-900 rounded-full w-full mt-2 text-red-500 transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, X, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { notificationsAPI } from "../../utils/api"

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationsAPI.getNotifications()
      const notifs = response.data || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter((n) => !n.read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notif) => (notif.notificationId === notificationId ? { ...notif, read: true } : notif)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifications.map((n) => notificationsAPI.markAsRead(n.notificationId)))
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification.notificationId)
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "like":
      case "comment":
      case "repost":
        if (notification.postId) {
          navigate(`/tweet/${notification.postId}`)
          onClose()
        }
        break
      case "follow":
        if (notification.actorId?.username) {
          navigate(`/profile/${notification.actorId.username}`)
          onClose()
        }
        break
      default:
        break
    }
  }

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, className: "flex-shrink-0" }

    switch (type) {
      case "like":
        return (
          <div className="bg-red-500/10 p-2 rounded-full">
            <Heart {...iconProps} className="text-red-500" fill="currentColor" />
          </div>
        )
      case "comment":
        return (
          <div className="bg-blue-500/10 p-2 rounded-full">
            <MessageCircle {...iconProps} className="text-blue-500" />
          </div>
        )
      case "repost":
        return (
          <div className="bg-green-500/10 p-2 rounded-full">
            <Repeat2 {...iconProps} className="text-green-500" />
          </div>
        )
      case "follow":
        return (
          <div className="bg-purple-500/10 p-2 rounded-full">
            <UserPlus {...iconProps} className="text-purple-500" />
          </div>
        )
      default:
        return (
          <div className="bg-gray-500/10 p-2 rounded-full">
            <Bell {...iconProps} className="text-gray-500" />
          </div>
        )
    }
  }

  const getNotificationText = (notification) => {
    const actorName = notification.actorId?.nombre || "Alguien"
    switch (notification.type) {
      case "like":
        return `le gustó tu tweet`
      case "comment":
        return `respondió a tu tweet`
      case "repost":
        return `retuiteó tu tweet`
      case "follow":
        return `comenzó a seguirte`
      default:
        return "nueva notificación"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="absolute top-16 left-4 w-96 bg-black border border-gray-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/95 backdrop-blur-xl sticky top-0">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-bold">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="bg-twitter-blue text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-twitter-blue hover:text-twitter-dark-blue text-sm font-medium"
              >
                <Check size={16} className="inline mr-1" />
                Marcar todas
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue mx-auto"></div>
              <p className="mt-3 text-gray-500 text-sm">Cargando notificaciones...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-900 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Bell size={24} className="text-gray-600" />
              </div>
              <h4 className="font-bold mb-2">No hay notificaciones</h4>
              <p className="text-gray-500 text-sm">Cuando tengas notificaciones, aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-900/50 cursor-pointer transition-all duration-200 ${
                    !notification.read ? "bg-gray-950/50 border-l-2 border-l-twitter-blue" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <img
                          src={
                            notification.actorId?.foto
                              ? `https://x-server-9jgv.onrender.com${notification.actorId.foto}`
                              : "/placeholder.svg?height=32&width=32"
                          }
                          alt={notification.actorId?.nombre}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm">
                            <span className="font-bold">{notification.actorId?.nombre}</span>{" "}
                            <span className="text-gray-300">{getNotificationText(notification)}</span>
                          </p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-twitter-blue rounded-full flex-shrink-0" />}
                      </div>

                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.date), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-800 bg-black/95">
            <button
              onClick={() => {
                navigate("/notifications")
                onClose()
              }}
              className="text-twitter-blue hover:underline text-sm w-full text-center font-medium"
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown

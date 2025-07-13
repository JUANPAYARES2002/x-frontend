"use client"

import { useState, useEffect } from "react"
import { X, UserPlus, UserCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { followAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"

const FollowersModal = ({ isOpen, onClose, userId, type = "followers" }) => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [followingStatus, setFollowingStatus] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen, type])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let response
      if (type === "followers") {
        response = await followAPI.getFollowers()
      } else {
        response = await followAPI.getFollowing()
      }

      const userData = response.data || []
      setUsers(userData)

      // Get current user's following status for each user
      const followingResponse = await followAPI.getFollowing()
      const currentFollowing = followingResponse.data || []

      const statusMap = {}
      userData.forEach((item) => {
        const targetUser = type === "followers" ? item.followerId : item.followingId
        if (targetUser && targetUser._id !== currentUser._id) {
          statusMap[targetUser._id] = currentFollowing.some((follow) => follow.followingId._id === targetUser._id)
        }
      })
      setFollowingStatus(statusMap)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId) => {
    try {
      await followAPI.toggleFollow(targetUserId)
      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }))
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-black border border-gray-800 rounded-2xl w-full max-w-md mx-4 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold capitalize">{type}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-twitter-blue mx-auto"></div>
              <p className="mt-2 text-gray-500 text-sm">Loading {type}...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <UserPlus size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500">No {type} yet</p>
            </div>
          ) : (
            users.map((item) => {
              const user = type === "followers" ? item.followerId : item.followingId
              if (!user) return null

              const isCurrentUser = user._id === currentUser._id
              const isFollowing = followingStatus[user._id]

              return (
                <div key={user._id} className="p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => handleUserClick(user.username)}
                    >
                      <img
                        src={user.foto ? `http://localhost:5000${user.foto}` : "/placeholder.svg?height=40&width=40"}
                        alt={user.nombre}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{user.nombre}</p>
                        <p className="text-gray-500 text-sm truncate">@{user.username}</p>
                      </div>
                    </div>

                    {!isCurrentUser && (
                      <button
                        onClick={() => handleFollow(user._id)}
                        className={`px-4 py-1 rounded-full font-bold text-sm transition-colors ${
                          isFollowing
                            ? "border border-gray-600 text-white hover:bg-red-600 hover:border-red-600"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck size={16} className="inline mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} className="inline mr-1" />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowersModal

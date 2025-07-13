"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, LinkIcon, MoreHorizontal, Camera, Repeat2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import Tweet from "../../components/Tweet/Tweet"
import { useAuth } from "../../context/AuthContext"
import { postsAPI, followAPI, likesAPI, commentsAPI, repostsAPI } from "../../utils/api"
import FollowersModal from "./FollowersModal"

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [userTweets, setUserTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedTweets, setLikedTweets] = useState([])
  const [userComments, setUserComments] = useState([])
  const [userReposts, setUserReposts] = useState([])
  const [activeTab, setActiveTab] = useState("tweets")
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    nombre: user?.nombre || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    foto: null,
  })

  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [modalType, setModalType] = useState("followers")

  const tabs = [
    { id: "tweets", label: "Tweets", count: userTweets.length },
    { id: "replies", label: "Reposts", count: userReposts.length },
    { id: "media", label: "Media", count: userTweets.filter((tweet) => tweet.foto).length },
    { id: "likes", label: "Likes", count: likedTweets.length },
  ]

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user tweets
      const tweetsResponse = await postsAPI.getPostsByUser(user._id)
      setUserTweets(tweetsResponse.data)

      // Fetch followers and following
      const followersResponse = await followAPI.getFollowers()
      const followingResponse = await followAPI.getFollowing()
      setFollowers(followersResponse.data)
      setFollowing(followingResponse.data)

      // Fetch liked posts
      const likedResponse = await likesAPI.getLikedPosts()
      setLikedTweets(likedResponse.data)

      // Fetch user reposts
      const repostsResponse = await repostsAPI.getUserReposts()
      setUserReposts(repostsResponse.data)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
    setEditForm({
      nombre: user?.nombre || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
      foto: null,
    })
  }

  const handleSaveProfile = async () => {
    const result = await updateProfile(editForm)
    if (result.success) {
      setIsEditingProfile(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditForm({ ...editForm, foto: file })
    }
  }

  const getFilteredTweets = () => {
    switch (activeTab) {
      case "tweets":
        return userTweets
      case "media":
        return userTweets.filter((tweet) => tweet.foto)
      case "replies":
        return userReposts
      case "likes":
        return likedTweets
      default:
        return userTweets
    }
  }

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
  }

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    })
  }

  const renderContent = () => {
    const filteredContent = getFilteredTweets()

    if (loading) {
      return (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitter-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando contenido...</p>
        </div>
      )
    }

    if (filteredContent.length === 0) {
      const emptyMessages = {
        tweets: {
          title: "No has tuiteado todavía",
          subtitle: "Cuando publiques un Tweet, aparecerá aquí.",
          icon: "📝",
        },
        replies: {
          title: "No has retuiteado todavía",
          subtitle: "Cuando retuitees algo, aparecerá aquí.",
          icon: "🔄",
        },
        media: {
          title: "No has compartido fotos o videos",
          subtitle: "Cuando compartas multimedia, aparecerá aquí.",
          icon: "📷",
        },
        likes: {
          title: "No has dado Me gusta a ningún Tweet",
          subtitle: "Cuando des Me gusta a un Tweet, aparecerá aquí.",
          icon: "❤️",
        },
      }

      const message = emptyMessages[activeTab]

      return (
        <div className="p-12 text-center">
          <div className="bg-gray-900 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <div className="text-4xl">{message.icon}</div>
          </div>
          <h3 className="text-2xl font-bold mb-3">{message.title}</h3>
          <p className="text-gray-500 text-lg max-w-sm mx-auto">{message.subtitle}</p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-gray-800">
        {filteredContent.map((item) => {
          if (activeTab === "replies") {
            // Para reposts, mostramos el tweet original con indicador de repost
            return (
              <div key={item._id} className="border-b border-gray-800">
                {/* Indicador de repost */}
                <div className="px-4 pt-3 pb-1">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Repeat2 size={14} className="mr-2 text-green-500" />
                    <span>Retuiteaste</span>
                    <span className="ml-2 text-gray-400">·</span>
                    <span className="ml-2">{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Tweet original */}
                {item.postId && <Tweet tweet={item.postId} onUpdate={fetchUserData} isRepost={true} />}
              </div>
            )
          }

          // Para tweets normales y likes
          return <Tweet key={item._id} tweet={item} onUpdate={fetchUserData} />
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 mr-80">
          <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
            {/* Enhanced Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-gray-800 p-4 z-10">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h1 className="text-xl font-bold">{user?.nombre}</h1>
                  <div className="flex items-center space-x-4 text-gray-500 text-sm">
                    <span>{userTweets.length} Tweets</span>
                    <span>·</span>
                    <span>Se unió en {formatJoinDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Profile Header */}
            <div className="relative">
              {/* Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-twitter-blue to-purple-600 relative">
                {isEditingProfile && (
                  <button className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                    <Camera size={24} className="text-white" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start -mt-16 mb-4">
                  <div className="relative">
                    <img
                      src={user?.foto ? `https://x-server-9jgv.onrender.com${user.foto}` : "/placeholder.svg?height=128&width=128"}
                      alt={user?.nombre}
                      className="w-32 h-32 rounded-full border-4 border-black shadow-xl"
                    />
                    {isEditingProfile && (
                      <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                        <Camera size={24} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button className="p-2 border border-gray-600 rounded-full hover:bg-gray-900 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                    {isEditingProfile ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-900 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-900 font-bold transition-colors"
                      >
                        Editar perfil
                      </button>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 text-xl font-bold focus:border-twitter-blue focus:outline-none"
                        placeholder="Nombre"
                      />
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 resize-none focus:border-twitter-blue focus:outline-none"
                        placeholder="Biografía"
                        rows="3"
                        maxLength="160"
                      />
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 focus:border-twitter-blue focus:outline-none"
                        placeholder="Ubicación"
                      />
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        className="w-full bg-transparent border border-gray-600 rounded-lg px-4 py-3 focus:border-twitter-blue focus:outline-none"
                        placeholder="Sitio web"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-2xl font-bold">{user?.nombre}</h2>
                        <p className="text-gray-500 text-lg">@{user?.username}</p>
                      </div>

                      {user?.bio && <p className="text-white text-lg leading-relaxed">{user.bio}</p>}

                      <div className="flex flex-wrap items-center gap-4 text-gray-500">
                        {user?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin size={16} />
                            <span>{user.location}</span>
                          </div>
                        )}
                        {user?.website && (
                          <div className="flex items-center space-x-1">
                            <LinkIcon size={16} />
                            <a href={user.website} className="text-twitter-blue hover:underline">
                              {user.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar size={16} />
                          <span>Se unió en {formatJoinDate(user?.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex space-x-6">
                        <button
                          className="hover:underline transition-colors"
                          onClick={() => {
                            setModalType("following")
                            setShowFollowersModal(true)
                          }}
                        >
                          <span className="font-bold text-white text-lg">{following.length}</span>
                          <span className="text-gray-500 ml-1">Siguiendo</span>
                        </button>
                        <button
                          className="hover:underline transition-colors"
                          onClick={() => {
                            setModalType("followers")
                            setShowFollowersModal(true)
                          }}
                        >
                          <span className="font-bold text-white text-lg">{followers.length}</span>
                          <span className="text-gray-500 ml-1">Seguidores</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-800 bg-black/80 backdrop-blur-xl sticky top-[73px] z-10">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-center font-medium transition-all relative group ${
                      activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span>{tab.label}</span>
                      {tab.count > 0 && <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">{tab.count}</span>}
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-twitter-blue rounded-full" />
                    )}
                    <div className="absolute inset-0 bg-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>

        <RightSidebar />
      </div>

      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={user._id}
        type={modalType}
      />
    </div>
  )
}

export default Profile

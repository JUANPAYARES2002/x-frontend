"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Calendar, MapPin, LinkIcon, MoreHorizontal, ArrowLeft } from "lucide-react"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import Tweet from "../../components/Tweet/Tweet"
import { useAuth } from "../../context/AuthContext"
import { postsAPI, followAPI, authAPI } from "../../utils/api"

const UserProfile = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAuth()
    const [profileUser, setProfileUser] = useState(null)
    const [userTweets, setUserTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("tweets")
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    const tabs = [
        { id: "tweets", label: "Tweets" },
        { id: "replies", label: "Replies" },
        { id: "media", label: "Media" },
        { id: "likes", label: "Likes" },
    ]

    useEffect(() => {
        if (username) {
            fetchUserProfile()
        }
    }, [username])

    const fetchUserProfile = async () => {
        try {
            // Obtener el usuario directamente por su username
            const userResponse = await authAPI.getUserByUsername(username)
            const targetUser = userResponse.data

            if (!targetUser || !targetUser._id) {
                console.error("Usuario no encontrado o sin _id:", targetUser)
                navigate("/home")
                return
            }

            setProfileUser(targetUser)

            // Obtener todos los posts y filtrar los del usuario
            const tweetsResponse = await postsAPI.getAllPosts()
            const allTweets = tweetsResponse.data || []

            const userTweets = allTweets.filter(
                (tweet) => tweet.userId && tweet.userId._id === targetUser._id
            )

            setUserTweets(userTweets)

            // Obtener followers y following
            const followersResponse = await followAPI.getFollowers()
            const followingResponse = await followAPI.getFollowing()

            setFollowers(followersResponse.data)
            setFollowing(followingResponse.data)

            // Verificar si el usuario actual ya lo sigue
            const isCurrentlyFollowing = followingResponse.data.some(
                (follow) => follow.followingId && follow.followingId._id === targetUser._id
            )

            setIsFollowing(isCurrentlyFollowing)
        } catch (error) {
            console.error("Error fetching user profile:", error)
            navigate("/home")
        } finally {
            setLoading(false)
        }
    }

    const handleFollow = async () => {
        if (!profileUser) return

        setFollowLoading(true)
        try {
            await followAPI.toggleFollow(profileUser._id)
            setIsFollowing(!isFollowing)

            if (isFollowing) {
                setFollowers((prev) => prev.filter((f) => f.followerId._id !== currentUser._id))
            } else {
                setFollowers((prev) => [...prev, { followerId: currentUser, followingId: profileUser }])
            }
        } catch (error) {
            console.error("Error toggling follow:", error)
        } finally {
            setFollowLoading(false)
        }
    }

    const getFilteredTweets = () => {
        switch (activeTab) {
            case "tweets":
                return userTweets
            case "media":
                return userTweets.filter((tweet) => tweet.foto)
            case "replies":
                return []
            case "likes":
                return []
            default:
                return userTweets
        }
    }

    const formatJoinDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitter-blue"></div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">User not found</h2>
                    <button onClick={() => navigate("/home")} className="text-twitter-blue hover:underline">
                        Go back to Home
                    </button>
                </div>
            </div>
        )
    }

    const isOwnProfile = currentUser?._id === profileUser._id

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="flex">
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 ml-64 mr-80">
                    <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
                        {/* Header */}
                        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-md border-b border-gray-800 p-4">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-900 rounded-full">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold">{profileUser.nombre}</h1>
                                    <span className="text-gray-500 text-sm">{userTweets.length} Tweets</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Header */}
                        <div className="relative">
                            {/* Cover Photo */}
                            <div className="h-48 bg-gray-800" />

                            {/* Profile Info */}
                            <div className="px-4 pb-4">
                                <div className="flex justify-between items-start -mt-16 mb-4">
                                    <img
                                        src={
                                            profileUser.foto
                                                ? `https://x-server-9jgv.onrender.com${profileUser.foto}`
                                                : "/placeholder.svg?height=128&width=128"
                                        }
                                        alt={profileUser.nombre}
                                        className="w-32 h-32 rounded-full border-4 border-black"
                                    />

                                    <div className="flex space-x-2">
                                        <button className="p-2 border border-gray-600 rounded-full hover:bg-gray-900">
                                            <MoreHorizontal size={20} />
                                        </button>
                                        {!isOwnProfile && (
                                            <button
                                                onClick={handleFollow}
                                                disabled={followLoading}
                                                className={`px-4 py-2 rounded-full font-bold transition-colors ${isFollowing
                                                    ? "border border-gray-600 text-white hover:bg-red-600 hover:border-red-600 hover:text-white"
                                                    : "bg-white text-black hover:bg-gray-200"
                                                    }`}
                                            >
                                                {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="space-y-3">
                                    <div>
                                        <h2 className="text-xl font-bold">{profileUser.nombre}</h2>
                                        <p className="text-gray-500">@{profileUser.username}</p>
                                    </div>

                                    {profileUser.bio && <p className="text-white">{profileUser.bio}</p>}

                                    <div className="flex flex-wrap items-center space-x-4 text-gray-500 text-sm">
                                        {profileUser.location && (
                                            <div className="flex items-center space-x-1">
                                                <MapPin size={16} />
                                                <span>{profileUser.location}</span>
                                            </div>
                                        )}
                                        {profileUser.website && (
                                            <div className="flex items-center space-x-1">
                                                <LinkIcon size={16} />
                                                <a href={profileUser.website} className="text-twitter-blue hover:underline">
                                                    {profileUser.website}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1">
                                            <Calendar size={16} />
                                            <span>Se unió {formatJoinDate(profileUser.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-4 text-sm">
                                        <button className="hover:underline">
                                            <span className="font-bold text-white">{following.length}</span>
                                            <span className="text-gray-500 ml-1">Siguiendo</span>
                                        </button>
                                        <button className="hover:underline">
                                            <span className="font-bold text-white">{followers.length}</span>
                                            <span className="text-gray-500 ml-1">Seguidores</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-800">
                            <div className="flex">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-4 text-center font-medium transition-colors relative ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                                            }`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-twitter-blue rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            {getFilteredTweets().length === 0 ? (
                                <div className="p-8 text-center">
                                    <h3 className="text-2xl font-bold mb-2">No Tweets yet</h3>
                                    <p className="text-gray-500">
                                        {isOwnProfile
                                            ? "When you post a Tweet, it'll show up here."
                                            : `@${profileUser.username} hasn't tweeted yet.`}
                                    </p>
                                </div>
                            ) : (
                                getFilteredTweets().map((tweet) => <Tweet key={tweet._id} tweet={tweet} onUpdate={fetchUserProfile} />)
                            )}
                        </div>
                    </div>
                </div>

                <RightSidebar />
            </div>
        </div>
    )
}

export default UserProfile

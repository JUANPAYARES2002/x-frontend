"use client"

import { useState, useEffect } from "react"
import { Sparkles, Users } from "lucide-react"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import TweetComposer from "../../components/Tweet/TweetComposer"
import Tweet from "../../components/Tweet/Tweet"
import { postsAPI, followAPI } from "../../utils/api"
import { Menu, Search } from "lucide-react"

const Home = () => {
  const [tweets, setTweets] = useState([])
  const [followingTweets, setFollowingTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("foryou")
  const [followingCount, setFollowingCount] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showRightSidebar, setShowRightSidebar] = useState(false)

  const tabs = [
    {
      id: "foryou",
      label: "Para ti",
      icon: Sparkles,
      description: "Tweets recomendados para ti",
    },
    {
      id: "following",
      label: "Siguiendo",
      icon: Users,
      description: "Tweets de personas que sigues",
    },
  ]

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (activeTab === "following" && followingTweets.length === 0) {
      fetchFollowingTweets()
    }
  }, [activeTab])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Fetch all tweets for "Para ti"
      const [tweetsResponse, followingResponse] = await Promise.all([postsAPI.getAllPosts(), followAPI.getFollowing()])

      setTweets(tweetsResponse.data)
      setFollowingCount(followingResponse.data.length)
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowingTweets = async () => {
    try {
      const response = await postsAPI.getFollowingPosts()
      setFollowingTweets(response.data)
    } catch (error) {
      console.error("Error fetching following tweets:", error)
    }
  }

  const handleTweetCreated = () => {
    // Refresh both feeds
    fetchInitialData()
    if (followingTweets.length > 0) {
      fetchFollowingTweets()
    }
  }

  const getCurrentTweets = () => {
    return activeTab === "foryou" ? tweets : followingTweets
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const renderEmptyState = () => {
    if (activeTab === "following") {
      return (
        <div className="p-12 text-center">
          <div className="bg-gray-900 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Users size={48} className="text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3">¡Bienvenido a tu cronología!</h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto mb-6">
            {followingCount === 0
              ? "Sigue a algunas cuentas para ver sus Tweets aquí."
              : "Los Tweets de las personas que sigues aparecerán aquí."}
          </p>
          {followingCount === 0 && (
            <button
              onClick={() => (window.location.href = "/explore")}
              className="bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Buscar personas
            </button>
          )}
        </div>
      )
    }

    return (
      <div className="p-12 text-center">
        <div className="bg-gray-900 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <Sparkles size={48} className="text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold mb-3">¡Bienvenido a X!</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Aún no hay tweets. ¡Sé el primero en compartir algo increíble!
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar visible solo en md+ */}
        <div className="hidden md:block md:w-64">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 md:mr-80">
          <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
            {/* Enhanced Header with Tabs */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-gray-800 z-10">
              <div className="flex">
                <div className="flex justify-between items-center px-4 py-2 md:hidden">
                  <div>
                    <button onClick={() => setShowSidebar(true)}><Menu size={24} /></button>
                  </div>
                  <div className="ml-auto">
                    <button onClick={() => setShowRightSidebar(true)}><Search size={24} /></button>
                  </div>
                </div>
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 py-4 px-6 text-center font-medium transition-all relative group ${activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Icon size={20} />
                        <span className="text-lg">{tab.label}</span>
                      </div>

                      {/* Active indicator */}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-twitter-blue rounded-full" />
                      )}

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )
                })}
              </div>

              {/* Tab description */}
              <div className="px-4 py-2 border-t border-gray-800/50">
                <p className="text-gray-500 text-sm">{tabs.find((tab) => tab.id === activeTab)?.description}</p>
              </div>
            </div>

            {/* Tweet Composer - Solo mostrar en "Para ti" */}
            {activeTab === "foryou" && <TweetComposer onTweetCreated={handleTweetCreated} />}

            {/* Timeline */}
            <div>
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitter-blue mx-auto"></div>
                  <p className="mt-4 text-gray-500 text-lg">
                    {activeTab === "foryou" ? "Cargando tweets..." : "Cargando tu cronología..."}
                  </p>
                </div>
              ) : getCurrentTweets().length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="divide-y divide-gray-800">
                  {getCurrentTweets().map((tweet) => (
                    <Tweet key={tweet._id} tweet={tweet} onUpdate={handleTweetCreated} />
                  ))}
                </div>
              )}
            </div>

            {/* Load more indicator */}
            {getCurrentTweets().length > 0 && (
              <div className="p-8 text-center border-t border-gray-800">
                <p className="text-gray-500">
                  {activeTab === "foryou"
                    ? `${tweets.length} tweets cargados`
                    : `${followingTweets.length} tweets de personas que sigues`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RightSidebar visible solo en md+ */}
        <div className="hidden md:block md:w-80">
          <RightSidebar />
        </div>
      </div>
      {/* Mobile Sidebar (left) */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex">
          <div className="w-64 bg-black border-r border-gray-800 p-4 overflow-y-auto">
            <button onClick={() => setShowSidebar(false)} className="text-white mb-4">✖ Cerrar</button>
            <Sidebar />
          </div>
          <div className="flex-1" onClick={() => setShowSidebar(false)}></div>
        </div>
      )}

      {/* Mobile RightSidebar (right) */}
      {showRightSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-end">
          <div className="w-80 bg-black border-l border-gray-800 p-4 overflow-y-auto">
            <button onClick={() => setShowRightSidebar(false)} className="text-white mb-4">✖ Cerrar</button>
            <RightSidebar />
          </div>
          <div className="flex-1" onClick={() => setShowRightSidebar(false)}></div>
        </div>
      )}
    </div>
  )
}

export default Home

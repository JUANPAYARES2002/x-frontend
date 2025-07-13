"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import Tweet from "../../components/Tweet/Tweet"
import { postsAPI } from "../../utils/api"

const Explore = () => {
  const [tweets, setTweets] = useState([])
  const [filteredTweets, setFilteredTweets] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("all")

  const filters = [
    { id: "all", label: "All" },
    { id: "trending", label: "Trending" },
    { id: "latest", label: "Latest" },
    { id: "people", label: "People" },
    { id: "media", label: "Media" },
  ]

  useEffect(() => {
    fetchTweets()
  }, [])

  useEffect(() => {
    filterTweets()
  }, [searchQuery, tweets, activeFilter])

  const fetchTweets = async () => {
    try {
      const response = await postsAPI.getAllPosts()
      setTweets(response.data)
    } catch (error) {
      console.error("Error fetching tweets:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterTweets = () => {
    let filtered = tweets

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((tweet) => {
        const description = tweet.description?.toLowerCase() || ""
        const username = tweet.userId?.username?.toLowerCase() || ""
        const name = tweet.userId?.nombre?.toLowerCase() || ""
        const query = searchQuery.toLowerCase()

        return description.includes(query) || username.includes(query) || name.includes(query)
      })
    }

    // Apply additional filters
    switch (activeFilter) {
      case "trending":
        filtered = filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        break
      case "latest":
        filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
        break
      case "people":
        // Could filter by verified users or popular users
        break
      case "media":
        filtered = filtered.filter((tweet) => tweet.foto)
        break
      default:
        break
    }

    setFilteredTweets(filtered)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 mr-80">
          <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-md border-b border-gray-800 p-4">
              <h1 className="text-xl font-bold mb-4">Explore</h1>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search Twitter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      activeFilter === filter.id
                        ? "bg-twitter-blue text-white"
                        : "text-gray-500 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading tweets...</p>
                </div>
              ) : filteredTweets.length === 0 ? (
                <div className="p-8 text-center">
                  <Search size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No results found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? `No tweets found for "${searchQuery}"` : "No tweets match your current filter"}
                  </p>
                </div>
              ) : (
                <>
                  {searchQuery && (
                    <div className="p-4 border-b border-gray-800">
                      <p className="text-gray-500">
                        {filteredTweets.length} results for "{searchQuery}"
                      </p>
                    </div>
                  )}
                  {filteredTweets.map((tweet) => (
                    <Tweet key={tweet._id} tweet={tweet} onUpdate={fetchTweets} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <RightSidebar />
      </div>
    </div>
  )
}

export default Explore

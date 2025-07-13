"use client"

import { useState, useEffect } from "react"
import { Bookmark, Trash2 } from "lucide-react"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import Tweet from "../../components/Tweet/Tweet"
import { bookmarksAPI } from "../../utils/api"

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const response = await bookmarksAPI.getBookmarks()
      setBookmarks(response.data)
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllBookmarks = async () => {
    if (window.confirm("Are you sure you want to clear all bookmarks?")) {
      try {
        for (const bookmark of bookmarks) {
          await bookmarksAPI.toggleBookmark(bookmark.postId._id)
        }
        setBookmarks([])
      } catch (error) {
        console.error("Error clearing bookmarks:", error)
      }
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Bookmarks</h1>
                  <p className="text-gray-500 text-sm">@username</p>
                </div>
                {bookmarks.length > 0 && (
                  <button
                    onClick={clearAllBookmarks}
                    className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span className="text-sm">Clear all</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-blue mx-auto"></div>
                  <p className="mt-4 text-gray-500">Cargando marcadores...</p>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="p-8 text-center">
                  <Bookmark size={64} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Guardar tweets para más tarde</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    ¡No dejes que se escapen los buenos! Guarda tus tuits para encontrarlos fácilmente en el futuro.
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-800">
                    <p className="text-gray-500 text-sm">{bookmarks.length} Tweets marcados como favoritos</p>
                  </div>
                  {bookmarks.map((bookmark) => (
                    <Tweet key={bookmark._id} tweet={bookmark.postId} onUpdate={fetchBookmarks} />
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

export default Bookmarks

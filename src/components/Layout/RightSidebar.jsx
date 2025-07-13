"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { postsAPI } from "../../utils/api"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

const RightSidebar = () => {
  const [posts, setPosts] = useState([])
  const [topComments, setTopComments] = useState([])
  const [topLikes, setTopLikes] = useState([])
  const [topReposts, setTopReposts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (!loading) buildTrends()
  }, [posts, searchTerm])

  const fetchPosts = async () => {
    try {
      const { data } = await postsAPI.getAllPosts()
      setPosts(data)
    } catch (err) {
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const buildTrends = () => {
    // Filtrar por descripción según searchTerm
    const filtered = posts.filter(post =>
      post.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Top 5 por comentarios
    setTopComments(
      [...filtered]
        .sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0))
        .slice(0, 5)
    )

    // Top 5 por likes
    setTopLikes(
      [...filtered]
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        .slice(0, 5)
    )

    // Top 5 por reposts
    setTopReposts(
      [...filtered]
        .sort((a, b) => (b.repost?.length || 0) - (a.repost?.length || 0))
        .slice(0, 5)
    )
  }

  const renderList = (items, metric) =>
    items.map((post, idx) => (
      <li key={idx} 
      onClick={() => navigate(`/tweet/${post._id}`)}
      className="hover:bg-gray-800 p-2 rounded cursor-pointer">
        <p className="text-gray-500 text-sm">
          {metric === "comments"
            ? `${post.comments?.length || 0} comentarios`
            : metric === "likes"
              ? `${post.likes?.length || 0} me gusta`
              : `${post.repost?.length || 0} reposts`}
        </p>
        <p className="font-bold truncate">
          {post.description.slice(0, 50)}{post.description.length > 50 ? "…" : ""}
        </p>
        <p className="text-gray-500 text-xs">
          {formatDistanceToNow(new Date(post.date), { addSuffix: true, locale: es })}
        </p>
      </li>
    ))

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-black p-4 flex flex-col">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Buscar en descripciones"
          className="w-full bg-gray-900 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {loading ? (
          <p className="text-gray-500 text-center">Cargando tendencias...</p>
        ) : (
          <>
            <div className="bg-black rounded-2xl p-4 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">Lo más comentado</h2>
              <ul className="space-y-3">
                {renderList(topComments, "comments")}
              </ul>
            </div>

            <div className="bg-black rounded-2xl p-4 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">Lo más gustado</h2>
              <ul className="space-y-3">
                {renderList(topLikes, "likes")}
              </ul>
            </div>

            <div className="bg-black rounded-2xl p-4 border border-gray-600">
              <h2 className="text-xl font-bold mb-4">Lo más reposteado</h2>
              <ul className="space-y-3">
                {renderList(topReposts, "reposts")}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RightSidebar

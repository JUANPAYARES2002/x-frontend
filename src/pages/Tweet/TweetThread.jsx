"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MessageCircle, ImageIcon, X, Smile, Calendar, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Sidebar from "../../components/Layout/Sidebar"
import RightSidebar from "../../components/Layout/RightSidebar"
import Tweet from "../../components/Tweet/Tweet"
import { postsAPI, commentsAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"

const TweetThread = () => {
  const { tweetId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tweet, setTweet] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentImage, setCommentImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (tweetId) fetchTweetAndComments()
  }, [tweetId])

  const fetchTweetAndComments = async () => {
    setLoading(true)
    try {
      const response = await postsAPI.getPost(tweetId)
      setTweet(response.data)

      if (response.data.comments && response.data.comments.length > 0) {
        setComments(response.data.comments)
      } else {
        setComments([])
      }
    } catch (error) {
      console.error("Error fetching tweet:", error)
      navigate("/home")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCommentImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setCommentImage(null)
    setImagePreview(null)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() && !commentImage) return

    setCommentLoading(true)
    try {
      const formData = new FormData()
      formData.append("postId", tweet._id)
      formData.append("description", commentText)

      if (commentImage) {
        formData.append("foto", commentImage)
      }

      await commentsAPI.createComment(formData)
      setCommentText("")
      setCommentImage(null)
      setImagePreview(null)
      await fetchTweetAndComments()
    } catch (error) {
      console.error("Error creating comment:", error)
      alert("Error al crear el comentario. Inténtalo de nuevo.")
    } finally {
      setCommentLoading(false)
    }
  }

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitter-blue"></div>
      </div>
    )
  }

  if (!tweet) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tweet not found</h2>
          <button onClick={() => navigate("/home")} className="text-twitter-blue hover:underline">
            Go back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 mr-80">
          <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-gray-800 p-4 z-10">
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold">Tweet</h1>
                </div>
              </div>
            </div>

            {/* Main Tweet - Enhanced */}
            <div className="border-b border-gray-800">
              <div className="p-4">
                <div className="flex space-x-3 mb-4">
                  <img
                    src={
                      tweet.userId?.foto
                        ? `https://x-server-9jgv.onrender.com${tweet.userId.foto}`
                        : "/placeholder.svg?height=48&width=48"
                    }
                    alt={tweet.userId?.nombre}
                    className="w-12 h-12 rounded-full cursor-pointer hover:brightness-90 transition-all"
                    onClick={() => navigate(`/profile/${tweet.userId?.username}`)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3
                        className="font-bold hover:underline cursor-pointer text-white"
                        onClick={() => navigate(`/profile/${tweet.userId?.username}`)}
                      >
                        {tweet.userId?.nombre}
                      </h3>
                      <span className="text-gray-500">@{tweet.userId?.username}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-white text-xl leading-relaxed whitespace-pre-wrap">{tweet.description}</p>

                  {tweet.foto && (
                    <div className="mt-4">
                      <img
                        src={`https://x-server-9jgv.onrender.com${tweet.foto}`}
                        alt="Tweet image"
                        className="max-w-full h-auto rounded-2xl border border-gray-700"
                      />
                    </div>
                  )}
                </div>

                <div className="text-gray-500 text-sm mb-4 pb-4 border-b border-gray-800">
                  {new Date(tweet.date).toLocaleString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                {/* Enhanced Tweet Actions */}
              </div>
            </div>

            {/* Enhanced Comment Composer */}
            <div className="border-b border-gray-800 p-4 bg-gray-950/30">
              <div className="flex space-x-4">
                <img
                  src={user?.foto ? `https://x-server-9jgv.onrender.com${user.foto}` : "/placeholder.svg?height=48&width=48"}
                  alt={user?.nombre}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <form onSubmit={handleComment} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="¡Únete a la conversación!"
                        className="w-full bg-transparent text-xl placeholder-gray-500 resize-none focus:outline-none min-h-[120px] leading-relaxed"
                        maxLength="280"
                      />

                      {/* Character count indicator */}
                      <div className="absolute bottom-2 right-2">
                        <div className={`text-sm ${280 - commentText.length < 20 ? "text-red-500" : "text-gray-500"}`}>
                          {280 - commentText.length}
                        </div>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full h-auto rounded-2xl max-h-64 object-cover border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-black/80 text-white rounded-full p-2 hover:bg-black transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <div className="flex items-center space-x-1">
                        <label className="cursor-pointer text-twitter-blue hover:bg-twitter-blue/10 p-2 rounded-full transition-colors">
                          <ImageIcon size={20} />
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                        <button
                          type="button"
                          className="text-twitter-blue hover:bg-twitter-blue/10 p-2 rounded-full transition-colors"
                        >
                          <Smile size={20} />
                        </button>
                        <button
                          type="button"
                          className="text-twitter-blue hover:bg-twitter-blue/10 p-2 rounded-full transition-colors"
                        >
                          <Calendar size={20} />
                        </button>
                        <button
                          type="button"
                          className="text-twitter-blue hover:bg-twitter-blue/10 p-2 rounded-full transition-colors"
                        >
                          <MapPin size={20} />
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={(!commentText.trim() && !commentImage) || commentLoading}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${
                          (!commentText.trim() && !commentImage) || commentLoading
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-twitter-blue hover:bg-twitter-dark-blue text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {commentLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Enviando...</span>
                          </div>
                        ) : (
                          "Responder"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Enhanced Comments Section */}
            <div>
              {comments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-900 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <MessageCircle size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">No hay respuestas aún</h3>
                  <p className="text-gray-500 text-lg">Sé el primero en responder a este tweet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {comments.map((comment, index) => (
                    <div
                      key={comment._id}
                      className="p-4 hover:bg-gray-950/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/comment/${comment._id}`)}
                    >
                      <div className="flex space-x-3">
                        {/* Thread line for visual connection */}
                        {index < comments.length - 1 && (
                          <div className="absolute left-8 mt-12 w-0.5 h-16 bg-gray-800"></div>
                        )}

                        <img
                          src={
                            comment.userId?.foto
                              ? `https://x-server-9jgv.onrender.com${comment.userId.foto}`
                              : "/placeholder.svg?height=48&width=48"
                          }
                          alt={comment.userId?.nombre}
                          className="w-12 h-12 rounded-full cursor-pointer hover:brightness-90 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/profile/${comment.userId?.username}`)
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className="font-bold hover:underline cursor-pointer text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/profile/${comment.userId?.username}`)
                              }}
                            >
                              {comment.userId?.nombre}
                            </h3>
                            <span className="text-gray-500">@{comment.userId?.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 text-sm">{formatDate(comment.date)}</span>
                          </div>

                          <p className="text-white leading-relaxed whitespace-pre-wrap mb-3">{comment.description}</p>

                          {comment.foto && (
                            <div className="mb-3">
                              <img
                                src={`https://x-server-9jgv.onrender.com${comment.foto}`}
                                alt="Comment image"
                                className="max-w-full h-auto rounded-2xl border border-gray-700 max-h-64 object-cover group-hover:brightness-95 transition-all"
                              />
                            </div>
                          )}

                          {/* Reply indicator */}
                          <div className="flex items-center text-gray-500 text-sm">
                            <MessageCircle size={14} className="mr-1" />
                            <span>Responder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  )
}

export default TweetThread

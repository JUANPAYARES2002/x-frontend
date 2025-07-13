"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, ImageIcon, X, MessageCircle, Smile, Calendar, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Sidebar from "../Layout/Sidebar"
import RightSidebar from "../Layout/RightSidebar"
import { commentsAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"

export default function CommentThread() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [comment, setComment] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchThread()
  }, [id])

  async function fetchThread() {
    setLoading(true)
    try {
      const { data: parent } = await commentsAPI.getComment(id)
      setComment(parent)

      try {
        const { data: kids } = await commentsAPI.getCommentsByParent(id)
        setReplies(kids || [])
      } catch (error) {
        console.log("No replies found")
        setReplies([])
      }
    } catch (error) {
      console.error("Error fetching comment:", error)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFile(null)
    setImagePreview(null)
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!text.trim() && !file) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("postId", comment.postId)
      formData.append("description", text)
      formData.append("parentCommentId", id)

      if (file) {
        formData.append("foto", file)
      }

      await commentsAPI.createComment(formData)
      setText("")
      setFile(null)
      setImagePreview(null)
      await fetchThread()
    } catch (error) {
      console.error("Error creating reply:", error)
      alert("Error al crear la respuesta. Inténtalo de nuevo.")
    } finally {
      setSubmitting(false)
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

  if (!comment) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Comentario no encontrado</h2>
          <button onClick={() => navigate(-1)} className="text-twitter-blue hover:underline">
            Volver
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
            {/* Enhanced Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-gray-800 p-4 z-10">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/tweet/${comment.postId}`)}
                  className="p-2 hover:bg-gray-900 rounded-full transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold">Hilo de comentario</h1>
                  <p className="text-gray-500 text-sm">Conversación</p>
                </div>
              </div>
            </div>

            {/* Enhanced Parent Comment */}
            <div className="border-b border-gray-800 p-4 bg-gray-950/20">
              <div className="flex space-x-3">
                <img
                  src={
                    comment.userId?.foto
                      ? `https://x-server-9jgv.onrender.com${comment.userId.foto}`
                      : "/placeholder.svg?height=48&width=48"
                  }
                  alt={comment.userId?.nombre}
                  className="w-12 h-12 rounded-full cursor-pointer hover:brightness-90 transition-all"
                  onClick={() => navigate(`/profile/${comment.userId?.username}`)}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3
                      className="font-bold hover:underline cursor-pointer text-white"
                      onClick={() => navigate(`/profile/${comment.userId?.username}`)}
                    >
                      {comment.userId?.nombre}
                    </h3>
                    <span className="text-gray-500">@{comment.userId?.username}</span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.date)}</span>
                  </div>

                  <p className="text-white text-lg leading-relaxed whitespace-pre-wrap mb-4">{comment.description}</p>

                  {comment.foto && (
                    <div className="mb-4">
                      <img
                        src={`https://x-server-9jgv.onrender.com${comment.foto}`}
                        alt="Comment image"
                        className="max-w-full h-auto rounded-2xl border border-gray-700 max-h-64 object-cover"
                      />
                    </div>
                  )}

                  <div className="text-gray-500 text-sm">
                    {new Date(comment.date).toLocaleString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Reply Composer */}
            <div className="border-b border-gray-800 p-4 bg-gray-950/30">
              <div className="flex space-x-4">
                <img
                  src={user?.foto ? `https://x-server-9jgv.onrender.com${user.foto}` : "/placeholder.svg?height=48&width=48"}
                  alt={user?.nombre}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <form onSubmit={handleReply} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Responder a este comentario..."
                        className="w-full bg-transparent text-xl placeholder-gray-500 resize-none focus:outline-none min-h-[120px] leading-relaxed"
                        maxLength="280"
                      />

                      <div className="absolute bottom-2 right-2">
                        <div className={`text-sm ${280 - text.length < 20 ? "text-red-500" : "text-gray-500"}`}>
                          {280 - text.length}
                        </div>
                      </div>
                    </div>

                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="preview"
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
                        disabled={(!text.trim() && !file) || submitting}
                        className={`px-8 py-2 rounded-full font-bold transition-all ${
                          (!text.trim() && !file) || submitting
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-twitter-blue hover:bg-twitter-dark-blue text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {submitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Enviando…</span>
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

            {/* Enhanced Replies */}
            <div>
              {replies.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gray-900 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <MessageCircle size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Sin respuestas aún</h3>
                  <p className="text-gray-500 text-lg">Sé el primero en responder a este comentario</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {replies.map((reply, index) => (
                    <div
                      key={reply._id}
                      className="p-4 hover:bg-gray-950/50 transition-all duration-200 cursor-pointer group"
                      onClick={() => navigate(`/comment/${reply._id}`)}
                    >
                      <div className="flex space-x-3">
                        {index < replies.length - 1 && (
                          <div className="absolute left-8 mt-12 w-0.5 h-16 bg-gray-800"></div>
                        )}

                        <img
                          src={
                            reply.userId?.foto
                              ? `https://x-server-9jgv.onrender.com${reply.userId.foto}`
                              : "/placeholder.svg?height=48&width=48"
                          }
                          alt={reply.userId?.nombre}
                          className="w-12 h-12 rounded-full cursor-pointer hover:brightness-90 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/profile/${reply.userId?.username}`)
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3
                              className="font-bold hover:underline cursor-pointer text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/profile/${reply.userId?.username}`)
                              }}
                            >
                              {reply.userId?.nombre}
                            </h3>
                            <span className="text-gray-500">@{reply.userId?.username}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 text-sm">{formatDate(reply.date)}</span>
                          </div>

                          <p className="text-white leading-relaxed whitespace-pre-wrap mb-3">{reply.description}</p>

                          {reply.foto && (
                            <div className="mb-3">
                              <img
                                src={`https://x-server-9jgv.onrender.com${reply.foto}`}
                                alt="Reply image"
                                className="max-w-full h-auto rounded-2xl border border-gray-700 max-h-64 object-cover group-hover:brightness-95 transition-all"
                              />
                            </div>
                          )}

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

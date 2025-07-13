import { useState, useRef, useEffect } from "react"
import { ImageIcon, Smile, Calendar, MapPin, X } from "lucide-react"
import { postsAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import EmojiPicker from "emoji-picker-react"

const TweetComposer = ({ onTweetCreated }) => {
  const { user } = useAuth()
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false) // Oculta el picker tras seleccionar
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !image) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("description", content)
      if (image) {
        formData.append("foto", image)
      }

      await postsAPI.createPost(formData)
      setContent("")
      setImage(null)
      setImagePreview(null)
      if (onTweetCreated) onTweetCreated()
    } catch (error) {
      console.error("Error creating tweet:", error)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = (!content.trim() && !image) || loading

  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex space-x-4">
        <img
          src={user?.foto ? `https://x-server-9jgv.onrender.com${user.foto}` : "/placeholder.svg?height=48&width=48"}
          alt={user?.nombre}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full bg-transparent text-xl placeholder-gray-500 resize-none focus:outline-none"
              rows="3"
              maxLength="280"
            />

            {imagePreview && (
              <div className="relative mt-3">
                <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-w-full h-auto rounded-2xl" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-75 text-white rounded-full p-1 hover:bg-opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer text-twitter-blue hover:bg-gray-900 p-2 rounded-full">
                  <ImageIcon size={20} />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="text-twitter-blue hover:bg-gray-900 p-2 rounded-full"
                  >
                    <Smile size={20} />
                  </button>

                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute top-10 z-50">
                      <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                  )}
                </div>
                <button type="button" className="text-twitter-blue hover:bg-gray-900 p-2 rounded-full">
                  <Calendar size={20} />
                </button>
                <button type="button" className="text-twitter-blue hover:bg-gray-900 p-2 rounded-full">
                  <MapPin size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{280 - content.length}</span>
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={`px-6 py-2 rounded-full font-bold transition-colors ${isDisabled
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-twitter-blue hover:bg-twitter-dark-blue text-white"
                    }`}
                >
                  {loading ? "Posting..." : "Tweet"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TweetComposer

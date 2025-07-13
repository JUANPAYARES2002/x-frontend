"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { likesAPI, repostsAPI, bookmarksAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Tweet = ({ tweet, onUpdate, isThread = false }) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados persistentes
  const [isLiked, setIsLiked] = useState(false)
  const [isReposted, setIsReposted] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(tweet.likes?.length || 0)
  const [repostsCount, setRepostsCount] = useState(tweet.repost?.length || 0)
  const [commentsCount, setCommentsCount] = useState(tweet.comments?.length || 0)

  // Estados de loading para animaciones
  const [isLiking, setIsLiking] = useState(false)
  const [isReposting, setIsReposting] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  // Verificar estados iniciales al cargar el componente
  useEffect(() => {
    const checkInitialStates = async () => {
      if (!user?._id) return

      try {
        // Verificar like
        const liked = tweet.likes?.some((like) => {
          if (typeof like === "object" && like.userId) {
            return like.userId.toString() === user._id || like.userId._id === user._id
          }
          return like.toString() === user._id
        })
        setIsLiked(liked || false)

        // Verificar repost
        const reposted = tweet.repost?.some((repost) => {
          if (typeof repost === "object" && repost.userId) {
            return repost.userId.toString() === user._id || repost.userId._id === user._id
          }
          return repost.toString() === user._id
        })
        setIsReposted(reposted || false)

        // Verificar bookmark
        const bookmarksResponse = await bookmarksAPI.getBookmarks()
        const bookmarkedPostIds = bookmarksResponse.data.map((bm) => bm.postId._id || bm.postId)
        setIsBookmarked(bookmarkedPostIds.includes(tweet._id))
      } catch (error) {
        console.error("Error checking initial states:", error)
      }
    }

    checkInitialStates()
  }, [tweet._id, tweet.likes, tweet.repost, user?._id])

  const handleLike = async (e) => {
    e.stopPropagation()
    if (isLiking) return

    setIsLiking(true)
    const previousState = isLiked
    const previousCount = likesCount

    // Optimistic update
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      await likesAPI.toggleLike(tweet._id)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error("Error toggling like:", error)
      // Revertir en caso de error
      setIsLiked(previousState)
      setLikesCount(previousCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleRepost = async (e) => {
    e.stopPropagation();
    if (isReposting) return;

    setIsReposting(true);
    const previousState = isReposted;
    const previousCount = repostsCount;

    // Optimistic update
    setIsReposted(!isReposted);
    setRepostsCount((prev) => (isReposted ? prev - 1 : prev + 1));

    try {
      if (isReposted) {
        const userRepost = tweet.repost?.find((repost) => {
          if (typeof repost === "object" && repost.userId) {
            return repost.userId.toString() === user._id || repost.userId._id === user._id;
          }
          return false;
        });

        if (userRepost && userRepost._id) {
          await repostsAPI.deleteRepost(userRepost._id); // ✅ IMPORTANTE: Usa _id de Mongo
        } else {
          console.warn("⚠️ No se encontró el repost del usuario para eliminar.");
        }
      } else {
        await repostsAPI.createRepost(tweet._id);
      }

      if (onUpdate) onUpdate(); // 🔄 Refresca lista si se usa
    } catch (error) {
      console.error("Error toggling repost:", error);
      setIsReposted(previousState);
      setRepostsCount(previousCount);
    } finally {
      setIsReposting(false);
    }
  }

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (isBookmarking) return

    setIsBookmarking(true)
    const previousState = isBookmarked

    // Optimistic update
    setIsBookmarked(!isBookmarked)

    try {
      await bookmarksAPI.toggleBookmark(tweet._id)
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      // Revertir en caso de error
      setIsBookmarked(previousState)
    } finally {
      setIsBookmarking(false)
    }
  }

  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es,
    })
  }

  const handleTweetClick = (e) => {
    if (!isThread && !e.target.closest("button") && !e.target.closest("a")) {
      navigate(`/tweet/${tweet._id}`)
    }
  }

  return (
    <div
      className="border-b border-gray-800 p-4 hover:bg-gray-950/50 transition-all duration-200 cursor-pointer"
      onClick={handleTweetClick}
    >
      <div className="flex space-x-3">
        <img
          src={tweet.userId?.foto ? `https://x-server-9jgv.onrender.com${tweet.userId.foto}` : "/placeholder.svg?height=48&width=48"}
          alt={tweet.userId?.nombre}
          className="w-12 h-12 rounded-full cursor-pointer hover:brightness-90 transition-all"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/profile/${tweet.userId?.username}`)
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3
              className="font-bold hover:underline cursor-pointer text-white truncate"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/profile/${tweet.userId?.username}`)
              }}
            >
              {tweet.userId?.nombre}
            </h3>
            <span className="text-gray-500 truncate">@{tweet.userId?.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm whitespace-nowrap">{formatDate(tweet.date)}</span>
            <div className="ml-auto">
              <button
                className="text-gray-500 hover:text-gray-300 hover:bg-gray-800 p-2 rounded-full transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-white whitespace-pre-wrap leading-relaxed">{tweet.description}</p>

            {tweet.foto && (
              <div className="mt-3">
                <img
                  src={`https://x-server-9jgv.onrender.com${tweet.foto}`}
                  alt="Tweet image"
                  className="max-w-full h-auto rounded-2xl border border-gray-700 hover:brightness-95 transition-all cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between max-w-md -ml-2">
            <button
              className="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue group transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/tweet/${tweet._id}`)
              }}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10 transition-all">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>

            <button
              onClick={handleRepost}
              disabled={isReposting}
              className={`flex items-center space-x-2 group transition-all ${isReposted ? "text-green-500" : "text-gray-500 hover:text-green-500"
                } ${isReposting ? "opacity-70" : ""}`}
            >
              <div
                className={`p-2 rounded-full transition-all ${isReposted ? "bg-green-500/10" : "group-hover:bg-green-500/10"
                  } ${isReposting ? "animate-pulse" : ""}`}
              >
                <Repeat2 size={18} className={isReposting ? "animate-spin" : ""} />
              </div>
              <span className="text-sm font-medium">{repostsCount}</span>
            </button>

            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 group transition-all ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                } ${isLiking ? "opacity-70" : ""}`}
            >
              <div
                className={`p-2 rounded-full transition-all ${isLiked ? "bg-red-500/10" : "group-hover:bg-red-500/10"
                  } ${isLiking ? "animate-pulse" : ""}`}
              >
                <Heart
                  size={18}
                  fill={isLiked ? "currentColor" : "none"}
                  className={`transition-all ${isLiking ? "animate-pulse" : ""} ${isLiked ? "scale-110" : ""}`}
                />
              </div>
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button
              className="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue group transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10 transition-all">
                <Share size={18} />
              </div>
            </button>

            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className={`flex items-center space-x-2 group transition-all ${isBookmarked ? "text-twitter-blue" : "text-gray-500 hover:text-twitter-blue"
                } ${isBookmarking ? "opacity-70" : ""}`}
            >
              <div
                className={`p-2 rounded-full transition-all ${isBookmarked ? "bg-twitter-blue/10" : "group-hover:bg-twitter-blue/10"
                  } ${isBookmarking ? "animate-pulse" : ""}`}
              >
                <Bookmark
                  size={18}
                  fill={isBookmarked ? "currentColor" : "none"}
                  className={`transition-all ${isBookmarking ? "animate-pulse" : ""} ${isBookmarked ? "scale-110" : ""
                    }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tweet

import axios from "axios";

const API_BASE_URL = "https://x-server-9jgv.onrender.com/api";
const api = axios.create({ baseURL: API_BASE_URL });

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post("/users/login", credentials),
  register: (formData) => api.post("/users/register", formData),
  getProfile: () => api.get("/users/profile"),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  updateProfile: (userData) => api.put("/users/update", userData),
}

// Posts API
export const postsAPI = {
  getAllPosts: () => api.get("/posts"),
  getPost: (id) => api.get(`/posts/${id}`),
  getPostsByUser: (userId) => api.get(`/posts/user/${userId}`),
  createPost: (postData) => api.post("/posts", postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  getFollowingPosts: () => api.get("/posts/following"),
}

// Comments API
export const commentsAPI = {
  createComment: (data) => api.post("/comments", data),
  getComment: id => api.get(`/comments/${id}`),
  getCommentsByParent: parentId => api.get(`/comments/thread/${parentId}`),
  deleteComment: id => api.delete(`/comments/${id}`),
}

// Likes API
export const likesAPI = {
  toggleLike: (postId) => api.post("/likes", { postId }),
  getLikedPosts: () => api.get("/likes/liked-posts"),
};

// Reposts API
export const repostsAPI = {
  createRepost: (postId) => api.post("/reposts", { postId }),
  deleteRepost: (repostId) => api.delete(`/reposts/${repostId}`),
  getUserReposts: () => api.get("/reposts/user"),
};

// Bookmarks API
export const bookmarksAPI = {
  toggleBookmark: (postId) => api.post("/bookmarks", { postId }),
  getBookmarks: () => api.get("/bookmarks"),
}

// Follow API
export const followAPI = {
  toggleFollow: (id) => api.post(`/follow/${id}`),
  getFollowers: () => api.get("/follow/followers"),
  getFollowing: () => api.get("/follow/following"),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
}

export default api

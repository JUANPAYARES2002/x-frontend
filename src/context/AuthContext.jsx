"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    if (token) {
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data

      localStorage.setItem("token", token)
      setToken(token)
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al iniciar sesión",
      }
    }
  }

  const register = async (userData) => {
    try {
      // 1) formData con todos los campos
      const formData = new FormData();
      formData.append("nombre", userData.nombre);
      formData.append("username", userData.username);
      formData.append("telefono", userData.telefono);
      formData.append("password", userData.password); // ojo: key "password"
      if (userData.foto) formData.append("foto", userData.foto);

      // 2) petición
      const res = await authAPI.register(formData);
      const { token, user } = res.data;

      // 3) guardado
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      navigate("/home");
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Error al registrarse",
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (userData) => {
    try {
      const formData = new FormData()
      Object.keys(userData).forEach((key) => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key])
        }
      })

      const response = await authAPI.updateProfile(formData)
      setUser(response.data)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al actualizar perfil",
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

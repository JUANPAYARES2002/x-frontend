"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(formData)

    if (result.success) {
      navigate("/home")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Image/Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-twitter-blue items-center justify-center">
        <div className="text-white text-8xl font-bold">𝕏</div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Está sucediendo ahora</h1>
            <h2 className="text-2xl font-bold text-white mb-8">Únete hoy.</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-twitter-blue"
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-twitter-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="text-twitter-blue hover:underline">
                Regístrate
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-twitter-blue hover:underline">
              ← De vuelta a Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

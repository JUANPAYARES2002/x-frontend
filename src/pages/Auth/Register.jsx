"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    telefono: "",
    password: "",
    foto: null,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    if (e.target.name === "foto") {
      setFormData({
        ...formData,
        foto: e.target.files[0],
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await register(formData)

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

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Únete hoy.</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-twitter-blue"
              />
            </div>

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
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
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

            <div>
              <label className="block text-gray-400 text-sm mb-2">Foto de perfil (opcional)</label>
              <input
                type="file"
                name="foto"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-twitter-blue file:text-white hover:file:bg-twitter-dark-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-4 rounded-full transition-colors disabled:opacity-50"
            >
              {loading ? "Creando cuenta..." : "crear cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-twitter-blue hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-twitter-blue hover:underline">
              ← De vuelta a Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

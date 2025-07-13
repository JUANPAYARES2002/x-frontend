import { Link } from "react-router-dom"

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Left side - Logo */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-black">
          <div className="text-white text-9xl font-bold">𝕏</div>
        </div>

        {/* Right side - Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="mb-12">
              <div className="lg:hidden text-center mb-8">
                <div className="text-white text-6xl font-bold">𝕏</div>
              </div>

              <h1 className="text-6xl font-bold mb-8">Lo que está pasando ahora</h1>

              <h2 className="text-3xl font-bold mb-8">Únete Hoy</h2>
            </div>

            <div className="space-y-4">
              <Link
                to="/register"
                className="block w-full bg-twitter-blue hover:bg-twitter-dark-blue text-white font-bold py-3 px-4 rounded-full text-center transition-colors"
              >
                Crear cuenta
              </Link>

              <p className="text-xs text-gray-500">
                Al registrarse, acepta los{" "}
                <a href="#" className="text-twitter-blue hover:underline">
                  Términos de servicio
                </a>{" "}
                y la{" "}
                <a href="#" className="text-twitter-blue hover:underline">
                  Política de privacidad
                </a>
                , incluido{" "}
                <a href="#" className="text-twitter-blue hover:underline">
                  uso de Cookies
                </a>
                .
              </p>
            </div>

            <div className="mt-12">
              <h3 className="text-lg font-bold mb-4">¿Ya tienes una cuenta?</h3>
              <Link
                to="/login"
                className="block w-full border border-gray-600 text-twitter-blue font-bold py-3 px-4 rounded-full text-center hover:bg-gray-900 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Download the X app
            </a>
            <a href="#" className="hover:underline">
              Help Center
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Cookie Policy
            </a>
            <a href="#" className="hover:underline">
              Accessibility
            </a>
            <a href="#" className="hover:underline">
              Ads info
            </a>
            <a href="#" className="hover:underline">
              Blog
            </a>
            <a href="#" className="hover:underline">
              Careers
            </a>
            <a href="#" className="hover:underline">
              Brand Resources
            </a>
            <a href="#" className="hover:underline">
              Advertising
            </a>
            <a href="#" className="hover:underline">
              Marketing
            </a>
            <a href="#" className="hover:underline">
              X for Business
            </a>
            <a href="#" className="hover:underline">
              Developers
            </a>
            <a href="#" className="hover:underline">
              Directory
            </a>
            <a href="#" className="hover:underline">
              Settings
            </a>
            <span>© 2025 X Corp.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing

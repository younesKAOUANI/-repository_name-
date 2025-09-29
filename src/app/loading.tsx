import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Chargement en cours...
        </h2>
        
        <p className="text-gray-600">
          Veuillez patienter pendant que nous préparons votre contenu.
        </p>

        {/* Loading Bar Animation */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

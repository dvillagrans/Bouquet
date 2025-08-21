import { useState } from 'react'
import { ImageWithFallback } from './ImageWithFallback'
import { Home, User, ShoppingCart } from 'lucide-react'

interface NameEntryProps {
  onSubmit: (name: string) => void
}

export function NameEntry({ onSubmit }: NameEntryProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim())
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Navigation icons */}
      <div className="absolute top-8 right-8 flex space-x-2">
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <Home className="w-4 h-4 text-[#8B4B6B]" />
        </div>
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-[#8B4B6B]" />
        </div>
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-4 h-4 text-[#8B4B6B]" />
        </div>
      </div>

      {/* Bouquet title */}
      <div className="absolute top-8 left-8">
        <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
        <p className="text-xs text-gray-600 mt-1">BIENVENIDO</p>
      </div>

      <div className="max-w-md text-center space-y-8">
        {/* Rose image */}
        <div className="flex justify-center mb-8">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1652430626301-e628b5271cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcGluayUyMHJvc2UlMjBmbG93ZXJ8ZW58MXx8fHwxNzU1NDYxMzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Pink rose"
            className="w-32 h-32 object-cover rounded-full"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-gray-700 text-lg">Hola, por favor ingresa tu nombre</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 border-2 border-[#8B4B6B]/30 rounded-lg focus:border-[#8B4B6B] focus:outline-none bg-white/80 backdrop-blur-sm text-center"
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-[#8B4B6B] text-white py-3 px-6 rounded-lg hover:bg-[#7A4159] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
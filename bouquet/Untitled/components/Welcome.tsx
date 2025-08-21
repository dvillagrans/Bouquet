import { ImageWithFallback } from './figma/ImageWithFallback';

interface WelcomeProps {
  onNext: () => void;
}

export function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      {/* Decorative floral element */}
      <div className="absolute top-8 left-8">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1718460784679-cb976f7f9ea5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWNvcmF0aXZlJTIwZmxvcmFsJTIwZWxlbWVudHN8ZW58MXx8fHwxNzU1NDYxMzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Decorative floral element"
          className="w-16 h-16 object-cover rounded-full opacity-70"
        />
      </div>

      {/* Bouquet title */}
      <div className="mb-12">
        <h1 className="text-[#8B4B6B] text-4xl font-serif italic mb-2">Bouquet</h1>
      </div>

      {/* Main content */}
      <div className="max-w-md text-center space-y-6">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic mb-8">Welcome</h2>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-[#8B4B6B]/20">
          <div className="space-y-4 text-left">
            <p className="text-sm text-gray-700">
              <span className="font-medium">✿ Nota:</span> Aparece la pantalla blanca y se muestra como se dibuja la palabra 'Welcome'
            </p>
            <p className="text-sm text-gray-600">
              Luego desaparece para mostrar la interfaz de usuario
            </p>
          </div>
        </div>

        <button 
          onClick={onNext}
          className="w-full bg-[#8B4B6B] text-white py-3 px-6 rounded-lg hover:bg-[#7A4159] transition-colors"
        >
          Continuar
        </button>
      </div>

      {/* Navigation icons in top right */}
      <div className="absolute top-8 right-8 flex space-x-2">
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <span className="text-[#8B4B6B] text-xs">🏠</span>
        </div>
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <span className="text-[#8B4B6B] text-xs">👤</span>
        </div>
        <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
          <span className="text-[#8B4B6B] text-xs">🛒</span>
        </div>
      </div>
    </div>
  );
}
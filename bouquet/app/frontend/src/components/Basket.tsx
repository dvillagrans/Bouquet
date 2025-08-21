import { Home, User, ShoppingCart, Minus, Plus, X } from 'lucide-react'
import type { MenuItem } from './Menu'

export interface BasketItem extends MenuItem {
  quantity: number
}

interface BasketProps {
  items: BasketItem[]
  onBack: () => void
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onProceedToPayment: () => void
  total: number
}

export function Basket({ items, onBack, onUpdateQuantity, onRemoveItem, onProceedToPayment, total }: BasketProps) {
  return (
    <div className="min-h-screen p-8 relative bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">BIENVENIDO</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={onBack}
            className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center hover:bg-[#8B4B6B]/30 transition-colors"
          >
            <Home className="w-4 h-4 text-[#8B4B6B]" />
          </button>
          <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#8B4B6B]" />
          </div>
          <div className="w-8 h-8 bg-[#8B4B6B] rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic">Mi Carrito</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tu carrito está vacío</p>
            <button 
              onClick={onBack}
              className="mt-4 bg-[#8B4B6B] text-white px-6 py-2 rounded-lg hover:bg-[#7A4159] transition-colors"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items list */}
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-[#8B4B6B]/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-[#8B4B6B] font-medium">{item.name}</h3>
                    <p className="text-lg font-medium text-gray-800">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-right">
                  <p className="text-sm text-gray-600">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            {/* Total and actions */}
            <div className="mt-8 pt-6 border-t border-[#8B4B6B]/20">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-medium text-gray-800">Total:</span>
                <span className="text-2xl font-medium text-[#8B4B6B]">${total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={onProceedToPayment}
                  className="w-full bg-[#8B4B6B] text-white py-3 px-6 rounded-lg hover:bg-[#7A4159] transition-colors"
                >
                  Proceder al Pago
                </button>
                
                <button
                  onClick={onBack}
                  className="w-full bg-white text-[#8B4B6B] py-3 px-6 rounded-lg border border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
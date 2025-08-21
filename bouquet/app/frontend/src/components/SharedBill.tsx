import { useState } from 'react'
import { Home, User, ShoppingCart } from 'lucide-react'
import type { BasketItem } from './Basket'

interface SharedBillProps {
  items: BasketItem[]
  total: number
  onBack: () => void
  onOrderComplete: () => void
}

export function SharedBill({ items, total, onBack, onOrderComplete }: SharedBillProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [customAmount, setCustomAmount] = useState('')

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const getSelectedTotal = () => {
    return items
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handlePayment = () => {
    onOrderComplete()
  }

  return (
    <div className="min-h-screen p-8 relative bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">BIENVENIDO</p>
        </div>
        
        <div className="flex space-x-2">
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
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic">Cuenta Compartida</h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-[#8B4B6B]/20">
          <p className="text-sm text-gray-700 text-center">
            Selecciona los artículos que quieres pagar
          </p>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border cursor-pointer transition-all ${
                selectedItems.has(item.id) 
                  ? 'border-[#8B4B6B] bg-[#8B4B6B]/5' 
                  : 'border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40'
              }`}
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="text-[#8B4B6B]"
                  />
                  <div>
                    <h3 className="text-[#8B4B6B] font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-[#8B4B6B]/20">
          <label className="block text-sm text-gray-700 mb-2">
            O ingresa un monto personalizado:
          </label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="$0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8B4B6B] focus:outline-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-[#8B4B6B]/20">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Artículos seleccionados:</span>
              <span className="font-medium">${getSelectedTotal().toFixed(2)}</span>
            </div>
            {customAmount && (
              <div className="flex justify-between">
                <span className="text-gray-700">Monto personalizado:</span>
                <span className="font-medium">${parseFloat(customAmount || '0').toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-medium">Total a pagar:</span>
                <span className="text-xl font-medium text-[#8B4B6B]">
                  ${(customAmount ? parseFloat(customAmount || '0') : getSelectedTotal()).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 pt-2">
              <p>Total de la factura: ${total.toFixed(2)}</p>
              <p>Restante: ${(total - (customAmount ? parseFloat(customAmount || '0') : getSelectedTotal())).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={!selectedItems.size && !customAmount}
            className="w-full bg-[#8B4B6B] text-white py-3 px-6 rounded-lg hover:bg-[#7A4159] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pagar mi parte
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-white text-[#8B4B6B] py-3 px-6 rounded-lg border border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}
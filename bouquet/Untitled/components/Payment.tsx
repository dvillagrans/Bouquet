import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PaymentProps {
  total: number;
  onBack: () => void;
  onProceedToSharedBill: () => void;
  onOrderComplete: () => void;
}

export function Payment({ total, onBack, onProceedToSharedBill, onOrderComplete }: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'individual' | 'shared'>('individual');

  const handlePayment = () => {
    if (paymentMethod === 'shared') {
      onProceedToSharedBill();
    } else {
      onOrderComplete();
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">WELCOME SPANISH</p>
        </div>
        
        <div className="flex space-x-2">
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

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic">Payment</h2>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        {/* Payment methods */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center shadow-sm border border-[#8B4B6B]/20">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1652430626301-e628b5271cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcGluayUyMHJvc2UlMjBmbG93ZXJ8ZW58MXx8fHwxNzU1NDYxMzUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Individual payment"
                className="w-16 h-16 object-cover rounded-full mx-auto mb-3"
              />
              <p className="text-sm text-[#8B4B6B] font-medium">Individual</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center shadow-sm border border-[#8B4B6B]/20">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1718460784679-cb976f7f9ea5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkZWNvcmF0aXZlJTIwZmxvcmFsJTIwZWxlbWVudHN8ZW58MXx8fHwxNzU1NDYxMzYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Shared payment"
                className="w-16 h-16 object-cover rounded-full mx-auto mb-3"
              />
              <p className="text-sm text-[#8B4B6B] font-medium">Multiple</p>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="individual"
                checked={paymentMethod === 'individual'}
                onChange={(e) => setPaymentMethod(e.target.value as 'individual' | 'shared')}
                className="text-[#8B4B6B]"
              />
              <span className="text-gray-700">Pago Individual</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="shared"
                checked={paymentMethod === 'shared'}
                onChange={(e) => setPaymentMethod(e.target.value as 'individual' | 'shared')}
                className="text-[#8B4B6B]"
              />
              <span className="text-gray-700">Factura Compartida</span>
            </label>
          </div>
        </div>

        {/* Total */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-[#8B4B6B]/20">
          <div className="flex justify-between items-center">
            <span className="text-xl font-medium text-gray-800">Total:</span>
            <span className="text-2xl font-medium text-[#8B4B6B]">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            className="w-full bg-[#8B4B6B] text-white py-3 px-6 rounded-lg hover:bg-[#7A4159] transition-colors"
          >
            {paymentMethod === 'shared' ? 'Dividir Cuenta' : 'Pagar Ahora'}
          </button>
          
          <button
            onClick={onBack}
            className="w-full bg-white text-[#8B4B6B] py-3 px-6 rounded-lg border border-[#8B4B6B] hover:bg-[#8B4B6B]/5 transition-colors"
          >
            Volver al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
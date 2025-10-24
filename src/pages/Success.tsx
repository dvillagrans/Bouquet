import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import flowerLogo from '@/assets/flower-logo.png';
import { useEffect } from 'react';

const Success = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart on success
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-albescent-white-50 to-coral-tree-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <img src={flowerLogo} alt="Bouquet" className="w-32 h-32 drop-shadow-lg" />
        </div>

        <div className="glass-card rounded-3xl shadow-2xl p-12 border-0">
          <div className="flex justify-center mb-6">
            <div className="glass-light rounded-full p-6 shadow-lg">
              <CheckCircle className="h-16 w-16 text-green-600 drop-shadow-sm" />
            </div>
          </div>

          <h2 className="text-4xl font-script text-buccaneer-800 mb-4 drop-shadow-sm">Order Complete!</h2>
          
          <p className="text-xl text-coral-tree-700 font-elegant mb-8">
            Thank you for your order. Your payment has been processed successfully.
          </p>

          <Button 
            variant="elegant" 
            size="lg" 
            onClick={() => navigate('/')}
            className="w-full shadow-lg"
          >
            Return to Home
          </Button>

          <div className="mt-8 flex justify-center">
            <img src={flowerLogo} alt="Flower decoration" className="w-24 h-24 opacity-60 drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;

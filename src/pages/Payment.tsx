import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, User } from 'lucide-react';
import flowerLogo from '@/assets/flower-logo.png';

const Payment = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    navigate('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/cart')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <img src={flowerLogo} alt="Bouquet" className="w-10 h-10" />
            <h1 className="text-2xl font-script text-buccaneer-700">Bouquet</h1>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-12">Payment</h2>
        
        <div className="space-y-6">
          <Card 
            className="glass-card hover:glass-medium transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden border-0"
            onClick={() => {
              // For individual payment, just show a success message
              navigate('/success');
            }}
          >
            <div className="bg-gradient-to-br from-pink-400 to-pink-600 p-12 text-white">
              <div className="flex flex-col items-center space-y-6">
                <div className="glass-light rounded-full p-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <User className="h-16 w-16 drop-shadow-sm" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-elegant mb-2 drop-shadow-sm">Individual</h3>
                  <p className="text-white/90 text-lg drop-shadow-sm">Pay for your own order</p>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="glass-card hover:glass-medium transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden border-0"
            onClick={() => navigate('/split-bill')}
          >
            <div className="bg-gradient-to-br from-coral-tree-400 to-buccaneer-600 p-12 text-white">
              <div className="flex flex-col items-center space-y-6">
                <div className="glass-light rounded-full p-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-16 w-16 drop-shadow-sm" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-elegant mb-2 drop-shadow-sm">Shared bill</h3>
                  <p className="text-white/90 text-lg drop-shadow-sm">Split the bill with others</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <img src={flowerLogo} alt="Flower decoration" className="w-24 h-24 opacity-40" />
        </div>
      </main>
    </div>
  );
};

export default Payment;

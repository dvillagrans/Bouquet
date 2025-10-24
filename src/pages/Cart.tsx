import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import flowerLogo from '@/assets/flower-logo.png';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
        <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={flowerLogo} alt="Bouquet" className="w-10 h-10" />
              <h1 className="text-2xl font-script text-buccaneer-700">Bouquet</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-12">My basket</h2>
          <div className="text-center py-12">
            <p className="text-2xl text-coral-tree-700 font-elegant">Your basket is empty</p>
            <Button
              variant="elegant"
              size="lg"
              onClick={() => navigate('/home')}
              className="mt-8"
            >
              Browse Menu
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
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
      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-12">My basket</h2>
        
        <div className="space-y-4 mb-8">
          {cart.map((item) => (
            <Card key={item.id} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-elegant text-buccaneer-800">{item.name}</h3>
                    <p className="text-coral-tree-700 text-sm font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-bold w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total and Actions */}
        <Card className="glass-medium border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-elegant text-buccaneer-800">Total:</span>
              <span className="text-3xl font-bold text-primary drop-shadow-sm">${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/home')}
                className="flex-1"
              >
                Add more
              </Button>
              <Button
                variant="elegant"
                size="lg"
                onClick={() => navigate('/payment')}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Cart;

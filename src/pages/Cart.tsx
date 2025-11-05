import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { Navigation } from '@/components/ui/navigation';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleRemoveItem = (id: number, name: string) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart`, {
      description: "Item successfully removed from your basket",
      duration: 2000,
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number, name: string) => {
    if (quantity === 0) {
      handleRemoveItem(id, name);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
        <Navigation 
          showBackButton={true} 
          title="My Basket"
          customBackAction={() => navigate('/home')}
        />

        <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="text-center py-8 sm:py-16 animate-fade-in">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-coral-tree-100 to-pink-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-coral-tree-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-script text-buccaneer-700 mb-3 sm:mb-4">
              Your basket is empty
            </h2>
            <p className="text-buccaneer-600 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Discover our delicious menu and add some amazing items to get started!
            </p>
            <Button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Start Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      <Navigation 
        showBackButton={true} 
        title="My Basket"
        customBackAction={() => navigate('/home')}
      />

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Cart Header */}
        <div className="mb-6 sm:mb-8 text-center animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-script text-buccaneer-800 mb-2 sm:mb-3">
            Your Order
          </h2>
          <p className="text-buccaneer-600 text-base sm:text-lg">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your basket
          </p>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-coral-tree-400 to-pink-400 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>
        
        {/* Cart Items */}
        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4" role="list" aria-label="Cart items">
          {cart.map((item, index) => (
            <div 
              key={item.id} 
              className="animate-fade-in-up hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
              role="listitem"
              aria-label={`${item.name} - ${item.quantity} items in cart`}
            >
              <Card className="glass border-glass-border transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-elegant text-buccaneer-800 mb-1"
                        id={`item-name-${item.id}`}
                      >
                        {item.name}
                      </h3>
                      <p 
                        className="text-coral-tree-600 font-medium"
                        aria-label={`Unit price: ${item.price} dollars each`}
                      >
                        ${item.price.toFixed(2)} each
                      </p>
                      <p 
                        className="text-sm text-buccaneer-500 mt-1"
                        aria-label={`Subtotal for ${item.quantity} items: ${(item.price * item.quantity).toFixed(2)} dollars`}
                      >
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div 
                        className="flex items-center gap-2 bg-white/50 rounded-full p-1"
                        role="group"
                        aria-label={`Quantity controls for ${item.name}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleUpdateQuantity(item.id, item.quantity - 1, item.name))}
                          className="h-8 w-8 rounded-full hover:bg-coral-tree-100 focus-ring"
                          aria-label={`Decrease quantity of ${item.name}`}
                          aria-describedby={`item-name-${item.id}`}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span 
                          className="w-8 text-center font-bold text-buccaneer-800 px-2"
                          aria-label={`Current quantity: ${item.quantity}`}
                          role="status"
                        >
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleUpdateQuantity(item.id, item.quantity + 1, item.name))}
                          className="h-8 w-8 rounded-full hover:bg-coral-tree-100 focus-ring"
                          aria-label={`Increase quantity of ${item.name}`}
                          aria-describedby={`item-name-${item.id}`}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleRemoveItem(item.id, item.name))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-smooth focus-ring"
                        aria-label={`Remove ${item.name} from cart`}
                        aria-describedby={`item-name-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div 
          className="max-w-2xl mx-auto mt-8 animate-slide-in-right"
          role="region"
          aria-label="Order summary"
        >
          <Card className="glass border-glass-border">
            <CardContent className="p-6">
              <h2 
                className="text-2xl font-elegant text-buccaneer-800 mb-4"
                id="order-summary-title"
              >
                Order Summary
              </h2>
              
              <div className="space-y-4" aria-labelledby="order-summary-title">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-buccaneer-700">Subtotal:</span>
                  <span 
                    className="font-medium"
                    aria-label={`Subtotal: ${totalPrice.toFixed(2)} dollars`}
                  >
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-buccaneer-700">Delivery:</span>
                  <span 
                    className="font-medium text-green-600"
                    aria-label="Delivery cost: Free"
                  >
                    Free
                  </span>
                </div>
                <div className="border-t border-glass-border pt-4">
                  <div 
                    className="flex items-center justify-between text-2xl font-bold text-buccaneer-800"
                    role="status"
                    aria-live="polite"
                  >
                    <span>Total:</span>
                    <span 
                      className="text-coral-tree-600"
                      aria-label={`Total amount: ${totalPrice.toFixed(2)} dollars`}
                    >
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/payment')}
                onKeyDown={(e) => handleKeyDown(e, () => navigate('/payment'))}
                className="w-full mt-6 bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus-ring"
                size="lg"
                aria-label={`Proceed to payment with total of ${totalPrice.toFixed(2)} dollars`}
              >
                Proceed to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Cart;

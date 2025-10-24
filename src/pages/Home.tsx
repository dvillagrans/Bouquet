import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Coffee, Sunrise, Utensils, Cookie, Wine } from 'lucide-react';
import { Card } from '@/components/ui/card';
import flowerLogo from '@/assets/flower-logo.png';

const categories = [
  { id: 'drinks', name: 'Drinks', icon: Wine, color: 'from-pink-400 to-pink-600' },
  { id: 'breakfast', name: 'Breakfast', icon: Sunrise, color: 'from-coral-tree-400 to-coral-tree-600' },
  { id: 'appetizers', name: 'Appetizers', icon: Coffee, color: 'from-buccaneer-400 to-buccaneer-600' },
  { id: 'dishes', name: 'Dishes', icon: Utensils, color: 'from-pink-500 to-coral-tree-500' },
  { id: 'desserts', name: 'Desserts', icon: Cookie, color: 'from-coral-tree-500 to-buccaneer-500' },
];

const Home = () => {
  const { userName, cart } = useCart();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={flowerLogo} alt="Bouquet" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-script text-buccaneer-700">Bouquet</h1>
              <p className="text-sm text-coral-tree-600">Welcome {userName}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/cart')}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {cartItemsCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-12">Home</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className="group cursor-pointer overflow-hidden glass-card hover:glass-medium transition-all duration-300 hover:shadow-2xl hover:scale-105 border-0"
                onClick={() => navigate(`/menu/${category.id}`)}
              >
                <div className={`bg-gradient-to-br ${category.color} p-8 text-white`}>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="glass-light rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon className="h-12 w-12 drop-shadow-sm" />
                    </div>
                    <h3 className="text-2xl font-elegant text-center drop-shadow-sm">{category.name}</h3>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <img src={flowerLogo} alt="Flower decoration" className="w-32 h-32 opacity-40" />
        </div>
      </main>
    </div>
  );
};

export default Home;

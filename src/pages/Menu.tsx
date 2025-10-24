import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { menuItems } from '@/data/menuData';
import flowerLogo from '@/assets/flower-logo.png';
import { toast } from 'sonner';

const Menu = () => {
  const { category } = useParams<{ category: string }>();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const filteredItems = menuItems.filter((item) => item.category === category);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getCategoryTitle = () => {
    const titles: Record<string, string> = {
      drinks: 'Drinks',
      breakfast: 'Breakfast',
      appetizers: 'Appetizers',
      dishes: 'Dishes',
      desserts: 'Desserts',
    };
    return titles[category || ''] || 'Menu';
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <img src={flowerLogo} alt="Bouquet" className="w-10 h-10" />
            <h1 className="text-2xl font-script text-buccaneer-700">Bouquet</h1>
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
        <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-12">{getCategoryTitle()}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <Card key={item.id} className="glass-card hover:glass-medium transition-all duration-300 hover:shadow-xl overflow-hidden group border-0">
              <CardHeader>
                <CardTitle className="text-xl font-elegant text-buccaneer-800">{item.name}</CardTitle>
                <CardDescription className="text-coral-tree-700 font-medium">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => handleAddToCart(item)}
                    className="rounded-full group-hover:scale-110 transition-transform"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Menu;

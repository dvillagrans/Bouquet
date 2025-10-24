import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import flowerLogo from '@/assets/flower-logo.png';

const Welcome = () => {
  const [name, setName] = useState('');
  const { setUserName } = useCart();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-albescent-white-50 to-coral-tree-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img src={flowerLogo} alt="Bouquet" className="w-20 h-20 drop-shadow-lg" />
            <h1 className="text-6xl font-script text-buccaneer-700 ml-4 drop-shadow-sm">Bouquet</h1>
          </div>
        </div>

        <div className="glass-card rounded-3xl shadow-2xl p-8 border-0">
          <h2 className="text-4xl font-script text-center text-buccaneer-800 mb-8 drop-shadow-sm">Welcome</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-center text-coral-tree-800 mb-4 text-lg font-elegant">
                Hi, please insert your name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full text-center text-lg h-12 glass-light border-0 focus:ring-2 focus:ring-primary rounded-xl"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="elegant" 
              size="lg" 
              className="w-full text-lg shadow-lg"
            >
              Continue
            </Button>
          </form>

          <div className="mt-8 flex justify-center">
            <img src={flowerLogo} alt="Flower decoration" className="w-24 h-24 opacity-60 drop-shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

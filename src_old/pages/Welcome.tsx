import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import flowerLogo from '@/assets/flower-logo.png';

const Welcome = () => {
  const [name, setName] = useState('');
  const [staffCode, setStaffCode] = useState('');
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
    <div className="min-h-screen bg-champagne flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <img src={flowerLogo} alt="Bouquet" className="w-20 h-20 mx-auto" />
        
        <h2 className="text-center text-coral-tree-700 text-sm font-medium">
          Hi, please insert your name
        </h2>
        
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Natalia"
          className="w-full text-center text-base h-12 bg-white border border-gray-300 focus:ring-2 focus:ring-coral-tree-300 focus:border-transparent rounded-lg"
          required
        />

        <Input
          type="text"
          value={staffCode}
          onChange={(e) => setStaffCode(e.target.value)}
          placeholder="Ingresa el código de staff"
          className="w-full text-center text-base h-12 bg-white border border-gray-300 focus:ring-2 focus:ring-coral-tree-300 focus:border-transparent rounded-lg"
        />

        <Button 
          type="submit" 
          className="w-full bg-coral-tree-500 hover:bg-coral-tree-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Continue
        </Button>
      </form>
    </div>
  );
};

export default Welcome;

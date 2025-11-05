import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Minus, DollarSign } from 'lucide-react';
import flowerLogo from '@/assets/flower-logo.png';
import { CartItem } from '@/types';

interface PersonBill {
  id: string;
  name: string;
  items: { itemId: string; quantity: number }[];
  total: number;
}

const SplitBill = () => {
  const { cart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [people, setPeople] = useState<PersonBill[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);

  const totalPrice = getTotalPrice();

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([
        ...people,
        {
          id: Date.now().toString(),
          name: newPersonName.trim(),
          items: [],
          total: 0,
        },
      ]);
      setNewPersonName('');
    }
  };

  const removePerson = (personId: string) => {
    setPeople(people.filter((p) => p.id !== personId));
  };

  const assignItemToPerson = (personId: string, item: CartItem) => {
    setPeople(
      people.map((person) => {
        if (person.id === personId) {
          const existingItem = person.items.find((i) => i.itemId === item.id);
          const newItems = existingItem
            ? person.items.map((i) =>
                i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...person.items, { itemId: item.id, quantity: 1 }];
          
          const newTotal = newItems.reduce((sum, i) => {
            const cartItem = cart.find((c) => c.id === i.itemId);
            return sum + (cartItem?.price || 0) * i.quantity;
          }, 0);

          return { ...person, items: newItems, total: newTotal };
        }
        return person;
      })
    );
  };

  const getPersonTotal = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    return person?.total || 0;
  };

  const totalAssigned = people.reduce((sum, person) => sum + person.total, 0);
  const remaining = totalPrice - totalAssigned;

  return (
    <div className="min-h-screen bg-gradient-to-br from-albescent-white-50 via-pink-50 to-coral-tree-50">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-0 border-b border-glass-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/payment')}>
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
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <h2 className="text-5xl font-script text-center text-buccaneer-700 mb-8">Shared bill</h2>
        
        {/* Total Summary */}
        <Card className="glass-medium border-0 mb-8 shadow-xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-coral-tree-700 mb-1 font-medium">Total</p>
                <p className="text-2xl font-bold text-buccaneer-800">${totalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-coral-tree-700 mb-1 font-medium">Assigned</p>
                <p className="text-2xl font-bold text-primary drop-shadow-sm">${totalAssigned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-coral-tree-700 mb-1 font-medium">Remaining</p>
                <p className="text-2xl font-bold text-secondary drop-shadow-sm">${remaining.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Person */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-elegant text-buccaneer-800">Add Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Person name"
                onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                className="flex-1 glass-light border-0 focus:ring-2 focus:ring-primary"
              />
              <Button onClick={addPerson} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* People List */}
        <div className="space-y-6 mb-8">
          {people.map((person) => (
            <Card key={person.id} className="glass-card border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-elegant text-buccaneer-800">{person.name}</CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary drop-shadow-sm">
                      ${getPersonTotal(person.id).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePerson(person.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {cart.map((item) => {
                    const personItem = person.items.find((i) => i.itemId === item.id);
                    const assignedQty = personItem?.quantity || 0;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg glass-light hover:glass-medium transition-all">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-buccaneer-800">{item.name}</p>
                          <p className="text-xs text-coral-tree-700 font-medium">${item.price.toFixed(2)}</p>
                        </div>
                        {assignedQty > 0 && (
                          <span className="text-sm font-bold text-primary mr-3">
                            x{assignedQty}
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => assignItemToPerson(person.id, item)}
                          className="h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Amount Option */}
        {!showCustomAmount ? (
          <Button
            variant="outline"
            onClick={() => setShowCustomAmount(true)}
            className="w-full mb-8 glass-light hover:glass-medium border-0"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add custom amount
          </Button>
        ) : (
          <Card className="glass-card border-0 mb-8">
            <CardContent className="p-4">
              <Input
                type="number"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter custom amount"
                className="glass-light border-0 focus:ring-2 focus:ring-primary"
              />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/cart')}
            className="flex-1"
          >
            Back to Cart
          </Button>
          <Button
            variant="elegant"
            size="lg"
            onClick={() => navigate('/success')}
            className="flex-1"
            disabled={people.length === 0}
          >
            Confirm Split
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SplitBill;

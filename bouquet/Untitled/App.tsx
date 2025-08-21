import { useState } from 'react';
import { Welcome } from './components/Welcome';
import { NameEntry } from './components/NameEntry';
import { Home } from './components/Home';
import { Menu } from './components/Menu';
import { Basket } from './components/Basket';
import { Payment } from './components/Payment';
import { SharedBill } from './components/SharedBill';

type Screen = 'welcome' | 'nameEntry' | 'home' | 'menu' | 'basket' | 'payment' | 'sharedBill';
type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: Category;
}

export interface BasketItem extends MenuItem {
  quantity: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userName, setUserName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('drinks');
  const [basket, setBasket] = useState<BasketItem[]>([]);

  const addToBasket = (item: MenuItem) => {
    setBasket(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromBasket = (itemId: string) => {
    setBasket(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromBasket(itemId);
      return;
    }
    setBasket(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return basket.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleWelcomeNext = () => {
    setCurrentScreen('nameEntry');
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setCurrentScreen('home');
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen('menu');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleViewBasket = () => {
    setCurrentScreen('basket');
  };

  const handleProceedToPayment = () => {
    setCurrentScreen('payment');
  };

  const handleProceedToSharedBill = () => {
    setCurrentScreen('sharedBill');
  };

  const handleOrderComplete = () => {
    setBasket([]);
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {currentScreen === 'welcome' && (
        <Welcome onNext={handleWelcomeNext} />
      )}
      
      {currentScreen === 'nameEntry' && (
        <NameEntry onSubmit={handleNameSubmit} />
      )}
      
      {currentScreen === 'home' && (
        <Home 
          userName={userName}
          onCategorySelect={handleCategorySelect}
          onViewBasket={handleViewBasket}
          basketCount={basket.reduce((total, item) => total + item.quantity, 0)}
        />
      )}
      
      {currentScreen === 'menu' && (
        <Menu 
          category={selectedCategory}
          onBack={handleBackToHome}
          onAddToBasket={addToBasket}
          onViewBasket={handleViewBasket}
          basketCount={basket.reduce((total, item) => total + item.quantity, 0)}
        />
      )}
      
      {currentScreen === 'basket' && (
        <Basket 
          items={basket}
          onBack={handleBackToHome}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromBasket}
          onProceedToPayment={handleProceedToPayment}
          total={getTotalAmount()}
        />
      )}
      
      {currentScreen === 'payment' && (
        <Payment 
          total={getTotalAmount()}
          onBack={() => setCurrentScreen('basket')}
          onProceedToSharedBill={handleProceedToSharedBill}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      {currentScreen === 'sharedBill' && (
        <SharedBill 
          items={basket}
          total={getTotalAmount()}
          onBack={() => setCurrentScreen('payment')}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  );
}
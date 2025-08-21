import { ImageWithFallback } from './figma/ImageWithFallback';

type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts';

interface HomeProps {
  userName: string;
  onCategorySelect: (category: Category) => void;
  onViewBasket: () => void;
  basketCount: number;
}

export function Home({ userName, onCategorySelect, onViewBasket, basketCount }: HomeProps) {
  const categories = [
    {
      id: 'drinks' as Category,
      name: 'Drinks',
      image: 'https://images.unsplash.com/photo-1681579289899-188bd52d51f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNjb2NrdGFpbCUyMGRyaW5rcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc1NTQzMjYwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'breakfast' as Category,
      name: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1721550097777-f05a56f16739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxicmVha2Zhc3QlMjBwYW5jYWtlcyUyMGVsZWdhbnR8ZW58MXx8fHwxNzU1NDYxMzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'appetizers' as Category,
      name: 'Appetizers',
      image: 'https://images.unsplash.com/photo-1732206048727-81dd4e6e9124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlbGVnYW50JTIwYXBwZXRpemVycyUyMGZvb2R8ZW58MXx8fHwxNzU1NDYxMzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'dishes' as Category,
      name: 'Dishes',
      image: 'https://images.unsplash.com/photo-1579523609295-1ef35e6bd1c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtYWluJTIwZGlzaCUyMGVsZWdhbnQlMjByZXN0YXVyYW50fGVufDF8fHx8MTc1NTQ2MTM1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'desserts' as Category,
      name: 'Desserts',
      image: 'https://images.unsplash.com/photo-1736959574670-a8ace9856e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlbGVnYW50JTIwZGVzc2VydCUyMGNha2V8ZW58MXx8fHwxNzU1NDYxMzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  return (
    <div className="min-h-screen p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">WELCOME SPANISH</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
            <span className="text-[#8B4B6B] text-xs">🏠</span>
          </div>
          <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
            <span className="text-[#8B4B6B] text-xs">👤</span>
          </div>
          <button 
            onClick={onViewBasket}
            className="relative w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center hover:bg-[#8B4B6B]/30 transition-colors"
          >
            <span className="text-[#8B4B6B] text-xs">🛒</span>
            {basketCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {basketCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Welcome message */}
      <div className="text-center mb-12">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic mb-4">Home</h2>
        <p className="text-gray-700">Bienvenido, {userName}</p>
      </div>

      {/* Categories grid */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="w-full h-24 rounded-lg overflow-hidden">
                  <ImageWithFallback 
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-[#8B4B6B] font-medium">{category.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
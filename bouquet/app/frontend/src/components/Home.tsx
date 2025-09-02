import { ImageWithFallback } from './ImageWithFallback'
import { Home as HomeIcon, User, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts'

interface HomeProps {
  userName: string
  onCategorySelect: (category: Category) => void
  onViewBasket: () => void
  basketCount: number
}

export function Home({ userName, onCategorySelect, onViewBasket, basketCount }: HomeProps) {
  const categories = [
    {
      id: 'drinks' as Category,
      name: 'Bebidas',
      image: 'https://images.unsplash.com/photo-1681579289899-188bd52d51f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNjb2NrdGFpbCUyMGRyaW5rcyUyMGNvbG9yZnVsfGVufDF8fHx8MTc1NTQzMjYwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'breakfast' as Category,
      name: 'Desayunos',
      image: 'https://images.unsplash.com/photo-1721550097777-f05a56f16739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxicmVha2Zhc3QlMjBwYW5jYWtlcyUyMGVsZWdhbnR8ZW58MXx8fHwxNzU1NDYxMzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'appetizers' as Category,
      name: 'Aperitivos',
      image: 'https://images.unsplash.com/photo-1732206048727-81dd4e6e9124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlbGVnYW50JTIwYXBwZXRpemVycyUyMGZvb2R8ZW58MXx8fHwxNzU1NDYxMzU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'dishes' as Category,
      name: 'Platos Principales',
      image: 'https://images.unsplash.com/photo-1579523609295-1ef35e6bd1c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtYWluJTIwZGlzaCUyMGVsZWdhbnQlMjByZXN0YXVyYW50fGVufDF8fHx8MTc1NTQ2MTM1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'desserts' as Category,
      name: 'Postres',
      image: 'https://images.unsplash.com/photo-1736959574670-a8ace9856e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxlbGVnYW50JTIwZGVzc2VydCUyMGNha2V8ZW58MXx8fHwxNzU1NDYxMzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ]

  return (
    <div className="min-h-screen p-8 relative bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">BIENVENIDO</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]">
            <HomeIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]">
            <User className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onViewBasket}
            className="relative w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]"
          >
            <ShoppingCart className="w-4 h-4" />
            {basketCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {basketCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Welcome message */}
      <div className="text-center mb-12">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic mb-4">Inicio</h2>
        <p className="text-gray-700">Bienvenido, {userName}</p>
      </div>

      {/* Categories grid */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="bg-white/80 backdrop-blur-sm border-[#8B4B6B]/20 hover:border-[#8B4B6B]/40 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="w-full h-24 rounded-lg overflow-hidden">
                    <ImageWithFallback 
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardTitle className="text-[#8B4B6B] font-medium text-center">{category.name}</CardTitle>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
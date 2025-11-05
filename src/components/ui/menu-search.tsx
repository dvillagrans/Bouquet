import React, { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MenuSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: 'name' | 'price-low' | 'price-high';
  onSortChange: (sort: 'name' | 'price-low' | 'price-high') => void;
}

export const MenuSearch: React.FC<MenuSearchProps> = ({
  searchTerm,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange('');
  };

  const resetFilters = () => {
    onPriceRangeChange([0, 50]);
    onSortChange('name');
    setShowFilters(false);
  };

  const hasActiveFilters = priceRange[0] > 0 || priceRange[1] < 50 || sortBy !== 'name';

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-buccaneer-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar platos, bebidas, postres..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg rounded-2xl border-2 border-buccaneer-200 focus:border-coral-tree-400 focus:ring-coral-tree-400 bg-white"
            aria-label="Buscar en el menú"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-buccaneer-100 rounded-full"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toggle and Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`
              rounded-xl border-2 transition-all duration-300
              ${showFilters 
                ? 'border-coral-tree-400 bg-coral-tree-50 text-coral-tree-700' 
                : 'border-buccaneer-200 hover:border-coral-tree-300'
              }
            `}
            aria-label="Mostrar filtros"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge className="ml-2 bg-coral-tree-500 text-white text-xs">
                {[
                  priceRange[0] > 0 || priceRange[1] < 50 ? 'Precio' : null,
                  sortBy !== 'name' ? 'Orden' : null
                ].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-buccaneer-500 hover:text-coral-tree-600 hover:bg-coral-tree-50 rounded-xl"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        <div className="flex items-center gap-2">
          {(priceRange[0] > 0 || priceRange[1] < 50) && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ${priceRange[0]} - ${priceRange[1]}
            </Badge>
          )}
          {sortBy !== 'name' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {sortBy === 'price-low' ? 'Precio: Menor a Mayor' : 'Precio: Mayor a Menor'}
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border-2 border-buccaneer-200 p-6 space-y-6 animate-fade-in">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-buccaneer-700 mb-3">
              Rango de Precio
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-buccaneer-500 mb-1">Mínimo</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={priceRange[0]}
                    onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
                    className="rounded-xl border-buccaneer-200"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-buccaneer-500 mb-1">Máximo</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={priceRange[1]}
                    onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
                    className="rounded-xl border-buccaneer-200"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-buccaneer-500">
                <span>$0</span>
                <span>$50</span>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-buccaneer-700 mb-3">
              Ordenar por
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'name', label: 'Nombre A-Z' },
                { value: 'price-low', label: 'Precio: Menor a Mayor' },
                { value: 'price-high', label: 'Precio: Mayor a Menor' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  onClick={() => onSortChange(option.value as any)}
                  className={`
                    rounded-xl transition-all duration-300
                    ${sortBy === option.value 
                      ? 'bg-coral-tree-500 text-white border-coral-tree-500' 
                      : 'border-buccaneer-200 hover:border-coral-tree-300 hover:bg-coral-tree-50'
                    }
                  `}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
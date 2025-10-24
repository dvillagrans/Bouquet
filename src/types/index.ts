export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image?: string;
}

export type MenuCategory = "drinks" | "breakfast" | "appetizers" | "dishes" | "desserts";

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  items: CartItem[];
  userName: string;
}

export interface SplitBill {
  totalAmount: number;
  people: Person[];
}

export interface Person {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
}

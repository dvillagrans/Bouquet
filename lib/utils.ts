import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generar código único para sesiones
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Formatear moneda
export function formatCurrency(amount: number, currency: string = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Calcular totales con impuestos y propina
export function calculateTotals(
  subtotal: number,
  taxRate: number = 16,
  tipRate: number = 10
) {
  const tax = (subtotal * taxRate) / 100;
  const tip = (subtotal * tipRate) / 100;
  const total = subtotal + tax + tip;

  return {
    subtotal,
    tax,
    tip,
    total,
  };
}

// Validar código de sesión
export function isValidSessionCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

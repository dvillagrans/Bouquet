import { z } from 'zod';

// Schema para crear una sesión
export const createSessionSchema = z.object({
  restaurant_name: z.string().min(1, 'El nombre del restaurante es requerido'),
  currency: z.string().default('MXN'),
  tip_rate: z.number().min(0).max(100).default(10),
  tax_rate: z.number().min(0).max(100).default(16),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// Schema para crear un item
export const createItemSchema = z.object({
  session_id: z.string().uuid(),
  name: z.string().min(1, 'El nombre del item es requerido'),
  qty: z.number().int().min(1),
  unit_price: z.number().positive(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

// Schema para asignar items
export const assignItemSchema = z.object({
  session_id: z.string().uuid(),
  item_id: z.string().uuid(),
  guest_id: z.string().min(1),
  fraction: z.number().min(0).max(1).default(1.0),
});

export type AssignItemInput = z.infer<typeof assignItemSchema>;

// Schema para crear payment intent
export const createPaymentIntentSchema = z.object({
  sessionId: z.string().uuid(),
  guestId: z.string().min(1),
  amount: z.number().positive(),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

// Schema para webhook de Stripe
export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
});

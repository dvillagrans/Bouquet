/**
 * Tipos locales para enums que ya no se exportan del cliente Prisma
 * tras la migración de schema. Se mantienen para compatibilidad con
 * el código existente mientras se adapta la lógica de negocio.
 */

export type TableStatus = "DISPONIBLE" | "OCUPADA" | "SUCIA" | "CERRANDO";

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

export type Station = "COCINA" | "BARRA";

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export type PaymentSplitMode = "FULL" | "EQUAL";

export type PaymentStatus = "PAID" | "PENDING";

export type ChainRole = "CHAIN_ADMIN" | "ZONE_MANAGER";

export type TableGroupStatus = "ACTIVE" | "CLOSED";

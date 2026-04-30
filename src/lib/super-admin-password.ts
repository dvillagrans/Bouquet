// Re-exporta desde el módulo unificado de contraseñas.
// Deprecado: importa directamente desde @/lib/auth-password
export { hashPassword as hashSuperAdminPassword, verifyPassword as verifySuperAdminPassword } from "./auth-password";

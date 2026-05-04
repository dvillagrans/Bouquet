export function enforcePasswordPolicy(plain: string): void {
  if (plain.length < 8) throw new Error("Password must be at least 8 characters");
  if (!/[A-Z]/.test(plain)) throw new Error("Password must contain an uppercase letter");
  if (!/[a-z]/.test(plain)) throw new Error("Password must contain a lowercase letter");
  if (!/[0-9]/.test(plain)) throw new Error("Password must contain a number");
  if (!/[^A-Za-z0-9]/.test(plain)) throw new Error("Password must contain a special character");
}

const fs = require('fs');

const path = 'src/actions/chain.ts';
let code = fs.readFileSync(path, 'utf8');

code += `
export async function setRestaurantAdminActive(input: {
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await prisma.staff.updateMany({
      where: { id: input.staffId, role: 'ADMIN' },
      data: { isActive: input.isActive },
    });
    if (res.count === 0) return { success: false, error: "Gerente no encontrado." };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}
`;

fs.writeFileSync(path, code);

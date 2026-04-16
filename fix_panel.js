const fs = require('fs');

const path = 'src/components/chain/ZoneStaffPanel.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(/import \{ createZoneStaffMember, getZoneStaff, setChainStaffActive \} from "@\/actions\/chain";/, `import { createZoneStaffMember, getZoneStaff, setRestaurantAdminActive } from "@/actions/chain";`);
code = code.replace(/import type \{ ChainStaffRow, ZoneStaffData \} from "@\/actions\/chain";/, `import type { RestaurantManagerRow, ZoneStaffData } from "@/actions/chain";`);

// Add restaurantId state
code = code.replace(/const \[pin, setPin\] = useState\(""\);/, `const [pin, setPin] = useState("");
  const [restaurantId, setRestaurantId] = useState("");`);

// Update load
code = code.replace(/const res = await getZoneStaff\(zid\);\n\s*setData\(res\);/, `const res = await getZoneStaff(zid);
      setData(res);
      if (res?.restaurants?.length && !restaurantId) {
        setRestaurantId(res.restaurants[0].id);
      }`);

// Update submit
code = code.replace(/const res = await createZoneStaffMember\(\{ zoneId, name, pin \}\);/, `if (!restaurantId) { setError("Selecciona una sucursal."); setCreating(false); return; }
    const res = await createZoneStaffMember({ zoneId, name, pin, restaurantId });`);

// Update toggle
code = code.replace(/const toggle = async \(row: ChainStaffRow\) => \{[\s\S]*?if \(res\.success && zoneId\) await load\(zoneId\);\n\s*\};/, `const toggle = async (row: RestaurantManagerRow) => {
    if (!data?.zone) return;
    setTogglingId(row.id);
    const res = await setRestaurantAdminActive({
      staffId: row.id,
      isActive: !row.isActive,
    });
    setTogglingId(null);
    if (res.success && zoneId) await load(zoneId);
  };`);

// Update forms
code = code.replace(/<div>\s*<label className="mb-1\.5 block text-\[10px\] font-medium uppercase tracking-\[0\.14em\] text-text-dim">\s*Nombre\s*<\/label>[\s\S]*?placeholder="Mínimo 4 caracteres"[\s\S]*?\/>\s*<\/div>\s*<\/div>/, `<div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Sucursal a la que asignas
                </label>
                <select
                  value={restaurantId}
                  onChange={(e) => {
                    setRestaurantId(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none transition-colors focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                >
                  <option value="" disabled>Selecciona sucursal...</option>
                  {(data?.restaurants ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Nombre completo
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-faint focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  required
                  minLength={4}
                  placeholder="Ej. 7890"
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 font-mono text-[14px] tracking-[0.2em] text-text-primary outline-none placeholder:text-text-faint placeholder:tracking-normal focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                />
              </div>
            </div>`);

// Update rows
code = code.replace(/<p className="mt-2 text-\[12px\] text-text-dim">Rol: ZONE_MANAGER<\/p>/g, `<p className="mt-2 text-[12px] text-text-dim">Sucursal Asignada: <span className="font-semibold text-text-primary">{row.restaurantName}</span></p>`);

// Fix grid cols
code = code.replace(/<div className="grid gap-4 md:grid-cols-2">/, `<div className="grid gap-4 md:grid-cols-3">`);


fs.writeFileSync(path, code);

"use client";

import { useState } from "react";
import { Plus, X, Building, MapPin, Map } from "lucide-react";
import { createRestaurantInChain } from "@/actions/chain";

interface ZoneData {
  id: string;
  name: string;
}

export default function CreateRestaurantDialog({
  chainId,
  zones,
  onCreated,
  onClose
}: {
  chainId: string;
  zones: ZoneData[];
  onCreated: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [newZoneName, setNewZoneName] = useState("");
  const [isNewZone, setIsNewZone] = useState(zones.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError("El nombre es requerido");
    if (isNewZone && !newZoneName) return setError("Especifica el nombre de la nueva zona");
    if (!isNewZone && !zoneId) return setError("Selecciona una zona");

    setLoading(true);
    setError("");

    try {
      const res = await createRestaurantInChain({
        chainId,
        name,
        address,
        zoneId: isNewZone ? undefined : zoneId,
        newZoneName: isNewZone ? newZoneName : undefined
      });
      if (res.success) {
        onCreated();
        onClose();
      } else {
        setError(res.error || "Error al crear la sucursal");
      }
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-solid/80 backdrop-blur-sm shadow-2xl">
      <div className="w-full max-w-md bg-bg-card border border-border-bright rounded-2xl overflow-hidden shadow-[0_0_60px_-15px_rgba(255,215,0,0.1)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-bg-hover text-text-dim hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-6 md:p-8">
           <h2 className="font-serif text-xl font-bold tracking-tight text-text-primary mb-1 flex items-center gap-2">
             <Building className="w-4 h-4 text-gold" />
             Nueva Sucursal
           </h2>
           <p className="text-xs text-text-muted mb-6">
             Agrega otra ubicación a tu cadena corporativa.
           </p>

           <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-dash-red-bg/50 border border-dash-red-border text-dash-red text-[11px] rounded-md text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim flex items-center gap-1.5">
                  Nombre Público
                </label>
                <input
                  autoFocus
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Trattoria Norte"
                  className="w-full bg-bg-solid border border-border-main rounded-md py-2 px-3 text-text-primary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-sans text-[13px] placeholder:text-text-faint"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Dirección (Opcional)
                </label>
                <input
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, Colonia, CP"
                  className="w-full bg-bg-solid border border-border-main rounded-md py-2 px-3 text-text-primary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-sans text-[13px] placeholder:text-text-faint"
                />
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center justify-between mb-1">
                   <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim flex items-center gap-1.5">
                     <Map className="w-3 h-3" />
                     Zona Geográfica
                   </label>
                   {zones.length > 0 && (
                     <button
                       type="button"
                       onClick={() => setIsNewZone(!isNewZone)}
                       className="text-[10px] text-gold hover:text-gold-light underline"
                     >
                       {isNewZone ? "Usar existente" : "+ Crear nueva"}
                     </button>
                   )}
                 </div>

                 {isNewZone ? (
                   <input
                     required
                     type="text" 
                     value={newZoneName}
                     onChange={(e) => setNewZoneName(e.target.value)}
                     placeholder="Nombre de la nueva Zona"
                     className="w-full bg-bg-solid border border-gold/40 rounded-md py-2 px-3 text-text-primary focus:outline-none focus:border-gold/80 focus:ring-1 focus:ring-gold/50 transition-all font-sans text-[13px] placeholder:text-text-faint"
                   />
                 ) : (
                   <select
                     required
                     value={zoneId}
                     onChange={(e) => setZoneId(e.target.value)}
                     className="w-full bg-bg-solid border border-border-main rounded-md py-2 px-3 text-text-primary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-sans text-[13px] appearance-none"
                   >
                     <option value="" disabled>Selecciona una zona</option>
                     {zones.map(z => (
                       <option key={z.id} value={z.id}>{z.name}</option>
                     ))}
                   </select>
                 )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-[11px] font-medium rounded-md text-bg-solid bg-gold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading ? "Creando sucursal..." : "Crear Sucursal"}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}

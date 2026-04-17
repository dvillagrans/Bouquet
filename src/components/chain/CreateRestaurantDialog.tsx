"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, MapPin } from "lucide-react";
import { createRestaurantInChain } from "@/actions/chain";
import { Map, Marker, ZoomControl } from "pigeon-maps";

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
  const [addressSearch, setAddressSearch] = useState("");
  const [colonia, setColonia] = useState("");
  const [cp, setCp] = useState("");
  const [alcaldia, setAlcaldia] = useState("");
  const [estado, setEstado] = useState("");
  
  const [zoneId, setZoneId] = useState("");
  const [newZoneName, setNewZoneName] = useState("");
  const [isNewZone, setIsNewZone] = useState(zones.length === 0);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Coordinate State (Default: CDMX)
  const [center, setCenter] = useState<[number, number]>([19.432608, -99.133209]);
  const [zoom, setZoom] = useState(13);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const darkTiles = (x: number, y: number, z: number, dpr?: number) => {
    return `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`;
  };

  useEffect(() => {
    if (!addressSearch || addressSearch.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            addressSearch
          )}&countrycodes=mx&format=json&addressdetails=1`
        );
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("Nominatim error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [addressSearch]);

  const selectAddress = (item: any) => {
    const addr = item.address || {};
    
    const street = addr.road || addr.pedestrian || "";
    const number = addr.house_number || "";
    const mainAddress = `${street} ${number}`.trim() || item.name || "";
    
    setAddressSearch(mainAddress);
    setColonia(addr.suburb || addr.neighbourhood || addr.residential || "");
    setCp(addr.postcode || "");
    setAlcaldia(addr.city || addr.town || addr.county || addr.municipality || "");
    setEstado(addr.state || "");
    
    setCenter([parseFloat(item.lat), parseFloat(item.lon)]);
    setZoom(16);
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError("El nombre es requerido");
    if (isNewZone && !newZoneName) return setError("El nombre de la nueva zona");
    if (!isNewZone && !zoneId) return setError("Selecciona una zona (o crea una)");

    setLoading(true);
    setError("");

    const finalAddressParts = [addressSearch, colonia, alcaldia, estado, cp].filter(Boolean);
    const finalAddressString = finalAddressParts.join(", ");

    try {
      const res = await createRestaurantInChain({
        chainId,
        name,
        address: finalAddressString,
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
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-[800px] h-[92vh] md:h-auto flex flex-col md:flex-row bg-[#222222] rounded-xl overflow-hidden shadow-2xl relative border border-[#333333] my-4 sm:my-8">
        
        {/* Left Col: MAP */}
        <div className="hidden md:block w-full md:w-2/5 h-48 md:h-auto border-b md:border-b-0 md:border-r border-[#333333] relative">
           <Map
             provider={darkTiles}
             center={center} 
             zoom={zoom} 
             onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom); }}
           >
             <Marker width={30} anchor={center} color="#E5A85A" />
             <ZoomControl style={{ bottom: 10, right: 10 }} />
           </Map>
           <div className="absolute top-4 left-4 z-10 pointer-events-none">
             <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#444] bg-[#2C2C2C]/80 backdrop-blur-sm text-[10px] text-[#DDDDDD] shadow-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-[#E5A85A] animate-pulse" />
               Live Locator
             </div>
           </div>
        </div>

        {/* Right Col: FORM */}
        <div className="w-full md:w-3/5 p-5 sm:p-6 md:p-8 flex flex-col h-full overflow-y-auto relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#888] hover:text-white transition-colors z-10 bg-[#333]/50"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-[20px] sm:text-[22px] font-semibold text-white mb-1 tracking-tight pr-6">
            Registra tu sucursal
          </h2>
          <p className="text-[12px] sm:text-[13px] text-[#A0A0A0] mb-5 sm:mb-6 max-w-md">
            Busca la dirección y autocompletaremos el formulario.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
             {error && (
               <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] rounded-md">
                 {error}
               </div>
             )}
             
             {/* Name */}
             <div className="space-y-1.5">
               <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">
                 Nombre de la sucursal
               </label>
               <input
                 required
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder="ej. Sucursal Polanco"
                 className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-3 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[14px] placeholder:text-[#555]"
               />
             </div>

             {/* Address Search */}
             <div className="space-y-1.5 relative">
               <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">
                 Dirección
               </label>
               <div className="relative">
                 <input
                   type="text" 
                   value={addressSearch}
                   onChange={(e) => setAddressSearch(e.target.value)}
                   onFocus={() => { if(searchResults.length > 0) setShowResults(true); }}
                   placeholder="Escribe tu calle y número..."
                   className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-3 pl-3 pr-10 text-white focus:outline-none focus:border-[#777] transition-all text-[14px] placeholder:text-[#555]"
                 />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                   {isSearching ? (
                     <span className="w-3.5 h-3.5 border-2 border-transparent border-t-[#888] rounded-full animate-spin" />
                   ) : (
                     <Search className="w-3.5 h-3.5 text-[#555]" />
                   )}
                 </div>
               </div>

               {/* Dropdown Results */}
               {showResults && searchResults.length > 0 && (
                 <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#2A2A2A] border border-[#444] rounded-md shadow-2xl overflow-hidden max-h-44 overflow-y-auto">
                   {searchResults.map((item, idx) => (
                     <button
                       key={idx}
                       type="button"
                       onClick={() => selectAddress(item)}
                       className="w-full text-left px-4 py-2.5 border-b border-[#333] hover:bg-[#333] transition-colors last:border-0"
                     >
                       <div className="text-[12px] text-white truncate">{item.display_name}</div>
                     </button>
                   ))}
                 </div>
               )}
             </div>

             {/* Geo Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div className="space-y-1.5">
                 <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">Colonia</label>
                 <input
                   type="text" 
                   value={colonia}
                   onChange={(e) => setColonia(e.target.value)}
                   placeholder="—"
                   className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-3 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[14px] placeholder:text-[#555]"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">Código Postal</label>
                 <input
                   type="text" 
                   value={cp}
                   onChange={(e) => setCp(e.target.value)}
                   placeholder="—"
                   className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-3 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[14px] placeholder:text-[#555]"
                 />
               </div>
               <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">Delegación / Estado</label>
                 <div className="flex gap-2">
                   <input
                     type="text" 
                     value={alcaldia}
                     onChange={(e) => setAlcaldia(e.target.value)}
                     placeholder="Alcaldía"
                     className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[13px] placeholder:text-[#555]"
                   />
                   <input
                     type="text" 
                     value={estado}
                     onChange={(e) => setEstado(e.target.value)}
                     placeholder="Estado"
                    className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-3 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[14px] placeholder:text-[#555]"
                   />
                 </div>
               </div>
             </div>

             {/* Zone Block */}
             <div className="space-y-1.5 pt-2 border-t border-[#333]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] tracking-[0.1em] uppercase text-[#A0A0A0]">
                    Zona Geográfica (Agrupador)
                  </label>
                  {zones.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewZone(!isNewZone)}
                      className="text-[10px] text-[#E5A85A] hover:text-[#FFCF84] transition-colors"
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
                    placeholder="Nombre de Zona (ej. Región Norte)"
                    className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[13px] placeholder:text-[#555]"
                  />
                ) : (
                  <select
                    required
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full bg-[#2A2A2A] border border-[#444] rounded-md py-2.5 px-3 text-white focus:outline-none focus:border-[#777] transition-all text-[13px] appearance-none"
                  >
                    <option value="" disabled>Selecciona la zona a la que pertenece</option>
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                )}
             </div>

             {/* Submit */}
             <div className="pt-4">
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full flex justify-center items-center py-3 px-4 rounded-md text-[#111] font-semibold bg-[#E5A85A] hover:bg-[#FFCF84] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
               >
                  {loading ? "Generando sucursal..." : "Confirmar Sucursal"}
               </button>
               <div className="text-center mt-3">
                 <span className="text-[9px] text-[#666]">Powered by OpenStreetMap & Pigeon Maps</span>
               </div>
             </div>
          </form>
        </div>
      </div>
    </div>
  );
}

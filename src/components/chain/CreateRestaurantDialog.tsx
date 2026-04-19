"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

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
      setError(err.message || "Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex touch-none flex-col justify-end bg-[#0a0a0a]/80 backdrop-blur-md animate-in fade-in-0 duration-300 md:touch-auto md:items-center md:justify-center md:overflow-y-auto md:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(96dvh,100%)] w-full max-w-4xl flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 border-b-0 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] animate-in fade-in-0 duration-300 md:my-4 md:max-h-[min(92vh,920px)] md:flex-row md:rounded-2xl md:border-b"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-restaurant-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Móvil: vista rápida del mapa (contexto espacial; desktop sigue en columna izquierda) */}
        <div className="relative h-[min(11rem,28dvh)] shrink-0 border-b border-white/5 md:hidden">
          <Map
            provider={darkTiles}
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            attribution={false}
          >
            <Marker width={28} anchor={center} color="#b7925d" />
            <ZoomControl style={{ bottom: 8, right: 8 }} />
          </Map>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] to-transparent py-6 pl-4">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-white/70">
              <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden />
              Ubicación según dirección
            </p>
          </div>
        </div>

        {/* Desktop: MAP lateral */}
        <div className="relative hidden h-auto w-full border-white/5 md:block md:w-2/5 md:border-r">
          <Map
            provider={darkTiles}
            center={center} 
            zoom={zoom} 
            onBoundsChanged={({ center, zoom }) => { setCenter(center); setZoom(zoom); }}
            attribution={false}
          >
            <Marker width={30} anchor={center} color="#b7925d" />
            <ZoomControl style={{ bottom: 10, right: 10 }} />
          </Map>
          <div className="absolute bottom-2 left-2 z-[6] rounded-md bg-[#0a0a0a]/80 backdrop-blur-md px-2 py-1 text-[9px] text-white/50 border border-white/10 pointer-events-auto">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener" className="hover:text-white transition-colors">© OSM</a>
            <span className="mx-1">·</span>
            <a href="https://carto.com/attributions" target="_blank" rel="noreferrer noopener" className="hover:text-white transition-colors">CARTO</a>
          </div>
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md text-[10px] font-medium tracking-widest uppercase text-white shadow-xl">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Locator
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="relative flex min-h-0 w-full flex-1 flex-col bg-[#0a0a0a] md:w-3/5">
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
              opacity: 0.04,
              mixBlendMode: "overlay",
            }}
            aria-hidden
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex size-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full bg-transparent text-white/45 ring-offset-background transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] sm:right-6 sm:top-6"
          >
            <X className="size-[1.125rem]" strokeWidth={2} aria-hidden />
          </button>

          <div className="relative z-10 flex min-h-0 flex-1 touch-auto flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.25rem,env(safe-area-inset-top))] sm:px-8 sm:pb-8 sm:pt-14">
            <header className="mb-6 shrink-0 sm:mb-8">
              <h2
                id="create-restaurant-title"
                className="mb-2 pr-12 font-serif text-[1.375rem] font-medium leading-tight tracking-tight text-white sm:text-2xl sm:pr-14"
              >
                Registra tu sucursal
              </h2>
              <p className="max-w-md text-base leading-relaxed text-text-dim lg:text-[14px]">
                Busca la dirección y autocompletaremos la posición comercial.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="relative flex flex-1 flex-col gap-5 pb-2 sm:gap-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 lg:text-[13px]">
                <span className="w-1 h-3 bg-red-500 rounded-full" />
                {error}
              </div>
            )}
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">
                Nombre de la sucursal
              </label>
              <input
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Sucursal Polanco"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
              />
            </div>

            {/* Address Search */}
            <div className="space-y-2 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">
                Dirección Base
              </label>
              <div className="relative">
                <input
                  type="text" 
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  onFocus={() => { if(searchResults.length > 0) setShowResults(true); }}
                  placeholder="Escribe tu calle y número..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-4 pr-10 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="size-4 text-text-dim animate-spin" />
                  ) : (
                    <Search className="size-4 text-text-dim" />
                  )}
                </div>
              </div>

              {/* Dropdown Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[min(14rem,40dvh)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectAddress(item)}
                      className="min-h-[48px] w-full border-b border-white/5 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-white/5 active:bg-white/10"
                    >
                      <div className="truncate text-sm text-white lg:text-[13px]">{item.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Geo Grid — una columna en móvil ancho; dos columnas desde sm */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">Colonia</label>
                <input
                  type="text" 
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="—"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">Código Postal</label>
                <input
                  type="text" 
                  value={cp}
                  onChange={(e) => setCp(e.target.value)}
                  placeholder="—"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                />
              </div>
              <div className="col-span-1 space-y-2 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">Entidad Federativa</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
                  <input
                    type="text" 
                    value={alcaldia}
                    onChange={(e) => setAlcaldia(e.target.value)}
                    placeholder="Alcaldía / Municipio"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                  />
                  <input
                    type="text" 
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="Estado"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                  />
                </div>
              </div>
            </div>

            {/* Zone Block */}
            <div className="space-y-3 pt-4 mt-2">
               <div className="flex flex-wrap items-center justify-between gap-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">
                   Zona (Agrupador)
                 </label>
                 {zones.length > 0 && (
                   <button
                     type="button"
                     onClick={() => setIsNewZone(!isNewZone)}
                     className="min-h-[44px] shrink-0 rounded-lg px-2 py-2 text-xs font-medium uppercase tracking-wider text-gold transition-colors hover:text-gold/80 active:bg-white/5 lg:min-h-0 lg:px-0 lg:py-1 lg:text-[11px]"
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
                   className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 placeholder:text-white/20 lg:text-[14px]"
                 />
               ) : (
                 <select
                   required
                   value={zoneId}
                   onChange={(e) => setZoneId(e.target.value)}
                   className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 appearance-none lg:text-[14px]"
                 >
                   <option value="" disabled className="text-black">Selecciona la zona a la que pertenece</option>
                   {zones.map(z => (
                     <option key={z.id} value={z.id} className="text-black">{z.name}</option>
                   ))}
                 </select>
               )}
            </div>

            {/* Submit — área táctil cómoda (adapt ≥44px) */}
            <div className="sticky bottom-0 mt-auto border-t border-white/[0.06] bg-[#0a0a0a]/95 pt-4 backdrop-blur-sm supports-[backdrop-filter]:bg-[#0a0a0a]/85">
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gold px-4 text-base font-medium text-bg-solid transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 md:hover:scale-[1.01] lg:text-[14px]"
              >
                 {loading ? (
                   <Loader2 className="size-5 animate-spin" />
                 ) : (
                   "Confirmar Sucursal"
                 )}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

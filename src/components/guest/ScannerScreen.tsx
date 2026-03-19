"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { ScanLine, X, AlertCircle } from "lucide-react";

export default function ScannerScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initScanner() {
      try {
        const hasCameras = await Html5Qrcode.getCameras();
        if (hasCameras && hasCameras.length > 0 && mounted) {
          const html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              if (mounted) {
                handleScan(decodedText);
              }
            },
            (errorMessage) => {
              // Ignore standard scanning frame errors
            }
          );
        } else {
          setError("No se encontraron cámaras en este dispositivo.");
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 
"No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.");
      }
    }

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  function handleScan(decodedText: string) {
    if (!isScanning) return;
    setIsScanning(false);
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    
    try {
      // The QR code could be a full URL (https://domain.com/mesa/X7B9K2) 
      // or just the raw layout ID
      let tableCode = decodedText;
      if (decodedText.includes('/mesa/')) {
         const url = new URL(decodedText);
         const parts = url.pathname.split('/');
         tableCode = parts[parts.length - 1]; // usually the last part
      }
      
      router.push(`/mesa/${tableCode}`);
    } catch {
      // For fallback if it's not a URL but raw string
      router.push(`/mesa/${decodedText}`);
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-ink overflow-hidden text-light">
      
      {/* Top Bar */}
      <header className="absolute top-0 z-10 flex w-full items-center justify-between p-6">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded-full bg-light/10 flex items-center justify-center">
             <div className="h-2 w-2 rounded-full bg-light" />
           </div>
           <span className="font-serif text-lg font-medium tracking-tight">Bouquet</span>
        </div>
        <button 
          onClick={() => {
             if (scannerRef.current?.isScanning) {
               scannerRef.current.stop().catch(console.error);
             }
             router.push('/');
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-light/10 backdrop-blur-md transition-colors hover:bg-light/20"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      
      {/* Scanner Viewport */}
      <div className="relative z-0 flex w-full flex-1 flex-col items-center justify-center">
        
        {error ? (
          <div className="flex flex-col items-center gap-4 px-8 text-center" style={{ animation: "reveal-up 0.5s both" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ember/10 text-ember">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-[0.9rem] text-light">{error}</p>
            <button 
               onClick={() => window.location.reload()}
               className="mt-4 border border-wire px-6 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-colors hover:border-light/30"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm px-6">
             <div 
               id="reader" 
               className="overflow-hidden rounded-2xl border border-wire bg-canvas/50"
             ></div>
             
             {/* Decorative overlay */}
             <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="relative aspect-square w-full sm:w-[250px] border-2 border-light/30 rounded-3xl">
                   <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-light -translate-x-[2px] -translate-y-[2px] rounded-tl-lg" />
                   <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-light translate-x-[2px] -translate-y-[2px] rounded-tr-lg" />
                   <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-light -translate-x-[2px] translate-y-[2px] rounded-bl-lg" />
                   <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-light translate-x-[2px] translate-y-[2px] rounded-br-lg" />
                </div>
             </div>
          </div>
        )}
        
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-12 z-10 flex flex-col items-center text-center px-6">
         <ScanLine className="mb-4 h-6 w-6 text-dim animate-pulse" />
         <p className="font-serif text-xl tracking-tight text-light">Escanea el código QR</p>
         <p className="mt-2 max-w-[280px] text-[0.8rem] text-dim">
           Apunta la cámara hacia el código en el centro de tu mesa para acceder al menú y ordenar.
         </p>
      </div>

    </main>
  );
}

import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add toast definition to states
state_old = r'''  const qrInviteCanvasRef = useRef<HTMLCanvasElement>\(null\);
  const \[qrInviteFullscreenOpen, setQrInviteFullscreenOpen\] = useState\(false\);

  const cuentaHref = \`/mesa/\$\{encodeURIComponent\(tableCode\)\}/cuenta\`;'''

state_new = r'''  const qrInviteCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrInviteFullscreenOpen, setQrInviteFullscreenOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const cuentaHref = `/mesa/${encodeURIComponent(tableCode)}/cuenta`;'''

text = re.sub(state_old, state_new, text)

# 2. Update alerts inside handleShareInvite
share_old = r'''      await navigator\.clipboard\.writeText\(url\);
      alert\("Enlace copiado \(este navegador no abre el menú de compartir\)\."\);
    \} catch \(err\) \{
      const e = err as \{ name\?: string \};
      if \(e\?\.name === "AbortError"\) return;
      try \{
        await navigator\.clipboard\.writeText\(url\);
        alert\("Enlace copiado al portapapeles\."\);
      \} catch \{
        alert\("No se pudo compartir\. Intenta de nuevo cuando cargue el QR\."\);
      \}
    \}'''

share_new = r'''      await navigator.clipboard.writeText(url);
      setToast({ type: "success", message: "Enlace de invitación copiado" });
    } catch (err) {
      const e = err as { name?: string };
      if (e?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setToast({ type: "success", message: "Enlace copiado al portapapeles" });
      } catch {
        setToast({ type: "error", message: "No se pudo compartir el enlace" });
      }
    }'''
text = re.sub(share_old, share_new, text)

# Also update the catch around getting URL
url_catch_old = r'''      \} catch \{
        alert\("No se pudo generar el enlace de invitación\."\);
        return;
      \}'''

url_catch_new = r'''      } catch {
        setToast({ type: "error", message: "No se pudo crear el enlace" });
        return;
      }'''
text = re.sub(url_catch_old, url_catch_new, text)

# 3. Add the Toast markup somewhere in the main render, perhaps just before <AnimatePresence> or inside the fragment.
render_target_old = r'''  return \(
    <>
      <div className\="relative flex flex-col"\>
        <TopNav guestName\=\{guestName\} partySize\=\{partySize\} tableCode\=\{displayTableCode\} isHostLive\=\{isHostLive\} \/\>'''

render_target_new = r'''  return (
    <>
      {toast && (
        <div
          className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{ animation: "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <div
            className={`flex items-center gap-3 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-full border ${
              toast.type === "error"
                ? "border-red-500/40 bg-white/95 text-red-600 guest-dark:bg-ink/90 guest-dark:text-red-400"
                : "border-text-primary/10 bg-bg-solid text-text-primary"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                toast.type === "error" ? "bg-red-500 animate-pulse" : "bg-gold"
              }`}
              aria-hidden="true"
            />
            <p className="text-[0.65rem] font-bold uppercase tracking-widest">{toast.message}</p>
          </div>
        </div>
      )}
      <div className="relative flex flex-col">
        <TopNav guestName={guestName} partySize={partySize} tableCode={displayTableCode} isHostLive={isHostLive} />'''

text = re.sub(render_target_old, render_target_new, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)

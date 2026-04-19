"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  motion,
  useReducedMotion as useFmReducedMotion,
  useDragControls,
  type PanInfo,
} from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
// Se mantiene la importación de Button por si se usa en el Footer
import { Button } from "@/components/ui/button"

const SHEET_BREAKPOINT_QUERY = "(max-width: 639px)"

function useMobileSheetBreakpoint() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {}
    const mq = window.matchMedia(SHEET_BREAKPOINT_QUERY)
    mq.addEventListener("change", onStoreChange)
    return () => mq.removeEventListener("change", onStoreChange)
  }, [])
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(SHEET_BREAKPOINT_QUERY).matches,
    () => false
  )
}

function DialogSheetMotionShell({
  children,
  dragEnabled,
}: {
  children: React.ReactNode
  dragEnabled: boolean
}) {
  const gestureCloseRef = React.useRef<HTMLButtonElement | null>(null)
  const dragControls = useDragControls()
  const reduceMotion = useFmReducedMotion()

  const dismissViaGesture = React.useCallback(() => {
    gestureCloseRef.current?.click()
  }, [])

  const onDragEnd = React.useCallback(
    (_evt: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const viewportH =
        typeof window !== "undefined" ? window.innerHeight : 640
      const dismissY = Math.max(
        72,
        Math.min(140, Math.round(viewportH * 0.16))
      )
      if (info.offset.y > dismissY || info.velocity.y > 420) {
        dismissViaGesture()
      }
    },
    [dismissViaGesture]
  )

  const interactiveDrag = dragEnabled && !reduceMotion

  return (
    <>
      {/* Cierre imperativo del gesto vía la misma ruta que Dialog.Close (closePress) */}
      <DialogPrimitive.Close
        ref={gestureCloseRef}
        render={
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
          />
        }
      >
        <span className="sr-only">Cerrar por gesto</span>
      </DialogPrimitive.Close>
      <motion.div
        drag={interactiveDrag ? "y" : false}
        dragControls={interactiveDrag ? dragControls : undefined}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 520 }}
        dragElastic={{ top: 0, bottom: 0.22 }}
        dragMomentum={false}
        onDragEnd={interactiveDrag ? onDragEnd : undefined}
        className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      >
      {interactiveDrag ? (
        <div className="flex shrink-0 touch-none items-center px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="w-11 shrink-0" aria-hidden />
          <div className="flex flex-1 justify-center py-2">
            <div
              className="flex cursor-grab justify-center rounded-full px-10 py-2 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span
                className="h-1 w-11 shrink-0 rounded-full bg-white/35"
                aria-hidden
              />
            </div>
          </div>
          <span className="sr-only">
            Arrastra hacia abajo para cerrar el panel
          </span>
          <div className="w-11 shrink-0" aria-hidden />
        </div>
      ) : null}
      {children}
      </motion.div>
    </>
  )
}

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 touch-none bg-[#0a0a0a]/80 backdrop-blur-md transition-all duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        /* Evita que el scroll del fondo “se cuele” en iOS cuando el modal está abierto */
        "overscroll-none",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const isMobileSheet = useMobileSheetBreakpoint()

  const noiseLayer = (
    <div
      className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000"
      style={{
        backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
        opacity: 0.04,
        mixBlendMode: "overlay",
      }}
      aria-hidden
    />
  )

  const closeButtonClasses =
    "absolute right-3 top-3 flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-transparent text-white/45 ring-offset-background transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:pointer-events-none sm:right-6 sm:top-6"

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 flex w-full flex-col gap-4 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] duration-300 outline-none",
          "p-6 max-sm:min-h-0 max-sm:p-0 sm:p-8",
          // Móvil — sheet: scroll dentro del shell; escritorio — scroll del popup
          "max-sm:flex max-sm:flex-col max-sm:gap-0 max-sm:overflow-hidden max-sm:overscroll-contain sm:overflow-hidden",
          // Móvil — bottom sheet
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[min(92dvh,100dvh)] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-[1.75rem] max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:border-t max-sm:border-white/10",
          "max-sm:data-open:animate-in max-sm:data-open:fade-in-0 max-sm:data-open:slide-in-from-bottom-6 max-sm:data-open:zoom-in-95",
          "max-sm:data-closed:animate-out max-sm:data-closed:fade-out-0 max-sm:data-closed:slide-out-to-bottom-6 max-sm:data-closed:zoom-out-95",
          // Desktop — modal centrado
          "sm:left-1/2 sm:top-1/2 sm:max-h-[min(90dvh,100dvh)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-white/10 sm:overflow-y-auto",
          "sm:data-open:animate-in sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-left-1/2 sm:data-open:slide-in-from-top-[48%]",
          "sm:data-closed:animate-out sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95 sm:data-closed:slide-out-to-left-1/2 sm:data-closed:slide-out-to-top-[48%]",
          className
        )}
        {...props}
      >
        {isMobileSheet ? (
          <DialogSheetMotionShell dragEnabled={isMobileSheet}>
            <div className="relative flex min-h-0 flex-1 flex-col">
              {noiseLayer}
              <div className="relative grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
                {children}
              </div>
              {showCloseButton && (
                <DialogPrimitive.Close
                  data-slot="dialog-close"
                  render={
                    <button type="button" className={closeButtonClasses} />
                  }
                >
                  <X
                    className="size-[1.125rem] sm:size-4"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="sr-only">Cerrar</span>
                </DialogPrimitive.Close>
              )}
            </div>
          </DialogSheetMotionShell>
        ) : (
          <>
            {noiseLayer}
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close
                data-slot="dialog-close"
                render={
                  <button type="button" className={closeButtonClasses} />
                }
              >
                <X
                  className="size-[1.125rem] sm:size-4"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="sr-only">Cerrar</span>
              </DialogPrimitive.Close>
            )}
          </>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-3 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-6 -mb-6 mt-6 flex flex-col-reverse gap-3 border-t border-white/5 bg-white/[0.02] px-6 py-5 max-sm:-mx-5 max-sm:gap-3.5 max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:-mb-8 sm:mt-8 sm:flex-row sm:justify-end sm:px-8",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" className="border-white/10 hover:bg-white/5 text-white" />}>
          Cerrar
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-serif text-2xl font-medium tracking-tight text-white leading-tight",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        /* ≥16px en móvil reduce zoom involuntario iOS (adapt) */
        "text-base leading-relaxed text-text-dim lg:text-[14px] lg:leading-relaxed *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-white",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

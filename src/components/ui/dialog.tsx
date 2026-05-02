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
        "fixed inset-0 z-50 bg-[#0A0507]/60 backdrop-blur-[12px] transition-all duration-500",
        "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
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

  const premiumBackdrop = (
    <>
      <div className="absolute inset-0 -z-10 bg-[#140C0F]/95 sm:bg-[#140C0F]/80 sm:backdrop-blur-3xl" />
      <div 
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(circle at 50% -20%, var(--color-rose-light), transparent 70%)"
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] transition-opacity duration-1000"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />
      {/* Silk Inner Border */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
    </>
  )

  const closeButtonClasses =
    "absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-glow/30 sm:right-6 sm:top-6"

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed z-50 flex w-full flex-col gap-4 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] outline-none duration-500",
          "max-sm:min-h-0 max-sm:p-0",
          // Layout
          "max-sm:flex max-sm:flex-col max-sm:gap-0 max-sm:overflow-hidden max-sm:overscroll-contain sm:overflow-hidden",
          // Móvil — bottom sheet
          "max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[92dvh] max-sm:rounded-t-[2rem] max-sm:border-t max-sm:border-white/10",
          "max-sm:data-open:animate-in max-sm:data-open:fade-in-0 max-sm:data-open:slide-in-from-bottom-full max-sm:data-closed:animate-out max-sm:data-closed:fade-out-0 max-sm:data-closed:slide-out-to-bottom-full",
          // Desktop — centered modal
          "sm:left-1/2 sm:top-1/2 sm:max-h-[90dvh] sm:max-w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] sm:p-0",
          "sm:data-open:animate-in sm:data-open:fade-in-0 sm:data-open:zoom-in-[0.98] sm:data-open:slide-in-from-top-[52%] sm:data-open:slide-in-from-left-1/2",
          "sm:data-closed:animate-out sm:data-closed:fade-out-0 sm:data-closed:zoom-out-[0.98] sm:data-closed:slide-out-to-top-[52%] sm:data-closed:slide-out-to-left-1/2",
          className
        )}
        {...props}
      >
        {isMobileSheet ? (
          <DialogSheetMotionShell dragEnabled={isMobileSheet}>
            <div className="relative flex min-h-0 flex-1 flex-col">
              {premiumBackdrop}
              <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-8 pt-4">
                {children}
              </div>
              {showCloseButton && (
                <DialogPrimitive.Close data-slot="dialog-close" render={<button type="button" className={closeButtonClasses} />}>
                  <X className="size-4" strokeWidth={2.5} />
                  <span className="sr-only">Cerrar</span>
                </DialogPrimitive.Close>
              )}
            </div>
          </DialogSheetMotionShell>
        ) : (
          <div className="relative flex flex-col p-8">
            {premiumBackdrop}
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close data-slot="dialog-close" render={<button type="button" className={closeButtonClasses} />}>
                <X className="size-4" strokeWidth={2.5} />
                <span className="sr-only">Cerrar</span>
              </DialogPrimitive.Close>
            )}
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
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
        "mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4",
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
        "font-serif text-2xl font-bold tracking-tight text-white",
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
        "text-[14px] leading-relaxed text-white/50",
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

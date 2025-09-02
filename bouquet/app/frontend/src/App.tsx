import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import WaiterView from './pages/WaiterView'
import GuestView from './pages/GuestView'
import SuccessView from './pages/SuccessView'
import SettingsView from './pages/SettingsView'
import { HomePage } from './components/HomePage'
import { RestaurantLobby } from './components/RestaurantLobby'
import { CreateTable } from './components/CreateTable'
import { JoinTable } from './components/JoinTable'
import { useNetworkStatus } from './lib/api'
import { Wifi, WifiOff } from 'lucide-react'
import { WebSocketProvider } from './contexts/WebSocketContext'

// Loading component
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="spinner mb-4 h-8 w-8 border-primary-600"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
)

// Network status indicator
const NetworkIndicator = () => {
  const isOnline = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-error-600 px-4 py-2 text-center text-white safe-top">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Sin conexión a internet</span>
      </div>
    </div>
  )
}

// PWA Update notification
const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = React.useState(false)

  React.useEffect(() => {
    const handleSWUpdate = () => {
      setShowUpdate(true)
    }

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate)

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate)
      }
    }
  }, [])

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-primary-600 p-4 text-white shadow-strong">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Actualización disponible</p>
          <p className="text-sm opacity-90">Nueva versión de la app lista</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-white px-3 py-1 text-sm font-medium text-primary-600 hover:bg-gray-100"
          >
            Actualizar
          </button>
          <button
            onClick={() => setShowUpdate(false)}
            className="rounded border border-white/30 px-3 py-1 text-sm font-medium hover:bg-white/10"
          >
            Después
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App component
function App() {
  return (
    <WebSocketProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Network status indicator */}
        <NetworkIndicator />

        {/* PWA update notification */}
        <PWAUpdateNotification />

        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
            },
          }}
        />

        {/* Main routing */}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Home - landing page with user type selection */}
            <Route path="/" element={<HomePage />} />

            {/* Waiter view - create new session */}
            <Route path="/waiter" element={<WaiterView />} />

            {/* Restaurant Lobby System */}
            <Route path="/restaurant/:slug" element={<RestaurantLobby />} />
            <Route path="/restaurant/:slug/create" element={<CreateTable />} />
            <Route path="/restaurant/:slug/join" element={<JoinTable />} />
            <Route path="/restaurant/:slug/menu" element={<GuestView />} />

            {/* Demo restaurant */}
            <Route path="/demo" element={<RestaurantLobby />} />

            {/* Guest view - join existing session */}
            <Route path="/join" element={<JoinTable />} />
            <Route path="/join/:sessionId" element={<GuestView />} />

            {/* Success view - payment confirmation */}
            <Route path="/success/:sessionId?" element={<SuccessView />} />

            {/* Payment view - direct payment link */}
            <Route
              path="/pay/:sessionId/:participantId"
              element={<GuestView />}
            />

            {/* Receipt view - session summary */}
            <Route
              path="/receipt/:sessionId"
              element={<SuccessView />}
            />

            {/* Settings page */}
            <Route path="/settings" element={<SettingsView />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* PWA install prompt (hidden by default) */}
        <div id="install-prompt" className="hidden">
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-strong">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Instalar Bouquet
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Accede rápidamente desde tu pantalla de inicio y úsala sin conexión
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const prompt = document.getElementById('install-prompt')
                      if (prompt) prompt.classList.add('hidden')
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Ahora no
                  </button>
                  <button
                    onClick={() => {
                      if ((window as any).installPWA) {
                        (window as any).installPWA()
                      }
                    }}
                    className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Instalar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebSocketProvider>
  )
}

export default App
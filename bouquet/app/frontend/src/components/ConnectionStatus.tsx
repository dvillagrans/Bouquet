import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

interface ConnectionStatusProps {
    showDetails?: boolean
}

export const ConnectionStatus = ({ showDetails = false }: ConnectionStatusProps) => {
    const { connectionStatus, isConnected } = useWebSocketContext()

    // No mostrar nada si está conectado
    if (isConnected) {
        return null
    }

    // Modo compacto para la barra superior
    if (!showDetails) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-warning-500 px-4 py-2 text-center text-white safe-top">
                <div className="flex items-center justify-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-sm font-medium">Modo sin tiempo real</span>
                </div>
            </div>
        )
    }

    // Modo detallado para mostrar en componentes
    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
                <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <div>
                        <p className="font-medium">Funcionando sin tiempo real</p>
                        <p className="text-sm text-muted-foreground">
                            {connectionStatus === 'error'
                                ? 'No se pudo conectar al servidor. Las actualizaciones automáticas están deshabilitadas.'
                                : 'Conectando al servidor de tiempo real...'
                            }
                        </p>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    )
}

export const ConnectedIndicator = () => {
    const { isConnected } = useWebSocketContext()

    if (!isConnected) return null

    return (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-lg bg-success-100 px-3 py-2 text-success-800 shadow-soft">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">En tiempo real</span>
        </div>
    )
}
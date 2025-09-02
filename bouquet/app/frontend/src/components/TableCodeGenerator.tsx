import { useState } from 'react'
import { useToast } from './ui/use-toast'
import { QrCode, MapPin, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface TableCodeGeneratorProps {
  onCodeGenerated?: (tableNumber: string) => void
  loading?: boolean
  className?: string
}

export const TableCodeGenerator: React.FC<TableCodeGeneratorProps> = ({
  onCodeGenerated,
  loading = false,
  className = ''
}) => {
  const { toast } = useToast()
  const [tableNumber, setTableNumber] = useState('')
  const [tableZone, setTableZone] = useState('salon')
  const [maxCapacity, setMaxCapacity] = useState('4')

  const handleGenerateCode = () => {
    const zonePrefix = tableZone === 'salon' ? 'S' : tableZone === 'terraza' ? 'T' : 'B'
    const newTableNumber = tableNumber || `${zonePrefix}-${Math.floor(Math.random() * 50) + 1}`

    onCodeGenerated?.(newTableNumber)
    toast({
      title: `Creando mesa: ${newTableNumber}`,
      description: `Zona: ${tableZone} • Capacidad: ${maxCapacity} personas`
    })
  }

  const getZoneIcon = (zone: string) => {
    switch (zone) {
      case 'terraza': return '🌿'
      case 'bar': return '🍺'
      default: return '🪑'
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Nueva Mesa
            </CardTitle>
            <CardDescription>
              Configura los detalles de la mesa y genera el código QR para comensales
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Clock className="w-3 h-3 mr-1" />
            Auto QR
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zona de la mesa */}
        <div className="space-y-2">
          <label htmlFor="zone" className="text-sm font-medium">
            Zona del restaurante
          </label>
          <select 
            id="zone" 
            value={tableZone} 
            onChange={(e) => setTableZone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona una zona</option>
            <option value="salon">🪑 Salón Principal</option>
            <option value="terraza">🌿 Terraza</option>
            <option value="bar">🍺 Zona de Bar</option>
          </select>
        </div>

        {/* Número de mesa */}
        <div className="space-y-2">
          <label htmlFor="table-number" className="text-sm font-medium">
            Identificador de Mesa
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="table-number"
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder={`Ej: ${getZoneIcon(tableZone)} Mesa 5, Rincón VIP...`}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Deja vacío para generar automáticamente
          </p>
        </div>

        {/* Capacidad máxima */}
        <div className="space-y-2">
          <label htmlFor="capacity" className="text-sm font-medium">
            Capacidad máxima
          </label>
          <select 
            id="capacity" 
            value={maxCapacity} 
            onChange={(e) => setMaxCapacity(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Número de comensales</option>
            <option value="2">👥 2 personas</option>
            <option value="4">👥 4 personas</option>
            <option value="6">👥 6 personas</option>
            <option value="8">👥 8+ personas</option>
          </select>
        </div>

        <div className="border-t my-4"></div>

        {/* Botón principal */}
        <Button
          onClick={handleGenerateCode}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Creando Mesa...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-5 w-5" />
              Crear Mesa con Código QR
            </>
          )}
        </Button>

        {/* Información adicional */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <QrCode className="h-4 w-4" />
            ¿Cómo funciona?
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">1</Badge>
              <span>Se genera automáticamente un código QR único</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">2</Badge>
              <span>Los comensales escanean el código o ingresan el código de 6 dígitos</span>
            </li>
            <li className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5 text-xs">3</Badge>
              <span>Acceden al menú digital y pueden realizar pedidos en tiempo real</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default TableCodeGenerator
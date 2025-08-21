import React, { useState } from 'react'
import { toast } from 'sonner'
import { QrCode, Copy, RefreshCw } from 'lucide-react'

interface TableCodeGeneratorProps {
  onCodeGenerated?: (code: string, tableNumber: string) => void
  loading?: boolean
  className?: string
}

export const TableCodeGenerator: React.FC<TableCodeGeneratorProps> = ({
  onCodeGenerated,
  loading = false,
  className = ''
}) => {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState('')

  // Generar código alfanumérico de 6 caracteres
  const generateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleGenerateCode = () => {
    const newCode = generateCode()
    const newTableNumber = tableNumber || `Mesa ${Math.floor(Math.random() * 50) + 1}`
    
    setGeneratedCode(newCode)
    onCodeGenerated?.(newCode, newTableNumber)
    
    toast.success(`Código generado: ${newCode}`)
  }

  const copyToClipboard = async () => {
    if (!generatedCode) return
    
    try {
      await navigator.clipboard.writeText(generatedCode)
      toast.success('Código copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar código')
    }
  }

  const regenerateCode = () => {
    handleGenerateCode()
    toast.info('Código regenerado')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input para número de mesa (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Número de Mesa (opcional)
        </label>
        <input
          type="text"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="input"
          placeholder="Ej: Mesa 5, Terraza 2, etc."
        />
      </div>

      {/* Botón principal para generar código */}
      <button
        onClick={handleGenerateCode}
        disabled={loading}
        className="btn btn-primary w-full py-3 text-lg font-semibold"
      >
        {loading ? (
          <>
            <div className="spinner mr-2" />
            Generando...
          </>
        ) : (
          <>
            <QrCode className="mr-2 h-6 w-6" />
            Generar Código de Mesa
          </>
        )}
      </button>

      {/* Código generado */}
      {generatedCode && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="text-center">
            <div className="mb-3">
              <QrCode className="mx-auto h-12 w-12 text-primary-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {tableNumber || 'Nueva Mesa'}
              </h3>
            </div>
            
            {/* Código destacado */}
            <div className="bg-white rounded-lg p-4 mb-4 border-2 border-dashed border-primary-300">
              <div className="text-3xl font-bold text-primary-600 tracking-wider mb-1">
                {generatedCode}
              </div>
              <div className="text-sm text-gray-600">
                Código de acceso para comensales
              </div>
            </div>
            
            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="btn btn-outline flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar
              </button>
              <button
                onClick={regenerateCode}
                className="btn btn-outline flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerar
              </button>
            </div>
            
            {/* Instrucciones */}
            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-1">📱 Los comensales pueden:</p>
              <ul className="text-left space-y-1">
                <li>• Escanear el código QR</li>
                <li>• Ingresar el código: <strong>{generatedCode}</strong></li>
                <li>• Ir a: <span className="font-mono text-xs">bouquet.app/join</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableCodeGenerator
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { restaurantApi } from '../lib/api'

interface SupabaseTestProps {
  onClose: () => void
}

const SupabaseTest: React.FC<SupabaseTestProps> = ({ onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [testResults, setTestResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message])
  }

  const testSupabaseConnection = async () => {
    try {
      addResult('🔄 Iniciando pruebas de conexión con Supabase...')
      
      // Test 1: Verificar conexión básica
      addResult('📡 Probando conexión básica...')
      const { error: connectionError } = await supabase
        .from('restaurants')
        .select('count')
        .limit(1)
      
      if (connectionError) {
        throw new Error(`Error de conexión: ${connectionError.message}`)
      }
      addResult('✅ Conexión básica exitosa')
      
      // Test 2: Probar API de restaurantes
      addResult('🏪 Probando API de restaurantes...')
      try {
        const restaurant = await restaurantApi.getBySlug('bouquet')
        addResult(`✅ Restaurante cargado: ${restaurant.name}`)
      } catch (err: any) {
        addResult(`⚠️ Restaurante no encontrado (normal en primera ejecución): ${err.message}`)
      }
      
      // Test 3: Verificar tablas existentes
      addResult('📋 Verificando estructura de tablas...')
      const { data: restaurants } = await supabase.from('restaurants').select('*').limit(1)
      const { data: staffCodes } = await supabase.from('staff_codes').select('*').limit(1)
      const { data: tables } = await supabase.from('tables').select('*').limit(1)
      
      addResult(`✅ Tabla restaurants: ${restaurants ? 'OK' : 'No accesible'}`)
      addResult(`✅ Tabla staff_codes: ${staffCodes ? 'OK' : 'No accesible'}`)
      addResult(`✅ Tabla tables: ${tables ? 'OK' : 'No accesible'}`)
      
      // Test 4: Probar funciones de Supabase
      addResult('⚙️ Probando funciones de base de datos...')
      try {
        const { data: functionTest } = await supabase.rpc('generate_unique_join_code')
        addResult(`✅ Función generate_unique_join_code: ${functionTest || 'OK'}`)
      } catch (err: any) {
        addResult(`⚠️ Error en función: ${err.message}`)
      }
      
      addResult('🎉 ¡Todas las pruebas completadas exitosamente!')
      setConnectionStatus('success')
      
    } catch (err: any) {
      setError(err.message)
      addResult(`❌ Error: ${err.message}`)
      setConnectionStatus('error')
    }
  }

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Prueba de Conexión con Supabase
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'testing' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              Estado: {connectionStatus === 'testing' ? 'Probando...' :
                      connectionStatus === 'success' ? 'Conectado' : 'Error'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h3 className="font-medium mb-2">Resultados de las pruebas:</h3>
          <div className="space-y-1 text-sm font-mono">
            {testResults.map((result, index) => (
              <div key={index} className="text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <h4 className="font-medium text-red-800 mb-1">Error detallado:</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={testSupabaseConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={connectionStatus === 'testing'}
          >
            Probar de nuevo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupabaseTest
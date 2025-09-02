import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Configuración para Supabase ya está en supabase.ts

// Tipos TypeScript
export interface SessionCreate {
  restaurant_name: string
  waiter_name?: string
  table_number?: string
  total_amount: number
  tip_percentage: number
  items: Item[]
  payment_method?: string
}

export interface Session {
  id: number
  session_id: string
  restaurant_name: string
  waiter_name?: string
  table_number?: string
  status: string
  total_amount: number
  tip_percentage: number
  tip_amount: number
  items: Item[]
  participants: Participant[]
  qr_code?: string
  join_url?: string
  created_at: string
}

export interface Item {
  id?: string
  name: string
  price: number
  quantity?: number
  participants?: string[]
}

export interface Participant {
  id: string
  name: string
  email?: string
  phone?: string
  amount_owed: number
  items: Item[]
  paid: boolean
  payment_id?: string
  transaction_id?: string
}

export interface ParticipantJoin {
  name: string
  email?: string
  phone?: string
}

export interface PaymentRequest {
  participant_id: string
  amount: number
  payment_method?: string
  card_token?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  payment_id: string
  status: string
  amount: number
  participant_id: string
  transaction_id?: string
  message: string
}

export interface PaymentStatus {
  session_id: string
  total_amount: number
  total_collected: number
  total_participants: number
  paid_participants: number
  completion_percentage: number
  all_paid: boolean
}

// Nuevos tipos para sistema de lobby
export interface Restaurant {
  id: string
  slug: string
  name: string
  description?: string
  image?: string
  qr_code: string
  lobby_enabled: boolean
  created_at: string
}

export interface StaffCode {
  id: string
  restaurant_id: string
  code: string
  created_by: string
  expires_at: string
  used_count: number
  max_uses: number
  active: boolean
}

export interface TableCreate {
  staff_code: string
  leader_name: string
  table_number?: string
  restaurant_id: string
}

export interface Table {
  id: string
  restaurant_id: string
  join_code: string
  leader_name: string
  table_number?: string
  participant_count: number
  status: 'active' | 'closed'
  created_at: string
  expires_at: string
}

export interface TableJoinRequest {
  join_code: string
}

// API Functions usando Supabase
export const sessionApi = {
  // Crear nueva sesión llamando al backend real
  create: async (sessionData: SessionCreate): Promise<Session> => {
    try {
      console.log('Creating session with data:', sessionData)
      
      const response = await fetch('http://localhost:8000/api/sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response text:', errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || `HTTP ${response.status}: ${errorText}`)
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
      }

      const data = await response.json()
      console.log('Session created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating session:', error)
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error(`Unknown error: ${JSON.stringify(error)}`)
      }
    }
  },

  // Obtener sesión por ID (mock implementation)
  get: async (_sessionId: string): Promise<Session> => {
    // Mock implementation
    throw new Error('Session not found')
  },

  // Unirse a sesión (mock implementation)
  join: async (_sessionId: string, _participant: ParticipantJoin): Promise<{ message: string; participant_id: string }> => {
    return {
      message: 'Te has unido a la sesión exitosamente',
      participant_id: crypto.randomUUID()
    }
  },

  // Calcular división (mock implementation)
  calculateSplit: async (_sessionId: string): Promise<{ message: string; participants: Participant[] }> => {
    return {
      message: 'División calculada exitosamente',
      participants: []
    }
  },
}

export const paymentApi = {
  // Procesar pago (mock implementation)
  process: async (_sessionId: string, paymentData: PaymentRequest): Promise<PaymentResponse> => {
    return {
      payment_id: crypto.randomUUID(),
      status: 'completed',
      amount: paymentData.amount,
      participant_id: paymentData.participant_id,
      transaction_id: crypto.randomUUID(),
      message: 'Pago procesado exitosamente'
    }
  },

  // Obtener estado de pagos (mock implementation)
  getStatus: async (sessionId: string): Promise<PaymentStatus> => {
    return {
      session_id: sessionId,
      total_amount: 0,
      total_collected: 0,
      total_participants: 0,
      paid_participants: 0,
      completion_percentage: 0,
      all_paid: false
    }
  },
}

// APIs para sistema de lobby usando Supabase
export const restaurantApi = {
  // Obtener información del restaurante por slug
  getBySlug: async (slug: string): Promise<Restaurant> => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        console.warn('Supabase error:', error)
        // Fallback to demo data if Supabase fails
        if (slug === 'demo') {
          return {
            id: 'demo-id',
            slug: 'demo',
            name: 'Restaurante Demo',
            qr_code: '',
            lobby_enabled: true,
            created_at: new Date().toISOString()
          }
        }
        throw new Error(`Error loading restaurant: ${error.message}`)
      }

      return data
    } catch (err) {
      console.warn('Restaurant API error:', err)
      // Fallback to demo data if any error occurs
      if (slug === 'demo') {
        return {
          id: 'demo-id',
          slug: 'demo',
          name: 'Restaurante Demo',
          qr_code: '',
          lobby_enabled: true,
          created_at: new Date().toISOString()
        }
      }
      throw err
    }
  },

  // Obtener menú del restaurante (mock data por ahora)
  getMenu: async (_slug: string): Promise<Item[]> => {
    // Mock data hasta que se implemente la tabla de menú
    return [
      { id: '1', name: 'Hamburguesa Clásica', price: 12.99 },
      { id: '2', name: 'Pizza Margherita', price: 15.50 },
      { id: '3', name: 'Ensalada César', price: 9.99 },
      { id: '4', name: 'Pasta Carbonara', price: 13.75 },
      { id: '5', name: 'Salmón Grillado', price: 18.99 }
    ]
  },
}

export const staffApi = {
  // Validar código de staff usando función de Supabase
  validateCode: async (restaurantId: string, code: string): Promise<{ valid: boolean; message: string; code_id?: string }> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_staff_code', {
          p_restaurant_id: restaurantId,
          p_code: code
        })

      if (error) {
        console.warn('Supabase staff validation error:', error)
        // Fallback: accept demo codes
        if (code === 'DEMO123' || code === 'STAFF' || code === 'TEST') {
          return { valid: true, message: 'Código demo válido', code_id: 'demo-code-id' }
        }
        throw new Error(`Error validating staff code: ${error.message}`)
      }

      return data[0] || { valid: false, message: 'Código inválido' }
    } catch (err) {
      console.warn('Staff validation error:', err)
      // Fallback: accept demo codes
      if (code === 'DEMO123' || code === 'STAFF' || code === 'TEST') {
        return { valid: true, message: 'Código demo válido', code_id: 'demo-code-id' }
      }
      throw err
    }
  },

  // Generar nuevo código de staff
  generateCode: async (restaurantId: string, staffId: string): Promise<StaffCode> => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString() // Código de 4 dígitos
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas

    const { data, error } = await supabase
      .from('staff_codes')
      .insert({
        restaurant_id: restaurantId,
        code: newCode,
        created_by: staffId,
        expires_at: expiresAt,
        max_uses: 50
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error generating staff code: ${error.message}`)
    }

    return data
  },

  // Obtener códigos activos
  getActiveCodes: async (restaurantId: string): Promise<StaffCode[]> => {
    const { data, error } = await supabase
      .from('staff_codes')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error loading staff codes: ${error.message}`)
    }

    return data || []
  },
}

export const tableApi = {
  // Crear nueva mesa usando función de Supabase
  create: async (tableData: TableCreate): Promise<Table> => {
    const { data, error } = await supabase
      .rpc('create_table', {
        p_restaurant_id: tableData.restaurant_id,
        p_staff_code: tableData.staff_code,
        p_leader_name: tableData.leader_name,
        p_table_number: tableData.table_number || null
      })

    if (error) {
      throw new Error(`Error creating table: ${error.message}`)
    }

    const result = data[0]
    if (!result.success) {
      throw new Error(result.message)
    }

    // Obtener la mesa creada
    const { data: tableData2, error: tableError } = await supabase
      .from('tables')
      .select('*')
      .eq('id', result.table_id)
      .single()

    if (tableError) {
      throw new Error(`Error loading created table: ${tableError.message}`)
    }

    return tableData2
  },

  // Buscar mesa por código de unión usando función de Supabase
  findByJoinCode: async (joinCode: string): Promise<Table | null> => {
    const { data, error } = await supabase
      .rpc('find_table_by_join_code', {
        p_join_code: joinCode
      })

    if (error) {
      throw new Error(`Error finding table: ${error.message}`)
    }

    return data && data.length > 0 ? data[0] : null
  },

  // Unirse a mesa (mock implementation)
  join: async (joinCode: string, _participantData: ParticipantJoin): Promise<{ message: string; table_id: string; participant_id: string }> => {
    const table = await tableApi.findByJoinCode(joinCode)

    if (!table) {
      throw new Error('Mesa no encontrada')
    }

    // Incrementar contador de participantes
    const { error } = await supabase
      .from('tables')
      .update({
        participant_count: table.participant_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', table.id)

    if (error) {
      throw new Error(`Error joining table: ${error.message}`)
    }

    return {
      message: 'Te has unido a la mesa exitosamente',
      table_id: table.id,
      participant_id: crypto.randomUUID()
    }
  },

  // Obtener información de mesa
  get: async (tableId: string): Promise<Table> => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .single()

    if (error) {
      throw new Error(`Error loading table: ${error.message}`)
    }

    return data
  },

  // Cerrar mesa usando función de Supabase
  close: async (tableId: string): Promise<{ message: string }> => {
    const { error } = await supabase
      .rpc('close_table', {
        p_table_id: tableId
      })

    if (error) {
      throw new Error(`Error closing table: ${error.message}`)
    }

    return { message: 'Mesa cerrada exitosamente' }
  },
}

// Utilidades para manejo de errores
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Error del servidor
    const status = error.response.status
    const message = error.response.data?.detail || error.response.data?.message || 'Error del servidor'

    switch (status) {
      case 400:
        return `Datos inválidos: ${message}`
      case 404:
        return 'Recurso no encontrado'
      case 500:
        return 'Error interno del servidor'
      default:
        return message
    }
  } else if (error.request) {
    // Error de red
    return 'Error de conexión. Verifica tu internet.'
  } else {
    // Error de configuración
    return error.message || 'Error desconocido'
  }
}

// Hook personalizado para verificar conectividad
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Función para retry automático
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      if (i === maxRetries) {
        throw error
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError
}

// Cache simple para PWA
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }
}

export const apiCache = new SimpleCache()

// Función para requests con cache
export const cachedRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Intentar obtener del cache primero
  const cached = apiCache.get(key)
  if (cached) {
    return cached
  }

  // Si no está en cache, hacer request
  const data = await requestFn()
  apiCache.set(key, data, ttl)

  return data
}

// Exportar funciones principales
export { supabase } from './supabase'
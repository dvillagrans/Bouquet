import axios, { AxiosResponse } from 'axios'
import { useState, useEffect } from 'react'

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar cache en PWA
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de red en PWA
    if (!navigator.onLine) {
      error.message = 'Sin conexión a internet. Verifica tu conexión.'
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Tiempo de espera agotado. Intenta nuevamente.'
    }
    return Promise.reject(error)
  }
)

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

// API Functions
export const sessionApi = {
  // Crear nueva sesión
  create: async (sessionData: SessionCreate): Promise<Session> => {
    const response: AxiosResponse<Session> = await api.post('/sessions/', sessionData)
    return response.data
  },

  // Obtener sesión por ID
  get: async (sessionId: string): Promise<Session> => {
    const response: AxiosResponse<Session> = await api.get(`/sessions/${sessionId}`)
    return response.data
  },

  // Unirse a sesión
  join: async (sessionId: string, participant: ParticipantJoin): Promise<{ message: string; participant_id: string }> => {
    const response = await api.post(`/sessions/${sessionId}/join`, participant)
    return response.data
  },

  // Calcular división
  calculateSplit: async (sessionId: string): Promise<{ message: string; participants: Participant[] }> => {
    const response = await api.put(`/sessions/${sessionId}/calculate`)
    return response.data
  },
}

export const paymentApi = {
  // Procesar pago
  process: async (sessionId: string, paymentData: PaymentRequest): Promise<PaymentResponse> => {
    const response: AxiosResponse<PaymentResponse> = await api.post(`/payments/${sessionId}/pay`, paymentData)
    return response.data
  },

  // Obtener estado de pagos
  getStatus: async (sessionId: string): Promise<PaymentStatus> => {
    const response: AxiosResponse<PaymentStatus> = await api.get(`/payments/${sessionId}/status`)
    return response.data
  },
}

// APIs para sistema de lobby
export const restaurantApi = {
  // Obtener información del restaurante por slug
  getBySlug: async (slug: string): Promise<Restaurant> => {
    const response: AxiosResponse<Restaurant> = await api.get(`/restaurants/${slug}`)
    return response.data
  },

  // Obtener menú del restaurante
  getMenu: async (slug: string): Promise<Item[]> => {
    const response: AxiosResponse<Item[]> = await api.get(`/restaurants/${slug}/menu`)
    return response.data
  },
}

export const staffApi = {
  // Validar código de staff
  validateCode: async (restaurantId: string, code: string): Promise<{ valid: boolean; message: string }> => {
    const response = await api.post(`/staff/validate-code`, {
      restaurant_id: restaurantId,
      code: code
    })
    return response.data
  },

  // Generar nuevo código de staff
  generateCode: async (restaurantId: string, staffId: string): Promise<StaffCode> => {
    const response: AxiosResponse<StaffCode> = await api.post(`/staff/generate-code`, {
      restaurant_id: restaurantId,
      staff_id: staffId
    })
    return response.data
  },

  // Obtener códigos activos
  getActiveCodes: async (restaurantId: string): Promise<StaffCode[]> => {
    const response: AxiosResponse<StaffCode[]> = await api.get(`/staff/codes/${restaurantId}`)
    return response.data
  },
}

export const tableApi = {
  // Crear nueva mesa
  create: async (tableData: TableCreate): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.post('/tables/', tableData)
    return response.data
  },

  // Buscar mesa por código de unión
  findByJoinCode: async (joinCode: string): Promise<Table | null> => {
    try {
      const response: AxiosResponse<Table> = await api.get(`/tables/join/${joinCode}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  // Unirse a mesa
  join: async (joinCode: string, participantData: ParticipantJoin): Promise<{ message: string; table_id: string; participant_id: string }> => {
    const response = await api.post(`/tables/join/${joinCode}`, participantData)
    return response.data
  },

  // Obtener información de mesa
  get: async (tableId: string): Promise<Table> => {
    const response: AxiosResponse<Table> = await api.get(`/tables/${tableId}`)
    return response.data
  },

  // Cerrar mesa
  close: async (tableId: string): Promise<{ message: string }> => {
    const response = await api.put(`/tables/${tableId}/close`)
    return response.data
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

export default api
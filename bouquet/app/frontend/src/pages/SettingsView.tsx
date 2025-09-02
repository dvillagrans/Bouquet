import { useState } from 'react'
import { ArrowLeft, Bell, HelpCircle, Download, Trash2, User, Palette, Database, Info, Wifi, Eye, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'


export default function SettingsView() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [username, setUsername] = useState('Usuario')
    const [email, setEmail] = useState('usuario@ejemplo.com')
    const [language, setLanguage] = useState('es')
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [soundEnabled, setSoundEnabled] = useState(true)

    const handleSaveProfile = () => {
        toast.success('Perfil actualizado correctamente')
    }

    const handleExportData = () => {
        toast.success('Datos exportados correctamente')
    }

    const handleDeleteData = () => {
        toast.success('Datos eliminados correctamente')
    }

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Alertas', icon: Bell },
        { id: 'appearance', label: 'Tema', icon: Palette },
        { id: 'data', label: 'Datos', icon: Database },
        { id: 'about', label: 'Info', icon: Info }
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-xl font-semibold">Configuración</h1>
                    </div>
                    <Badge variant="secondary">v1.0.0</Badge>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="grid w-full grid-cols-5 bg-muted p-1 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        Información personal
                                    </CardTitle>
                                    <CardDescription>
                                        Gestiona tu información personal y preferencias de cuenta
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-lg font-semibold">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <Button variant="outline" size="sm">
                                                Cambiar foto
                                            </Button>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                JPG, PNG hasta 2MB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="username" className="text-sm font-medium">Nombre de usuario</label>
                                            <Input
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="language" className="text-sm font-medium">Idioma</label>
                                        <select
                                            id="language"
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="es">Español</option>
                                            <option value="en">English</option>
                                            <option value="fr">Français</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleSaveProfile}>
                                            Guardar cambios
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-orange-600" />
                                        Notificaciones
                                    </CardTitle>
                                    <CardDescription>
                                        Configura cómo y cuándo recibir notificaciones
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-base">Notificaciones push</div>
                                            <div className="text-sm text-muted-foreground">
                                                Recibe notificaciones en tiempo real
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                notifications ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    notifications ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-base">Sonidos</div>
                                            <div className="text-sm text-muted-foreground">
                                                Reproducir sonidos para notificaciones
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSoundEnabled(!soundEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                soundEnabled ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-purple-600" />
                                        Apariencia
                                    </CardTitle>
                                    <CardDescription>
                                        Personaliza la apariencia de la aplicación
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-base">Modo oscuro</div>
                                            <div className="text-sm text-muted-foreground">
                                                Cambia entre tema claro y oscuro
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDarkMode(!darkMode)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                darkMode ? 'bg-primary' : 'bg-muted'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    darkMode ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Data Tab */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-green-600" />
                                        Gestión de datos
                                    </CardTitle>
                                    <CardDescription>
                                        Controla tus datos y privacidad
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Exportar mis datos
                                        </Button>
                                        <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteData}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar todos los datos
                                        </Button>
                                    </div>

                                    <div className="border-t my-4"></div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Eye className="h-4 w-4" />
                                                Política de privacidad
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-2 pl-6">
                                                <p>• Todos los datos se almacenan de forma segura y encriptada</p>
                                                <p>• No compartimos información personal con terceros sin tu consentimiento</p>
                                                <p>• Los datos de pago son procesados de forma segura por procesadores certificados</p>
                                                <p>• Puedes solicitar la eliminación de tus datos en cualquier momento</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Lock className="h-4 w-4" />
                                                Tus derechos sobre los datos
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-2 pl-6">
                                                <p>• Derecho de acceso: puedes solicitar una copia de tus datos</p>
                                                <p>• Derecho de rectificación: puedes corregir datos incorrectos</p>
                                                <p>• Derecho de supresión: puedes solicitar la eliminación de tus datos</p>
                                                <p>• Derecho de portabilidad: puedes exportar tus datos</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button variant="outline" className="w-full justify-start">
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            Contactar soporte sobre privacidad
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-gray-600" />
                                        Información de la aplicación
                                    </CardTitle>
                                    <CardDescription>
                                        Detalles sobre esta versión de Bouquet
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Versión</span>
                                            <p className="font-medium">1.0.0</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Build</span>
                                            <p className="font-medium">2024.01.001</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Última actualización</span>
                                            <p className="font-medium">25 Ago 2025</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Plataforma</span>
                                            <p className="font-medium">Web PWA</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Tamaño de la app</span>
                                            <p className="font-medium">2.4 MB</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-muted-foreground">Estado</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <p className="font-medium">Conectado</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t my-4"></div>

                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start">
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            Centro de ayuda
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Wifi className="h-4 w-4 mr-2" />
                                            Comprobar conexión
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Download className="h-4 w-4 mr-2" />
                                            Buscar actualizaciones
                                        </Button>
                                    </div>

                                    <div className="border-t my-4"></div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Términos de servicio
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Política de privacidad
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1">
                                            Licencias de código abierto
                                        </Button>
                                    </div>

                                    <div className="text-center text-sm text-muted-foreground pt-4">
                                        <p>Hecho con ❤️ por el equipo de Bouquet</p>
                                        <p className="text-xs mt-1">© 2025 Bouquet. Todos los derechos reservados.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Bottom spacing for mobile */}
                    <div className="h-8" />
                </div>
            </div>
        </div>
    )
}
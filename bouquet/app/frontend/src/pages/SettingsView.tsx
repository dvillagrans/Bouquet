import { useState } from 'react'
import { ArrowLeft, Bell, Moon, Sun, Shield, HelpCircle, Download, Trash2, User, Palette, Database, Info, Volume2, VolumeX, Wifi, Eye, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Checkbox } from '../components/ui/checkbox'
import { Slider } from '../components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'

export default function SettingsView() {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState(true)
    const [emailNotifications, setEmailNotifications] = useState(false)
    const [soundNotifications, setSoundNotifications] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [autoSync, setAutoSync] = useState(true)
    const [offlineMode, setOfflineMode] = useState(false)
    const [language, setLanguage] = useState('es')
    const [volume, setVolume] = useState([75])
    const [dataUsage, setDataUsage] = useState(true)
    const [analytics, setAnalytics] = useState(false)
    const [username, setUsername] = useState('Usuario')
    const [email, setEmail] = useState('usuario@example.com')

    const handleClearCache = () => {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name)
                })
            })
        }
        toast.success('Caché limpiado exitosamente')
    }

    const handleClearData = () => {
        localStorage.clear()
        sessionStorage.clear()
        toast.success('Datos eliminados exitosamente')
        navigate('/')
    }

    const handleSaveProfile = () => {
        toast.success('Perfil actualizado exitosamente')
    }

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
                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Perfil</span>
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Alertas</span>
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            <span className="hidden sm:inline">Tema</span>
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">Datos</span>
                        </TabsTrigger>
                        <TabsTrigger value="about" className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            <span className="hidden sm:inline">Info</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
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
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                                        <AvatarFallback className="text-lg">
                                            {username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
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
                                        <Label htmlFor="username">Nombre de usuario</Label>
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo electrónico</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language">Idioma</Label>
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                                            <SelectItem value="en">🇺🇸 English</SelectItem>
                                            <SelectItem value="pt">🇧🇷 Português</SelectItem>
                                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                                    Guardar cambios
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    Notificaciones
                                </CardTitle>
                                <CardDescription>
                                    Configura cómo y cuándo recibir notificaciones
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="push-notifications">Notificaciones push</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recibe alertas sobre pedidos y pagos en tiempo real
                                            </p>
                                        </div>
                                        <Switch
                                            id="push-notifications"
                                            checked={notifications}
                                            onCheckedChange={setNotifications}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="email-notifications">Notificaciones por email</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Recibe resúmenes semanales y actualizaciones importantes
                                            </p>
                                        </div>
                                        <Switch
                                            id="email-notifications"
                                            checked={emailNotifications}
                                            onCheckedChange={setEmailNotifications}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="sound-notifications">Sonidos de notificación</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Reproducir sonidos para nuevas notificaciones
                                            </p>
                                        </div>
                                        <Switch
                                            id="sound-notifications"
                                            checked={soundNotifications}
                                            onCheckedChange={setSoundNotifications}
                                        />
                                    </div>

                                    {soundNotifications && (
                                        <>
                                            <Separator />
                                            <div className="space-y-3">
                                                <Label>Volumen de notificaciones</Label>
                                                <div className="flex items-center gap-3">
                                                    <VolumeX className="h-4 w-4" />
                                                    <Slider
                                                        value={volume}
                                                        onValueChange={setVolume}
                                                        max={100}
                                                        step={1}
                                                        className="flex-1"
                                                    />
                                                    <Volume2 className="h-4 w-4" />
                                                    <span className="text-sm font-medium w-8">{volume[0]}%</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="auto-sync">Sincronización automática</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Mantener datos actualizados en tiempo real
                                            </p>
                                        </div>
                                        <Switch
                                            id="auto-sync"
                                            checked={autoSync}
                                            onCheckedChange={setAutoSync}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {darkMode ? (
                                        <Moon className="h-5 w-5 text-purple-600" />
                                    ) : (
                                        <Sun className="h-5 w-5 text-yellow-600" />
                                    )}
                                    Apariencia
                                </CardTitle>
                                <CardDescription>
                                    Personaliza la apariencia de la aplicación
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="dark-mode">Modo oscuro</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Cambia a un tema oscuro para mayor comodidad visual
                                            </p>
                                        </div>
                                        <Switch
                                            id="dark-mode"
                                            checked={darkMode}
                                            onCheckedChange={setDarkMode}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label>Tema de color</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Button variant="outline" className="h-16 flex-col gap-2">
                                                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                <span className="text-xs">Azul</span>
                                            </Button>
                                            <Button variant="outline" className="h-16 flex-col gap-2">
                                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                                <span className="text-xs">Verde</span>
                                            </Button>
                                            <Button variant="outline" className="h-16 flex-col gap-2">
                                                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                                                <span className="text-xs">Morado</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Data Tab */}
                    <TabsContent value="data" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-green-600" />
                                    Datos y almacenamiento
                                </CardTitle>
                                <CardDescription>
                                    Gestiona el almacenamiento y uso de datos de la aplicación
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="offline-mode">Modo sin conexión</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Permitir uso básico sin conexión a internet
                                            </p>
                                        </div>
                                        <Switch
                                            id="offline-mode"
                                            checked={offlineMode}
                                            onCheckedChange={setOfflineMode}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="data-usage">Optimizar uso de datos</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Reducir el consumo de datos móviles
                                            </p>
                                        </div>
                                        <Switch
                                            id="data-usage"
                                            checked={dataUsage}
                                            onCheckedChange={setDataUsage}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label>Administrar datos</Label>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleClearCache}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Limpiar caché (12.5 MB)
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar todos los datos
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Eliminará permanentemente todos los datos
                                                            almacenados localmente, incluyendo sesiones guardadas, configuraciones personales
                                                            y cualquier dato sin sincronizar.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleClearData}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            Sí, eliminar todo
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-indigo-600" />
                                    Privacidad y seguridad
                                </CardTitle>
                                <CardDescription>
                                    Controla cómo se usan tus datos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label htmlFor="analytics">Compartir datos de uso</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Ayúdanos a mejorar la app compartiendo datos anónimos de uso
                                        </p>
                                    </div>
                                    <Switch
                                        id="analytics"
                                        checked={analytics}
                                        onCheckedChange={setAnalytics}
                                    />
                                </div>

                                <Separator />

                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="privacy-policy">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Política de privacidad
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                                            <p>• Todos los datos se almacenan de forma segura y encriptada</p>
                                            <p>• No compartimos información personal con terceros sin tu consentimiento</p>
                                            <p>• Los datos de pago son procesados de forma segura por procesadores certificados</p>
                                            <p>• Puedes solicitar la eliminación de tus datos en cualquier momento</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="data-rights">
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Tus derechos sobre los datos
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-muted-foreground space-y-2">
                                            <p>• Derecho de acceso: puedes solicitar una copia de tus datos</p>
                                            <p>• Derecho de rectificación: puedes corregir datos incorrectos</p>
                                            <p>• Derecho de supresión: puedes solicitar la eliminación de tus datos</p>
                                            <p>• Derecho de portabilidad: puedes exportar tus datos</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <div className="pt-4">
                                    <Button variant="outline" className="w-full justify-start">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Contactar soporte sobre privacidad
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* About Tab */}
                    <TabsContent value="about" className="space-y-6">
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

                                <Separator />

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

                                <Separator />

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
                    </TabsContent>
                </Tabs>

                {/* Bottom spacing for mobile */}
                <div className="h-8" />
            </div>
        </div>
    )
}
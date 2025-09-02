import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Input,
    Badge,
    Alert,
    AlertDescription,
    AlertTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui';
import { ShoppingCart, Users, CreditCard, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ShadcnShowcase = () => {
    return (
        <div className="container-mobile py-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Bouquet UI Components</h1>
                <p className="text-muted-foreground">Componentes de shadcn/ui integrados con la identidad de Bouquet</p>
            </div>

            {/* Buttons Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Botones</CardTitle>
                    <CardDescription>
                        Diferentes variantes de botones manteniendo el estilo de Bouquet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button>Primario</Button>
                        <Button variant="secondary">Secundario</Button>
                        <Button variant="default">Éxito</Button>
                        <Button variant="outline">Advertencia</Button>
                        <Button variant="destructive">Error</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button size="sm">Pequeño</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Grande</Button>
                        <Button size="icon">
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cards Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-primary-600" />
                            <CardTitle>Mesa 4</CardTitle>
                        </div>
                        <CardDescription>2 comensales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            Orden en progreso. Tiempo estimado: 15 min
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Badge variant="default">Activa</Badge>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5 text-warning-600" />
                            <CardTitle>Pago Pendiente</CardTitle>
                        </div>
                        <CardDescription>Mesa 7</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            Total: $45.50
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Badge variant="secondary">Pendiente</Badge>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Nueva Orden</CardTitle>
                        <CardDescription>Crear nueva orden para mesa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="Número de mesa" />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Crear Orden</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Alerts Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Alertas</h2>

                <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>¡Orden completada!</AlertTitle>
                    <AlertDescription>
                        La orden de la mesa 3 ha sido completada exitosamente.
                    </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Atención requerida</AlertTitle>
                    <AlertDescription>
                        La mesa 5 ha estado esperando más de 20 minutos.
                    </AlertDescription>
                </Alert>

                <Alert variant="default">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Nueva característica</AlertTitle>
                    <AlertDescription>
                        Ahora puedes dividir la cuenta entre múltiples comensales.
                    </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de conexión</AlertTitle>
                    <AlertDescription>
                        No se pudo conectar con el servidor. Verifica tu conexión a internet.
                    </AlertDescription>
                </Alert>
            </div>

            {/* Dialog Example */}
            <Card>
                <CardHeader>
                    <CardTitle>Diálogos</CardTitle>
                    <CardDescription>
                        Modales y diálogos para interacciones importantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Abrir Diálogo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmar Acción</DialogTitle>
                                <DialogDescription>
                                    ¿Estás seguro de que quieres completar esta orden?
                                    Esta acción no se puede deshacer.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline">Cancelar</Button>
                                <Button>Confirmar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Input and Form Elements */}
            <Card>
                <CardHeader>
                    <CardTitle>Elementos de Formulario</CardTitle>
                    <CardDescription>
                        Inputs y controles de formulario con el estilo de Bouquet
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Nombre del plato</label>
                        <Input placeholder="Ingresa el nombre del plato" />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Precio</label>
                        <Input type="number" placeholder="0.00" />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">Cancelar</Button>
                        <Button className="flex-1">Guardar</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Badges showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Estados y Badges</CardTitle>
                    <CardDescription>
                        Indicadores visuales para diferentes estados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secundario</Badge>
                        <Badge variant="default">Disponible</Badge>
                        <Badge variant="outline">En espera</Badge>
                         <Badge variant="destructive">Agotado</Badge>
                        <Badge variant="outline">Outline</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ShadcnShowcase;
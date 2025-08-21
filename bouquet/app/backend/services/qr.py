import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SquareGradiantColorMask
from io import BytesIO
import base64
from typing import Optional

def generate_qr_code(
    data: str,
    size: int = 10,
    border: int = 4,
    error_correction: str = 'M',
    fill_color: str = 'black',
    back_color: str = 'white',
    styled: bool = False
) -> str:
    """Generar código QR y retornarlo como string base64"""
    
    # Configurar nivel de corrección de errores
    error_levels = {
        'L': qrcode.constants.ERROR_CORRECT_L,  # ~7%
        'M': qrcode.constants.ERROR_CORRECT_M,  # ~15%
        'Q': qrcode.constants.ERROR_CORRECT_Q,  # ~25%
        'H': qrcode.constants.ERROR_CORRECT_H   # ~30%
    }
    
    error_correct = error_levels.get(error_correction, qrcode.constants.ERROR_CORRECT_M)
    
    # Crear instancia de QR
    qr = qrcode.QRCode(
        version=1,  # Controla el tamaño (1 es el más pequeño)
        error_correction=error_correct,
        box_size=size,
        border=border,
    )
    
    # Agregar datos
    qr.add_data(data)
    qr.make(fit=True)
    
    # Generar imagen
    if styled:
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=SquareGradiantColorMask(
                back_color=(255, 255, 255),
                center_color=(0, 0, 0),
                edge_color=(0, 0, 0)
            )
        )
    else:
        img = qr.make_image(fill_color=fill_color, back_color=back_color)
    
    # Convertir a base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def generate_session_qr(
    session_id: str,
    base_url: str = "http://localhost:5173",
    custom_params: Optional[dict] = None
) -> str:
    """Generar QR específico para sesiones de split-bill"""
    
    # Construir URL de unión
    join_url = f"{base_url}/join/{session_id}"
    
    # Agregar parámetros personalizados si existen
    if custom_params:
        params = '&'.join([f"{k}={v}" for k, v in custom_params.items()])
        join_url += f"?{params}"
    
    # Generar QR con estilo personalizado para mejor apariencia
    return generate_qr_code(
        data=join_url,
        size=8,
        border=2,
        error_correction='M',
        styled=True
    )

def generate_payment_qr(
    session_id: str,
    participant_id: str,
    amount: float,
    base_url: str = "http://localhost:5173"
) -> str:
    """Generar QR para pago directo de un participante"""
    
    payment_url = f"{base_url}/pay/{session_id}/{participant_id}?amount={amount}"
    
    return generate_qr_code(
        data=payment_url,
        size=6,
        border=1,
        error_correction='H',  # Mayor corrección para URLs de pago
        fill_color='#1a365d',  # Azul oscuro
        back_color='white'
    )

def generate_receipt_qr(
    session_id: str,
    base_url: str = "http://localhost:5173"
) -> str:
    """Generar QR para ver recibo/resumen de la sesión"""
    
    receipt_url = f"{base_url}/receipt/{session_id}"
    
    return generate_qr_code(
        data=receipt_url,
        size=6,
        border=1,
        error_correction='M',
        fill_color='#2d3748',  # Gris oscuro
        back_color='white'
    )

def validate_qr_data(data: str) -> dict:
    """Validar y extraer información de datos de QR"""
    
    result = {
        'is_valid': False,
        'type': 'unknown',
        'data': {},
        'url': data
    }
    
    try:
        if '/join/' in data:
            # QR de unión a sesión
            session_id = data.split('/join/')[-1].split('?')[0]
            result.update({
                'is_valid': True,
                'type': 'join_session',
                'data': {'session_id': session_id}
            })
        
        elif '/pay/' in data:
            # QR de pago
            parts = data.split('/pay/')[-1].split('/')
            if len(parts) >= 2:
                session_id = parts[0]
                participant_id = parts[1].split('?')[0]
                result.update({
                    'is_valid': True,
                    'type': 'payment',
                    'data': {
                        'session_id': session_id,
                        'participant_id': participant_id
                    }
                })
        
        elif '/receipt/' in data:
            # QR de recibo
            session_id = data.split('/receipt/')[-1].split('?')[0]
            result.update({
                'is_valid': True,
                'type': 'receipt',
                'data': {'session_id': session_id}
            })
        
        return result
        
    except Exception as e:
        result['error'] = str(e)
        return result

def get_qr_info(qr_data: str) -> dict:
    """Obtener información detallada de un código QR"""
    
    validation = validate_qr_data(qr_data)
    
    info = {
        'url': qr_data,
        'is_split_bill_qr': validation['is_valid'],
        'type': validation['type'],
        'data': validation.get('data', {}),
        'instructions': get_qr_instructions(validation['type'])
    }
    
    if 'error' in validation:
        info['error'] = validation['error']
    
    return info

def get_qr_instructions(qr_type: str) -> str:
    """Obtener instrucciones para el usuario según el tipo de QR"""
    
    instructions = {
        'join_session': "Escanea este código para unirte a la sesión de división de cuenta",
        'payment': "Escanea este código para realizar tu pago",
        'receipt': "Escanea este código para ver el recibo de la sesión",
        'unknown': "Código QR no reconocido"
    }
    
    return instructions.get(qr_type, instructions['unknown'])
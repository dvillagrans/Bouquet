from typing import List, Dict, Any
import math

def calculate_split(
    items: List[Dict[str, Any]],
    participants: List[Dict[str, Any]],
    total_amount: float,
    tip_amount: float
) -> List[Dict[str, Any]]:
    """Calcular división de cuenta entre participantes"""
    
    if not participants:
        return []
    
    num_participants = len(participants)
    
    # Si no hay items específicos, dividir equitativamente
    if not items:
        return calculate_equal_split(participants, total_amount, tip_amount)
    
    # Calcular división basada en items seleccionados
    return calculate_item_based_split(items, participants, total_amount, tip_amount)

def calculate_equal_split(
    participants: List[Dict[str, Any]],
    total_amount: float,
    tip_amount: float
) -> List[Dict[str, Any]]:
    """División equitativa entre todos los participantes"""
    
    num_participants = len(participants)
    total_with_tip = total_amount + tip_amount
    
    # Calcular monto por persona
    amount_per_person = total_with_tip / num_participants
    
    # Manejar centavos restantes
    remainder_cents = int((total_with_tip * 100) % (num_participants * 100))
    
    updated_participants = []
    for i, participant in enumerate(participants):
        participant_copy = participant.copy()
        
        # Asignar monto base
        participant_copy['amount_owed'] = round(amount_per_person, 2)
        
        # Distribuir centavos restantes a los primeros participantes
        if i < remainder_cents:
            participant_copy['amount_owed'] += 0.01
        
        participant_copy['amount_owed'] = round(participant_copy['amount_owed'], 2)
        participant_copy['split_method'] = 'equal'
        participant_copy['items'] = []  # En división equitativa, no hay items específicos
        
        updated_participants.append(participant_copy)
    
    return updated_participants

def calculate_item_based_split(
    items: List[Dict[str, Any]],
    participants: List[Dict[str, Any]],
    total_amount: float,
    tip_amount: float
) -> List[Dict[str, Any]]:
    """División basada en items específicos seleccionados por cada participante"""
    
    # Inicializar montos
    participant_amounts = {p['id']: 0.0 for p in participants}
    participant_items = {p['id']: [] for p in participants}
    
    # Calcular subtotal de items asignados
    assigned_total = 0.0
    
    for item in items:
        item_price = item.get('price', 0.0)
        item_participants = item.get('participants', [])
        
        if item_participants:
            # Dividir item entre participantes asignados
            price_per_participant = item_price / len(item_participants)
            
            for participant_id in item_participants:
                if participant_id in participant_amounts:
                    participant_amounts[participant_id] += price_per_participant
                    participant_items[participant_id].append({
                        'name': item.get('name', 'Unknown item'),
                        'price': item_price,
                        'shared_with': len(item_participants),
                        'individual_cost': round(price_per_participant, 2)
                    })
            
            assigned_total += item_price
    
    # Calcular items no asignados (diferencia entre total y items asignados)
    unassigned_amount = total_amount - assigned_total
    
    # Distribuir items no asignados equitativamente
    if unassigned_amount > 0:
        unassigned_per_participant = unassigned_amount / len(participants)
        for participant_id in participant_amounts:
            participant_amounts[participant_id] += unassigned_per_participant
    
    # Distribuir propina proporcionalmente
    if tip_amount > 0:
        for participant_id in participant_amounts:
            if total_amount > 0:
                tip_proportion = participant_amounts[participant_id] / total_amount
                participant_tip = tip_amount * tip_proportion
                participant_amounts[participant_id] += participant_tip
    
    # Actualizar participantes
    updated_participants = []
    for participant in participants:
        participant_copy = participant.copy()
        participant_id = participant['id']
        
        participant_copy['amount_owed'] = round(participant_amounts[participant_id], 2)
        participant_copy['split_method'] = 'item_based'
        participant_copy['items'] = participant_items[participant_id]
        
        updated_participants.append(participant_copy)
    
    return updated_participants

def calculate_custom_split(
    participants: List[Dict[str, Any]],
    custom_amounts: Dict[str, float],
    total_amount: float,
    tip_amount: float
) -> List[Dict[str, Any]]:
    """División personalizada con montos específicos por participante"""
    
    total_with_tip = total_amount + tip_amount
    assigned_total = sum(custom_amounts.values())
    
    # Verificar que los montos personalizados no excedan el total
    if assigned_total > total_with_tip:
        raise ValueError("Custom amounts exceed total bill amount")
    
    # Calcular diferencia para distribuir
    remaining_amount = total_with_tip - assigned_total
    participants_without_custom = [
        p for p in participants 
        if p['id'] not in custom_amounts
    ]
    
    updated_participants = []
    for participant in participants:
        participant_copy = participant.copy()
        participant_id = participant['id']
        
        if participant_id in custom_amounts:
            # Usar monto personalizado
            participant_copy['amount_owed'] = round(custom_amounts[participant_id], 2)
        elif participants_without_custom:
            # Distribuir monto restante equitativamente
            remaining_per_participant = remaining_amount / len(participants_without_custom)
            participant_copy['amount_owed'] = round(remaining_per_participant, 2)
        else:
            participant_copy['amount_owed'] = 0.0
        
        participant_copy['split_method'] = 'custom'
        updated_participants.append(participant_copy)
    
    return updated_participants

def validate_split(
    participants: List[Dict[str, Any]],
    expected_total: float,
    tolerance: float = 0.01
) -> Dict[str, Any]:
    """Validar que la división sea correcta"""
    
    calculated_total = sum(p.get('amount_owed', 0) for p in participants)
    difference = abs(calculated_total - expected_total)
    
    return {
        'is_valid': difference <= tolerance,
        'expected_total': expected_total,
        'calculated_total': calculated_total,
        'difference': difference,
        'tolerance': tolerance
    }
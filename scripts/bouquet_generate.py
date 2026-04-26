"""
Bouquet OPS — Generador de datos sintéticos contextualizados
Trabajo Terminal 2026-B142 · IPN ESCOM

Uso:
    pip install anthropic
    export ANTHROPIC_API_KEY="sk-ant-..."
    python bouquet_generate.py

El JSON resultante se guarda en output_cafeteria_1.json
Cambia el perfil en PERFIL_CAFETERIA para cada cafetería.
"""

import anthropic
import json
import os
import re

# ─────────────────────────────────────────────────────────────────────────────
# PERFIL DE LA CAFETERÍA
# Cambia estos valores con los datos reales de cada entrevista
# ─────────────────────────────────────────────────────────────────────────────
PERFIL_CAFETERIA = {
    "nombre":         "Cafetería Edificio 1 — ESCOM",
    "num_mesas":      8,
    "apertura":       "07:00",
    "cierre":         "17:00",
    "dias":           "Lunes a Viernes",
    "ordenes_normal": 80,      # órdenes en día normal
    "ordenes_tranq":  30,      # órdenes en día tranquilo
    "horas_pico":     [8, 9, 10, 13, 14],
    "menu": [
        {"nombre": "Torta de milanesa",   "precio": 40},
        {"nombre": "Torta de jamón",       "precio": 30},
        {"nombre": "Café americano",       "precio": 20},
        {"nombre": "Café con leche",       "precio": 22},
        {"nombre": "Agua fresca",          "precio": 15},
        {"nombre": "Quesadilla",           "precio": 25},
        {"nombre": "Tamal",                "precio": 18},
        {"nombre": "Arroz con leche",      "precio": 20},
        {"nombre": "Yogurt con granola",   "precio": 28},
        {"nombre": "Galletas",             "precio": 10},
    ],
    "productos_lentos":    ["Arroz con leche", "Yogurt con granola", "Galletas"],
    "pagos": {
        "efectivo":     75,   # porcentaje
        "transferencia": 20,
        "tarjeta":       5,
    },
    "reduccion_vacaciones": 70,   # % de reducción en vacaciones
    "semana_parciales": "Más café, menos comida completa, pagan más rápido, mayor concurrencia 7–9am",
    "splits":           True,     # ¿ocurren splits de pago?
}

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURACIÓN DE GENERACIÓN
# ─────────────────────────────────────────────────────────────────────────────
NUM_ORDENES  = 300          # cuántas órdenes generar
FECHA_DESDE  = "2024-02-01"
FECHA_HASTA  = "2024-06-30"
ARCHIVO_OUT  = "output_cafeteria_1.json"

# ─────────────────────────────────────────────────────────────────────────────
# PROMPT
# ─────────────────────────────────────────────────────────────────────────────
def construir_prompt(perfil: dict, n: int, desde: str, hasta: str) -> str:
    menu_str = "\n".join(
        f"  - {p['nombre']} — ${p['precio']}"
        for p in perfil["menu"]
    )
    pagos_str = (
        f"efectivo {perfil['pagos']['efectivo']}% / "
        f"transferencia {perfil['pagos']['transferencia']}% / "
        f"tarjeta {perfil['pagos']['tarjeta']}%"
    )
    picos_str = ", ".join(str(h) + ":00" for h in perfil["horas_pico"])

    return f"""Eres un generador experto de datos sintéticos para sistemas de gestión de restaurantes universitarios en México.

Genera exactamente {n} órdenes de cafetería con los siguientes parámetros reales recolectados en entrevista de campo:

## PERFIL DE LA CAFETERÍA
Nombre: {perfil['nombre']}
Mesas: {perfil['num_mesas']}
Horario: {perfil['apertura']} a {perfil['cierre']}, {perfil['dias']}
Órdenes en día normal: ~{perfil['ordenes_normal']}
Órdenes en día tranquilo: ~{perfil['ordenes_tranq']}
Horas pico: {picos_str}

## MENÚ
{menu_str}
Productos de baja rotación (frecuencia < 8%): {', '.join(perfil['productos_lentos'])}

## PAGOS
Distribución: {pagos_str}
Splits entre comensales: {'Sí, ~5% de órdenes' if perfil['splits'] else 'No ocurren'}

## CALENDARIO ESCOLAR IPN
Semestres activos: Feb–Jun y Ago–Dic
Vacaciones verano: julio completo (reducción {perfil['reduccion_vacaciones']}% del volumen)
Vacaciones diciembre: 16 dic en adelante (reducción {perfil['reduccion_vacaciones']}% del volumen)
Semana Santa: tercera semana de abril (reducción 60%)
Semana de parciales (semanas 8 y 16 de cada semestre): {perfil['semana_parciales']}

## PERÍODO
Desde: {desde}
Hasta: {hasta}

## REGLAS DE GENERACIÓN
- Devuelve ÚNICAMENTE un JSON array válido. Sin markdown, sin texto, sin explicaciones.
- El array debe tener exactamente {n} objetos.
- Estructura de cada orden:
{{
  "order_id": "uuid-v4",
  "restaurant_name": "{perfil['nombre']}",
  "table_number": <entero 1–{perfil['num_mesas']}>,
  "created_at": "<ISO8601 con hora realista según horas pico>",
  "status": "completed" | "cancelled",
  "duration_minutes": <entero, tiempo total de la orden>,
  "items": [
    {{
      "product_name": "<nombre exacto del menú>",
      "quantity": <entero>,
      "unit_price": <precio numérico>
    }}
  ],
  "payment": {{
    "method": "cash" | "transfer" | "card",
    "total": <suma de items>,
    "split": true | false
  }}
}}
- 3–4% de órdenes deben tener status "cancelled" (sin items ni payment)
- Distribuye timestamps de forma realista: más órdenes en horas pico, menos en horas muertas
- Aplica estacionalidad: menos órdenes en vacaciones, más en inicio de semestre
- En semana de parciales ajusta el mix de productos según lo indicado
- Los productos de baja rotación deben aparecer con frecuencia menor al 8%
- duration_minutes varía por hora: en pico 5–12 min, en horas muertas 8–20 min"""


# ─────────────────────────────────────────────────────────────────────────────
# GENERACIÓN
# ─────────────────────────────────────────────────────────────────────────────
def generar(perfil: dict, n: int, desde: str, hasta: str) -> list:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "Falta ANTHROPIC_API_KEY. Ejecútalo así:\n"
            "  export ANTHROPIC_API_KEY='sk-ant-...'\n"
            "  python bouquet_generate.py"
        )

    client = anthropic.Anthropic(api_key=api_key)
    prompt = construir_prompt(perfil, n, desde, hasta)

    print(f"  Llamando a Claude API ({n} órdenes)...")
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=16000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    # Limpiar posibles bloques markdown
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    return json.loads(raw)


# ─────────────────────────────────────────────────────────────────────────────
# VALIDACIÓN Y STATS
# ─────────────────────────────────────────────────────────────────────────────
def validar_y_mostrar(ordenes: list, perfil: dict):
    total       = len(ordenes)
    completadas = [o for o in ordenes if o.get("status") == "completed"]
    canceladas  = [o for o in ordenes if o.get("status") == "cancelled"]
    todos_items = [i for o in completadas for i in o.get("items", [])]

    ingresos    = sum(o["payment"]["total"] for o in completadas if "payment" in o)
    ticket_prom = ingresos / len(completadas) if completadas else 0

    metodos = {}
    for o in completadas:
        m = o.get("payment", {}).get("method", "unknown")
        metodos[m] = metodos.get(m, 0) + 1

    conteo_prod = {}
    for item in todos_items:
        p = item.get("product_name", "?")
        conteo_prod[p] = conteo_prod.get(p, 0) + item.get("quantity", 1)

    top5 = sorted(conteo_prod.items(), key=lambda x: x[1], reverse=True)[:5]

    print("\n" + "─" * 52)
    print("  VALIDACIÓN DE DATOS GENERADOS")
    print("─" * 52)
    print(f"  Total órdenes:      {total}")
    print(f"  Completadas:        {len(completadas)}")
    print(f"  Canceladas:         {len(canceladas)} ({len(canceladas)/total*100:.1f}%)")
    print(f"  Items generados:    {len(todos_items)}")
    print(f"  Ticket promedio:    ${ticket_prom:.2f}")
    print(f"  Ingresos totales:   ${ingresos:,.2f}")
    print(f"\n  Métodos de pago:")
    for m, c in metodos.items():
        print(f"    {m:15s}  {c:3d}  ({c/len(completadas)*100:.1f}%)")
    print(f"\n  Top 5 productos:")
    for prod, cnt in top5:
        print(f"    {prod[:30]:30s}  {cnt}")
    print("─" * 52)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n  Bouquet OPS — Generador de datos sintéticos")
    print(f"  Cafetería: {PERFIL_CAFETERIA['nombre']}")
    print(f"  Período:   {FECHA_DESDE} → {FECHA_HASTA}")
    print(f"  Órdenes:   {NUM_ORDENES}\n")

    ordenes = generar(PERFIL_CAFETERIA, NUM_ORDENES, FECHA_DESDE, FECHA_HASTA)

    validar_y_mostrar(ordenes, PERFIL_CAFETERIA)

    with open(ARCHIVO_OUT, "w", encoding="utf-8") as f:
        json.dump(ordenes, f, ensure_ascii=False, indent=2)

    print(f"\n  JSON guardado en: {ARCHIVO_OUT}")
    print("  Siguiente paso: script de inserción a Supabase.\n")

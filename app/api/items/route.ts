import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createItemSchema } from '@/lib/schemas';

// POST /api/items - Crear un nuevo item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createItemSchema.parse(body);

    // Verificar que la sesión existe y está abierta
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('id, status')
      .eq('id', validatedData.session_id)
      .single();

    if (!session || session.status !== 'open') {
      return NextResponse.json(
        { error: 'Sesión no encontrada o cerrada' },
        { status: 400 }
      );
    }

    // Crear item
    const { data: item, error } = await supabaseAdmin
      .from('items')
      .insert({
        session_id: validatedData.session_id,
        name: validatedData.name,
        qty: validatedData.qty,
        unit_price: validatedData.unit_price,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json(
        { error: 'Error al crear el item' },
        { status: 500 }
      );
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}

// GET /api/items?session_id=xxx - Obtener items de una sesión
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    const { data: items, error } = await supabaseAdmin
      .from('items')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json(
        { error: 'Error al obtener items' },
        { status: 500 }
      );
    }

    return NextResponse.json(items || []);
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

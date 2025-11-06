import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { assignItemSchema } from '@/lib/schemas';

// POST /api/assign - Asignar un item a un guest
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = assignItemSchema.parse(body);

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

    // Verificar que el item existe
    const { data: item } = await supabaseAdmin
      .from('items')
      .select('id')
      .eq('id', validatedData.item_id)
      .eq('session_id', validatedData.session_id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 400 }
      );
    }

    // Crear asignación
    const { data: assignment, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        session_id: validatedData.session_id,
        item_id: validatedData.item_id,
        guest_id: validatedData.guest_id,
        fraction: validatedData.fraction,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      return NextResponse.json(
        { error: 'Error al crear la asignación' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assign:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}

// GET /api/assign?session_id=xxx&guest_id=yyy - Obtener asignaciones
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const guestId = searchParams.get('guest_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('assignments')
      .select('*, items(*)')
      .eq('session_id', sessionId);

    if (guestId) {
      query = query.eq('guest_id', guestId);
    }

    const { data: assignments, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      return NextResponse.json(
        { error: 'Error al obtener asignaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignments || []);
  } catch (error) {
    console.error('Error in GET /api/assign:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createSessionSchema } from '@/lib/schemas';
import { generateSessionCode } from '@/lib/utils';

// POST /api/sessions - Crear una nueva sesión
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createSessionSchema.parse(body);

    // Generar código único
    const code = generateSessionCode();

    // Crear sesión en Supabase
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        code,
        restaurant_name: validatedData.restaurant_name,
        currency: validatedData.currency,
        tip_rate: validatedData.tip_rate,
        tax_rate: validatedData.tax_rate,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Error al crear la sesión' },
        { status: 500 }
      );
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 400 }
    );
  }
}

// GET /api/sessions?code=ABC123 - Obtener sesión por código
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Código de sesión requerido' },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'open')
      .single();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

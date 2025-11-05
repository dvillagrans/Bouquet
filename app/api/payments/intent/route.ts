import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { createPaymentIntent } from '@/lib/payments/stripe';
import { createPaymentIntentSchema } from '@/lib/schemas';

// POST /api/payments/intent - Crear un PaymentIntent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    // Obtener la sesión para verificar que existe
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', validatedData.sessionId)
      .eq('status', 'open')
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada o cerrada' },
        { status: 404 }
      );
    }

    // Calcular el total del guest usando la función de Supabase
    const { data: totalData, error: totalError } = await supabaseAdmin
      .rpc('get_total_for_guest', {
        p_session: validatedData.sessionId,
        p_guest: validatedData.guestId,
      });

    if (totalError) {
      console.error('Error calculating total:', totalError);
      return NextResponse.json(
        { error: 'Error al calcular el total' },
        { status: 500 }
      );
    }

    const total = Number(totalData) || validatedData.amount;

    // Crear PaymentIntent en Stripe
    const paymentIntent = await createPaymentIntent(
      total,
      session.currency,
      {
        sessionId: validatedData.sessionId,
        guestId: validatedData.guestId,
      }
    );

    // Registrar el pago pendiente en la base de datos
    await supabaseAdmin.from('payments').insert({
      session_id: validatedData.sessionId,
      guest_id: validatedData.guestId,
      provider: 'stripe',
      provider_payment_id: paymentIntent.id,
      amount: total,
      status: 'pending',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: total,
    });
  } catch (error) {
    console.error('Error in POST /api/payments/intent:', error);
    return NextResponse.json(
      { error: 'Error al crear el PaymentIntent' },
      { status: 500 }
    );
  }
}

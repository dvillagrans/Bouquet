import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/payments/stripe';
import { supabaseAdmin } from '@/lib/db';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature', { status: 400 });
    }

    // Verificar y construir el evento
    let event: Stripe.Event;
    try {
      event = await constructWebhookEvent(payload, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const { id: eventId, type } = event;

    // Verificar idempotencia: ignorar eventos ya procesados
    const { data: existing } = await supabaseAdmin
      .from('webhook_logs')
      .select('event_id')
      .eq('event_id', eventId)
      .single();

    if (existing) {
      console.log('Duplicate event, ignoring:', eventId);
      return new NextResponse('Duplicate event', { status: 200 });
    }

    // Registrar el evento
    await supabaseAdmin.from('webhook_logs').insert({
      event_id: eventId,
      payload: event,
    });

    // Procesar según el tipo de evento
    switch (type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { sessionId, guestId } = paymentIntent.metadata;

        // Actualizar el pago en la base de datos
        const { error } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'succeeded',
          })
          .eq('provider_payment_id', paymentIntent.id);

        if (error) {
          console.error('Error updating payment:', error);
        }

        console.log('Payment succeeded:', {
          sessionId,
          guestId,
          amount: paymentIntent.amount / 100,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Actualizar el pago como fallido
        await supabaseAdmin
          .from('payments')
          .update({
            status: 'failed',
          })
          .eq('provider_payment_id', paymentIntent.id);

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log('Unhandled event type:', type);
    }

    return new NextResponse('ok', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

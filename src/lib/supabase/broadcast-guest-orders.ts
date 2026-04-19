import { createClient } from "@supabase/supabase-js";

async function broadcastOnChannel(channelName: string, event: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const channel = supabase.channel(channelName);

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        supabase.removeChannel(channel);
        reject(new Error("broadcast subscribe timeout"));
      }, 10_000);

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          void channel
            .send({ type: "broadcast", event, payload: {} })
            .then(() => { supabase.removeChannel(channel); resolve(); })
            .catch((e) => { supabase.removeChannel(channel); reject(e); });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          supabase.removeChannel(channel);
          reject(new Error(status));
        }
      });
    });
  } catch {
    /* sin service role o error de red */
  }
}

/**
 * Notifica a los clientes del menú (misma mesa) vía Realtime Broadcast.
 * Requiere SUPABASE_SERVICE_ROLE_KEY en el servidor (opcional).
 */
export function broadcastGuestOrdersRefresh(tableQrCode: string) {
  return broadcastOnChannel(`guest-orders:${encodeURIComponent(tableQrCode)}`, "refresh");
}

export function broadcastBillRequested(tableQrCode: string) {
  return broadcastOnChannel(`guest-orders:${encodeURIComponent(tableQrCode)}`, "bill-requested");
}

/**
 * Despierta cocina/barra (KDS) para un restaurante vía Realtime Broadcast.
 * El cliente usa la anon key; no recibe `postgres_changes` en `Order` por RLS.
 */
export function broadcastKdsOrdersRefresh(restaurantId: string) {
  return broadcastOnChannel(`kds-orders:${encodeURIComponent(restaurantId)}`, "refresh");
}

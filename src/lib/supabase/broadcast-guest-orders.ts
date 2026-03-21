import { createClient } from "@supabase/supabase-js";

async function broadcast(tableQrCode: string, event: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const channelName = `guest-orders:${encodeURIComponent(tableQrCode)}`;
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
  return broadcast(tableQrCode, "refresh");
}

export function broadcastBillRequested(tableQrCode: string) {
  return broadcast(tableQrCode, "bill-requested");
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const { restaurantId } = await params;

  const res = NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  res.cookies.set("bq_restaurant_id", restaurantId, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}


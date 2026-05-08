import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  if (!process.env.META_APP_ID) {
    return NextResponse.redirect(
      new URL("/settings?tab=connections&error=meta_not_configured", request.url)
    );
  }

  const state = randomBytes(16).toString("hex");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: `${appUrl}/api/auth/meta/callback`,
    scope: "ads_management,ads_read,business_management",
    state,
    response_type: "code",
  });

  const response = NextResponse.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  );

  // Store state + adspilot client_id in cookies for the callback to verify
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600, // 10 minutes
    path: "/",
  };
  response.cookies.set("meta_oauth_state", state, cookieOpts);
  response.cookies.set("meta_oauth_client_id", clientId, cookieOpts);

  return response;
}

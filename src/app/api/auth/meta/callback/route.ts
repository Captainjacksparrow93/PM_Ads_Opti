import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/encryption";

const META_API = "https://graph.facebook.com/v19.0";

function settingsUrl(base: string, params: Record<string, string>) {
  const u = new URL("/settings", base);
  u.searchParams.set("tab", "connections");
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const savedState = request.cookies.get("meta_oauth_state")?.value;
  const clientId = request.cookies.get("meta_oauth_client_id")?.value;

  // Clear cookies on every path
  const clearCookies = (res: NextResponse) => {
    res.cookies.delete("meta_oauth_state");
    res.cookies.delete("meta_oauth_client_id");
    return res;
  };

  if (oauthError) {
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "meta_access_denied" }))
    );
  }

  if (!code || !returnedState || returnedState !== savedState || !clientId) {
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "meta_invalid_state" }))
    );
  }

  try {
    // 1. Exchange code for short-lived token
    const tokenRes = await fetch(
      `${META_API}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          redirect_uri: `${origin}/api/auth/meta/callback`,
          code,
        }),
      { cache: "no-store" }
    );
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message ?? "Token exchange failed");
    }
    const shortLivedToken: string = tokenData.access_token;

    // 2. Upgrade to long-lived token (~60 days)
    const longTokenRes = await fetch(
      `${META_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: shortLivedToken,
        }),
      { cache: "no-store" }
    );
    const longTokenData = await longTokenRes.json();
    const accessToken: string = longTokenData.access_token ?? shortLivedToken;
    const expiresIn: number = longTokenData.expires_in ?? 5184000; // 60 days fallback

    // 3. Fetch connected ad accounts
    const adAccountsRes = await fetch(
      `${META_API}/me/adaccounts?fields=id,name,currency,timezone_name&limit=50&access_token=${accessToken}`,
      { cache: "no-store" }
    );
    const adAccountsData = await adAccountsRes.json();
    const adAccounts: Array<{
      id: string;
      name: string;
      currency?: string;
      timezone_name?: string;
    }> = adAccountsData.data ?? [];

    if (adAccounts.length === 0) {
      return clearCookies(
        NextResponse.redirect(settingsUrl(origin, { error: "meta_no_ad_accounts" }))
      );
    }

    // 4. Persist to Supabase
    const supabase = createAdminClient();
    const encryptedToken = encrypt(accessToken);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    for (const account of adAccounts) {
      const accountId = account.id.replace("act_", "");
      await supabase.from("ad_accounts").upsert(
        {
          client_id: clientId,
          platform: "meta",
          account_id: accountId,
          account_name: account.name,
          currency: account.currency ?? "USD",
          timezone: account.timezone_name ?? "UTC",
          access_token_encrypted: encryptedToken,
          token_expires_at: expiresAt,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "client_id,platform,account_id" }
      );
    }

    // 5. Mark client connected
    await supabase
      .from("clients")
      .update({ meta_connected: true, updated_at: new Date().toISOString() })
      .eq("id", clientId);

    const accountNames = adAccounts.map((a) => a.name).join(",");
    return clearCookies(
      NextResponse.redirect(
        settingsUrl(origin, {
          success: "meta",
          accounts: adAccounts.length.toString(),
          names: accountNames.slice(0, 80),
        })
      )
    );
  } catch (err) {
    console.error("[meta/callback]", err);
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "meta_failed" }))
    );
  }
}

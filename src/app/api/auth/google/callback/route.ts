import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt } from "@/lib/encryption";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_ADS_API = "https://googleads.googleapis.com/v17";

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
  const savedState = request.cookies.get("google_oauth_state")?.value;
  const clientId = request.cookies.get("google_oauth_client_id")?.value;

  const clearCookies = (res: NextResponse) => {
    res.cookies.delete("google_oauth_state");
    res.cookies.delete("google_oauth_client_id");
    return res;
  };

  if (oauthError) {
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "google_access_denied" }))
    );
  }

  if (!code || !returnedState || returnedState !== savedState || !clientId) {
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "google_invalid_state" }))
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error_description ?? "Token exchange failed");
    }

    const { access_token, refresh_token, expires_in } = tokenData as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    if (!refresh_token) {
      // Can happen if user previously authorized; force re-consent by adding prompt=consent
      throw new Error("No refresh token returned — ensure prompt=consent is set");
    }

    // 2. List accessible Google Ads customer accounts
    const devToken = process.env.GOOGLE_DEVELOPER_TOKEN;
    let adAccounts: Array<{ resourceName: string; id: string; name: string; currency: string; timezone: string }> = [];

    if (devToken) {
      const customersRes = await fetch(
        `${GOOGLE_ADS_API}/customers:listAccessibleCustomers`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "developer-token": devToken,
          },
          cache: "no-store",
        }
      );

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const resourceNames: string[] = customersData.resourceNames ?? [];

        // Fetch details for each customer (max 10 to avoid rate limits)
        const details = await Promise.allSettled(
          resourceNames.slice(0, 10).map(async (resourceName) => {
            const customerId = resourceName.replace("customers/", "");
            const detailRes = await fetch(
              `${GOOGLE_ADS_API}/customers/${customerId}?fields=resourceName,id,descriptiveName,currencyCode,timeZone`,
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  "developer-token": devToken,
                  ...(process.env.GOOGLE_LOGIN_CUSTOMER_ID
                    ? { "login-customer-id": process.env.GOOGLE_LOGIN_CUSTOMER_ID }
                    : {}),
                },
                cache: "no-store",
              }
            );
            if (!detailRes.ok) return null;
            return detailRes.json();
          })
        );

        adAccounts = details
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value)
          .map((r) => ({
            resourceName: r.value.resourceName,
            id: r.value.id ?? r.value.resourceName.replace("customers/", ""),
            name: r.value.descriptiveName ?? `Account ${r.value.id}`,
            currency: r.value.currencyCode ?? "USD",
            timezone: r.value.timeZone ?? "UTC",
          }));
      }
    }

    // Fallback: store a placeholder if API calls failed (test token scenario)
    if (adAccounts.length === 0) {
      adAccounts = [
        {
          resourceName: "customers/unknown",
          id: "pending",
          name: "Google Ads Account (pending verification)",
          currency: "USD",
          timezone: "UTC",
        },
      ];
    }

    // 3. Persist to Supabase
    const supabase = createAdminClient();
    const encryptedAccess = encrypt(access_token);
    const encryptedRefresh = encrypt(refresh_token);
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    for (const account of adAccounts) {
      await supabase.from("ad_accounts").upsert(
        {
          client_id: clientId,
          platform: "google",
          account_id: account.id,
          account_name: account.name,
          currency: account.currency,
          timezone: account.timezone,
          access_token_encrypted: encryptedAccess,
          refresh_token_encrypted: encryptedRefresh,
          token_expires_at: expiresAt,
          connected_at: new Date().toISOString(),
        },
        { onConflict: "client_id,platform,account_id" }
      );
    }

    // 4. Mark client connected
    await supabase
      .from("clients")
      .update({ google_connected: true, updated_at: new Date().toISOString() })
      .eq("id", clientId);

    return clearCookies(
      NextResponse.redirect(
        settingsUrl(origin, {
          success: "google",
          accounts: adAccounts.length.toString(),
          names: adAccounts.map((a) => a.name).join(",").slice(0, 80),
        })
      )
    );
  } catch (err) {
    console.error("[google/callback]", err);
    return clearCookies(
      NextResponse.redirect(settingsUrl(origin, { error: "google_failed" }))
    );
  }
}

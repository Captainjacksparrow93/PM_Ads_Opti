export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 font-sans text-slate-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: May 2026</p>

      <section className="space-y-8 text-sm leading-relaxed text-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. What We Collect</h2>
          <p>AdsPilot collects the following data to provide its service:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Agency and team member account information (name, email)</li>
            <li>OAuth access tokens for Meta Ads and Google Ads accounts (encrypted at rest)</li>
            <li>Campaign performance metrics fetched from Meta and Google APIs</li>
            <li>Shopify store data (orders, revenue) when a Shopify store is connected</li>
            <li>Ad creative assets (images, videos, copy) uploaded by the user</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. How We Use Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To display campaign analytics and performance reports</li>
            <li>To enable AI-powered campaign optimisation via the Anthropic API</li>
            <li>To create, pause, and adjust campaigns on behalf of authorised users</li>
            <li>We never sell, share, or use your data for advertising purposes</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Meta Platform Data</h2>
          <p>
            AdsPilot accesses Meta Marketing API data solely to manage and optimise ad campaigns
            for authorised accounts. We request only the permissions required:
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">ads_management</code>,
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">ads_read</code>,
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs ml-1">business_management</code>.
          </p>
          <p className="mt-2">
            Meta data is not transferred to third parties. Tokens are encrypted and stored only for
            the duration of the authorised connection.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Google Ads Data</h2>
          <p>
            AdsPilot uses the Google Ads API with the
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs mx-1">https://www.googleapis.com/auth/adwords</code>
            scope to read and manage authorised Google Ads accounts. Data is used exclusively for
            campaign management within AdsPilot.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Token Storage & Security</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All OAuth tokens are encrypted at rest using AES-256-GCM</li>
            <li>Tokens are stored in a Supabase PostgreSQL database with Row Level Security</li>
            <li>Each agency can only access its own data — cross-tenant access is prevented at the database level</li>
            <li>Connections can be revoked at any time from Settings → Ad Accounts</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Data Retention</h2>
          <p>
            Data is retained for as long as the account is active. Upon account deletion, all stored
            tokens, campaign data, and assets are permanently removed within 30 days.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Contact</h2>
          <p>
            For privacy enquiries, contact us at{" "}
            <a href="mailto:privacy@adspilot.io" className="text-violet-600 underline">
              privacy@adspilot.io
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

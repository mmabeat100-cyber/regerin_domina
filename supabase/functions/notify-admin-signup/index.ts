// Deploy via Supabase Dashboard → Edge Functions → Create function → paste this file.
// Requires secrets: RESEND_API_KEY, ADMIN_EMAIL (set in Dashboard → Edge Functions → Secrets).
// Optional secret: RESEND_FROM_EMAIL (defaults to Resend's shared sandbox sender).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupPayload {
  displayName?: string;
  email?: string;
  phone?: string;
  city?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
  const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev";

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY or ADMIN_EMAIL secret" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { displayName, email, phone, city } = (await req.json()) as SignupPayload;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nouvelle demande d'inscription : ${displayName ?? "—"}`,
        html: `
          <p>Une nouvelle demande d'inscription a été soumise sur Ringerin Domina.</p>
          <ul>
            <li><strong>Nom :</strong> ${displayName ?? "—"}</li>
            <li><strong>Ville :</strong> ${city ?? "—"}</li>
            <li><strong>Email :</strong> ${email ?? "—"}</li>
            <li><strong>Téléphone :</strong> ${phone ?? "—"}</li>
          </ul>
          <p>Connectez-vous au back-office (/admin/profils) pour examiner et valider cette demande.</p>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

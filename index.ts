import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") ?? "";
  if (!allowedOrigin || origin !== allowedOrigin) return json(403, { error: "Origem não autorizada." });
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json(405, { error: "Método não permitido." });

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 65_000) return json(413, { error: "Cadastro muito grande." });

  let body: { fields?: Record<string, unknown>; turnstileToken?: string; website?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "Dados inválidos." });
  }

  // Honeypot: quietly accept bot submissions without storing them.
  if (body.website) return json(200, { ok: true });
  const fields = body.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return json(400, { error: "Ficha inválida." });
  const name = String(fields.p1_nome ?? "").trim();
  if (!name || name.length > 200) return json(400, { error: "Informe o nome do proponente." });
  if (JSON.stringify(fields).length > 60_000) return json(413, { error: "Cadastro muito grande." });

  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
  const turnstileToken = String(body.turnstileToken ?? "");
  if (!turnstileSecret || !turnstileToken) return json(400, { error: "Verificação de segurança ausente." });
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: turnstileSecret,
      response: turnstileToken,
      remoteip: request.headers.get("x-forwarded-for")?.split(",")[0] ?? "",
    }),
  });
  const verificationResult = await verification.json();
  const expectedHostname = Deno.env.get("TURNSTILE_HOSTNAME") ?? "";
  if (!verificationResult.success || (expectedHostname && verificationResult.hostname !== expectedHostname)) {
    return json(400, { error: "Verificação de segurança não aprovada. Tente novamente." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
  const serviceKey = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const ownerId = Deno.env.get("ADMIN_USER_ID") ?? "";
  if (!supabaseUrl || !serviceKey || !ownerId) return json(503, { error: "O recebimento ainda não foi configurado." });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("pre_venda_cadastros").insert({
    owner_id: ownerId,
    nome_proponente: name,
    telefone: typeof fields.p1_whatsapp === "string" ? fields.p1_whatsapp : null,
    email: typeof fields.p1_email === "string" ? fields.p1_email : null,
    dados: fields,
  });
  if (error) {
    console.error("Falha ao guardar ficha", error);
    return json(500, { error: "Não foi possível guardar os dados agora." });
  }
  return json(201, { ok: true });
});

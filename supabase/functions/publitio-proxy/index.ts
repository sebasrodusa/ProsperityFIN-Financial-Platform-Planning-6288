import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const publitioKey = Deno.env.get("PUBLITIO_API_KEY")!;
const publitioSecret = Deno.env.get("PUBLITIO_API_SECRET")!;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha1(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return toHex(hash);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const supabase = createClient(supabaseUrl, serviceRole);
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await supabase
    .from("users_pf")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "client") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid form" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const file = form.get("file");
  const publicId = form.get("public_id")?.toString();
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "File required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ts = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.floor(10000000 + Math.random() * 90000000).toString();
  const signature = await sha1(ts + nonce + publitioSecret);

  const url = new URL("https://api.publit.io/v1/files/create");
  url.searchParams.set("api_key", publitioKey);
  url.searchParams.set("api_timestamp", ts);
  url.searchParams.set("api_nonce", nonce);
  url.searchParams.set("api_signature", signature);

  const body = new FormData();
  if (publicId) body.append("public_id", publicId);
  body.append("file", file);

  try {
    const res = await fetch(url.toString(), { method: "POST", body });
    const data = await res.json();
    if (!res.ok || !data || data.error) {
      return new Response(JSON.stringify({ error: data?.message || "Publitio error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ public_id: data.public_id ?? data.id, url: data.url || data.url_preview }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Publitio request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});


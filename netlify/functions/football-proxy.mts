/**
 * Server-side proxy for football-data.org.
 *
 * Keeps the API key out of the browser bundle. The client calls
 * /football-api/v4/... and the netlify.toml redirect rewrites those to
 * /.netlify/functions/football-proxy/v4/..., which this function forwards
 * upstream with the X-Auth-Token header injected.
 */
export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.FOOTBALL_API_KEY ?? "";
  if (!apiKey) {
    console.error("football-proxy: FOOTBALL_API_KEY env var is missing");
    return new Response(JSON.stringify({ error: "FOOTBALL_API_KEY not configured" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(req.url);
  // Depending on whether Netlify hands us the rewritten function path or the
  // original request path, strip whichever prefix is present.
  let path = url.pathname;
  for (const prefix of ["/.netlify/functions/football-proxy", "/football-api"]) {
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length);
      break;
    }
  }
  const target = `https://api.football-data.org${path}${url.search}`;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { "X-Auth-Token": apiKey },
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      console.error(
        `football-proxy: upstream ${upstream.status} for ${path} — body: ${body.slice(0, 500)}`,
      );
    }
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown fetch error";
    console.error(`football-proxy: fetch failed for ${target}: ${message}`);
    return new Response(
      JSON.stringify({ error: "upstream fetch failed", message, target: path }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

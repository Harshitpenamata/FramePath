import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import { logError, runWithRequest } from "../app/errors";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    // Self-hosted: never serve the app (or set session cookies) over plain http.
    const url = new URL(request.url);
    if (url.protocol === "http:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      url.protocol = "https:";
      return Response.redirect(url.href, 301);
    }
    // One address: requests to an alias (www, the old avinyainteractive address) go to the main one, path kept.
    const main = (env as { SITE_URL?: string }).SITE_URL ? new URL((env as { SITE_URL?: string }).SITE_URL!).hostname : "";
    if (main && url.hostname !== main && url.hostname !== "127.0.0.1" && url.hostname !== "localhost" && url.hostname !== "framepath.internal") {
      url.hostname = main;
      return Response.redirect(url.href, 301);
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    // Crashes that escape the app are logged for the daily error email, then answered with a plain 500.
    return runWithRequest(request, () => Promise.resolve(runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx))).catch(async (e: unknown) => {
      await logError("worker", e, 500);
      return new Response("Something went wrong. Please try again.", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }));
  },
  // Hourly cron (vite.config.ts): video health checks and queued AI work. It calls the app's own job route
  // internally with a one-time token kept in memory, so the route can't be triggered from outside.
  async scheduled(_controller: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    const token = crypto.randomUUID();
    (globalThis as any).__framepathCronToken = token;
    const request = new Request("https://framepath.internal/api/jobs/run", { method: "POST", headers: { "x-framepath-cron": token } });
    ctx.waitUntil(Promise.resolve(handler.fetch(request, env, ctx as any)).then(async (r: Response) => console.log("Scheduled job", r.status, (await r.text()).slice(0, 500))));
  },
};

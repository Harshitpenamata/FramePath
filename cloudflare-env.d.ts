declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

declare namespace Cloudflare { interface Env { ANTHROPIC_API_KEY?: string; } }
declare namespace Cloudflare { interface Env { GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; SESSION_SECRET?: string; FRAMEPATH_ADMIN_IDS?: string; } }

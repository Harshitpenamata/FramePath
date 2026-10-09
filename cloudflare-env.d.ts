declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

declare namespace Cloudflare { interface Env { OPENAI_API_KEY?: string; OPENAI_MODEL?: string; } }
declare namespace Cloudflare { interface Env { GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; SESSION_SECRET?: string; FRAMEPATH_ADMIN_IDS?: string; } }

import { neon } from "@neondatabase/serverless";

/**
 * Client PostgreSQL Neon (driver serverless).
 * Initialisation paresseuse : le build ne doit pas échouer si DATABASE_URL
 * est absente de l'environnement de build.
 */
let sql: ReturnType<typeof neon> | null = null;

export function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL n'est pas définie.");
    }
    sql = neon(url);
  }
  return sql;
}

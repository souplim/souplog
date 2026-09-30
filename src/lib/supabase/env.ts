/**
 * Read statically, never as `process.env[name]`: the bundler only inlines a
 * NEXT_PUBLIC_* value into the browser bundle when it can see the literal
 * property access, so a computed lookup resolves to undefined client-side —
 * which is what `getPostImageUrl` tripped over in the post editor.
 */
const PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

function requireEnv(name: keyof typeof PUBLIC_ENV): string {
  const value = PUBLIC_ENV[name];

  if (value === undefined || value === '') {
    throw new Error(`환경변수 ${name}가 비어 있습니다. .env.local을 확인하세요.`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

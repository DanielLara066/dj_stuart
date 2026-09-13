import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não encontrada.');
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS public.feedbacks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message VARCHAR(1000) NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1000),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx
  ON public.feedbacks (created_at DESC)
`;

await sql`ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY`;
await sql`GRANT USAGE ON SCHEMA public TO anonymous`;
await sql`REVOKE ALL ON TABLE public.feedbacks FROM anonymous`;
await sql`GRANT INSERT (name, rating, message) ON TABLE public.feedbacks TO anonymous`;
await sql`GRANT USAGE, SELECT ON SEQUENCE public.feedbacks_id_seq TO anonymous`;
await sql`DROP POLICY IF EXISTS anonymous_insert_feedback ON public.feedbacks`;
await sql`
  CREATE POLICY anonymous_insert_feedback
  ON public.feedbacks
  FOR INSERT
  TO anonymous
  WITH CHECK (
    status = 'pending'
    AND char_length(name) BETWEEN 2 AND 80
    AND rating BETWEEN 1 AND 5
    AND char_length(message) BETWEEN 10 AND 1000
  )
`;

console.log('Banco de feedbacks configurado.');

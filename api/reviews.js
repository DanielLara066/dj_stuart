import { neon } from '@neondatabase/serverless';
import { createHmac, randomUUID } from 'node:crypto';

export function createHandler({ env = process.env, connect = neon } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const fail = (status, error) => res.status(status).json({ error });
    if (!['GET', 'POST'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST');
      return fail(405, 'Método não permitido.');
    }
    let body;
    if (req.method === 'POST') {
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) return fail(415, 'Envie os dados em JSON.');
      if (req.headers.origin && req.headers.origin !== `https://${req.headers.host}`) return fail(403, 'Origem não permitida.');
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
      catch { return fail(400, 'Dados inválidos.'); }
      if (!body || typeof body !== 'object' || JSON.stringify(body).length > 8000) return fail(400, 'Dados inválidos.');
      const { name, comment, rating, website } = body;
      if (website || typeof name !== 'string' || typeof comment !== 'string' ||
          name.trim().length < 2 || name.trim().length > 60 || comment.trim().length < 5 ||
          comment.trim().length > 1000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return fail(400, 'Confira seu nome, nota e comentário.');
      }
    }
    if (!env.DATABASE_URL || !env.REVIEW_RATE_LIMIT_SECRET) return fail(503, 'Avaliações temporariamente indisponíveis. Tente novamente mais tarde.');
    try {
      const sql = connect(env.DATABASE_URL);
      if (req.method === 'GET') {
        const reviews = await sql`SELECT id, name, rating, comment, created_at FROM stuart_reviews ORDER BY created_at DESC, id DESC LIMIT 50`;
        return res.status(200).json({ reviews });
      }
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      const key = createHmac('sha256', env.REVIEW_RATE_LIMIT_SECRET).update(ip).digest('hex');
      // The database serializes concurrent submissions from the same address.
      const reviews = await sql`
        WITH allowed AS (
          INSERT INTO stuart_review_limits (key, next_allowed_at) VALUES (${key}, now() + interval '1 minute')
          ON CONFLICT (key) DO UPDATE SET next_allowed_at = now() + interval '1 minute'
          WHERE stuart_review_limits.next_allowed_at <= now() RETURNING key
        )
        INSERT INTO stuart_reviews (id, name, rating, comment)
        SELECT ${randomUUID()}::uuid, ${body.name.trim()}, ${body.rating}, ${body.comment.trim()} FROM allowed
        RETURNING id, name, rating, comment, created_at`;
      if (!reviews.length) {
        res.setHeader('Retry-After', '60');
        return fail(429, 'Aguarde um minuto antes de enviar outra avaliação.');
      }
      return res.status(201).json({ review: reviews[0] });
    } catch {
      return fail(503, 'Não foi possível acessar as avaliações. Tente novamente mais tarde.');
    }
  };
}
export default createHandler();

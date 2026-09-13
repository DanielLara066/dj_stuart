import { neon } from '@neondatabase/serverless';

let schemaReady;

function database() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('Banco de dados ainda não configurado.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }

  return neon(process.env.DATABASE_URL);
}

async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS feedbacks (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(80) NOT NULL,
          rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
          message VARCHAR(1000) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS feedbacks_created_at_idx
        ON feedbacks (created_at DESC)
      `;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }

  return schemaReady;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const name = String(body?.name || '').trim();
    const message = String(body?.feedback || '').trim();
    const website = String(body?.website || '').trim();
    const rating = Number(body?.rating);

    if (website) return response.status(201).json({ ok: true });

    if (name.length < 2 || name.length > 80) {
      return response.status(400).json({ error: 'Digite um nome válido.' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return response.status(400).json({ error: 'Selecione uma avaliação de 1 a 5 estrelas.' });
    }
    if (message.length < 10 || message.length > 1000) {
      return response.status(400).json({ error: 'O feedback deve ter entre 10 e 1000 caracteres.' });
    }

    const sql = database();
    await ensureSchema(sql);
    await sql`
      INSERT INTO feedbacks (name, rating, message)
      VALUES (${name}, ${rating}, ${message})
    `;

    return response.status(201).json({ ok: true });
  } catch (error) {
    if (error?.code === 'DATABASE_NOT_CONFIGURED') {
      return response.status(503).json({ error: 'O envio será liberado em breve.' });
    }

    console.error('Feedback submission failed', error);
    return response.status(500).json({ error: 'Não foi possível enviar agora. Tente novamente.' });
  }
}

import { neon } from '@neondatabase/serverless';

const required = ['DATABASE_URL', 'NEON_AUTH_BASE_URL', 'NEON_DATA_API_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} não encontrada.`);
}

const marker = `Teste automático ${Date.now()}`;
const origin = 'https://dj-stuart-ivory.vercel.app';
const tokenResponse = await fetch(`${process.env.NEON_AUTH_BASE_URL}/token/anonymous`, {
  headers: { Origin: origin }
});
const tokenPayload = await tokenResponse.json();

if (!tokenResponse.ok || !tokenPayload.token) {
  throw new Error('Falha ao obter o token anônimo.');
}

const insertResponse = await fetch(`${process.env.NEON_DATA_API_URL}/feedbacks`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenPayload.token}`,
    'Content-Type': 'application/json',
    Origin: origin,
    Prefer: 'return=minimal'
  },
  body: JSON.stringify({
    name: 'Teste do sistema',
    rating: 5,
    message: marker
  })
});

if (!insertResponse.ok) {
  throw new Error(`Falha no envio: ${insertResponse.status} ${await insertResponse.text()}`);
}

const sql = neon(process.env.DATABASE_URL);
const saved = await sql`
  SELECT id, status
  FROM public.feedbacks
  WHERE message = ${marker}
`;

if (saved.length !== 1 || saved[0].status !== 'pending') {
  throw new Error('O registro não foi salvo corretamente.');
}

await sql`DELETE FROM public.feedbacks WHERE message = ${marker}`;
console.log('Envio, gravação e limpeza do teste confirmados.');

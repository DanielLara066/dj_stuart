# Ativar avaliações no projeto existente

O código está preparado, mas o banco ainda não foi provisionado ou conectado.

1. Reconectar a Vercel com acesso à equipe `ddesousalara-4224` e ao projeto `dj-stuart`.
2. Conectar Neon pelo Marketplace ao projeto existente. Usar um banco de preview separado do de produção.
3. Executar `db/schema.sql` no banco correspondente.
4. Configurar `DATABASE_URL` e `REVIEW_RATE_LIMIT_SECRET` (segredo aleatório forte) nas variáveis de ambiente do projeto. Nunca colocar valores no GitHub ou no HTML.
5. Fazer deploy da branch e testar uma avaliação em preview: enviar, abrir outro navegador, recarregar e verificar que o comentário permanece. O POST publica imediatamente; não há fila de aprovação.
6. Após validar, publicar na produção e confirmar a leitura. Não inserir avaliações fictícias em produção.

A API devolve até 50 avaliações mais recentes, armazena os envios no Postgres e limita envios por endereço a um por minuto. O endereço é armazenado apenas como HMAC na tabela de limite. Comentários são renderizados como texto. Para retirar uma avaliação, usar o editor SQL autenticado do banco pelo ID (não há painel administrativo público).

Validação atual: `npm test` usa um adaptador simulado para testar validação, falhas e contrato da API. Isso não substitui o teste no banco real.

## Vídeos pendentes

- Primeiro, trajetória: arquivo atual com 39,91 s, 480 × 276, vídeo ~83 kbps. Substituir pelo original de 40 s.
- Segundo, bagagem/set hipnótico: arquivo atual com 23,01 s, 640 × 1138, vídeo ~172 kbps. O usuário escolheu outro arquivo, de 17 s; ele ainda é necessário.
- Terceiro, “Mais do que tocar músicas”: arquivo original ausente. Não usar outro vídeo como substituto.

Preservar áudio e resolução dos originais. Apenas aumentar resolução/bitrate dos arquivos atuais não recupera os detalhes perdidos.

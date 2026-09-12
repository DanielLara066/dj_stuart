(() => {
  const form = document.getElementById('reviewForm');
  if (!form) return;
  const status = document.getElementById('reviewStatus');
  const submit = document.getElementById('reviewSubmit');
  const list = document.getElementById('reviewList');
  const refresh = document.getElementById('reviewRefresh');
  let sending = false;
  let reviews = [];
  async function request(options) {
    const response = await fetch('/api/reviews', { ...options, signal: AbortSignal.timeout(12000) });
    let data;
    try { data = await response.json(); } catch { throw new Error('Avaliações temporariamente indisponíveis. Tente novamente mais tarde.'); }
    if (!response.ok) throw new Error(data.error || 'Não foi possível acessar as avaliações.');
    return data;
  }
  function render() {
    list.replaceChildren();
    if (!reviews.length) {
      const empty = document.createElement('p');
      empty.className = 'review-empty';
      empty.textContent = 'Ainda não há avaliações. Seja o primeiro a compartilhar sua experiência.';
      list.append(empty);
    }
    reviews.forEach(review => {
      const card = document.createElement('article');
      card.className = 'review-card';
      const name = document.createElement('strong');
      name.textContent = review.name;
      const stars = document.createElement('span');
      stars.className = 'review-stars';
      stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      stars.setAttribute('aria-label', review.rating + ' de 5 estrelas');
      const comment = document.createElement('p');
      comment.textContent = review.comment;
      const date = document.createElement('time');
      date.dateTime = review.created_at;
      date.textContent = new Date(review.created_at).toLocaleDateString('pt-BR');
      card.append(name, stars, comment, date);
      list.append(card);
    });
  }
  async function load() {
    if (sending) return;
    refresh.disabled = true;
    submit.disabled = true;
    status.textContent = 'Carregando avaliações…';
    try {
      const data = await request();
      reviews = data.reviews;
      render();
      status.textContent = '';
      submit.disabled = false;
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'A conexão demorou. Tente atualizar as avaliações.' : error.message;
    } finally { refresh.disabled = false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || submit.disabled || !form.reportValidity()) return;
    sending = true;
    submit.disabled = true;
    refresh.disabled = true;
    status.textContent = 'Publicando…';
    const fields = new FormData(form);
    try {
      const { review } = await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: fields.get('name'), rating: Number(fields.get('rating')), comment: fields.get('comment'), website: fields.get('website') }) });
      reviews = [review, ...reviews.filter(item => item.id !== review.id)].slice(0, 50);
      render();
      form.reset();
      status.textContent = 'Sua avaliação foi publicada. Obrigado por compartilhar!';
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'Não foi possível confirmar o envio. Atualize as avaliações antes de tentar novamente.' : error.message;
    } finally {
      sending = false;
      submit.disabled = false;
      refresh.disabled = false;
    }
  });
  refresh.addEventListener('click', load);
  load();
})();

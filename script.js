if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (!window.location.hash || window.location.hash === '#top') {
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
}

document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 8px 24px rgba(0,0,0,0.35)' : 'none';
});

const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formNote.textContent = 'Mensagem enviada! Retornaremos em breve.';
  form.reset();
});

const feedbackForm = document.getElementById('feedbackForm');
const feedbackNote = document.getElementById('feedbackNote');

if (feedbackForm && feedbackNote) {
  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!feedbackForm.reportValidity()) return;

    const button = feedbackForm.querySelector('button[type="submit"]');
    const formData = new FormData(feedbackForm);
    const originalLabel = button.textContent;

    button.disabled = true;
    button.textContent = 'Enviando...';
    feedbackNote.textContent = '';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          rating: Number(formData.get('rating')),
          feedback: formData.get('feedback'),
          website: formData.get('website')
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar agora.');

      feedbackForm.reset();
      feedbackNote.textContent = 'Feedback enviado com sucesso! Obrigado.';
    } catch (error) {
      feedbackNote.textContent = error.message || 'Não foi possível enviar agora. Tente novamente.';
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

const revealTargets = document.querySelectorAll(
  '.about-grid, .profile-panel, .social-pill'
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((el) => {
  el.classList.add('reveal');
  observer.observe(el);
});

const bioTrack = document.getElementById('bioTrack');
const bioSlides = bioTrack ? [...bioTrack.querySelectorAll('.bio-slide')] : [];
const bioPrev = document.querySelector('.bio-arrow-prev');
const bioNext = document.querySelector('.bio-arrow-next');
let activeBioSlide = 0;

function showBioSlide(index) {
  if (!bioTrack || !bioSlides.length) return;
  activeBioSlide = (index + bioSlides.length) % bioSlides.length;
  const previousIndex = (activeBioSlide - 1 + bioSlides.length) % bioSlides.length;
  const nextIndex = (activeBioSlide + 1) % bioSlides.length;

  bioSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === activeBioSlide);
    slide.classList.toggle('is-previous', slideIndex === previousIndex);
    slide.classList.toggle('is-next', slideIndex === nextIndex);
    slide.setAttribute('aria-hidden', String(slideIndex !== activeBioSlide));
  });
}

if (bioTrack) {
  showBioSlide(activeBioSlide);

  bioPrev.addEventListener('click', () => showBioSlide(activeBioSlide - 1));
  bioNext.addEventListener('click', () => showBioSlide(activeBioSlide + 1));

  bioSlides.forEach((slide) => {
    slide.addEventListener('click', () => {
      if (slide.classList.contains('is-previous')) showBioSlide(activeBioSlide - 1);
      if (slide.classList.contains('is-next')) showBioSlide(activeBioSlide + 1);
    });
  });

  let touchStartX = 0;
  bioTrack.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  bioTrack.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    showBioSlide(activeBioSlide + (distance < 0 ? 1 : -1));
  }, { passive: true });

  bioTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showBioSlide(activeBioSlide - 1);
    if (event.key === 'ArrowRight') showBioSlide(activeBioSlide + 1);
  });
}


document.querySelectorAll('.video-sound-toggle').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const video = button.previousElementSibling;
    const enableSound = video.muted;

    document.querySelectorAll('.bio-video').forEach((item) => {
      item.muted = true;
    });
    document.querySelectorAll('.video-sound-toggle').forEach((item) => {
      item.textContent = '🔇 Ativar som';
      item.setAttribute('aria-label', 'Ativar som do vídeo');
    });

    if (enableSound) {
      video.muted = false;
      video.play();
      button.textContent = '🔊 Desativar som';
      button.setAttribute('aria-label', 'Desativar som do vídeo');
    }
  });
});

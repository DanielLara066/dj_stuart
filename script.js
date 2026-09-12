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
    const video = slide.querySelector('video');
    if (video) {
      video.muted = true;
      updateSoundButton(slide);
      if (slideIndex === activeBioSlide) startBioVideo(video);
      else video.pause();
    }
    slide.querySelectorAll('button').forEach(button => {
      button.tabIndex = slideIndex === activeBioSlide ? 0 : -1;
    });
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

const supportsFineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function updateSoundButton(slide) {
  const video = slide.querySelector('video');
  const button = slide.querySelector('.video-sound-toggle');
  if (!video || !button) return;
  button.textContent = video.muted ? 'Ativar som' : 'Desativar som';
  button.setAttribute('aria-label', button.textContent + ' do vídeo');
  button.setAttribute('aria-pressed', String(!video.muted));
}

async function startBioVideo(video) {
  const wrap = video.closest('.bio-video-wrap');
  let fallback = wrap.querySelector('.video-start');
  if (!fallback) {
    fallback = document.createElement('button');
    fallback.type = 'button';
    fallback.className = 'video-start';
    fallback.textContent = 'Reproduzir vídeo';
    fallback.hidden = true;
    fallback.addEventListener('click', event => {
      event.stopPropagation();
      startBioVideo(video);
    });
    wrap.append(fallback);
  }
  try {
    await video.play();
    if (!video.closest('.bio-slide').classList.contains('active') || document.hidden) {
      video.muted = true;
      video.pause();
    }
    fallback.hidden = true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      video.muted = true;
      updateSoundButton(video.closest('.bio-slide'));
      fallback.hidden = false;
    }
  }
}

document.querySelectorAll('.video-sound-toggle').forEach(button => {
  button.addEventListener('click', async event => {
    event.stopPropagation();
    const slide = button.closest('.bio-slide');
    const video = slide.querySelector('video');
    if (!slide.classList.contains('active')) return;
    const enableSound = video.muted;
    bioSlides.forEach(item => {
      const other = item.querySelector('video');
      if (other) other.muted = true;
      updateSoundButton(item);
    });
    video.muted = !enableSound;
    updateSoundButton(slide);
    await startBioVideo(video);
  });
});
document.addEventListener('visibilitychange', () => {
  bioSlides.forEach(slide => {
    const video = slide.querySelector('video');
    if (!video) return;
    video.muted = true;
    updateSoundButton(slide);
    if (document.hidden) video.pause();
    else if (slide.classList.contains('active')) startBioVideo(video);
  });
});

if (supportsFineCursor) {
  document.body.classList.add('custom-cursor');

  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  let dotX = window.innerWidth / 2;
  let dotY = window.innerHeight / 2;
  let ringX = dotX;
  let ringY = dotY;

  window.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;
  });

  function animateRing() {
    ringX += (dotX - ringX) * 0.18;
    ringY += (dotY - ringY) * 0.18;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  const hoverTargets = 'a, button, input, textarea, .btn, .social-pill, .track-card, .mix-card, .gallery-item, .bio-slide';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorRing.classList.add('is-hovering');
      cursorDot.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorRing.classList.remove('is-hovering');
      cursorDot.classList.remove('is-hovering');
    }
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '';
    cursorRing.style.opacity = '';
  });
}

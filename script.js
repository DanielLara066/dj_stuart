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
  '.about-grid, .profile-panel, .mix-card, .gallery-item, .social-pill'
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
let activeBioSlide = 1;

function showBioSlide(index) {
  if (!bioTrack || !bioSlides.length) return;
  activeBioSlide = (index + bioSlides.length) % bioSlides.length;
  const activeSlide = bioSlides[activeBioSlide];
  bioSlides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === activeBioSlide));
  requestAnimationFrame(() => {
    const targetLeft = activeSlide.offsetLeft - (bioTrack.clientWidth - activeSlide.offsetWidth) / 2;
    bioTrack.scrollTo({ left: targetLeft, behavior: 'smooth' });
  });
}

if (bioTrack) {
  const centerInitialBioSlide = () => {
    const initialSlide = bioSlides[activeBioSlide];
    bioTrack.scrollLeft = initialSlide.offsetLeft - (bioTrack.clientWidth - initialSlide.offsetWidth) / 2;
  };
  requestAnimationFrame(centerInitialBioSlide);
  window.addEventListener('load', centerInitialBioSlide, { once: true });

  bioPrev.addEventListener('click', () => showBioSlide(activeBioSlide - 1));
  bioNext.addEventListener('click', () => showBioSlide(activeBioSlide + 1));

  let bioScrollTimer;
  bioTrack.addEventListener('scroll', () => {
    clearTimeout(bioScrollTimer);
    bioScrollTimer = setTimeout(() => {
      const trackCenter = bioTrack.scrollLeft + bioTrack.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      bioSlides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(trackCenter - slideCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      activeBioSlide = closestIndex;
      bioSlides.forEach((slide, index) => slide.classList.toggle('active', index === activeBioSlide));
    }, 80);
  }, { passive: true });

  bioTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showBioSlide(activeBioSlide - 1);
    if (event.key === 'ArrowRight') showBioSlide(activeBioSlide + 1);
  });
}

const supportsFineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

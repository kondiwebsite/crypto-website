const root = document.documentElement;
const header = document.querySelector("[data-header]");
const progress = document.querySelector(".scroll-progress");
const cursorGlow = document.querySelector(".cursor-glow");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const parallaxLayers = [...document.querySelectorAll(".parallax-layer")];
const scrollLayers = [...document.querySelectorAll(".parallax-scroll")];
const counters = [...document.querySelectorAll("[data-counter]")];
const revealItems = [...document.querySelectorAll(".reveal")];
const slides = [...document.querySelectorAll(".testimonial-card")];
const prevButton = document.querySelector("[data-prev]");
const nextButton = document.querySelector("[data-next]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let ticking = false;
let activeSlide = 0;

function updateScrollEffects() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progressWidth = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

  progress.style.width = `${progressWidth}%`;
  header.classList.toggle("scrolled", scrollY > 18);

  if (!prefersReducedMotion && window.innerWidth > 760) {
    scrollLayers.forEach((layer) => {
      const speed = Number(layer.dataset.speed || 0);
      layer.style.translate = `0 ${scrollY * speed}px`;
    });
  }

  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}

function handleMouseMove(event) {
  if (window.innerWidth <= 760 || prefersReducedMotion) return;

  cursorGlow.style.opacity = "1";
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;

  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  parallaxLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth || 0);
    layer.style.translate = `${x * depth * 42}px ${y * depth * 42}px`;
  });
}

function closeMenu() {
  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function setSlide(index) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeSlide);
  });
}

function animateCounter(counter) {
  const target = Number(counter.dataset.counter);
  const suffix = counter.nextElementSibling?.textContent || "";
  const decimalPlaces = Number.isInteger(target) ? 0 : 1;
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const progressValue = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progressValue, 3);
    counter.textContent = (target * eased).toFixed(decimalPlaces);

    if (progressValue < 1) {
      window.requestAnimationFrame(frame);
    } else {
      counter.textContent = target.toFixed(decimalPlaces).replace(/\.0$/, "");
      if (suffix === "ms") counter.textContent = Math.round(target);
    }
  }

  window.requestAnimationFrame(frame);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.16,
  rootMargin: "0px 0px -8% 0px",
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

revealItems.forEach((item) => revealObserver.observe(item));
counters.forEach((counter) => counterObserver.observe(counter));

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

themeToggle.addEventListener("click", () => {
  const isLight = root.dataset.theme === "light";
  root.dataset.theme = isLight ? "dark" : "light";
  themeToggle.setAttribute("aria-label", isLight ? "Toggle light mode" : "Toggle dark mode");
});

prevButton.addEventListener("click", () => setSlide(activeSlide - 1));
nextButton.addEventListener("click", () => setSlide(activeSlide + 1));

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("mousemove", handleMouseMove, { passive: true });
window.addEventListener("mouseleave", () => {
  cursorGlow.style.opacity = "0";
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
}, { passive: true });

setInterval(() => {
  setSlide(activeSlide + 1);
}, 5200);

updateScrollEffects();

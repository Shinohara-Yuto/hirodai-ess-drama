let galleryItems = [];
let lightboxIndex = 0;

function sizeClass(size) {
  if (size === "hero") return "gallery-item--hero";
  if (size === "wide") return "gallery-item--wide";
  return "";
}

function createGalleryItem(item, index) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `gallery-item reveal ${sizeClass(item.size)}`;
  el.dataset.category = item.category;
  el.dataset.index = String(index);
  el.setAttribute("aria-label", `${item.label}: ${item.caption}`);

  const src = `assets/gallery/${item.file}`;
  el.innerHTML = `
    <img src="${src}" alt="${item.caption}" loading="lazy">
    <span class="gallery-item-zoom" aria-hidden="true">+</span>
    <span class="gallery-item-overlay">
      <span class="gallery-item-label">${item.label}</span>
      <span class="gallery-item-caption">${item.caption}</span>
    </span>
  `;

  el.addEventListener("click", () => openLightbox(index));
  return el;
}

function renderGallery(filter = "all") {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const visibleItems =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  visibleItems.forEach((item) => {
    const globalIndex = galleryItems.indexOf(item);
    grid.appendChild(createGalleryItem(item, globalIndex));
  });

  observeGalleryItems();
}

function observeGalleryItems() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".gallery-item").forEach((el) => observer.observe(el));
}

function initGalleryFilters() {
  document.querySelectorAll(".gallery-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".gallery-filter").forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      renderGallery(btn.dataset.filter);
    });
  });
}

function ensureLightbox() {
  let lightbox = document.querySelector(".lightbox");
  if (lightbox) return lightbox;

  lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="閉じる">&times;</button>
    <button class="lightbox-nav lightbox-nav--prev" type="button" aria-label="前の写真">&#8249;</button>
    <button class="lightbox-nav lightbox-nav--next" type="button" aria-label="次の写真">&#8250;</button>
    <div class="lightbox-inner">
      <img src="" alt="">
      <div class="lightbox-caption">
        <strong></strong>
        <span></span>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-nav--prev").addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });
  lightbox.querySelector(".lightbox-nav--next").addEventListener("click", (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });

  return lightbox;
}

function openLightbox(index) {
  const lightbox = ensureLightbox();
  lightboxIndex = index;
  updateLightboxContent();
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

function navigateLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const lightbox = document.querySelector(".lightbox");
  const item = galleryItems[lightboxIndex];
  if (!lightbox || !item) return;

  const src = `assets/gallery/${item.file}`;
  lightbox.querySelector("img").src = src;
  lightbox.querySelector("img").alt = item.caption;
  lightbox.querySelector(".lightbox-caption strong").textContent = item.label;
  lightbox.querySelector(".lightbox-caption span").textContent = item.caption;
}

function initCountdown() {
  const el = document.getElementById("countdown-value");
  if (!el) return;

  const target = new Date("2026-07-20T14:00:00+09:00");

  function update() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      el.textContent = "本日開演！";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    if (days > 0) {
      el.textContent = `あと ${days} 日 ${hours} 時間`;
    } else {
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      el.textContent = `あと ${hours} 時間 ${minutes} 分`;
    }
  }

  update();
  setInterval(update, 60000);
}

async function initGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  try {
    const response = await fetch("data/gallery.json");
    if (!response.ok) throw new Error("gallery.json not found");
    const data = await response.json();
    galleryItems = data.items || [];
    renderGallery("all");
    initGalleryFilters();
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="gallery-lead">写真を読み込めませんでした。</p>';
  }
}

function syncAnnounceHeight() {
  const bar = document.querySelector(".announce-bar");
  if (!bar) return;

  if (window.matchMedia("(max-width: 600px)").matches) {
    document.documentElement.style.setProperty("--announce-height", `${bar.offsetHeight}px`);
  } else {
    document.documentElement.style.setProperty("--announce-height", "44px");
  }
}

function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", isOpen);
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(
    ".section-header, .about-text, .about-features li, .member-stats-link, .practice-card, .year-schedule, .perf-type-card, .production-card, .current-card, .faq-item, .join-card, .gallery-header, .gallery-highlights, .gallery-filters, .gallery-report-banner, .spotlight-card, .why-card, .voice-card, .hero-badge, .hero-countdown, .reports-guide"
  ).forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initGallery();
  initNav();
  initReveal();
  syncAnnounceHeight();
  window.addEventListener("resize", syncAnnounceHeight);
});

let galleryItems = [];
let galleryFilter = "all";
let lightboxIndex = 0;
let lightboxVisibleIndices = [];
let countdownTimer = null;

function sizeClass(size) {
  if (size === "hero") return "gallery-item--hero";
  if (size === "wide") return "gallery-item--wide";
  return "";
}

function getVisibleGalleryIndices(filter = galleryFilter) {
  if (filter === "all") {
    return galleryItems.map((_, index) => index);
  }
  return galleryItems
    .map((item, index) => (item.category === filter ? index : -1))
    .filter((index) => index >= 0);
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

  galleryFilter = filter;
  grid.innerHTML = "";
  const visibleIndices = getVisibleGalleryIndices(filter);

  visibleIndices.forEach((globalIndex) => {
    grid.appendChild(createGalleryItem(galleryItems[globalIndex], globalIndex));
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
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      renderGallery(btn.dataset.filter);
    });
  });
}

function ensureLightbox() {
  let lightbox = document.querySelector(".lightbox");
  if (lightbox) return lightbox;

  lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "写真ギャラリー");
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
  lightboxVisibleIndices = getVisibleGalleryIndices();
  if (!lightboxVisibleIndices.includes(index)) {
    lightboxVisibleIndices = getVisibleGalleryIndices("all");
  }
  lightboxIndex = index;
  updateLightboxContent();
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lightbox-close").focus();
}

function closeLightbox() {
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

function navigateLightbox(direction) {
  const list =
    lightboxVisibleIndices.length > 0
      ? lightboxVisibleIndices
      : galleryItems.map((_, index) => index);
  if (list.length === 0) return;

  let position = list.indexOf(lightboxIndex);
  if (position < 0) position = 0;
  position = (position + direction + list.length) % list.length;
  lightboxIndex = list[position];
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

  const target = new Date("2027-01-16T00:00:00+09:00");

  function update() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      const endOfDay = new Date("2027-01-16T23:59:59+09:00");
      el.textContent = now <= endOfDay ? "本日開演！" : "公演終了ありがとうございました";
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
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
  countdownTimer = setInterval(update, 60000);
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
  if (!bar) {
    document.documentElement.style.setProperty("--announce-height", "0px");
    return;
  }

  if (window.matchMedia("(max-width: 600px)").matches) {
    document.documentElement.style.setProperty("--announce-height", `${bar.offsetHeight}px`);
  } else {
    document.documentElement.style.setProperty("--announce-height", "44px");
  }
}

function setNavOpen(links, toggle, isOpen) {
  links.classList.toggle("open", isOpen);
  toggle.classList.toggle("active", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
  if (isOpen) {
    links.removeAttribute("inert");
  } else {
    links.setAttribute("inert", "");
  }
}

function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!header || !toggle || !links) return;

  setNavOpen(links, toggle, false);

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  toggle.addEventListener("click", () => {
    setNavOpen(links, toggle, !links.classList.contains("open"));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setNavOpen(links, toggle, false);
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
    ".section-header, .about-text, .about-features li, .member-stats-link, .practice-card, .year-schedule, .perf-type-card, .production-card, .current-card, .faq-item, .join-card, .gallery-header, .gallery-highlights, .gallery-filters, .gallery-report-banner, .spotlight-card, .why-card, .voice-card, .current-countdown, .reports-guide"
  ).forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

function escapeSponsorHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function initSponsors() {
  const grid = document.getElementById("sponsors-grid");
  if (!grid) return;

  try {
    const response = await fetch("data/sponsors.json");
    if (!response.ok) throw new Error("sponsors.json not found");
    const data = await response.json();
    const sponsors = Array.isArray(data.sponsors) ? data.sponsors : [];

    if (sponsors.length === 0) {
      grid.innerHTML = '<p class="sponsors-empty">協賛企業を募集しています。</p>';
      return;
    }

    grid.innerHTML = "";
    sponsors.forEach((sponsor) => {
      const hasImage = Boolean(sponsor.image);
      const name = sponsor.name || "協賛企業";
      const el = document.createElement(sponsor.url ? "a" : "div");
      el.className = `sponsor-banner${hasImage ? "" : " sponsor-banner--placeholder"}`;
      if (sponsor.url) {
        el.href = sponsor.url;
        if (/^https?:\/\//i.test(sponsor.url)) {
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        }
      }
      el.setAttribute("aria-label", name);

      if (hasImage) {
        el.innerHTML = `<img src="${escapeSponsorHtml(sponsor.image)}" alt="${escapeSponsorHtml(name)}" loading="lazy">`;
      } else {
        el.innerHTML = `<span class="sponsor-banner-label">${escapeSponsorHtml(name)}</span>`;
      }

      grid.appendChild(el);
    });
  } catch (error) {
    console.error(error);
    grid.innerHTML = '<p class="sponsors-empty">協賛企業を募集しています。</p>';
  }
}

function finishPageIntro() {
  const intro = document.getElementById("page-intro");
  const hash = window.location.hash;
  document.body.classList.remove("intro-pending");
  try {
    sessionStorage.setItem("ess-intro-seen", "1");
  } catch (_) {
    /* ignore */
  }

  if (!intro) {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView();
    }
    return;
  }

  intro.classList.add("is-done");
  intro.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    intro.remove();
    if (hash) {
      const target = document.querySelector(hash);
      if (target) target.scrollIntoView();
    }
  }, 800);
}

function initPageIntro() {
  const intro = document.getElementById("page-intro");
  const mosaic = document.getElementById("page-intro-mosaic");
  if (!intro || !mosaic) {
    document.body.classList.remove("intro-pending");
    return;
  }

  let seen = false;
  try {
    seen = sessionStorage.getItem("ess-intro-seen") === "1";
  } catch (_) {
    seen = false;
  }

  const shouldSkip =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    Boolean(window.location.hash) ||
    seen;

  if (shouldSkip) {
    finishPageIntro();
    return;
  }

  const photos = [
    "assets/gallery/honkouen-1.jpg",
    "assets/gallery/remecon-1.jpg",
    "assets/gallery/spring2026.jpg",
    "assets/gallery/remecon-4.jpg",
  ];

  mosaic.innerHTML = photos
    .map(
      (src) =>
        `<div class="page-intro-tile"><img src="${src}" alt="" decoding="async"></div>`
    )
    .join("");

  const skip = document.getElementById("page-intro-skip");
  if (skip) {
    skip.addEventListener("click", finishPageIntro);
    window.setTimeout(() => skip.focus(), 50);
  }

  window.setTimeout(finishPageIntro, 2600);
}

document.addEventListener("DOMContentLoaded", () => {
  syncAnnounceHeight();
  initPageIntro();
  initCountdown();
  initGallery();
  initSponsors();
  initNav();
  initReveal();
  window.addEventListener("resize", syncAnnounceHeight);
});

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════════════════════
   DIGITAL ENVELOPE — Creative Edition
   Dark romantic backdrop · gold frame · shimmer · petals
══════════════════════════════════════════════════════════════ */
(function initEnvelope() {
  const overlay  = document.getElementById("env-overlay");
  const envelope = document.getElementById("envelope");
  if (!overlay || !envelope) return;

  const flap    = overlay.querySelector(".env-flap");
  const seal    = overlay.querySelector(".env-seal");
  const card    = overlay.querySelector(".env-card");
  const hint    = overlay.querySelector(".env-hint");
  const shimmer = overlay.querySelector(".env-shimmer-bar");
  const particles = document.getElementById("envBgHearts");

  // Lock scroll
  document.body.style.overflow = "hidden";

  // ── Spawn hearts + rose petals in overlay bg ──────────────
  if (particles) {
    // Hearts (on dark bg these look like soft pink glows)
    const hSizes = [4, 6, 8, 10, 12];
    for (let i = 0; i < 14; i++) {
      const h = document.createElement("span");
      h.className = "floating-heart";
      const sz = hSizes[i % hSizes.length];
      h.style.setProperty("--fh-size", `${sz}px`);
      h.style.setProperty("--fh-opacity", (0.25 + Math.random() * 0.2).toFixed(2));
      h.style.left   = `${Math.random() * 100}%`;
      h.style.bottom = `${Math.random() * 20}%`;
      particles.appendChild(h);
      gsap.to(h, {
        y: -(window.innerHeight + 100),
        x: gsap.utils.random(-40, 40),
        duration: gsap.utils.random(10, 20),
        repeat: -1,
        delay: gsap.utils.random(0, 10),
        ease: "none",
      });
    }

    // Rose petals — soft ellipse shapes falling from top
    const petalColors = [
      "rgba(220, 160, 160, 0.55)",
      "rgba(240, 185, 170, 0.50)",
      "rgba(205, 145, 145, 0.45)",
      "rgba(255, 200, 185, 0.50)",
    ];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span");
      p.className = "env-petal";
      p.style.background = petalColors[i % petalColors.length];
      p.style.left = `${Math.random() * 100}%`;
      p.style.top  = `-${12 + Math.random() * 20}px`;
      p.style.width  = `${5 + Math.random() * 5}px`;
      p.style.height = `${9 + Math.random() * 7}px`;
      p.style.borderRadius = Math.random() > 0.5
        ? "0 80% 0 80%"
        : "80% 0 80% 0";
      particles.appendChild(p);
      gsap.to(p, {
        y: window.innerHeight + 60,
        x: gsap.utils.random(-80, 80),
        rotation: gsap.utils.random(120, 360),
        opacity: 0.7,
        duration: gsap.utils.random(7, 15),
        repeat: -1,
        delay: gsap.utils.random(0, 10),
        ease: "none",
      });
    }
  }

  // ── Entrance — drops in with a gentle tilt landing ────────
  gsap.set(envelope, { y: -80, opacity: 0, rotation: 4 });
  gsap.set(hint, { opacity: 0, y: 14 });

  gsap.timeline({ delay: 0.3 })
    .to(envelope, {
      y: 0, opacity: 1, rotation: -1.5,
      duration: 1.0, ease: "power3.out",
    })
    .to(envelope, {
      rotation: 0,
      duration: 0.5, ease: "elastic.out(1, 0.5)",
    }, "-=0.1")
    .to(hint, {
      opacity: 1, y: 0,
      duration: 0.65, ease: "power2.out",
    }, "-=0.4");

  // ── Shimmer sweep (repeating gold highlight) ───────────────
  gsap.to(shimmer, {
    left: "150%",
    duration: 1.5,
    repeat: -1,
    repeatDelay: 4.5,
    delay: 2.0,
    ease: "power2.inOut",
  });

  // ── Idle float ────────────────────────────────────────────
  const floatAnim = gsap.to(envelope, {
    y: -12,
    duration: 2.4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 1.8,
  });

  // ── Wax seal pulse ────────────────────────────────────────
  const sealPulse = gsap.timeline({ repeat: -1, delay: 2.0 })
    .to(seal, { scale: 1.1,  duration: 1.4, ease: "sine.inOut" })
    .to(seal, { scale: 1.0,  duration: 1.4, ease: "sine.inOut" })
    .to(seal, { rotation: 3, duration: 2.0, ease: "sine.inOut" })
    .to(seal, { rotation: 0, duration: 2.0, ease: "sine.inOut" });

  // ── Hover: lift envelope on dark background ────────────────
  let opened = false;

  envelope.addEventListener("mouseenter", () => {
    if (opened) return;
    gsap.to(envelope, { y: "-=6", duration: 0.4, ease: "power2.out", overwrite: "auto" });
    gsap.to(hint, { opacity: 1, letterSpacing: "0.12em", duration: 0.4, ease: "power2.out" });
  });
  envelope.addEventListener("mouseleave", () => {
    if (opened) return;
    gsap.to(envelope, { y: "+=6", duration: 0.4, ease: "power2.inOut", overwrite: "auto" });
    gsap.to(hint, { letterSpacing: "0.08em", duration: 0.4, ease: "power2.inOut" });
  });

  // ── Opening sequence ──────────────────────────────────────
  function openEnvelope() {
    if (opened) return;
    opened = true;

    floatAnim.kill();
    sealPulse.kill();
    gsap.killTweensOf([envelope, seal, shimmer]);
    gsap.set(envelope, { y: 0, rotation: 0 });

    gsap.timeline({
      onComplete() {
        document.body.style.overflow   = "";
        document.body.style.overflowX  = "hidden";
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.pointerEvents    = "none";
      },
    })

    // ① Hint and glow fade
    .to(hint,             { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" }, 0)
    .to(".env-glow",      { opacity: 0, duration: 0.4 }, 0)

    // ② Seal reacts — pop then crumble away
    .to(seal, { scale: 1.25, duration: 0.14, ease: "power2.out" }, 0.05)
    .to(seal, { scale: 0, opacity: 0, rotation: 20, duration: 0.42, ease: "back.in(3)" }, 0.19)

    // ③ Envelope rights itself with a tiny shake before opening
    .to(envelope, { x: -5, duration: 0.06, ease: "power2.out" }, 0.35)
    .to(envelope, { x: 5,  duration: 0.06, ease: "power2.out" }, 0.41)
    .to(envelope, { x: 0,  duration: 0.06, ease: "power2.out" }, 0.47)

    // ④ Flap lifts open (3D)
    .to(flap, {
      rotateX: -185,
      duration: 1.1,
      ease: "power2.inOut",
    }, 0.52)

    // ⑤ Card rises from the opened envelope
    .to(card, {
      opacity: 1,
      y: -58,
      duration: 0.65,
      ease: "power2.out",
    }, 1.0)

    // ⑥ Overlay dims further to black before reveal
    .to(overlay, { background: "#0a0402", duration: 0.5, ease: "power2.in" }, 1.6)

    // ⑦ Envelope dissolves
    .to(envelope, {
      scale: 1.08,
      opacity: 0,
      duration: 0.65,
      ease: "power2.in",
    }, 1.7)

    // ⑧ Full reveal — overlay fades out
    .to(overlay, {
      opacity: 0,
      duration: 0.75,
      ease: "power2.inOut",
    }, 2.15)

    .set(overlay, { visibility: "hidden" });
  }

  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
  });
})();

/* ══════════════════════════════════════════════════════════════
   END DIGITAL ENVELOPE
══════════════════════════════════════════════════════════════ */

const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
heroTl
  .from(".hero-content .eyebrow", { y: 28, opacity: 0, duration: 0.7 })
  .from(".hero-title", { y: 40, opacity: 0, duration: 1 }, "-=0.3")
  .from(".hero-date", { y: 25, opacity: 0, duration: 0.7 }, "-=0.5")
  .from(".cta-btn", { y: 20, opacity: 0, duration: 0.7 }, "-=0.35");

gsap.to(".hero-bg", {
  scale: 1,
  yPercent: 8,
  ease: "none",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});

gsap.from(".gallery-item", {
  opacity: 0,
  y: 28,
  duration: 0.7,
  stagger: 0.12,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".gallery-grid",
    start: "top 80%",
  },
});

// Gallery lightbox
const galleryModal = document.getElementById("galleryModal");
const galleryModalImg = document.getElementById("galleryModalImg");
const galleryCounter = document.getElementById("galleryCounter");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item img"));
let currentGalleryIndex = 0;

function openGalleryModal(index) {
  currentGalleryIndex = index;
  const img = galleryItems[index];
  galleryModalImg.src = img.src;
  galleryModalImg.alt = img.alt;
  galleryCounter.textContent = `${index + 1} / ${galleryItems.length}`;
  galleryModal.classList.add("is-open");
  galleryModal.setAttribute("aria-hidden", "false");
  gsap.fromTo(".gallery-modal-img-wrap img", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
  document.body.style.overflow = "hidden";
}

function closeGalleryModal() {
  galleryModal.classList.remove("is-open");
  galleryModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showGalleryImage(index) {
  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const img = galleryItems[currentGalleryIndex];
  gsap.to(".gallery-modal-img-wrap img", { opacity: 0, scale: 0.92, duration: 0.15, ease: "power2.in", onComplete: () => {
    galleryModalImg.src = img.src;
    galleryModalImg.alt = img.alt;
    galleryCounter.textContent = `${currentGalleryIndex + 1} / ${galleryItems.length}`;
    gsap.fromTo(".gallery-modal-img-wrap img", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
  }});
}

galleryItems.forEach((img, i) => {
  img.parentElement.addEventListener("click", () => openGalleryModal(i));
});

document.getElementById("galleryClose").addEventListener("click", closeGalleryModal);
document.getElementById("galleryBackdrop").addEventListener("click", closeGalleryModal);
document.getElementById("galleryPrev").addEventListener("click", () => showGalleryImage(currentGalleryIndex - 1));
document.getElementById("galleryNext").addEventListener("click", () => showGalleryImage(currentGalleryIndex + 1));

document.addEventListener("keydown", (e) => {
  if (!galleryModal.classList.contains("is-open")) return;
  if (e.key === "Escape") closeGalleryModal();
  if (e.key === "ArrowLeft") showGalleryImage(currentGalleryIndex - 1);
  if (e.key === "ArrowRight") showGalleryImage(currentGalleryIndex + 1);
});

gsap.from(".gift-wrap", {
  opacity: 0,
  y: 24,
  duration: 0.75,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#gift-guide",
    start: "top 82%",
  },
});

gsap
  .timeline({
    scrollTrigger: {
      trigger: "#details",
      start: "top 78%",
    },
  })
  .from(".detail-card", { y: 22, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out" })
  .from(".countdown-wrap", { y: 18, opacity: 0, duration: 0.6 }, "-=0.35");

const targetDate = new Date("2026-06-27T14:30:00").getTime();
const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const format = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const nextValues = {
    days: format(days),
    hours: format(hours),
    minutes: format(minutes),
    seconds: format(seconds),
  };

  Object.entries(nextValues).forEach(([key, value]) => {
    const el = countdownEls[key];
    if (el.textContent !== value) {
      el.textContent = value;
      gsap.fromTo(el, { scale: 1.18, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" });
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Validation modal
const validationModal = document.getElementById("validationModal");
const validationMessage = document.getElementById("validationMessage");

function showValidationModal(message) {
  validationMessage.textContent = message;
  validationModal.classList.add("is-open");
  validationModal.setAttribute("aria-hidden", "false");
}

function closeValidationModal() {
  validationModal.classList.remove("is-open");
  validationModal.setAttribute("aria-hidden", "true");
}

document.getElementById("validationClose").addEventListener("click", closeValidationModal);
document.getElementById("validationBackdrop").addEventListener("click", closeValidationModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && validationModal.classList.contains("is-open")) closeValidationModal();
});

// Injection pattern guard
function containsInjection(str) {
  const pattern = /(<[^>]+>|<\/?\w+|--|;|'|"|`|select\s|insert\s|update\s|delete\s|drop\s|alter\s|exec\s|script|onerror|onload|javascript:|union\s|from\s+\w|where\s+\w)/i;
  return pattern.test(str);
}

function countWords(str) {
  return str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
}

// Word counter
const messageInput = document.getElementById("messageInput");
const wordCounter = document.getElementById("wordCounter");

messageInput.addEventListener("input", () => {
  const count = countWords(messageInput.value);
  wordCounter.textContent = `${count} / 100 words`;
  wordCounter.classList.toggle("over", count > 100);
});

const form = document.getElementById("rsvpForm");
const rsvpSuccess = document.getElementById("rsvpSuccess");
const rsvpSuccessIcon = document.getElementById("rsvpSuccessIcon");
const rsvpSuccessTitle = document.getElementById("rsvpSuccessTitle");
const rsvpSuccessMessage = document.getElementById("rsvpSuccessMessage");
const submitAnotherBtn = document.getElementById("submitAnotherBtn");
const floatingLayer = document.getElementById("floatingLayer");

submitAnotherBtn.addEventListener("click", () => {
  rsvpSuccess.classList.remove("is-visible");
  rsvpSuccess.setAttribute("aria-hidden", "true");
  form.style.display = "";
  gsap.fromTo(form, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
});
const numberOfGuestsInput = document.getElementById("numberOfGuests");
const guestNamesContainer = document.getElementById("guestNamesContainer");

function renderGuestNameFields() {
  const guestCount = Math.max(1, Math.min(20, Number(numberOfGuestsInput.value || 1)));
  guestNamesContainer.innerHTML = "";

  for (let i = 0; i < guestCount; i += 1) {
    const wrapper = document.createElement("label");
    wrapper.className = "guest-name-row";

    const label = document.createElement("span");
    label.textContent = `Guest Name ${i + 1}`;

    const input = document.createElement("input");
    input.type = "text";
    input.name = "guestNames";
    input.maxLength = 50;
    input.required = true;
    input.placeholder = "Enter guest name";

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    guestNamesContainer.appendChild(wrapper);
  }
}

numberOfGuestsInput.addEventListener("input", renderGuestNameFields);
renderGuestNameFields();

function burstHearts() {
  const pieces = Array.from({ length: 18 }, () => {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.style.left = `${window.innerWidth * 0.5}px`;
    heart.style.top = `${window.innerHeight * 0.52}px`;
    floatingLayer.appendChild(heart);
    return heart;
  });

  pieces.forEach((heart) => {
    const x = gsap.utils.random(-180, 180);
    const y = gsap.utils.random(-250, -90);
    gsap.to(heart, {
      x,
      y,
      opacity: 0,
      duration: gsap.utils.random(1, 1.8),
      ease: "power2.out",
      onComplete: () => heart.remove(),
    });
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const numberOfGuests = Number(formData.get("numberOfGuests") || 0);
  const guestNames = formData
    .getAll("guestNames")
    .map((name) => String(name || "").trim())
    .filter(Boolean);

  const payload = {
    numberOfGuests,
    guestNames,
    attendance: formData.get("attendance"),
    message: formData.get("message"),
  };

  if (!numberOfGuests || numberOfGuests < 1 || guestNames.length !== numberOfGuests) {
    showValidationModal("Please complete all guest name fields before submitting.");
    return;
  }

  // Injection guard on names
  for (const name of guestNames) {
    if (containsInjection(name)) {
      showValidationModal("A guest name contains invalid or potentially harmful characters. Please use plain text only — no symbols, code, or special formatting.");
      return;
    }
  }

  // Message word limit
  const msgText = payload.message || "";
  if (countWords(msgText) > 100) {
    showValidationModal("Your message exceeds the 100-word limit. Please shorten it before submitting.");
    return;
  }

  // Injection guard on message
  if (containsInjection(msgText)) {
    showValidationModal("Your message contains invalid or potentially harmful characters. Please write a plain text message only — no code, links, or special formatting.");
    return;
  }

  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      showValidationModal(errData.message || "Something went wrong. Please try again.");
      return;
    }

    const isAttending = payload.attendance === "yes";

    if (isAttending) {
      rsvpSuccessIcon.textContent = "💌";
      rsvpSuccessTitle.textContent = "We received your RSVP!";
      rsvpSuccessMessage.textContent = "Thank you so much for taking the time to respond. Your presence means the world to us. We can't wait to celebrate this special day with you!";
    } else {
      rsvpSuccessIcon.textContent = "🤍";
      rsvpSuccessTitle.textContent = "Thank you for letting us know.";
      rsvpSuccessMessage.textContent = "We completely understand, and we're truly grateful that you took the time to respond. Though you won't be with us in person, you will be in our hearts as we celebrate this special day. We hope to share our joy with you soon.";
    }

    form.reset();
    renderGuestNameFields();
    gsap.to(form, { opacity: 0, y: -16, duration: 0.3, ease: "power2.in", onComplete: () => {
      form.style.display = "none";
      rsvpSuccess.classList.add("is-visible");
      rsvpSuccess.setAttribute("aria-hidden", "false");
      gsap.fromTo(rsvpSuccess, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      document.getElementById("rsvp").scrollIntoView({ behavior: "smooth", block: "start" });
    }});
    burstHearts();
  } catch {
    showValidationModal("Something went wrong while submitting your RSVP. Please try again.");
  }
});

// Dress code lightbox
const dressModal = document.getElementById("dressModal");
const dressModalImg = document.getElementById("dressModalImg");
const dressModalCounter = document.getElementById("dressModalCounter");
const dressModalImgWrap = document.getElementById("dressModalImgWrap");
const dressSlides = Array.from(document.querySelectorAll(".dress-carousel-slide img"));
let currentDressIndex = 0;

function openDressModal(index) {
  currentDressIndex = index;
  const img = dressSlides[index];
  dressModalImg.src = img.src;
  dressModalImg.alt = img.alt;
  dressModalCounter.textContent = `${index + 1} / ${dressSlides.length}`;
  dressModal.classList.add("is-open");
  dressModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  gsap.fromTo(dressModalImgWrap, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
}

function closeDressModal() {
  dressModal.classList.remove("is-open");
  dressModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showDressImage(index) {
  currentDressIndex = (index + dressSlides.length) % dressSlides.length;
  const img = dressSlides[currentDressIndex];
  gsap.to(dressModalImgWrap, { opacity: 0, scale: 0.92, duration: 0.15, ease: "power2.in", onComplete: () => {
    dressModalImg.src = img.src;
    dressModalImg.alt = img.alt;
    dressModalCounter.textContent = `${currentDressIndex + 1} / ${dressSlides.length}`;
    gsap.fromTo(dressModalImgWrap, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" });
  }});
}

dressSlides.forEach((img, i) => {
  img.parentElement.addEventListener("click", (e) => {
    if (Math.abs(e.clientX - (img.parentElement._dragStartX || e.clientX)) < 5) openDressModal(i);
  });
  img.parentElement.addEventListener("pointerdown", (e) => { img.parentElement._dragStartX = e.clientX; });
});

document.getElementById("dressModalClose").addEventListener("click", closeDressModal);
document.getElementById("dressModalBackdrop").addEventListener("click", closeDressModal);
document.getElementById("dressModalPrev").addEventListener("click", () => showDressImage(currentDressIndex - 1));
document.getElementById("dressModalNext").addEventListener("click", () => showDressImage(currentDressIndex + 1));

// Swipe inside dress modal
let dressSwipeStartX = 0;
dressModal.addEventListener("pointerdown", (e) => { dressSwipeStartX = e.clientX; });
dressModal.addEventListener("pointerup", (e) => {
  const diff = e.clientX - dressSwipeStartX;
  if (diff < -50) showDressImage(currentDressIndex + 1);
  else if (diff > 50) showDressImage(currentDressIndex - 1);
});

document.addEventListener("keydown", (e) => {
  if (!dressModal.classList.contains("is-open")) return;
  if (e.key === "Escape") closeDressModal();
  if (e.key === "ArrowLeft") showDressImage(currentDressIndex - 1);
  if (e.key === "ArrowRight") showDressImage(currentDressIndex + 1);
});

// Mobile menu
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");

function openMobileMenu() {
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.contains("is-open") ? closeMobileMenu() : openMobileMenu();
});

mobileMenuBackdrop.addEventListener("click", closeMobileMenu);

document.querySelectorAll(".mobile-menu-nav a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMobileMenu();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const giftModal = document.getElementById("giftModal");
const giftModalTitle = document.getElementById("giftModalTitle");
const giftModalImage = document.getElementById("giftModalImage");
const giftDownloadLink = document.getElementById("giftDownloadLink");
const giftButtons = document.querySelectorAll("[data-gift-type]");
const giftCloseTargets = document.querySelectorAll("[data-close-gift]");

function openGiftModal(label, imageSrc) {
  giftModalTitle.textContent = `${label} QR`;
  giftModalImage.src = imageSrc;
  giftModalImage.alt = `${label} QR code`;
  giftDownloadLink.href = imageSrc;
  giftDownloadLink.download = `${label.toLowerCase()}-qr`;

  giftModal.classList.add("is-open");
  giftModal.setAttribute("aria-hidden", "false");
  gsap.fromTo(".gift-modal-card", { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
}

function closeGiftModal() {
  giftModal.classList.remove("is-open");
  giftModal.setAttribute("aria-hidden", "true");
}

giftButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.getAttribute("data-gift-label") || "Gift";
    const imageSrc = button.getAttribute("data-gift-image") || "";
    if (!imageSrc) return;
    openGiftModal(label, imageSrc);
  });
});

giftCloseTargets.forEach((el) => {
  el.addEventListener("click", closeGiftModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && giftModal.classList.contains("is-open")) {
    closeGiftModal();
  }
});


// Dress code carousels
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".dress-carousel-track");
  const slides = carousel.querySelectorAll(".dress-carousel-slide");
  const dotsContainer = carousel.querySelector(".dress-carousel-dots");
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); resetTimer(); });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startTimer() {
    autoTimer = setInterval(() => goTo(current + 1), 3000);
  }

  function resetTimer() {
    clearInterval(autoTimer);
    startTimer();
  }

  let dragStartX = 0;
  let isDragging = false;

  carousel.addEventListener("pointerdown", (e) => { dragStartX = e.clientX; isDragging = true; clearInterval(autoTimer); });
  carousel.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    track.style.transition = "none";
    track.style.transform = `translateX(calc(-${current * 100}% + ${diff}px))`;
  });
  carousel.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "";
    const diff = e.clientX - dragStartX;
    if (diff < -50) goTo(current + 1);
    else if (diff > 50) goTo(current - 1);
    else goTo(current);
    resetTimer();
  });
  carousel.addEventListener("pointerleave", () => {
    if (isDragging) { isDragging = false; track.style.transition = ""; goTo(current); resetTimer(); }
  });

  startTimer();
});

// Global floating hearts — more count, varied sizes & opacities
(function spawnGlobalHearts() {
  const sizes  = [6, 8, 10, 12, 14];
  const opacities = [0.25, 0.30, 0.35, 0.40, 0.45];

  for (let i = 0; i < 22; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    const sz = sizes[i % sizes.length];
    const op = opacities[Math.floor(Math.random() * opacities.length)];
    heart.style.setProperty("--fh-size", `${sz}px`);
    heart.style.setProperty("--fh-opacity", op);
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top  = `${70 + Math.random() * 30}%`;
    floatingLayer.appendChild(heart);

    gsap.to(heart, {
      y: -window.innerHeight - 150,
      x: gsap.utils.random(-55, 55),
      duration: gsap.utils.random(9, 20),
      repeat: -1,
      delay: gsap.utils.random(0, 10),
      ease: "none",
    });
  }
})();

// Shared helper: spawn floating hearts inside a section container
function spawnSectionHearts(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const sizes    = [5, 7, 9, 11, 13];
  const opacities = [0.20, 0.28, 0.33, 0.38];

  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    const sz = sizes[i % sizes.length];
    const op = opacities[Math.floor(Math.random() * opacities.length)];
    heart.style.setProperty("--fh-size", `${sz}px`);
    heart.style.setProperty("--fh-opacity", op);
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top  = `${80 + Math.random() * 20}%`;
    container.appendChild(heart);

    gsap.to(heart, {
      y: -(container.offsetHeight + 100),
      x: gsap.utils.random(-40, 40),
      duration: gsap.utils.random(8, 16),
      repeat: -1,
      delay: gsap.utils.random(0, 8),
      ease: "none",
    });
  }
}

spawnSectionHearts("detailsHearts", 14);
spawnSectionHearts("programHearts", 14);
spawnSectionHearts("giftHearts", 12);

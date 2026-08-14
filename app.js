const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;
const header = document.querySelector(".site-header");
const preloader = document.querySelector(".preloader");
const brand = document.querySelector(".brand");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const mobileNavClose = document.querySelector(".mobile-nav-close");
const scrollTopButton = document.querySelector(".scroll-top");
const stickyActions = document.querySelector(".sticky-actions");
const leadModal = document.querySelector("#leadModal");
const floorLightbox = document.querySelector("#floorLightbox");
const mediaLightbox = document.querySelector("#mediaLightbox");

const finishPreloader = (() => {
  let finished = false;

  return () => {
    if (finished) return;
    finished = true;

    window.setTimeout(() => {
      preloader?.classList.add("is-complete");
      body.classList.remove("is-loading");
      body.classList.add("experience-ready");
    }, reduceMotion ? 0 : 120);

    window.setTimeout(() => preloader?.classList.add("is-hidden"), reduceMotion ? 0 : 1180);
  };
})();

const startPreloader = () => {
  if (reduceMotion || !preloader) {
    finishPreloader();
    return;
  }

  const startedAt = performance.now();
  const minimumDuration = 1250;
  const maximumDuration = 1950;

  const finishAfterMinimum = () => {
    const remaining = Math.max(0, minimumDuration - (performance.now() - startedAt));
    window.setTimeout(finishPreloader, remaining);
  };

  if (document.readyState === "complete") finishAfterMinimum();
  else window.addEventListener("load", finishAfterMinimum, { once: true });

  window.setTimeout(finishPreloader, maximumDuration);
};

startPreloader();

const revealTargets = document.querySelectorAll(
  ".reveal-copy, .reveal-mask, .image-reveal, .project-ledger div, .stat-grid article, .address-chapter, .commercial-statements article, .amenities-list article, .creative, .trust-ledger div, .faq-list details, .connectivity-diagram"
);

const revealVisibleTargets = () => {
  const viewportBottom = window.innerHeight * 0.93;

  revealTargets.forEach((target) => {
    if (target.classList.contains("is-revealed")) return;
    const rect = target.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= viewportBottom) return;
    target.classList.add("is-revealed");
  });
};

if (reduceMotion) {
  revealTargets.forEach((target) => target.classList.add("is-revealed"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = [...(entry.target.parentElement?.children || [])];
        const siblingIndex = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = `${Math.min(siblingIndex, 5) * 65}ms`;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
}

const statItems = document.querySelectorAll(".stat-grid article");

const countStat = (item) => {
  const numberNode = item.querySelector("strong[data-count]");
  if (!numberNode || numberNode.dataset.counted === "true") return;

  numberNode.dataset.counted = "true";
  const finalText = numberNode.textContent.trim();
  const target = Number(numberNode.dataset.count || 0);

  if (reduceMotion || !target) {
    numberNode.textContent = finalText;
    return;
  }

  const startedAt = performance.now();
  const duration = 1150;

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.max(1, Math.round(target * eased));

    if (finalText.includes("M")) {
      numberNode.textContent = `${current}M+`;
    } else if (finalText.includes(",")) {
      numberNode.textContent = `${current.toLocaleString("en-IN")}+`;
    } else {
      numberNode.textContent = `${current}+`;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      numberNode.textContent = finalText;
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countStat(entry.target);
        statObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );
  statItems.forEach((item) => statObserver.observe(item));
} else {
  statItems.forEach(countStat);
}

const setMenu = (open) => {
  if (!mobileNav || !menuToggle) return;
  mobileNav.classList.toggle("is-open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  body.classList.toggle("menu-open", open);

  if (open) {
    mobileNav.querySelector("a")?.focus();
  }
};

menuToggle?.addEventListener("click", () => setMenu(!mobileNav?.classList.contains("is-open")));
mobileNavClose?.addEventListener("click", () => setMenu(false));
mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a, [data-open-form]")) setMenu(false);
});

const openFormButtons = document.querySelectorAll("[data-open-form]");
const closeFormButtons = document.querySelectorAll("[data-close-form]");
let leadModalIsOpen = false;
let modalScrollPosition = 0;
let modalTrigger = null;

const setLeadModal = (open, trigger = null) => {
  if (!leadModal) return;
  if (open === leadModalIsOpen) return;
  leadModalIsOpen = open;
  leadModal.classList.toggle("is-open", open);
  leadModal.setAttribute("aria-hidden", String(!open));

  if (open) {
    modalScrollPosition = window.scrollY;
    modalTrigger = trigger || document.activeElement;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    body.style.setProperty("--modal-scroll-offset", `-${modalScrollPosition}px`);
    body.style.setProperty("--modal-scrollbar-width", `${scrollbarWidth}px`);
    body.classList.add("modal-open");
    setMenu(false);
    window.setTimeout(() => leadModal.querySelector("input")?.focus(), 120);
  } else {
    body.classList.remove("modal-open");
    body.style.removeProperty("--modal-scroll-offset");
    body.style.removeProperty("--modal-scrollbar-width");
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, modalScrollPosition);
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
    window.setTimeout(() => modalTrigger?.focus?.(), 0);
  }
};

openFormButtons.forEach((button) => button.addEventListener("click", () => setLeadModal(true, button)));
closeFormButtons.forEach((button) => button.addEventListener("click", () => setLeadModal(false)));

const getUtmData = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
  };
};

const setFormStatus = (form, message, isError = false) => {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
};

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    if (!submit) return;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.phone = String(payload.phone || "").replace(/[^\d+]/g, "");
    payload.page_url = window.location.href;
    payload.referrer = document.referrer;
    payload.timestamp = new Date().toISOString();
    payload.source = "MEK Grand Central landing page";
    Object.assign(payload, getUtmData());

    if (!payload.name || payload.phone.length < 10) {
      setFormStatus(form, "Please enter your name and a valid mobile number.", true);
      return;
    }

    const originalLabel = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = "Sending...";
    setFormStatus(form, "");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.error || "Unable to submit enquiry.");

      form.reset();
      setFormStatus(form, "Thank you. Your enquiry has been submitted.");
      if (form.classList.contains("modal-form")) {
        window.setTimeout(() => setLeadModal(false), 1300);
      }
    } catch (error) {
      setFormStatus(form, error.message || "Something went wrong. Please call us.", true);
    } finally {
      submit.disabled = false;
      submit.innerHTML = originalLabel;
    }
  });
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.removeAttribute("open");
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) other.removeAttribute("open");
    });
  });
});

const planData = [
  {
    src: "/assets/commercial-plan-executive-suite.webp",
    alt: "MEK Grand Central executive suite floor plan",
    title: "MEK Grand Central Executive Suite Floor Plan",
    config: "Executive Suite",
    area: "764 SqFt",
    price: "Rs 1.26 Cr.",
  },
  {
    src: "/assets/commercial-plan-premium-office.webp",
    alt: "MEK Grand Central premium office floor plan",
    title: "MEK Grand Central Premium Office Floor Plan",
    config: "Premium Office",
    area: "2588 SqFt",
    price: "Rs 4.27 Cr.",
  },
  {
    src: "/assets/commercial-plan-corporate-office.webp",
    alt: "MEK Grand Central corporate office floor plan",
    title: "MEK Grand Central Corporate Office Floor Plan",
    config: "Corporate Office",
    area: "4062 SqFt",
    price: "Rs 6.70 Cr.",
  },
  {
    src: "/assets/commercial-plan-floor-plate.webp",
    alt: "MEK Grand Central full floor plate plan",
    title: "MEK Grand Central Full Floor Plate Plan",
    config: "Floor Plate",
    area: "5453 SqFt",
    price: "On Request",
  },
  {
    src: "/assets/commercial-plan-boutique-office.webp",
    alt: "MEK Grand Central boutique office floor plan",
    title: "MEK Grand Central Boutique Office Floor Plan",
    config: "Boutique Office Space",
    area: "467 SqFt",
    price: "Rs 77.06 Lakhs",
  },
];

const planViewer = document.querySelector("[data-plan-viewer]");
const planButtons = [...document.querySelectorAll("[data-plan-index]")];
const planImage = document.querySelector("[data-plan-image]");
const planConfig = document.querySelector("[data-plan-config]");
const planArea = document.querySelector("[data-plan-area]");
const planPrice = document.querySelector("[data-plan-price]");
const openActivePlan = document.querySelector("[data-open-active-plan]");
let activePlanIndex = 0;

const setPlan = (index) => {
  const nextIndex = Math.max(0, Math.min(index, planData.length - 1));
  const nextPlan = planData[nextIndex];
  activePlanIndex = nextIndex;

  planButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === nextIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  planImage?.classList.add("is-changing");
  window.setTimeout(() => {
    if (planImage) {
      planImage.src = nextPlan.src;
      planImage.alt = nextPlan.alt;
      planImage.classList.remove("is-changing");
    }
    if (planConfig) planConfig.textContent = nextPlan.config;
    if (planArea) planArea.textContent = nextPlan.area;
    if (planPrice) planPrice.textContent = nextPlan.price;
  }, reduceMotion ? 0 : 220);
};

planButtons.forEach((button) => {
  button.addEventListener("click", () => setPlan(Number(button.dataset.planIndex || 0)));
});

const setFloorLightbox = (open) => {
  if (!floorLightbox) return;
  const image = floorLightbox.querySelector(".floor-lightbox-canvas img");
  const title = floorLightbox.querySelector("#floorLightboxTitle");
  const plan = planData[activePlanIndex];

  if (open && plan) {
    if (image) {
      image.src = plan.src;
      image.alt = plan.alt;
    }
    if (title) title.textContent = plan.title;
  }

  floorLightbox.classList.toggle("is-open", open);
  floorLightbox.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("lightbox-open", open);
};

openActivePlan?.addEventListener("click", () => setFloorLightbox(true));
document.querySelectorAll("[data-close-floor]").forEach((button) => {
  button.addEventListener("click", () => setFloorLightbox(false));
});

const mediaImage = mediaLightbox?.querySelector(".media-lightbox-canvas img");

const setMediaLightbox = (open, source = "", alt = "") => {
  if (!mediaLightbox) return;

  if (open && mediaImage) {
    mediaImage.src = source;
    mediaImage.alt = alt;
  }

  mediaLightbox.classList.toggle("is-open", open);
  mediaLightbox.setAttribute("aria-hidden", String(!open));
  body.classList.toggle("lightbox-open", open);
};

document.querySelectorAll("[data-creative-src]").forEach((button) => {
  button.addEventListener("click", () => {
    setMediaLightbox(true, button.dataset.creativeSrc, button.dataset.creativeAlt || "Project creative");
  });
});

document.querySelectorAll("[data-close-media]").forEach((button) => {
  button.addEventListener("click", () => setMediaLightbox(false));
});

const gallery = document.querySelector("[data-gallery-slider]");
let showGalleryImage = () => {};
let updateScrollGallery = () => {};

if (gallery) {
  const images = [...gallery.querySelectorAll(".gallery-image")];
  const thumbs = [...gallery.querySelectorAll(".gallery-thumb")];
  const counter = gallery.querySelector("[data-gallery-count]");
  const previous = gallery.querySelector(".gallery-prev");
  const next = gallery.querySelector(".gallery-next");
  const backdrop = gallery.querySelector(".gallery-backdrop");
  const backgroundLayers = [document.createElement("span"), document.createElement("span")];
  let currentIndex = 0;
  let activeBackground = 0;
  let autoTimer = null;
  let galleryVisible = false;
  let manualGalleryUntil = 0;

  backgroundLayers.forEach((layer) => {
    layer.className = "gallery-bg-layer";
    backdrop?.appendChild(layer);
  });

  const imageUrl = (index) => images[index]?.currentSrc || images[index]?.src || "";

  const setBackground = (url, immediate = false) => {
    if (!url) return;
    const nextBackground = immediate ? activeBackground : 1 - activeBackground;
    backgroundLayers[nextBackground].style.backgroundImage = `url("${url}")`;
    backgroundLayers[nextBackground].classList.add("is-active");
    backgroundLayers[1 - nextBackground].classList.remove("is-active");
    activeBackground = nextBackground;
  };

  showGalleryImage = (index, userInitiated = false) => {
    if (!images.length) return;
    const nextIndex = (index + images.length) % images.length;
    if (nextIndex === currentIndex && !userInitiated) return;
    currentIndex = nextIndex;
    if (userInitiated) manualGalleryUntil = performance.now() + 1800;

    images.forEach((image, imageIndex) => {
      const active = imageIndex === currentIndex;
      image.classList.toggle("is-active", active);
      image.setAttribute("aria-hidden", String(!active));
    });
    thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle("is-active", thumbIndex === currentIndex));
    if (counter) counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    setBackground(imageUrl(currentIndex));
  };

  const stopAuto = () => window.clearInterval(autoTimer);
  const startAuto = () => {
    stopAuto();
    if (reduceMotion || !galleryVisible) return;
    autoTimer = window.setInterval(() => showGalleryImage(currentIndex + 1), 4800);
  };

  previous?.addEventListener("click", () => {
    showGalleryImage(currentIndex - 1, true);
    startAuto();
  });
  next?.addEventListener("click", () => {
    showGalleryImage(currentIndex + 1, true);
    startAuto();
  });
  thumbs.forEach((thumb, index) => thumb.addEventListener("click", () => {
    showGalleryImage(index, true);
    startAuto();
  }));

  gallery.addEventListener("mouseenter", stopAuto);
  gallery.addEventListener("mouseleave", startAuto);
  gallery.addEventListener("focusin", stopAuto);
  gallery.addEventListener("focusout", startAuto);

  const galleryObserver = new IntersectionObserver((entries) => {
    galleryVisible = entries[0]?.isIntersecting || false;
    if (galleryVisible) startAuto();
    else stopAuto();
  }, { threshold: 0.18 });
  galleryObserver.observe(gallery);

  updateScrollGallery = () => {
    if (window.innerWidth <= 768 || reduceMotion) return;
    if (performance.now() < manualGalleryUntil) return;
    const rect = gallery.getBoundingClientRect();
    const scrollable = Math.max(1, gallery.offsetHeight - window.innerHeight);
    if (rect.top > 0 || rect.bottom < window.innerHeight) return;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    const index = Math.min(images.length - 1, Math.floor(progress * images.length));
    showGalleryImage(index);
  };

  setBackground(imageUrl(0), true);
  showGalleryImage(0, true);
}

const amenitiesPreview = document.querySelector("[data-amenity-preview]");
document.querySelectorAll("[data-amenity-image]").forEach((item) => {
  item.tabIndex = 0;
  const activate = () => {
    document.querySelectorAll("[data-amenity-image]").forEach((other) => other.classList.toggle("is-active", other === item));
    if (!amenitiesPreview || amenitiesPreview.src.endsWith(item.dataset.amenityImage || "")) return;
    amenitiesPreview.classList.add("is-changing");
    window.setTimeout(() => {
      amenitiesPreview.src = item.dataset.amenityImage;
      amenitiesPreview.classList.remove("is-changing");
    }, reduceMotion ? 0 : 180);
  };
  item.addEventListener("mouseenter", activate);
  item.addEventListener("focus", activate);
});

const commercialStory = document.querySelector(".commercial-story");
document.querySelectorAll("[data-commercial-image]").forEach((item) => {
  item.tabIndex = 0;
  const activate = () => commercialStory?.style.setProperty("--commercial-bg", `url("${item.dataset.commercialImage}")`);
  item.addEventListener("mouseenter", activate);
  item.addEventListener("focus", activate);
});

const navigationLinks = [...document.querySelectorAll(".desktop-nav a[href^='#'], .mobile-nav-links a[href^='#']")];
const navigationSections = [...new Set(navigationLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean))];

const setActiveNavigation = () => {
  if (!navigationSections.length) return;
  const probe = Math.min(window.innerHeight * 0.42, 380);
  let activeSection = navigationSections[0];
  let closest = Number.POSITIVE_INFINITY;

  navigationSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const distance = Math.abs(rect.top - probe);
    if (distance < closest) {
      closest = distance;
      activeSection = section;
    }
  });

  navigationLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeSection.id}`);
  });
};

const updateScrollState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  scrollTopButton?.classList.toggle("is-visible", window.scrollY > 700);
  stickyActions?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.72);
  revealVisibleTargets();
  setActiveNavigation();
  updateScrollGallery();

  if (!reduceMotion) {
    const hero = document.querySelector(".hero-media");
    const offset = Math.min(window.scrollY * 0.055, 42);
    hero?.style.setProperty("--hero-y", `${offset}px`);
  }
};

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateScrollState();
    scrollTicking = false;
  });
}, { passive: true });

scrollTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

brand?.addEventListener("click", (event) => {
  event.preventDefault();
  setMenu(false);
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  setMenu(false);
  setLeadModal(false);
  setFloorLightbox(false);
  setMediaLightbox(false);
});

window.addEventListener("load", () => {
  updateScrollState();
  if (!window.location.hash) return;
  window.setTimeout(() => {
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    const offset = (header?.offsetHeight || 0) + 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "auto" });
    requestAnimationFrame(revealVisibleTargets);
  }, reduceMotion ? 0 : 1250);
});

window.setTimeout(() => {
  let hasSeenPrompt = true;
  try {
    hasSeenPrompt = sessionStorage.getItem("mekLeadPromptSeen") === "true";
  } catch (error) {
    hasSeenPrompt = true;
  }

  if (!hasSeenPrompt && window.scrollY < 120 && !body.classList.contains("menu-open")) {
    try {
      sessionStorage.setItem("mekLeadPromptSeen", "true");
    } catch (error) {
      // Explicit enquiry controls remain available when storage is unavailable.
    }
    setLeadModal(true);
  }
}, 14000);

updateScrollState();

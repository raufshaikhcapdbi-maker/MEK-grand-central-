const modal = document.querySelector("#leadModal");
const loader = document.querySelector(".page-loader");
const openButtons = document.querySelectorAll("[data-open-form]");
const closeButtons = document.querySelectorAll("[data-close-form]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");
const forms = document.querySelectorAll("[data-lead-form]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.body.classList.add("is-loading");

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader?.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
  }, reduceMotion ? 0 : 520);
});

const revealTargets = [
  ...document.querySelectorAll(".section, .stat-grid article, .feature-list div, .advantage-grid article, .amenity-strip span, .gallery-card, .faq-list details"),
];

if (!reduceMotion) {
  document.body.classList.add("reveal-ready");
  revealTargets.forEach((target, index) => {
    target.classList.add("reveal-item");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  loader?.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
}

const setModal = (open) => {
  modal.classList.toggle("is-open", open);
  modal.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("modal-open", open);

  if (open) {
    const firstInput = modal.querySelector("input");
    window.setTimeout(() => firstInput?.focus(), 80);
  }
};

openButtons.forEach((button) => {
  button.addEventListener("click", () => setModal(true));
});

closeButtons.forEach((button) => {
  button.addEventListener("click", () => setModal(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setModal(false);
  }
});

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target.matches("a, button")) {
    mobileNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

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

const setStatus = (form, message, isError = false) => {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
};

const normalizePhone = (phone) => phone.replace(/[^\d+]/g, "");

forms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.phone = normalizePhone(payload.phone || "");
    payload.page_url = window.location.href;
    payload.referrer = document.referrer;
    payload.timestamp = new Date().toISOString();
    payload.source = "MEK Grand Central landing page";
    Object.assign(payload, getUtmData());

    if (!payload.name || payload.phone.length < 10) {
      setStatus(form, "Please enter your name and a valid mobile number.", true);
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending...";
    setStatus(form, "");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit enquiry.");
      }

      form.reset();
      setStatus(form, "Thank you. Your enquiry has been submitted.");
      window.setTimeout(() => setModal(false), 1100);
    } catch (error) {
      setStatus(form, error.message || "Something went wrong. Please call us.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = form.classList.contains("modal-form") ? "Send Enquiry" : "Submit Enquiry";
    }
  });
});

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const stat = entry.target.querySelector("strong");
      if (!stat || stat.dataset.counted) return;

      stat.dataset.counted = "true";
      const original = stat.textContent.trim();
      const number = Number(original.replace(/[^0-9.]/g, ""));
      const suffix = original.replace(/[0-9.,]/g, "");
      const hasComma = original.includes(",");

      if (!number || reduceMotion) {
        stat.textContent = original;
        return;
      }

      const startedAt = performance.now();
      const duration = 1100;

      const tick = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let value = Math.round(number * eased);

        if (original.includes("M")) {
          value = Math.max(1, Math.round(number * eased));
        }

        stat.textContent = `${hasComma ? value.toLocaleString("en-IN") : value}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          stat.textContent = original;
        }
      };

      requestAnimationFrame(tick);
      statObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-grid article").forEach((item) => statObserver.observe(item));

const heroImage = document.querySelector(".hero-media img");
let ticking = false;

const updateParallax = () => {
  if (!heroImage || reduceMotion) return;
  const offset = Math.min(window.scrollY * 0.08, 70);
  heroImage.style.transform = `scale(1.06) translateY(${offset}px)`;
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  },
  { passive: true }
);

window.setTimeout(() => {
  setModal(true);
}, 5000);

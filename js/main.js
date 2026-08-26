/* Shared helpers used across every page */

function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

// For your own uploaded photos (content/uploads/...), routes the image
// through Netlify's built-in Image CDN, which automatically resizes it
// to `width` and serves it as WebP/AVIF where the visitor's browser
// supports it — so a large uploaded photo is never sent at full size.
// External URLs (Unsplash, etc.) are left as-is and just cache-busted.
// `width` should roughly match how large the image actually displays —
// no point fetching a 1600px image for a 120px thumbnail.
function bustImg(url, width){
  if(!url) return url;
  const cb = window.IMG_CACHE_BUST || Date.now();
  const isOwnUpload = url.indexOf("/content/uploads/") === 0 || url.indexOf("content/uploads/") === 0;
  if(isOwnUpload){
    const w = width || 1200;
    return "/.netlify/images?url=" + encodeURIComponent(url) + "&width=" + w + "&_cb=" + cb;
  }
  const sep = url.includes("?") ? "&" : "?";
  return url + sep + "_cb=" + cb;
}

// Renders the key-stat chip used on dormitory cards (e.g. "4,200 beds").
function specPlateHTML(indexNo, value, labelText){
  return `<div class="spec-plate">
    <span class="val">${value}</span>&nbsp;<span class="k">${labelText}</span>
  </div>`;
}

// Renders the availability badge shown on dormitory cards and detail
// pages — one of exactly three states: "Beds Available", "Waitlist",
// or "Fully Booked". Set each dormitory's `status` field in data.js
// (values: "available" | "waitlist" | "full") to control this.
function availabilityBadgeHTML(status){
  if(status === "waitlist"){
    return `<span class="avail-badge avail-waitlist"><i class="dot"></i>Waitlist</span>`;
  }
  if(status === "full"){
    return `<span class="avail-badge avail-full"><i class="dot"></i>Fully Booked</span>`;
  }
  return `<span class="avail-badge avail-open"><i class="dot"></i>Beds Available</span>`;
}

// Central place for the contact details used by the enquiry form,
// footer, and the floating quick-contact button. Update these once
// and every page picks them up.
const CONTACT_INFO = {
  phone: "+65 6000 0000",
  phoneHref: "tel:+6560000000",
  email: "janell@dwall.com.sg",
  whatsapp: "" // add your WhatsApp Business number (e.g. "6580001234") to enable the WhatsApp option below
};

// Injects a fixed, bottom-right "quick contact" button on every page
// (built here in JS rather than duplicated HTML so it only needs to
// be maintained in one place). Expands to show call / email / WhatsApp
// options — WhatsApp only appears once CONTACT_INFO.whatsapp is set.
function initQuickContact(){
  if(document.getElementById("quick-contact")) return;
  const waLink = CONTACT_INFO.whatsapp
    ? `<a href="https://wa.me/${CONTACT_INFO.whatsapp}" target="_blank" rel="noopener" class="qc-option qc-whatsapp">
         <span class="qc-label">WhatsApp us</span>
       </a>`
    : "";
  const wrap = document.createElement("div");
  wrap.id = "quick-contact";
  wrap.className = "quick-contact";
  wrap.innerHTML = `
    <div class="qc-menu">
      <a href="${CONTACT_INFO.phoneHref}" class="qc-option qc-call"><span class="qc-label">Call ${CONTACT_INFO.phone}</span></a>
      <a href="mailto:${CONTACT_INFO.email}" class="qc-option qc-email"><span class="qc-label">Email us</span></a>
      ${waLink}
      <a href="index.html#contact" class="qc-option qc-form"><span class="qc-label">Send an enquiry</span></a>
    </div>
    <button type="button" class="qc-toggle" aria-label="Contact us">
      <span class="qc-icon-open">Contact us</span>
      <span class="qc-icon-close">Close</span>
    </button>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector(".qc-toggle").addEventListener("click", ()=>{
    wrap.classList.toggle("open");
  });
  document.addEventListener("click", (e)=>{
    if(wrap.classList.contains("open") && !wrap.contains(e.target)){
      wrap.classList.remove("open");
    }
  });
}

function initRevealOnScroll(){
  const items = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    items.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

// Wires up any <form data-enquiry-form> on the page: prevents the
// default submit (no backend is connected yet), shows a confirmation
// message, and logs the payload to the console so it's easy to see
// what a real backend/CRM integration would receive.
function initEnquiryForms(){
  document.querySelectorAll("form[data-enquiry-form]").forEach(form=>{
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      console.log("Enquiry submitted (wire this up to your CRM/email):", data);
      const success = form.parentElement.querySelector(".form-success") || form.querySelector(".form-success");
      form.querySelectorAll("input, textarea, select").forEach(el => { if(el.type !== "hidden") el.value = ""; });
      if(success){
        success.style.display = "block";
        setTimeout(()=>{ success.style.display = "none"; }, 6000);
      }
    });
  });
}

function setActiveNav(){
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links > a[data-nav]").forEach(a=>{
    if(a.getAttribute("data-nav") === path) a.classList.add("active");
  });
  const accToggle = document.querySelector(".nav-dropdown-toggle");
  if(accToggle && (path === "hospitality.html" || path === "detail.html")){
    accToggle.classList.add("active");
  }
}

// Click-to-toggle dropdown (works on both touch and desktop; closes on outside click / Escape).
function initNavDropdowns(){
  document.querySelectorAll(".nav-dropdown").forEach(dd=>{
    const toggle = dd.querySelector(".nav-dropdown-toggle");
    if(!toggle) return;
    toggle.addEventListener("click", (e)=>{
      e.stopPropagation();
      const isOpen = dd.classList.contains("open");
      document.querySelectorAll(".nav-dropdown.open").forEach(o => o.classList.remove("open"));
      if(!isOpen) dd.classList.add("open");
    });
  });
  document.addEventListener("click", ()=>{
    document.querySelectorAll(".nav-dropdown.open").forEach(o => o.classList.remove("open"));
  });
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape"){
      document.querySelectorAll(".nav-dropdown.open").forEach(o => o.classList.remove("open"));
    }
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  initRevealOnScroll();
  initEnquiryForms();
  setActiveNav();
  initNavDropdowns();
  initQuickContact();
});

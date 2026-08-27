window.CONTENT_READY.then(function(){
  const type = getParam("type") || "dormitory";
  const id = getParam("id");
  const list = type === "hostel" ? HOSTELS : DORMITORIES;
  const item = list.find(x => x.id === id) || list[0];
  const root = document.getElementById("detail-root");

  if(!item){
    root.innerHTML = `<div class="page-hero"><h1>We couldn't find that listing.</h1><p class="lead"><a href="/">Back to homepage</a></p></div>`;
    return;
  }

  document.title = item.name + " — D Wall";
  const backHref = type === "hostel" ? "/hospitality" : "/#dormitories";
  const backLabel = type === "hostel" ? "Other Accommodations" : "Dormitories";

  // ---- Gallery (dormitories ship with a gallery array; hostels use heroImage twice as a graceful fallback) ----
  const galleryImages = item.gallery && item.gallery.length ? item.gallery : [item.heroImage, item.heroImage, item.heroImage];
  const extraCount = Math.max(0, galleryImages.length - 3);

  const galleryHTML = `
    <div class="gallery bracket reveal">
      <span class="bl"></span><span class="br"></span>
      <div class="main" data-gallery-open="0"><img src="${bustImg(galleryImages[0], 1200)}" alt="${item.name}" loading="eager" fetchpriority="high" decoding="async"></div>
      <div class="side">
        <div data-gallery-open="1"><img src="${bustImg(galleryImages[1] || galleryImages[0], 500)}" alt="${item.name}" loading="lazy" decoding="async"></div>
        <div data-gallery-open="2" data-more="${extraCount > 0 ? "View all " + galleryImages.length + " photos" : ""}"><img src="${bustImg(galleryImages[2] || galleryImages[0], 500)}" alt="${item.name}" loading="lazy" decoding="async"></div>
      </div>
    </div>`;

  const statusLabel = { available: "Beds Available", waitlist: "Waitlist", full: "Fully Booked" }[item.status] || "—";

  // ---- Fact row (dormitories get the full operational stats; hostels get a lighter set) ----
  const factRowHTML = type === "hostel"
    ? `<div class="fact-row reveal">
         <div class="fact"><span class="v">${item.location}</span><span class="k">Location</span></div>
         <div class="fact"><span class="v">${item.facilities.length}</span><span class="k">Facilities</span></div>
         <div class="fact"><span class="v">TWL Hospitality</span><span class="k">Brand</span></div>
       </div>`
    : `<div class="fact-row reveal">
         <div class="fact"><span class="v">${item.beds.toLocaleString()}</span><span class="k">Total beds</span></div>
         <div class="fact"><span class="v">${statusLabel}</span><span class="k">Status</span></div>
         <div class="fact"><span class="v">${item.roomTypes}</span><span class="k">Room types</span></div>
         <div class="fact"><span class="v">${item.yearBuilt}</span><span class="k">Built</span></div>
         <div class="fact"><span class="v">${item.distance}</span><span class="k">Nearest checkpoint</span></div>
       </div>`;

  // ---- Write-up ----
  const writeupHTML = item.writeup.map(p => `<p>${p}</p>`).join("");

  // ---- Facilities: dormitories split into In-Room Amenities + Communal Facilities; hostels use a single list ----
  const hasSplitFacilities = type !== "hostel" && item.roomAmenities && item.communalFacilities;
  const facilitiesSectionHTML = hasSplitFacilities
    ? `<h2 style="margin-top:44px;">In-Room Amenities</h2>
       <div class="facility-grid">${item.roomAmenities.map(f => `<div class="facility"><span class="dot"></span>${f}</div>`).join("")}</div>

       <h2 style="margin-top:44px;">Communal Facilities</h2>
       <div class="facility-grid">${item.communalFacilities.map(f => `<div class="facility"><span class="dot"></span>${f}</div>`).join("")}</div>`
    : `<h2 style="margin-top:44px;">Facilities</h2>
       <div class="facility-grid">${item.facilities.map(f => `<div class="facility"><span class="dot"></span>${f}</div>`).join("")}</div>`;

  // ---- Map ----
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(item.mapQuery)}&output=embed`;

  // ---- VR / video tours ----
  function tourCard(labelOn, labelOff, url, kind){
    if(url){
      const frame = kind === "video"
        ? `<video src="${url}" controls></video>`
        : `<iframe src="${url}" allow="xr-spatial-tracking; gyroscope; accelerometer" allowfullscreen></iframe>`;
      return `<div class="tour-card">
        <div class="frame">${frame}</div>
        <div class="meta"><span>${labelOn}</span></div>
      </div>`;
    }
    return `<div class="tour-card">
      <div class="frame"><div class="play">${labelOff}</div></div>
      <div class="meta"><span style="color:var(--ink-soft); font-weight:500;">Embed link not added yet</span></div>
    </div>`;
  }
  const toursHTML = `<div class="tour-grid reveal">
    ${tourCard("360° VR walkthrough", "VR tour coming soon", item.vrTourUrl, "vr")}
    ${tourCard("Video tour", "Video tour coming soon", item.videoTourUrl, "video")}
  </div>`;

  // ---- Enquiry form ----
  const enquiryHTML = `
    <div class="side-card" id="enquire">
      <h3>${type === "hostel" ? `Enquire about ${item.name}` : "Check availability"}</h3>
      ${type !== "hostel" ? availabilityBadgeHTML(item.status) : ""}
      <form data-enquiry-form style="margin-top:${type !== "hostel" ? "16px" : "0"};">
        <input type="hidden" name="listing" value="${item.name}">
        <div class="form-row">
          <label for="d-name">Name</label>
          <input id="d-name" name="name" type="text" required placeholder="Your full name">
        </div>
        <div class="form-row">
          <label for="d-company">Company</label>
          <input id="d-company" name="company" type="text" placeholder="Company / employer">
        </div>
        <div class="form-row">
          <label for="d-email">Email</label>
          <input id="d-email" name="email" type="email" required placeholder="you@company.com">
        </div>
        <div class="form-row">
          <label for="d-message">Message</label>
          <textarea id="d-message" name="message" placeholder="Number of beds needed, preferred move-in date..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">${type === "hostel" ? "Send enquiry" : "Check availability"}</button>
        <div class="form-success">Thanks — your enquiry has been noted. We'll be in touch shortly.</div>
      </form>
    </div>`;

  root.innerHTML = `
    <div class="crumb"><a href="${backHref}">← ${backLabel}</a></div>
    <div class="detail-title-row">
      <div>
        <span class="index-label">${type === "hostel" ? "TWL Hospitality" : "D Wall dormitory"}</span>
        <h1 style="margin-top:10px; font-size:clamp(1.8rem,3.4vw,2.6rem);">${item.name}</h1>
        <div class="detail-loc">📍 ${item.location}</div>
      </div>
      <a href="${type === "hostel" ? "/#contact" : "#enquire"}" class="btn btn-outline">${type === "hostel" ? "Enquire now" : "Check availability"}</a>
    </div>

    ${galleryHTML}
    ${factRowHTML}

    <div class="detail-body">
      <div class="writeup">
        <h2>About this ${type === "hostel" ? "hostel" : "dormitory"}</h2>
        ${writeupHTML}

        ${facilitiesSectionHTML}

        <h2 style="margin-top:44px;">Location</h2>
        <div class="map-embed"><iframe src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>

        <h2 style="margin-top:44px;">Tours</h2>
        ${toursHTML}
      </div>
      <div class="detail-side">
        ${enquiryHTML}
        ${type === "hostel" && item.website ? `<div class="side-card"><h3>Book direct</h3><p style="font-size:14px;">See live rates and availability on the TWL Hospitality site.</p><a href="${item.website}" target="_blank" rel="noopener" class="btn btn-outline" style="margin-top:14px; width:100%; justify-content:center;">Visit twlhospitality.com</a></div>` : ""}
      </div>
    </div>
  `;

  // The gallery / fact-row / tour-grid above are created fresh here, after
  // DOMContentLoaded already ran the page's "fade in on scroll" setup once —
  // so that setup missed them. Re-run it now that they actually exist.
  initRevealOnScroll();

  // ---- Full photo gallery lightbox: shows every photo, not just the 3 preview boxes ----
  if(!document.getElementById("gallery-lightbox")){
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.id = "gallery-lightbox";
    lb.innerHTML = `
      <div class="lightbox-card gallery-lightbox-card">
        <button type="button" class="lightbox-close" id="gallery-lightbox-close" aria-label="Close">✕</button>
        <button type="button" class="gallery-lightbox-nav prev" id="gallery-lightbox-prev" aria-label="Previous photo">‹</button>
        <img id="gallery-lightbox-img" alt="">
        <button type="button" class="gallery-lightbox-nav next" id="gallery-lightbox-next" aria-label="Next photo">›</button>
        <div class="gallery-lightbox-count" id="gallery-lightbox-count"></div>
      </div>`;
    document.body.appendChild(lb);
  }
  const lbEl = document.getElementById("gallery-lightbox");
  const lbImg = document.getElementById("gallery-lightbox-img");
  const lbCount = document.getElementById("gallery-lightbox-count");
  let lbIndex = 0;

  function showLbImage(i){
    lbIndex = (i + galleryImages.length) % galleryImages.length;
    lbImg.src = bustImg(galleryImages[lbIndex], 1600);
    lbImg.alt = item.name;
    lbCount.textContent = (lbIndex + 1) + " / " + galleryImages.length;
  }
  function openLightbox(i){
    showLbImage(i);
    lbEl.classList.add("open");
  }
  document.querySelectorAll("[data-gallery-open]").forEach(el=>{
    el.style.cursor = "pointer";
    el.addEventListener("click", ()=> openLightbox(parseInt(el.getAttribute("data-gallery-open"), 10) || 0));
  });
  document.getElementById("gallery-lightbox-close").onclick = () => lbEl.classList.remove("open");
  document.getElementById("gallery-lightbox-prev").onclick = () => showLbImage(lbIndex - 1);
  document.getElementById("gallery-lightbox-next").onclick = () => showLbImage(lbIndex + 1);
  lbEl.addEventListener("click", (e)=>{ if(e.target === lbEl) lbEl.classList.remove("open"); });
  document.addEventListener("keydown", (e)=>{
    if(!lbEl.classList.contains("open")) return;
    if(e.key === "Escape") lbEl.classList.remove("open");
    if(e.key === "ArrowLeft") showLbImage(lbIndex - 1);
    if(e.key === "ArrowRight") showLbImage(lbIndex + 1);
  });
});

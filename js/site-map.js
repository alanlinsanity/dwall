window.CONTENT_READY.then(function(){
  const mapEl = document.getElementById("site-map");
  if(!mapEl || typeof L === "undefined") return;

  const map = L.map("site-map", {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([1.345, 103.79], 8);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 18
  }).addTo(map);

  function pinIcon(color){
    return L.divIcon({
      className: "",
      html: `<div class="map-pin-dot" style="width:16px;height:16px;background:${color};"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  }

  const navyIcon = pinIcon("var(--navy)");
  const goldIcon = pinIcon("var(--yellow)");
  const bounds = [];

  function addPin(item, kind){
    if(typeof item.lat !== "number" || typeof item.lng !== "number") return;
    const isDorm = kind === "dormitory";
    const icon = isDorm ? navyIcon : goldIcon;
    const detailUrl = `detail.html?type=${kind}&id=${item.id}`;
    const statLine = isDorm ? `${item.beds.toLocaleString()} beds` : "Backpacker hostel";

    const popupHTML = `<div class="map-pin-popup">
      <span class="kind ${isDorm ? "dorm" : "hostel"}">${isDorm ? "D Wall dormitory" : "TWL Hospitality"}</span>
      <span class="name">${item.name}</span>
      <span class="meta">${item.location} · ${statLine}</span>
      <a href="${detailUrl}">View details →</a>
    </div>`;

    L.marker([item.lat, item.lng], { icon }).addTo(map).bindPopup(popupHTML);
    bounds.push([item.lat, item.lng]);
  }

  if(typeof DORMITORIES !== "undefined") DORMITORIES.forEach(d => addPin(d, "dormitory"));
  if(typeof HOSTELS !== "undefined") HOSTELS.forEach(h => addPin(h, "hostel"));

  if(bounds.length){
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
  }
});

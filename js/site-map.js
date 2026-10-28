window.CONTENT_READY.then(function(){
  const mapEl = document.getElementById("site-map");
  if(!mapEl || typeof L === "undefined") return;

  const map = L.map("site-map", {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([1.345, 103.79], 11);

  // Keyless basemap (standard OpenStreetMap tiles, no API key needed).
  // If those tiles ever fail to load, fall back to Esri's free street map.
  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  let switched = false;
  osm.on("tileerror", function(){
    if(switched) return;
    switched = true;
    map.removeLayer(osm);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 18
    }).addTo(map);
  });

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

  // Anchor the visible area to the whole of Singapore (roughly Tuas in
  // the west to Changi in the east, Woodlands in the north to Sentosa
  // in the south) so the map always shows the full island, regardless
  // of how tightly clustered the actual property pins happen to be.
  const bounds = [
    [1.15, 103.60],
    [1.48, 104.10]
  ];

  function addPin(item, kind){
    if(typeof item.lat !== "number" || typeof item.lng !== "number") return;
    const isDorm = kind === "dormitory";
    const icon = isDorm ? navyIcon : goldIcon;
    const detailUrl = `/detail?type=${kind}&id=${item.id}`;
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
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
  }
});

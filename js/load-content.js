/* Loads site content from /content/*.json — the files the CMS edits —
   and exposes them as the same global arrays (DORMITORIES, HOSTELS,
   PROJECTS, TEAM) that every page's rendering script already expects.
   Other scripts should wait on window.CONTENT_READY before reading
   these globals, since fetching is asynchronous:

     window.CONTENT_READY.then(() => { ...use DORMITORIES etc... });

   This keeps every existing render script working unchanged — only
   the *loading* mechanism changed, not how the data is shaped or used. */

window.CONTENT_READY = (async function loadContent(){
  // Cache-bust every load: a plain fetch() can be served from the
  // browser's HTTP cache even after new content is deployed, which is
  // the #1 cause of "I edited it but the site still shows the old
  // version." The timestamp query param plus cache:"no-store" forces
  // a fresh network request every time.
  const v = Date.now();
  window.IMG_CACHE_BUST = v; // reused below to bust image caching too
  const base = "content/";
  try{
    const [dormRes, hostelRes, projRes, teamRes, heroRes] = await Promise.all([
      fetch(base + "dormitories.json?v=" + v, { cache: "no-store" }),
      fetch(base + "hostels.json?v=" + v, { cache: "no-store" }),
      fetch(base + "projects.json?v=" + v, { cache: "no-store" }),
      fetch(base + "team.json?v=" + v, { cache: "no-store" }),
      fetch(base + "hero.json?v=" + v, { cache: "no-store" })
    ]);
    const [dorm, hostel, proj, team, hero] = await Promise.all([
      dormRes.json(), hostelRes.json(), projRes.json(), teamRes.json(), heroRes.json()
    ]);
    window.DORMITORIES = dorm.dormitories || [];
    window.HOSTELS = hostel.hostels || [];
    window.PROJECTS = proj.projects || [];
    window.TEAM = team.team || [];
    window.HERO_IMAGES = hero.heroImages || [];
  } catch(err){
    console.error("Failed to load site content from /content/*.json:", err);
    window.DORMITORIES = window.DORMITORIES || [];
    window.HOSTELS = window.HOSTELS || [];
    window.PROJECTS = window.PROJECTS || [];
    window.TEAM = window.TEAM || [];
    window.HERO_IMAGES = window.HERO_IMAGES || [];
  }
})();

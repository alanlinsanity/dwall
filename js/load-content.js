/* Loads site content from /content/*.json — the files the CMS edits —
   and exposes them as the same global arrays (DORMITORIES, HOSTELS,
   PROJECTS, TEAM) that every page's rendering script already expects.
   Other scripts should wait on window.CONTENT_READY before reading
   these globals, since fetching is asynchronous:

     window.CONTENT_READY.then(() => { ...use DORMITORIES etc... });

   This keeps every existing render script working unchanged — only
   the *loading* mechanism changed, not how the data is shaped or used. */

window.CONTENT_READY = (async function loadContent(){
  const base = "content/";
  try{
    const [dormRes, hostelRes, projRes, teamRes] = await Promise.all([
      fetch(base + "dormitories.json"),
      fetch(base + "hostels.json"),
      fetch(base + "projects.json"),
      fetch(base + "team.json")
    ]);
    const [dorm, hostel, proj, team] = await Promise.all([
      dormRes.json(), hostelRes.json(), projRes.json(), teamRes.json()
    ]);
    window.DORMITORIES = dorm.dormitories || [];
    window.HOSTELS = hostel.hostels || [];
    window.PROJECTS = proj.projects || [];
    window.TEAM = team.team || [];
  } catch(err){
    console.error("Failed to load site content from /content/*.json:", err);
    window.DORMITORIES = window.DORMITORIES || [];
    window.HOSTELS = window.HOSTELS || [];
    window.PROJECTS = window.PROJECTS || [];
    window.TEAM = window.TEAM || [];
  }
})();

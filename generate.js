const fs = require("fs");

const data = JSON.parse(fs.readFileSync("projects.json", "utf8"));

const visibilityMap = {};
try {
  const csvText = fs.readFileSync("projects.csv", "utf8");
  if (csvText) {
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    const headerRaw = lines.shift();
    const headerCols = headerRaw.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, "").trim());
    const nameIdx = headerCols.indexOf("name");
    const visIdx = headerCols.indexOf("visibility");

    lines.forEach(line => {
      const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s => s.replace(/^"|"$/g, ""));
      while (cols.length < headerCols.length) cols.push("");
      const name = (cols[nameIdx] || "").toLowerCase().trim();
      const vis = (cols[visIdx] || "").trim();
      if (name) visibilityMap[name] = vis;
    });
  }
} catch (e) {
  console.warn("Could not read projects.csv for visibility:", e.message);
}

const bases = {
  prime: "https://github.com/probabilityzero/",
  han: "https://github.com/hanslibrary/"
};

const archivedStatuses = ["successful", "archived", "live", "idea", "merged", "failed", "-"];
const isArchived = status => archivedStatuses.includes(status);

function renderStatus(item) {
  return item.live ? `[${item.status}](${item.live})` : item.status;
}

function collectProjects(portfolio, archivedFlag) {
  const result = [];

  Object.entries(portfolio).forEach(([type, items]) => {
    items.forEach(item => {
      const archived = isArchived(item.status);
      if (archivedFlag === archived) result.push({ ...item, type });
    });
  });

  result.sort((a, b) =>
    a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
  );

  return result;
}

function collectAll(portfolio) {
  const result = [];

  Object.entries(portfolio).forEach(([type, items]) => {
    items.forEach(item => result.push({ ...item, type }));
  });

  result.sort((a, b) =>
    a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
  );

  return result;
}

function generateTable(items, owner) {
  const lockPath = "assets/icons/lock.png";
  let table =
     `| Projects&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Repositories&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |\n` +
    `|--------|---------|--------|\n`;
  let lastType = "";
  items.forEach(item => {
    const type = item.type === lastType ? "" : item.type;
    lastType = item.type;
    const base = bases[owner];
    const vis = (visibilityMap[item.name.toLowerCase()] || item.visibility || "").toUpperCase();
    const lockHtml = vis && vis !== "PUBLIC" ? ` <img src="${lockPath}" alt="private" width="14" />` : "";
    table += `| ${type} | [${item.name}](${base}${item.name})${lockHtml} | ${renderStatus(item)} |\n`;
  });
  return table;
}

function htmlTable(items, owner, title) {
  let rows = "";
  let i = 1;

  items.forEach(item => {
    const repo = bases[owner] + item.name;
    const live = item.live ? `<a class="live" href="${item.live}" target="_blank">Live</a>` : "";
    rows += `
      <tr>
        <td>${i++}</td>
        <td>${item.type}</td>
        <td><a href="${repo}" target="_blank">${item.name}</a></td>
        <td>${item.status}</td>
        <td>${live}</td>
      </tr>`;
  });

  return `
  <section>
    <h2>${title}</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Type</th>
          <th>Project</th>
          <th>Status</th>
          <th>Live</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

const primeActive = collectProjects(data.prime, false);
const primeArchived = collectProjects(data.prime, true);
const hanActive = collectAll(data.han);

let readme = "";

readme += generateTable(primeActive, "prime");
readme += `#### [Han's](${bases.han})\n\n`;
readme += generateTable(hanActive, "han");

if (primeArchived.length > 0) {
  readme += `<details>\n<summary>Archived</summary>\n\n`;
  readme += generateTable(primeArchived, "prime");
  readme += `\n\n\n`;
  readme += `Learn more about me: [localhost://0002](https://probabilityzero.github.io/probabilityzero/)`;
  readme += `\n</details>\n\n`;
}

fs.writeFileSync("README.md", readme);



const allRows = [...primeActive.map(p => ({...p, archived:false})),
                 ...primeArchived.map(p => ({...p, archived:true}))];

function buildRows(rows) {
  let i = 1;
  return rows.map(item => {
    const repo = bases.prime + item.name;
    const live = item.live
      ? ` <a class="btn live" href="${item.live}" target="_blank">LIVE</a>`
      : "";
    return `
      <tr data-archived="${item.archived}">
        <td>${i++}</td>
        <td>${item.type}</td>
        <td>
          <a href="${repo}" target="_blank">${item.name}</a>${live}
        </td>
        <td>${item.status}</td>
      </tr>`;
  }).join("");
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Projects</title>
<link rel="stylesheet" href="../assets/styles/global.css">
<link rel="stylesheet" href="styles.css">
</head>

<body>

<div class="cursor-trail" id="cur"></div>

<canvas id="bgGlobe"></canvas>
<div class="glitch-scan"></div>

<div class="titlebar glitch">  
  <a class="btn" href="/probabilityzero">BACK</a>
  <h3 data-text="PROJECT REGISTRY" class="glitch">PROJECT REGISTRY</h3>
  <div class="led"></div>
</div>

<div class="wrap">

  <div class="toolbar">
    <input id="search" class="search" placeholder="SEARCH PROJECTS">
    <p>SORT BY<p>
    <button id="sortName" class="btn secondary">NAME</button>
    <button id="sortType" class="btn secondary">TYPE</button>
    <button id="toggleArchive" class="btn">SHOW ARCHIVED</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>TYPE</th>
        <th>REPOSITORY</th>
        <th>STATUS</th>
      </tr>
    </thead>
    <tbody>
      ${buildRows(allRows)}
    </tbody>
  </table>

  <div class="statusbar">
    <span>NODE: PRIME EDGE</span>
    <span id="counter" class="counter"></span>
    <span id="visibleCount"></span>
  </div>

</div>

<script>
const rows = [...document.querySelectorAll("tbody tr")];
const toggle = document.getElementById("toggleArchive");
const search = document.getElementById("search");
const counter = document.getElementById("counter");
const visibleCount = document.getElementById("visibleCount");

let showArchived = false;

function applyFilters(){
  const q = search.value.toLowerCase();
  let visible = 0;

  rows.forEach(r=>{
    const archived = r.dataset.archived === "true";
    const text = r.innerText.toLowerCase();

    const ok = (showArchived || !archived) && text.includes(q);
    r.style.display = ok ? "" : "none";
    if(ok) visible++;
  });

  visibleCount.textContent = "VISIBLE: " + visible;
  counter.textContent = "TOTAL: " + rows.length;
}

toggle.onclick = ()=>{
  showArchived = !showArchived;
  toggle.textContent = showArchived ? "HIDE ARCHIVED" : "SHOW ARCHIVED";
  applyFilters();
};

search.oninput = applyFilters;

/* simple sort helpers */
function sortBy(col){
  const tbody = document.querySelector("tbody");
  const sorted = rows.sort((a,b)=>
    a.children[col].innerText.localeCompare(b.children[col].innerText)
  );
  sorted.forEach(r=>tbody.appendChild(r));
}

document.getElementById("sortName").onclick = ()=>sortBy(2);
document.getElementById("sortType").onclick = ()=>sortBy(1);

applyFilters();
</script>
<script src="globe.js"></script>
</body>
</html>`;

 
fs.writeFileSync("projects/index.html", html);

console.log("README and interactive index generated.");
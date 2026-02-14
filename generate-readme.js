const fs = require("fs");

const data = JSON.parse(fs.readFileSync("projects.json", "utf8"));

const bases = {
  prime: "https://github.com/probabilityzero/",
  han: "https://github.com/hanslibrary/"
};

const archivedStatuses = ["successful", "archived", "live", "idea", "failed", "-"];
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
  let table =
    `| Projects&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Repositories&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |\n`;

  table += `|--------|---------|--------|\n`;

  let lastType = "";

  items.forEach(item => {
    const type = item.type === lastType ? "" : item.type;
    lastType = item.type;

    const base = bases[owner];

    table += `| ${type} | [${item.name}](${base}${item.name}) | ${renderStatus(item)} |\n`;
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
readme += `#### [Han's ↗](${bases.han})\n\n`;
readme += generateTable(hanActive, "han");

if (primeArchived.length > 0) {
  readme += `<details>\n<summary>Archived</summary>\n\n`;
  readme += generateTable(primeArchived, "prime");
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

<style>
body{
  margin:0;
  background:#0b0f14;
  color:#d6e3ff;
  font-family:monospace;
  image-rendering:pixelated;
}

/* Title bar */
.titlebar{
  background:linear-gradient(#0b3a6b,#082748);
  color:#eaf6ff;
  padding:8px 12px;
  font-weight:bold;
  border-bottom:2px solid #3aa0ff;
  letter-spacing:1px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

/* Center container */
.wrap{
  max-width:900px;
  margin:28px auto;
  padding:0 16px;
}

/* Retro buttons */
.btn{
  background:#0b3a6b;
  border:2px solid #3aa0ff;
  color:#eaf6ff;
  padding:4px 10px;
  text-decoration:none;
  font-size:13px;
  cursor:pointer;
  margin-left:6px;
  box-shadow:0 0 6px #3aa0ff40 inset;
}

.btn:hover{
  background:#104b8c;
}

.btn.live{
  background:#063f2e;
  border-color:#2cffb2;
  color:#baffea;
}

/* Search box */
.search{
  width:100%;
  margin:14px 0 18px;
  padding:8px;
  background:#06080c;
  border:2px solid #3aa0ff;
  color:#eaf6ff;
  font-family:monospace;
}

/* Table */
table{
  width:100%;
  border-collapse:collapse;
  background:#06080c;
  border:2px solid #3aa0ff;
}

th,td{
  padding:8px;
  border-bottom:1px solid #1a2638;
  text-align:left;
}

th{
  background:#082748;
  position:sticky;
  top:0;
}

tr[data-archived="true"]{
  opacity:.55;
}
</style>
</head>

<body>

<div class="titlebar">
  <span>PROJECT REGISTRY</span>
  <a class="btn" href="/probabilityzero">BACK</a>
</div>

<div class="wrap">

<input id="search" class="search" placeholder="SEARCH PROJECTS">

<div style="margin-bottom:10px;">
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

</div>

<script>
const rows = [...document.querySelectorAll("tbody tr")];
const toggle = document.getElementById("toggleArchive");
const search = document.getElementById("search");

let showArchived = false;

function applyFilters(){
  const q = search.value.toLowerCase();
  rows.forEach(r=>{
    const archived = r.dataset.archived === "true";
    const text = r.innerText.toLowerCase();

    const visible =
      (showArchived || !archived) &&
      text.includes(q);

    r.style.display = visible ? "" : "none";
  });
}

toggle.onclick = ()=>{
  showArchived = !showArchived;
  toggle.textContent = showArchived ? "HIDE ARCHIVED" : "SHOW ARCHIVED";
  applyFilters();
};

search.oninput = applyFilters;

applyFilters();
</script>

</body>
</html>`;

 
fs.writeFileSync("projects/index.html", html);

console.log("README and interactive index generated.");

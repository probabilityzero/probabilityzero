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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Projects Index</title>
<style>
body{font-family:system-ui;background:#0b0c10;color:#e6e6e6;margin:0;padding:24px}
h1{margin-bottom:8px}
h2{margin-top:32px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th,td{padding:10px;border-bottom:1px solid #222;text-align:left}
th{position:sticky;top:0;background:#111}
a{color:#7dd3fc;text-decoration:none}
.live{background:#065f46;color:#a7f3d0;padding:4px 8px;border-radius:6px}
input{width:100%;padding:10px;margin:16px 0;background:#111;border:1px solid #333;color:#eee;border-radius:8px}
</style>
</head>
<body>

<h1>Projects</h1>
<input id="search" placeholder="Search projects…" />

${htmlTable(primeActive, "prime", "My Projects")}
${htmlTable(hanActive, "han", "Han's Projects")}

<details>
  <summary>Archived</summary>
  ${htmlTable(primeArchived, "prime", "Archived Projects")}
</details>

<script>
const search = document.getElementById('search');
search.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('tbody tr').forEach(tr => {
    tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
});
</script>

</body>
</html>`;
 
fs.writeFileSync("projects/index.html", html);

console.log("README and interactive index generated.");

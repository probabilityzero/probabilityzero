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
      if (archivedFlag === archived) {
        result.push({ ...item, type });
      }
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

let output = "";

const primeActive = collectProjects(data.prime, false);
const primeArchived = collectProjects(data.prime, true);
const hanActive = collectAll(data.han);

output += generateTable(primeActive, "prime");

output += `#### [Han's ↗](${bases.han})\n\n`;
output += generateTable(hanActive, "han");

if (primeArchived.length > 0) {
  output += `<details>\n<summary>Archived</summary>\n\n`;
  output += generateTable(primeArchived, "prime");
  output += `\n</details>\n\n`;
}

fs.writeFileSync("README.md", output);

console.log("README generated.");

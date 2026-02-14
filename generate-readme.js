const fs = require("fs");

const data = JSON.parse(fs.readFileSync("projects.json", "utf8"));

const bases = {
  prime: "https://github.com/probabilityzero/",
  han: "https://github.com/hanslibrary/"
};

data.sort((a, b) => {
  if (a.type === b.type) return a.name.localeCompare(b.name);
  return a.type.localeCompare(b.type);
});

const archivedStatuses = ["successful", "failed", "-"];
const isArchived = (status) => archivedStatuses.includes(status);

const myProjects = data.filter(p => p.owner === "prime");
const hanProjects = data.filter(p => p.owner === "han");

const myActive = myProjects.filter(p => !isArchived(p.status));
const myArchived = myProjects.filter(p => isArchived(p.status));

const hanActive = hanProjects;

function renderStatus(item) {
  if (item.live) return `[${item.status}](${item.live})`;
  return item.status;
}

function generateTable(items) {
  let table = `| Name | Repositories | Status |\n`;
  table += `|------|---------|--------|\n`;

  let lastType = "";

  items.forEach(item => {
    const type = item.type === lastType ? "" : item.type;
    lastType = item.type;

    const base = bases[item.owner] || bases.prime;

    table += `| ${type} | [${item.name}](${base}${item.name}) | ${renderStatus(item)} |\n`;
  });

  return table;
}

let output = "";

output += `### My Projects\n\n`;
output += generateTable(myActive);

output += `### Han's Projects [↗](${bases.han})\n\n`;
output += generateTable(hanActive);

if (myArchived.length > 0) {
  output += `<details>\n<summary>Archived Projects</summary>\n\n`;
  output += generateTable(myArchived);
  output += `\n</details>\n\n`;
}

fs.writeFileSync("README.md", output);

console.log("README generated.");

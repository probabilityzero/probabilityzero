const fs = require("fs");

const data = JSON.parse(fs.readFileSync("projects.json", "utf8"));
const base = "https://github.com/probabilityzero/";

data.sort((a, b) => {
  if (a.type === b.type) return a.name.localeCompare(b.name);
  return a.type.localeCompare(b.type);
});

const archivedStatuses = ["Successful", "Failed", "-"];

const isArchived = (status) => archivedStatuses.includes(status);

const active = data.filter(item => !isArchived(item.status));
const archived = data.filter(item => isArchived(item.status));

function generateTable(items) {
  let table = `| Projects | | Status |\n`;
  table += `|------|---------|--------|\n`;

  let lastType = "";

  items.forEach(item => {
    const type = item.type === lastType ? "" : item.type;
    lastType = item.type;

    table += `| ${type} | [${item.name}](${base}${item.name}) | ${item.status} |\n`;
  });

  return table;
}

let output = `### Projects navigate\n\n`;

output += generateTable(active);

if (archived.length > 0) { 
  output += `<details>\n<summary>Archived Projects</summary>\n\n`;
  output += `\n`;
  output += generateTable(archived);
  output += `\n</details>\n`;
}

fs.writeFileSync("readme.md", output);

console.log("README generated.");

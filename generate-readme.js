
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("projects.json", "utf8"));
const base = "https://github.com/probabilityzero/";

data.sort((a, b) => {
  if (a.type === b.type) return a.name.localeCompare(b.name);
  return a.type.localeCompare(b.type);
});

let output = `# Projects\n\n`;
output += `| Type | Project | Status |\n`;
output += `|------|---------|--------|\n`;

let lastType = "";

data.forEach(item => {
  const type = item.type === lastType ? "" : item.type;
  lastType = item.type;

  output += `| ${type} | [${item.name}](${base}${item.name}) | ${item.status} |\n`;
});

fs.writeFileSync("README.md", output);

console.log("README generated.");


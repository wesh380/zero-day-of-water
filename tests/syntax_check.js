const fs = require("fs");
const path = require("path");
const vm = require("vm");

const targetPath = path.join(__dirname, "..", "docs", "solar", "agrivoltaics", "app.js");

function sanitizeSource(source) {
  const lines = source.split(/\r?\n/);
  return lines
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("import ")) return "";
      if (trimmed.startsWith("export default")) return "";
      if (trimmed.startsWith("export ")) {
        return line.replace(/^\s*export\s+/, "");
      }
      return line;
    })
    .join("\n");
}

function main() {
  const source = fs.readFileSync(targetPath, "utf8");
  const sanitized = sanitizeSource(source);
  try {
    new vm.Script(sanitized, { filename: "agrivoltaics/app.js" });
    console.log("Syntax check PASSED for docs/solar/agrivoltaics/app.js");
    process.exit(0);
  } catch (error) {
    console.error("Syntax check FAILED for docs/solar/agrivoltaics/app.js");
    console.error(error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

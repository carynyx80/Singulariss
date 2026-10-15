/**
 * Compile contracts with solc-js (no Foundry binary required).
 * Output: contracts/out/<Contract>.json { abi, bytecode }
 * Usage: npm run compile
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import solc from "solc";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "contracts", "src");
const outDir = join(root, "contracts", "out");
mkdirSync(outDir, { recursive: true });

function findImports(path) {
  // Resolve @openzeppelin/* from node_modules, relative otherwise.
  try {
    if (path.startsWith("@openzeppelin")) {
      return { contents: readFileSync(join(root, "node_modules", path), "utf8") };
    }
    return { contents: readFileSync(join(srcDir, path), "utf8") };
  } catch (e) {
    return { error: `import not found: ${path}` };
  }
}

const sources = {};
for (const f of readdirSync(srcDir)) {
  if (f.endsWith(".sol")) sources[f] = { content: readFileSync(join(srcDir, f), "utf8") };
}

const input = {
  language: "Solidity",
  sources,
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
if (output.errors) {
  for (const e of output.errors) console[e.severity === "error" ? "error" : "warn"](e.formattedMessage);
  if (output.errors.some((e) => e.severity === "error")) process.exit(1);
}
for (const [file, contracts] of Object.entries(output.contracts)) {
  for (const [name, c] of Object.entries(contracts)) {
    writeFileSync(join(outDir, `${name}.json`), JSON.stringify({ abi: c.abi, bytecode: "0x" + c.evm.bytecode.object }, null, 2));
    console.log(`compiled ${name} (${file})`);
  }
}

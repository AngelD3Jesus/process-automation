import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import type { Target } from "./targets.js";
import type { Step } from "./flowToSteps.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function templatePath(target: Target) {
  return path.resolve(__dirname, "../src/templates", `${target}.hbs`);
}

Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);
Handlebars.registerHelper("json", (v: unknown) => JSON.stringify(v));

export function renderTemplate(target: Target, data: { steps: Step[] }) {
  const fullPath = templatePath(target);
  const raw = fs.readFileSync(fullPath, "utf8");
  const template = Handlebars.compile(raw, { noEscape: true });
  return template(data);
}
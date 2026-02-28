import type { Flow } from "./types.js";
import type { Target } from "./targets.js";
import { flowToSteps } from "./flowToSteps.js";
import { renderTemplate } from "./render.js";

export function generateScript(flow: Flow, target: Target = "python"): string {
  const steps = flowToSteps(flow);
  return renderTemplate(target, { steps });
}
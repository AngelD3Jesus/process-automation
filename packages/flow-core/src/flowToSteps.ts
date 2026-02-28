import type { Flow } from "./types.js";

export type Step =
  | { op: "trigger" }
  | { op: "readFile"; fileName: string; fileContent: string }
  | { op: "processText"; mode: "upper" | "lower" | "trim" }
  | { op: "sendEmail"; to: string; subject: string }
  | { op: "end" };

function nextNodeId(flow: Flow, currentId: string): string | null {
  const edge = flow.edges.find(e => e.source === currentId);
  return edge?.target ?? null;
}

export function flowToSteps(flow: Flow): Step[] {
  const trigger = flow.nodes.find(n => n.type === "trigger");
  if (!trigger) throw new Error("No trigger node.");

  const steps: Step[] = [];
  let currId: string | null = trigger.id;
  const seen = new Set<string>();

  while (currId) {
    if (seen.has(currId)) throw new Error("Cycle detected.");
    seen.add(currId);

    const node = flow.nodes.find(n => n.id === currId);
    if (!node) break;

    switch (node.type) {
      case "trigger":
        steps.push({ op: "trigger" });
        break;

      case "readFile":
  steps.push({
    op: "readFile",
    fileName: String((node as any).props?.fileName ?? ""),
    fileContent: String((node as any).props?.fileContent ?? ""),
  });
  break;

      case "processText":
        steps.push({ op: "processText", mode: String((node as any).props?.mode ?? "upper") as any });
        break;

      case "sendEmail":
        steps.push({
          op: "sendEmail",
          to: String((node as any).props?.to ?? "test@example.com"),
          subject: String((node as any).props?.subject ?? "Automatización"),
        });
        break;

      case "end":
        steps.push({ op: "end" });
        return steps;
    }

    currId = nextNodeId(flow, currId);
  }

  steps.push({ op: "end" });
  return steps;
}
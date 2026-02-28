import { Flow } from "./types.js";

export function generateScript(flow: Flow): string {
  return `export async function main(runtime: any) {
  return { ok: true, nodes: ${flow.nodes.length}, edges: ${flow.edges.length} };
}`;
}
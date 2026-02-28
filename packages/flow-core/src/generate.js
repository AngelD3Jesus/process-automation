"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScript = generateScript;
function generateScript(flow) {
    return `export async function main(runtime: any) {
  return { ok: true, nodes: ${flow.nodes.length}, edges: ${flow.edges.length} };
}`;
}

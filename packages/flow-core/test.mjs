import { validateFlow, generateScript } from "./dist/index.js";

const flow = {
  version: 1,
  nodes: [
    { id: "t1", type: "trigger", position: { x: 0, y: 0 }, props: {} },

    { id: "r1", type: "readFile", position: { x: 0, y: 0 }, props: { path: "./data/input.txt" } },

    { id: "p1", type: "processText", position: { x: 0, y: 0 }, props: { mode: "upper" } },

    { id: "s1", type: "sendEmail", position: { x: 0, y: 0 }, props: { to: "test@example.com", subject: "Hola" } },

    { id: "e1", type: "end", position: { x: 0, y: 0 }, props: {} }
  ],
  edges: [
    { id: "e1", source: "t1", target: "r1" },
    { id: "e2", source: "r1", target: "p1" },
    { id: "e3", source: "p1", target: "s1" },
    { id: "e4", source: "s1", target: "e1" }
  ]
};

console.log("validate:", validateFlow(flow));

// cambia target aquí: "python" | "bash" | "powershell"
const script = generateScript(flow, "python");
console.log("script:\n", script);
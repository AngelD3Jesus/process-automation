import type { Flow } from "./types.js";

export type ValidationError = {
  code: string;
  message: string;
  nodeId?: string;
};

export function validateFlow(flow: Flow): ValidationError[] {
  const errors: ValidationError[] = [];

  const triggers = flow.nodes.filter((n) => n.type === "trigger");
  const ends = flow.nodes.filter((n) => n.type === "end");

  if (triggers.length !== 1) {
    errors.push({
      code: "TRIGGER_COUNT",
      message: "Debe existir exactamente 1 nodo Trigger.",
    });
  }

  if (ends.length < 1) {
    errors.push({
      code: "END_REQUIRED",
      message: "Debe existir al menos 1 nodo End.",
    });
  }

  for (const node of flow.nodes) {
    const incoming = flow.edges.filter((e) => e.target === node.id);
    const outgoing = flow.edges.filter((e) => e.source === node.id);

    if (node.type === "trigger" && incoming.length > 0) {
      errors.push({
        code: "TRIGGER_WITH_INPUT",
        message: "El nodo Trigger no debe tener conexiones de entrada.",
        nodeId: node.id,
      });
    }

    if (node.type === "end" && outgoing.length > 0) {
      errors.push({
        code: "END_WITH_OUTPUT",
        message: "El nodo End no debe tener conexiones de salida.",
        nodeId: node.id,
      });
    }

    if (node.type !== "trigger" && incoming.length === 0) {
      errors.push({
        code: "NODE_WITHOUT_INPUT",
        message: "El nodo no tiene conexión de entrada.",
        nodeId: node.id,
      });
    }

    if (node.type !== "end" && outgoing.length === 0) {
      errors.push({
        code: "NODE_WITHOUT_OUTPUT",
        message: "El nodo no tiene conexión de salida.",
        nodeId: node.id,
      });
    }

    if (node.type === "readFile") {
      const content = String((node.props as Record<string, unknown>)?.fileContent ?? "");
      if (!content.trim()) {
        errors.push({
          code: "READFILE_EMPTY",
          message: "El nodo readFile debe tener un archivo .txt cargado.",
          nodeId: node.id,
        });
      }
    }

    if (node.type === "processText") {
      const mode = String((node.props as Record<string, unknown>)?.mode ?? "");
      if (!["upper", "lower", "trim"].includes(mode)) {
        errors.push({
          code: "PROCESS_MODE_INVALID",
          message: "El nodo processText debe tener un modo válido: upper, lower o trim.",
          nodeId: node.id,
        });
      }
    }

    if (node.type === "sendEmail") {
      const to = String((node.props as Record<string, unknown>)?.to ?? "");
      if (!to.trim()) {
        errors.push({
          code: "SEND_EMAIL_TO_REQUIRED",
          message: "El nodo sendEmail debe tener un destinatario.",
          nodeId: node.id,
        });
      }
    }
  }

  return errors;
}
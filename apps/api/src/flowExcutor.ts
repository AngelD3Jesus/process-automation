import type { Flow } from "flow-core";
import { sendRealEmail } from "./email.js";

type ExecutionResult = {
  stdout: string[];
  ctx: Record<string, unknown>;
};

function nextNodeId(flow: Flow, currentId: string): string | null {
  const edge = flow.edges.find((e) => e.source === currentId);
  return edge?.target ?? null;
}

function processTextValue(text: string, mode: string) {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "trim") return text.trim();
  return text;
}

export async function executeFlow(flow: Flow): Promise<ExecutionResult> {
  const trigger = flow.nodes.find((n) => n.type === "trigger");
  if (!trigger) throw new Error("No existe nodo trigger.");

  const stdout: string[] = [];
  const ctx: Record<string, unknown> = {};

  let currId: string | null = trigger.id;
  const seen = new Set<string>();

  while (currId) {
    if (seen.has(currId)) {
      throw new Error("Se detectó un ciclo en el flujo.");
    }
    seen.add(currId);

    const node = flow.nodes.find((n) => n.id === currId);
    if (!node) break;

    switch (node.type) {
      case "trigger":
        stdout.push("[TRIGGER] Inicio del flujo");
        break;

      case "readFile": {
        const props = node.props as Record<string, unknown>;
        const fileContent = String(props.fileContent ?? "");
        const fileName = String(props.fileName ?? "archivo.txt");

        ctx.fileText = fileContent;
        stdout.push(`[READFILE] Archivo cargado: ${fileName}`);
        break;
      }

      case "processText": {
        const props = node.props as Record<string, unknown>;
        const mode = String(props.mode ?? "upper");
        const currentText = String(ctx.fileText ?? "");

        ctx.fileText = processTextValue(currentText, mode);
        stdout.push(`[PROCESSTEXT] Transformación aplicada: ${mode}`);
        break;
      }

      case "sendEmail": {
  const props = node.props as Record<string, unknown>;
  const to = String(props.to ?? "");
  const subject = String(props.subject ?? "Automatización");
  const body = String(ctx.fileText ?? "");

  const result = await sendRealEmail({
    to,
    subject,
    text: body,
  });

  stdout.push(`[SENDEMAIL] Correo enviado a ${to}`);
  stdout.push(`[SENDEMAIL] ID: ${String(result.messageId ?? "sin-id")}`);
  break;
}

      case "end":
        stdout.push("[END] Flujo finalizado");
        return { stdout, ctx };
    }

    currId = nextNodeId(flow, currId);
  }

  return { stdout, ctx };
}
import { runGeneratedScript } from "./runner.js";
import express from "express";
import cors from "cors";
import { validateFlow, generateScript, type Flow } from "flow-core";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("OK"));

app.post("/api/validate", (req, res) => {
  const flow = req.body as Flow;
  const errors = validateFlow(flow);
  res.json({ ok: errors.length === 0, errors });
});

app.post("/api/generate", (req, res) => {
  const { flow, target } = req.body as { flow: Flow; target: "python" | "bash" | "powershell" };

  const errors = validateFlow(flow);
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const code = generateScript(flow, target ?? "python");
  res.json({ ok: true, code });
});

app.post("/api/run", async (req, res) => {
  try {
    const { flow, target } = req.body as {
      flow: Flow;
      target: "python" | "bash" | "powershell";
    };

    const errors = validateFlow(flow);

    if (errors.length > 0) {
      return res.status(400).json({
        ok: false,
        errors,
      });
    }

    const code = generateScript(flow, target ?? "python");
    const execution = await runGeneratedScript(code, target ?? "python");

    res.json({
      ok: execution.ok,
      code,
      execution,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

app.listen(3001, () => console.log("API running on http://localhost:3001"));
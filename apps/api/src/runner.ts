import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type Target = "python" | "bash" | "powershell";

function getExtension(target: Target) {
  if (target === "python") return "py";
  if (target === "bash") return "sh";
  return "ps1";
}

function getCommand(target: Target) {
  if (target === "python") return { cmd: "python", args: [] as string[] };
  if (target === "bash") return { cmd: "bash", args: [] as string[] };
  return { cmd: "powershell", args: ["-ExecutionPolicy", "Bypass", "-File"] };
}

export async function runGeneratedScript(code: string, target: Target) {
  const extension = getExtension(target);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "process-automation-"));
  const scriptPath = path.join(tempDir, `script.${extension}`);

  fs.writeFileSync(scriptPath, code, "utf8");

  const { cmd, args } = getCommand(target);

  try {
    const result = await execFileAsync(cmd, [...args, scriptPath], {
      timeout: 5000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });

    return {
      ok: true,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      scriptPath,
    };
  } catch (error: unknown) {
    const err = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };

    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
      error: err.message ?? "Error ejecutando script",
      scriptPath,
    };
  }
}
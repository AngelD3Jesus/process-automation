import FlowNode from "./FlowNode";
import { useMemo, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

type Target = "python" | "bash" | "powershell";
type NodeType = "trigger" | "readFile" | "processText" | "sendEmail" | "end";

type FlowNodeData = {
  label: string;
  nodeType: NodeType;
  props: Record<string, unknown>;
};

function uid() {
  return Math.random().toString(16).slice(2);
}

function defaultProps(t: NodeType): Record<string, unknown> {
  if (t === "readFile") return { fileName: "", fileContent: "" };
  if (t === "processText") return { mode: "upper" };
  if (t === "sendEmail") return { to: "test@example.com", subject: "Hola" };
  return {};
}

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

export default function App() {
  const [target, setTarget] = useState<Target>("python");
  const [log, setLog] = useState<string>("");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([
  {
    id: "t1",
    type: "flowNode",
    position: { x: 50, y: 80 },
    data: { label: "Trigger", nodeType: "trigger", props: {} },
  },
  {
    id: "r1",
    type: "flowNode",
    position: { x: 260, y: 80 },
    data: {
      label: "readFile",
      nodeType: "readFile",
      props: { fileName: "", fileContent: "" },
    },
  },
  {
    id: "p1",
    type: "flowNode",
    position: { x: 470, y: 80 },
    data: {
      label: "processText",
      nodeType: "processText",
      props: { mode: "upper" },
    },
  },
  {
    id: "s1",
    type: "flowNode",
    position: { x: 680, y: 80 },
    data: {
      label: "sendEmail",
      nodeType: "sendEmail",
      props: { to: "test@example.com", subject: "Hola" },
    },
  },
  {
    id: "e1",
    type: "flowNode",
    position: { x: 890, y: 80 },
    data: { label: "End", nodeType: "end", props: {} },
  },
]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: "e1", source: "t1", target: "r1" },
    { id: "e2", source: "r1", target: "p1" },
    { id: "e3", source: "p1", target: "s1" },
    { id: "e4", source: "s1", target: "e1" },
  ]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const flow = useMemo(
    () => ({
      version: 1 as const,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.data.nodeType,
        position: n.position,
        props: n.data.props ?? {},
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
      })),
    }),
    [nodes, edges]
  );

  const onNodesChange = (changes: NodeChange[]) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
  };

  const onConnect = (connection: Connection) => {
    setEdges((currentEdges) =>
      addEdge({ ...connection, id: "e-" + uid() }, currentEdges)
    );
  };

  const addNode = (nodeType: NodeType) => {
  const id = `${nodeType}-${uid()}`;


  const newNode: Node<FlowNodeData> = {
    id,
    type: "flowNode",
    position: { x: 200, y: 200 + nodes.length * 50 },
    data: {
      label: nodeType,
      nodeType,
      props: defaultProps(nodeType),
    },
  };

  setNodes((currentNodes) => [...currentNodes, newNode]);
 };

 const deleteSelectedNode = () => {
  if (!selectedNodeId) return;

  setNodes((currentNodes) =>
    currentNodes.filter((node) => node.id !== selectedNodeId)
  );

  setEdges((currentEdges) =>
    currentEdges.filter(
      (edge) =>
        edge.source !== selectedNodeId && edge.target !== selectedNodeId
    )
  );

  setSelectedNodeId(null);
};

  const updateSelectedNodeProps = (patch: Record<string, unknown>) => {
    if (!selectedNodeId) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                props: {
                  ...node.data.props,
                  ...patch,
                },
              },
            }
          : node
      )
    );
  };

  const apiPost = async (path: string, body: unknown) => {
    const response = await fetch(`/api${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  };

  const validate = async () => {
    try {
      const result = await apiPost("/validate", flow);
      setLog(JSON.stringify(result, null, 2));
    } catch (error) {
      setLog(JSON.stringify(error, null, 2));
    }
  };

  const generate = async () => {
    try {
      const result = await apiPost("/generate", { flow, target });
      setLog(result.code ?? JSON.stringify(result, null, 2));
    } catch (error) {
      setLog(JSON.stringify(error, null, 2));
    }
  };

  const runScript = async () => {
  try {
    const result = await apiPost("/run", { flow, target });
    setLog(JSON.stringify(result, null, 2));
  } catch (error) {
    setLog(JSON.stringify(error, null, 2));
  }
};

  const downloadScript = () => {
  if (!log.trim()) return;

  const extensionMap: Record<Target, string> = {
    python: "py",
    bash: "sh",
    powershell: "ps1",
  };

  const extension = extensionMap[target];
  const fileName = `generated-script.${extension}`;

  const blob = new Blob([log], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

const saveFlowToFile = () => {
  const flowData = JSON.stringify(flow, null, 2);
  const blob = new Blob([flowData], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flow.json";
  link.click();

  URL.revokeObjectURL(url);
};

const loadFlowFromFile = (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result ?? ""));

      const loadedNodes: Node<FlowNodeData>[] = parsed.nodes.map(
        (node: {
          id: string;
          type: NodeType;
          position: { x: number; y: number };
          props?: Record<string, unknown>;
        }) => ({
          id: node.id,
          type: "flowNode",
          position: node.position,
          data: {
            label: node.type,
            nodeType: node.type,
            props: node.props ?? {},
          },
        })
      );

      const loadedEdges: Edge[] = parsed.edges.map(
        (edge: {
          id: string;
          source: string;
          target: string;
          sourceHandle?: string;
        }) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
        })
      );

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setSelectedNodeId(null);
      setLog("Flujo cargado correctamente.");
    } catch {
      setLog("No se pudo cargar el flujo.");
    }
  };

  reader.readAsText(file);
};

const fileInputId = "load-flow-input";

  return (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "260px 1fr 420px",
      height: "100vh",
      width: "100vw",
    }}
  >
    <div style={{ padding: 12, borderRight: "1px solid #222" }}>
      <h3>Target</h3>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value as Target)}
        style={{ width: "100%" }}
      >
        <option value="python">Python</option>
        <option value="bash">Bash</option>
        <option value="powershell">PowerShell</option>
      </select>

      <hr />

      <button onClick={validate}>Validate</button>{" "}
      <button onClick={generate}>Generate</button>
      <br />
      <br />
      <button onClick={downloadScript} disabled={!log.trim()}>
        Descargar script
      </button>
      <button onClick={runScript}>Run</button>

      <hr />

      <button onClick={saveFlowToFile} style={{ width: "100%", marginBottom: 8 }}>
        Guardar flujo
      </button>

      <label
        htmlFor={fileInputId}
        style={{
          display: "block",
          width: "100%",
          padding: "6px 10px",
          background: "#eee",
          color: "#111",
          textAlign: "center",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Cargar flujo
      </label>

      <input
        id={fileInputId}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          loadFlowFromFile(file);
        }}
      />

            <hr />

      <h3>Agregar nodo</h3>
      <button onClick={() => addNode("readFile")}>+ readFile</button>
      <br />
      <button onClick={() => addNode("processText")}>+ processText</button>
      <br />
      <button onClick={() => addNode("sendEmail")}>+ sendEmail</button>
      <br />
      <button onClick={() => addNode("end")}>+ end</button>

      <hr />

      <button
        onClick={deleteSelectedNode}
        disabled={!selectedNodeId}
        style={{ width: "100%" }}
      >
        Eliminar nodo seleccionado
      </button>

      <p style={{ fontSize: 12, marginTop: 12 }}>
        Tip: puedes conectar nodos arrastrando de un nodo a otro.
      </p>
    </div>

    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
        style={{ width: "100%", height: "100%" }}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>

    <div
      style={{
        padding: 12,
        borderLeft: "1px solid #222",
        overflow: "auto",
      }}
    >
      <h3>Salida</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{log}</pre>

      <hr />

      <h3>Propiedades</h3>
      {!selectedNode && <p>Selecciona un nodo</p>}

      {selectedNode && (
        <div>
          <p>
            <strong>ID:</strong> {selectedNode.id}
          </p>
          <p>
            <strong>Tipo:</strong> {selectedNode.data.nodeType}
          </p>

          {selectedNode.data.nodeType === "readFile" && (
            <>
              <label>Archivo .txt</label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    updateSelectedNodeProps({
                      fileName: file.name,
                      fileContent: String(reader.result ?? ""),
                    });
                  };
                  reader.readAsText(file);
                }}
                style={{ width: "100%", marginBottom: 10 }}
              />

              <p style={{ fontSize: 12 }}>
                <strong>Archivo:</strong>{" "}
                {String(selectedNode.data.props.fileName ?? "Ninguno")}
              </p>

              <label>Contenido cargado</label>
              <textarea
                value={String(selectedNode.data.props.fileContent ?? "")}
                readOnly
                style={{ width: "100%", minHeight: 120, marginBottom: 10 }}
              />
            </>
          )}

          {selectedNode.data.nodeType === "processText" && (
            <>
              <label>Mode</label>
              <select
                value={String(selectedNode.data.props.mode ?? "upper")}
                onChange={(e) =>
                  updateSelectedNodeProps({ mode: e.target.value })
                }
                style={{ width: "100%", marginBottom: 10 }}
              >
                <option value="upper">upper</option>
                <option value="lower">lower</option>
                <option value="trim">trim</option>
              </select>
            </>
          )}

          {selectedNode.data.nodeType === "sendEmail" && (
              <>
                <label>To</label>
                <input
                  type="text"
                  value={String(selectedNode.data.props.to ?? "")}
                  onChange={(e) =>
                    updateSelectedNodeProps({ to: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: 10 }}
                />

                <label>Subject</label>
                <input
                  type="text"
                  value={String(selectedNode.data.props.subject ?? "")}
                  onChange={(e) =>
                    updateSelectedNodeProps({ subject: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: 10 }}
                />
              </>
            )}
        </div>
      )}
    </div>
  </div>
);
}
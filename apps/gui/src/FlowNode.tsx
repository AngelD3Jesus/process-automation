import { Handle, Position, type NodeProps } from "reactflow";

type NodeType = "trigger" | "readFile" | "processText" | "sendEmail" | "end";

type FlowNodeData = {
  label: string;
  nodeType: NodeType;
  props: Record<string, unknown>;
};

export default function FlowNode({ data, selected }: NodeProps<FlowNodeData>) {
  return (
    <div
      style={{
        minWidth: 140,
        padding: 12,
        borderRadius: 10,
        border: selected ? "2px solid #4f8cff" : "1px solid #555",
        background: "#1f1f1f",
        color: "white",
        textAlign: "center",
      }}
    >
      {data.nodeType !== "trigger" && (
        <Handle type="target" position={Position.Left} />
      )}

      <div style={{ fontWeight: "bold" }}>{data.label}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{data.nodeType}</div>

      {data.nodeType !== "end" && (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}
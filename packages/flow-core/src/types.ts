export type NodeType = "trigger" | "readFile" | "processText" | "sendEmail" | "end";

export type FlowNode<TProps = any> = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  props: TProps;
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
};

export type Flow = {
  version: 1;
  nodes: FlowNode[];
  edges: FlowEdge[];
};
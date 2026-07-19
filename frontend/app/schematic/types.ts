export interface SchematicNode {
  id: string;
  type: string;
  category?: string;
  rotation?: number;
  flipped?: boolean;
  properties?: {
    model?: string;
    parameters?: Record<string, number>;
    pins?: string[];
    category?: string;
  };
}

export interface Connection {
  comp: string;
  pin: string;
  net: string;
}

export interface Wire {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  net?: string;
}

export type PositionMap = Record<string, { x: number; y: number }>;

export type ConsoleTabType = "compiler" | "simulation" | "verification";

export type PropertyTabType = "properties" | "connections" | "history";

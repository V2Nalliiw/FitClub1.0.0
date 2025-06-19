import { ConnectionLineType, BackgroundVariant } from "reactflow";

// Extend the ConnectionLineType type to include 'bezier'
declare module "reactflow" {
  export type ConnectionLineType =
    | "default"
    | "straight"
    | "step"
    | "smoothstep"
    | "bezier";
  export type BackgroundVariant = "lines" | "dots" | "cross";
}

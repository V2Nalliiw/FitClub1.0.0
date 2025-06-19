interface Window {
  // Add any missing window properties here
  HTMLElement: typeof HTMLElement;
  // FlowBuilder custom window properties
  updateNodeData?: (nodeId: string, newData: any) => void;
  duplicateNode?: (nodeId: string) => void;
  deleteNode?: (nodeId: string) => void;
}

// Add HTMLElement extensions
interface HTMLElement {
  value?: string;
  checked?: boolean;
  style: CSSStyleDeclaration;
}

// Add EventTarget extensions
interface EventTarget {
  closest?: (selector: string) => Element | null;
}

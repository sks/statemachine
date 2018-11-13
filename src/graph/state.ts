import Edge from "./edge";
import Node from "./node";

export default interface State {
    selectedNode: Node,
    selectedEdge: Edge,
    mouseDownNode: Node | null,
    mouseDownLink: Edge | null,
    justDragged: boolean,
    justScaleTransGraph: boolean,
    lastKeyDown: number,
    shiftNodeDrag: boolean,
    selectedText: null,
    graphMouseDown: boolean,
}
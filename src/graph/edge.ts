import Node from "./node";

export default class Edge {
    public source: Node;
    public target: Node;
    constructor(source: Node, target: Node) {
        this.source = source;
        this.target = target;
    }
}
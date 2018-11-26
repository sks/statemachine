import Edge from "./edge";
import Node from "./node";

interface iGraph {
    nodes: Node[]
    edges: Edge[]
}

export default class Graph {
    constructor(public nodes: Node[], public edges: Edge[]) { }
    public toString(): string {
        return `nodes: ${this.nodes.length}, edges: ${this.edges.length}`;
    }
    public get urlValue(): string {
        return window.btoa(JSON.stringify(this.iGraph));
    }
    private get iGraph(): iGraph {
        return {
            nodes: this.nodes,
            edges: this.edges
        }
    }

}



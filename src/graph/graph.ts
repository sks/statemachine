import Edge from "./edge";
import Node from "./node";

interface iGraph {
    nodes: Node[]
    edges: Edge[]
}

export default class Graph {
    constructor(public nodes: Node[], public edges: Edge[]) { }
    public static fromString(val: string): Graph {
        let jsonVal: iGraph;
        try {
            jsonVal = JSON.parse(window.atob(val));
        } catch (error) {
            console.error('error deserializing the value', { val, error });
            jsonVal = { nodes: [], edges: [] };
        }
        return new Graph(jsonVal.nodes, jsonVal.edges);
    }
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



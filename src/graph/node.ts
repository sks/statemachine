
interface NodeData {
    title: string;
    properties: { [key: string]: string };
}

export default class Node {
    data: NodeData;
    constructor(title: string,
        public id: number,
        public x: number,
        public y: number, ) {
        this.data = {
            title,
            properties: {},
        }
    }
    public get translate(): string {
        return `translate(${this.x},${this.y})`;
    }
}
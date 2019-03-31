import Graph from "../../src/graph/graph";
import Node from "../../src/graph/node";
import Edge from "../../src/graph/edge";

describe('graph', () => {
    const complexGraphString = `eyJub2RlcyI6W3siaWQiOjEsIngiOjEyLCJ5IjoxNSwiZGF0YSI6eyJ0aXRsZSI6InNvbWUgdGl0bGUgMSIsInByb3BlcnRpZXMiOnt9fX0seyJpZCI6MiwieCI6MjIsInkiOjI1LCJkYXRhIjp7InRpdGxlIjoic29tZSB0aXRsZSAyIiwicHJvcGVydGllcyI6e319fV0sImVkZ2VzIjpbeyJzb3VyY2UiOnsiaWQiOjEsIngiOjEyLCJ5IjoxNSwiZGF0YSI6eyJ0aXRsZSI6InNvbWUgdGl0bGUgMSIsInByb3BlcnRpZXMiOnt9fX0sInRhcmdldCI6eyJpZCI6MiwieCI6MjIsInkiOjI1LCJkYXRhIjp7InRpdGxlIjoic29tZSB0aXRsZSAyIiwicHJvcGVydGllcyI6e319fX1dfQ==`;
    let graph: Graph;
    beforeEach(() => {
        graph = new Graph([], []);
    })
    describe('simple graph', () => {
        test('toString', () => {
            expect(graph.toString()).toBe(`nodes: 0, edges: 0`);
        })
        test('urlValue', () => {
            expect(graph.urlValue).toBe(`eyJub2RlcyI6W10sImVkZ2VzIjpbXX0=`);
        })
    });
    describe('complex graph', () => {
        beforeEach(() => {
            const node1 = new Node("some title 1", 1, 12, 15);
            const node2 = new Node("some title 2", 2, 22, 25);
            const nodes: Node[] = [node1, node2];
            const edges: Edge[] = [
                new Edge(node1, node2),
            ];
            graph = new Graph(nodes, edges);
        })
        test('toString', () => {
            expect(graph.toString()).toBe(`nodes: 2, edges: 1`);
        })
        test('urlValue', () => {
            expect(graph.urlValue).toBe(complexGraphString);
        })
    });
    describe('create graph from base64 encoded string', () => {
        test('it creates a graph from base64', () => {
            const graph = Graph.fromString(complexGraphString)
            expect(graph.toString()).toBe(`nodes: 2, edges: 1`);
        })
        describe('negative test cases', () => {
            test('it returns an empty graph when the base64 string is invalid', () => {
                const graph = Graph.fromString(`something invalid`);
                expect(graph.toString()).toBe(`nodes: 0, edges: 0`);
            })
        })
    })
})

import Graph from "../../src/graph/graph";
import Node from "../../src/graph/node";
import Edge from "../../src/graph/edge";

describe('graph', () => {
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
            const nodes: Node[] = [
                new Node("some title 1", 1, 12, 15),
                new Node("some title 2", 2, 22, 25),
            ];
            const edges: Edge[] = [];
            graph = new Graph(nodes, edges);
        })
        test('toString', () => {
            expect(graph.toString()).toBe(`nodes: 2, edges: 0`);
        })
        test('urlValue', () => {
            expect(graph.urlValue).toBe(`eyJub2RlcyI6W3siaWQiOjEsIngiOjEyLCJ5IjoxNSwiZGF0YSI6eyJ0aXRsZSI6InNvbWUgdGl0bGUgMSIsInByb3BlcnRpZXMiOnt9fX0seyJpZCI6MiwieCI6MjIsInkiOjI1LCJkYXRhIjp7InRpdGxlIjoic29tZSB0aXRsZSAyIiwicHJvcGVydGllcyI6e319fV0sImVkZ2VzIjpbXX0=`);
        })
    });
})

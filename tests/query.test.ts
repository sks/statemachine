import locationToGraph from "../src/location_to_graph";

test('basic', () => {
    expect(locationToGraph("?graph=something_invalid")).toEqual({ "edges": [], "nodes": [] });
});


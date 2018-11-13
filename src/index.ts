import './style/main.scss';
import * as d3 from 'd3';
import GraphCreator from './graphcreator';
import Node from './graph/node';
import Edge from './graph/edge';

(() => {
    window.onbeforeunload = function () {
        return "Make sure to save your graph locally before leaving :-)";
    };

    const docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];

    const width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;

    const xLoc = width / 2 - 25,
        yLoc = 100;

    // initial node data
    const nodes: Node[] = [
        new Node("new concept", 0, xLoc, yLoc),
        new Node("new concept_2 ", 1, xLoc, yLoc + 200),
    ];
    const edges = [new Edge(nodes[1], nodes[0])];

    /** MAIN SVG **/
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    const graph = new GraphCreator(svg, nodes, edges);
    graph.updateGraph();

})()

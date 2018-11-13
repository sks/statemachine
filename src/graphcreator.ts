import State from "@/graph/state";

import * as d3 from 'd3';
import Node from "./graph/node";
import Edge from "./graph/edge";


export interface d3Selection extends d3.Selection<d3.BaseType, Node, HTMLElement, any> { };

const consts = {
    selectedClass: 'selected',
    connectClass: 'connect-node',
    circleGClass: 'conceptG',
    conectorCircle: 'conectorCircle',
    graphClass: 'graph',
    activeEditId: 'active-editing',
    BACKSPACE_KEY: 8,
    DELETE_KEY: 46,
    ENTER_KEY: 13,
    nodeRadius: 50,
};

export default class GraphCreator {
    public static animateTime = 400;

    private state: State = {
        selectedNode: null,
        selectedEdge: null,
        mouseDownNode: null,
        mouseDownLink: null,
        justDragged: false,
        justScaleTransGraph: false,
        lastKeyDown: -1,
        shiftNodeDrag: false,
        selectedText: null,
        graphMouseDown: false,
    };

    private connectorLine: d3Selection;
    private connectTarget: Node;
    private svg: d3Selection;
    private svgG;
    private circles: d3Selection;
    private paths: d3Selection;
    private resultCircles: d3Selection;
    private lastResultList: d3.BaseType[];
    private drag;
    dragLine: any;
    private static insertTitleLinebreaks(gEl: d3Selection, title: string) {
        if (typeof title === 'undefined') { title = 'value'; }
        const words = title.toString().split(/\s+/g),
            nwords = words.length;
        const el = gEl.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-' + (nwords - 1) * 7.5);

        for (let i = 0; i < words.length; i++) {
            const tspan = el.append('tspan').text(words[i]);
            if (i > 0) {
                tspan.attr('x', 0).attr('dy', '18');
            }
        }
    };

    constructor(svg: any,
        private readonly nodes: Node[],
        private readonly edges: Edge[]) {
        this.svg = svg;
        this.svgG = svg.append('g').classed(consts.graphClass, true);
        this.defineArrows();
        this.bindEvents();
        this.dragLine = this.svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');
    }

    public get idct() {
        return this.nodes.length;
    };

    private defineArrows() {
        // define arrow markers for graph links
        const defs = this.svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', '32')
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        // define arrow markers for leading arrow
        defs.append('svg:marker')
            .attr('id', 'mark-end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 7)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        // displayed when dragging between nodes
        this.connectorLine = this.svgG.append('svg:path')
            .attr('class', 'link hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');
    }
    private bindEvents() {
        // svg nodes and edges
        this.resultCircles = this.svgG.append('g').attr('class', 'resultItems');
        this.paths = this.svgG.append('g');
        this.circles = this.svgG.append('g');

        // handle circle drag
        this.drag = d3.drag()
            .on('drag', this.dragMove)
            .on('end', this.dragEnd);

        // listen for key events
        d3.select(window).on('keydown', this.svgKeyDown)
            .on('keyup', () => this.state.lastKeyDown = -1);
        this.svg
            .on('mouseover', () => this.svg.style('cursor', 'crosshair'))
            .on('mousedown', () => this.state.graphMouseDown = true)
            .on('mouseup', () => this.svgMouseUp())
            .on('dblclick.zoom', () => this.svg.attr('transform', d3.event.transform));
    }
    public svgKeyDown = () => {
        // make sure repeated key presses don't register for each keydown
        if (this.state.lastKeyDown !== -1) return;

        this.state.lastKeyDown = d3.event.keyCode;
        switch (d3.event.keyCode) {
            case consts.BACKSPACE_KEY:
            case consts.DELETE_KEY:
                d3.event.preventDefault();
                if (this.state.selectedNode) {
                    this.nodes.splice(this.nodes.indexOf(this.state.selectedNode), 1);
                    this.spliceLinksForNode(this.state.selectedNode);
                    this.state.selectedNode = null;
                } else if (this.state.selectedEdge) {
                    this.edges.splice(this.edges.indexOf(this.state.selectedEdge), 1);
                    this.state.selectedEdge = null;
                }
                this.updateGraph();
                break;
        }
    }
    public svgMouseUp = () => {
        if (this.state.justScaleTransGraph) {
            // dragged not clicked
            this.state.justScaleTransGraph = false;
        } else if (this.state.graphMouseDown && d3.event.shiftKey) {
            // clicked not dragged from svg
            var xycoords = d3.mouse(this.svgG.node());
            const id = this.idct + 1;
            const node = new Node(`new concept ${id}`, id, xycoords[0], xycoords[1]);
            this.nodes.push(node);
            this.updateGraph();
            // make title of text immediently editable
            //   var d3txt = this.changeTextOfNode(thisGraph.circles.filter(function(dval){
            //     return dval.id === d.id;
            //   }), d),
            //       txtNode = d3txt.node();
            //   thisGraph.selectElementContents(txtNode);
            //   txtNode.focus();
        } else if (this.state.shiftNodeDrag) {
            // dragged from node
            this.state.shiftNodeDrag = false;
            this.dragLine.classed("hidden", true);
        }
        this.state.graphMouseDown = false;
    }

    public serialize() {
        const saveEdges: Edge[] = [];
        this.edges.forEach(function (val, i) {
            saveEdges.push({ source: val.source, target: val.target });
        });
        const nodesData = this.nodes.map(node => {
            return {
                id: node.id,
                x: node.x || 0,
                y: node.y || 0,
                node_type: node.data.title,
                properties: node.data.properties,
            };
        });
        return JSON.stringify({ 'nodes': nodesData, 'edges': saveEdges });
    };

    public deserialize(nodes: Node[], edges: Edge[]) {
        this.deleteGraph(true);
        const nodesData = nodes.map(node => {
            return node;
        });
        [].push.apply(this.nodes, nodesData);
        const newEdges = edges;
        newEdges.forEach((e, i) => {
            newEdges[i] = {
                source: this.nodes.filter((n) => { return n.id === e.source.id; })[0],
                target: this.nodes.filter((n) => { return n.id === e.target.id; })[0]
            };
        });

        [].push.apply(this.edges, newEdges);
        this.updateGraph();
    };

    private dragMove = (d: any) => {
        this.state.justDragged = true;
        if (this.state.shiftNodeDrag) {
            const gMousePos = d3.mouse(this.svgG.node());
            this.connectorLine.attr('d', `M${d.x},${d.y}L${gMousePos[0]},${gMousePos[1]}`);
        } else {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            this.updateGraph();
        }
    };
    private dragEnd = (d: any) => {
        if (!this.state.shiftNodeDrag) {
            this.showResults([]);
        }
        if (this.connectTarget && (this.connectTarget !== d)) {
            const newEdge = new Edge(d, this.connectTarget);
            this.edges.push(newEdge);
            this.updateGraph();
        }
        this.state.shiftNodeDrag = false;
        this.connectorLine.classed('hidden', true);
    };

    private deleteGraph(skipPrompt: boolean) {
        if (!skipPrompt && !window.confirm('Press OK to delete this graph')) {
            return;
        }
        while (this.nodes.length) { this.nodes.pop(); }
        while (this.edges.length) { this.edges.pop(); }
        this.updateGraph();
    };
    private spliceLinksForNode(node: any) {
        this.edges.filter((l) => {
            return (l.source === node || l.target === node);
        }).forEach(l => {
            this.edges.splice(this.edges.indexOf(l), 1);
        });
    };

    private selectAnEdge(d3Path: d3Selection, edge: Edge) {
        const thisGraph = this;
        d3Path.classed(consts.selectedClass, true);
        if (thisGraph.state.selectedEdge) {
            thisGraph.deselectEdges();
        }
        thisGraph.state.selectedEdge = edge;
    };
    private selectANode(d3Node: d3Selection, nodeData: Node) {
        const thisGraph = this;
        d3Node.classed(consts.selectedClass, true);
        if (thisGraph.state.selectedNode) {
            thisGraph.deselectNodes();
        }
        thisGraph.state.selectedNode = nodeData;
    };
    private deselectNodes = () => {
        const thisGraph = this;
        thisGraph.circles.selectAll('g')
            .filter((cd: any) => cd.id === thisGraph.state.selectedNode.id)
            .classed(consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
    };
    private deselectEdges = () => {
        const thisGraph = this;
        thisGraph.paths.selectAll('path').filter(function (cd) {
            return cd === thisGraph.state.selectedEdge;
        }).classed(consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
    };

    private pathMouseDown = (d3path: d3Selection, d: Edge) => {
        const thisGraph = this,
            state = thisGraph.state;
        // d3.event.stopPropagation();
        state.mouseDownLink = d;

        if (state.selectedNode) {
            thisGraph.deselectNodes();
        }

        const prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d) {
            thisGraph.selectAnEdge(d3path, d);
        } else {
            thisGraph.deselectEdges();
        }
    };
    private isMouseOnCircleCorner = (d3node: d3Selection) => {
        const mousePos = d3.mouse(d3node.node() as d3.ContainerElement);
        const r = Math.sqrt(mousePos[0] * mousePos[0] + mousePos[1] * mousePos[1]);
        return (r > (consts.nodeRadius / 1.618));
    };
    private circleMouseDown = (d3node: d3Selection, d: Node) => {
        const thisGraph = this,
            state = thisGraph.state;
        // d3.event.stopPropagation();
        state.mouseDownNode = d;
        state.shiftNodeDrag = false;
        if (this.isMouseOnCircleCorner(d3node)) {
            state.shiftNodeDrag = true;
            thisGraph.connectorLine.classed('hidden', false)
                .attr('d', `M ${d.x},${d.y}L${d.x},${d.y}`);
            return;
        }
    };

    private circleClick = (d3node: d3Selection, d: Node) => {
        if (this.state.selectedEdge) {
            this.deselectEdges();
        }
        const prevNode = this.state.selectedNode;

        if (!prevNode || prevNode.id !== d.id) {
            this.selectANode(d3node, d);
        } else {
            this.deselectNodes();
        }
        this.state.mouseDownNode = null;
        d3.event.preventDefault();
        d3.event.stopPropagation();
        return false;
    };

    // call to propagate changes to graph
    public updateGraph = () => {
        const paths = this.paths.selectAll('path').data(this.edges as any[],
            (d: Edge) => String(d.source.id) + '+' + String(d.target.id));
        // update existing paths
        paths.style('marker-end', 'url(#end-arrow)')
            .classed(consts.selectedClass, (d: Edge) => d === this.state.selectedEdge)
            .attr('d', (d: Edge) => `M ${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`);

        // add new paths
        let thisGraph = this;
        paths.enter()
            .append('path')
            .style('marker-end', 'url(#end-arrow)')
            .classed('link', true)
            .attr('d', (d: Edge) => `M ${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`)
            .on('mousedown', function (d) { thisGraph.pathMouseDown(d3.select(this), d) })
            .on('mouseup', () => this.state.mouseDownLink = null);

        // remove old links
        paths.exit().remove();

        // update existing nodes
        const circles = this.circles.selectAll('g').data(this.nodes);
        circles.attr('transform', (d: Node) => d.translate);

        // add new nodes
        const newGs = circles.enter()
            .append('g');

        newGs.classed(consts.circleGClass, true)
            .attr('transform', (d: Node) => d.translate)
            .on('mouseover', function (d: Node) {
                if (!thisGraph.state.shiftNodeDrag) { return; }
                if (thisGraph.connectTarget) { return; }
                thisGraph.connectTarget = d;
                d3.select(this).classed(consts.connectClass, true);
            })
            .on('mouseout', function (this: d3.BaseType, d: Node) {
                if (thisGraph.connectTarget !== d) { return; }
                thisGraph.connectTarget = undefined;
                d3.select(this).classed(consts.connectClass, false);
            })
            .on('mousedown', function (this: d3.BaseType, d) {
                thisGraph.circleMouseDown(d3.select(this), d);
            })
            .on('click', function (this: d3.BaseType, d) { thisGraph.circleClick(d3.select(this), d); })
            .call(thisGraph.drag);

        newGs.append('circle')
            .attr('class', 'outerCircle')
            .attr('r', String(consts.nodeRadius))
            .append('title').text('drag ')

        newGs.append('circle')
            .attr('class', 'innerCircle')
            .attr('r', String(consts.nodeRadius / 1.618));

        newGs.each(function (this: d3.BaseType, d: Node) {
            GraphCreator.insertTitleLinebreaks(d3.select(this), d.data.title);
        });

        // remove old nodes
        circles.exit().remove();
    };

    showResults(resultList: d3.BaseType[]) {
        resultList = resultList || this.lastResultList;
        if (!resultList) {
            return;
        }
        this.lastResultList = resultList;
        const thisGraph = this;
        const resultCircle = thisGraph.resultCircles.selectAll('g').data(resultList);
        const cornerDistance = consts.nodeRadius + consts.nodeRadius / 1.618;
        const getTranslate = (d: any, isStart: boolean) => {
            const distance = isStart ? consts.nodeRadius : cornerDistance;
            const node = d.node()[0] as Node;
            let x = node.x;
            x += distance * Math.sin(node.id / 5);
            let y = node.y;
            y += distance * Math.cos(node.id / 5);
            return 'translate(' + x + ',' + y + ')';
        };
        resultCircle
            .transition()
            .duration(GraphCreator.animateTime / 2)
            .attr('transform', d => getTranslate(d, false))
            .attr('opacity', 0.6);
        // .select('text').text(d => d.data.x);

        resultCircle.exit().remove();

        const newGs = resultCircle.enter()
            .append('g');
        newGs
            .attr('opacity', 1)
            .attr('transform', d => getTranslate(d, true))
            .transition()
            .duration(GraphCreator.animateTime / 2)
            .attr('transform', d => getTranslate(d, false))
            .attr('opacity', 0.6);
        // newGs.each(function (d) {
        //     GraphCreator.insertTitleLinebreaks(d3.select(this), d.data.x);
        // });
    };

    public updateWindow(width: number, height: number) {
        this.svg.attr('width', width).attr('height', height);
    };
}
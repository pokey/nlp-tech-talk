// Adapted from http://stackoverflow.com/a/18319089/2605678

var TRIPLES = [
  {subject:"Globality",        predicate:"location",      object:"Menlo_Park"},
  {subject:"Menlo_Park",       predicate:"type",          object:"City"},
  {subject:"Atlanta,_Georgia", predicate:"type",          object:"City"},
  {subject:"Globality",        predicate:"hasPastClient", object:"Coca_Cola"},
  {subject:"Globality",        predicate:"hasPastClient", object:"Latham_&_Watkins"},
  {subject:"Latham_&_Watkins", predicate:"industry",      object:"Legal"},
  {subject:"Coca_Cola",        predicate:"location",      object:"Atlanta,_Georgia"},
  {subject:"Coca_Cola",        predicate:"foundingDate",  object:"1886"},
  {subject:"Coca_Cola",        predicate:"type",          object:"Corporation"},
];

var NODES = {
  "1886": {uri: "1886", x: 485.08855506728264, y: 289.8670698595927},
  "Globality": {uri: "Globality", x: 256.3559179136504, y: 410.448276201156},
  "Menlo_Park": {uri: "Menlo_Park", x: 83.92997119750402, y: 382.81827430484475},
  "City": {uri: "City", x: 139.61065209414951, y: 215.82600255720297},
  "Atlanta,_Georgia": {uri: "Atlanta,_Georgia", x: 253.83315449595113, y: 80.59225202119978},
  "Coca_Cola": {uri: "Coca_Cola", x: 310.2867869231662, y: 247.4835462482827},
  "Latham_&_Watkins": {uri: "Latham_&_Watkins", x: 435.8877573008512, y: 418.9047682683342},
  "Legal": {uri: "Legal", x: 290.4583074887293, y: 523.5155083552423},
  "Corporation": {uri: "Corporation", x: 444.5497547165428, y: 130.53765729914292}
};



function deepCopy(o) {
  return JSON.parse(JSON.stringify(o));
}

var w = 600,
    h = 600;

var centerX = w / 2;
var centerY = h / 2;

function linkKey(d) {
  return d.id;
}

function nodeKey(d) {
  return d.uri;
}

function pathId(d) {
  return d.source.index + "_" + d.target.index; 
}

function arrowheadId(d) {
  return "arrowhead_" + d.id; 
}

function makeGraph(elemId) {
  nodes = deepCopy(NODES);
  triples = deepCopy(TRIPLES);

  var simulation = d3.forceSimulation()
      .force("charge", d3.forceManyBody().strength(-2000))
      .force("link", d3.forceLink().distance(180).iterations(5))
      .force("center", d3.forceCenter(centerX, centerY))
      .force("x", d3.forceX(centerX).strength(0.25))
      .force("y", d3.forceY(centerY).strength(0.25))
      .on("tick", tick);

  var svg = d3.select("#" + elemId).append("svg:svg")
      .attr("class", "graph")
      .attr("height", "100%")
      .attr("viewBox", "0 0 " + w + " " + h);

  var defs = svg.append("defs");
  var lines = svg.append('g');
  var circles = svg.append('g');

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x, d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x, d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null, d.fy = null;
  }

  var linkPath, textPath, circle, text;

  var tripleId = 0;

  var color = d3.scaleOrdinal(d3.schemeSet1);

  function linkColor(d) {
    return color(d.predicate);
  }

  function update(isFirst) {
    // Compute the distinct nodes from the links.
    triples.forEach(function(triple) {
      triple.source = nodes[triple.subject] || (nodes[triple.subject] = {uri: triple.subject});
      triple.target = nodes[triple.object] || (nodes[triple.object] = {uri: triple.object});
      if (!('id' in triple)) {
        triple.id = tripleId++;
      }
    });

    var links = triples;

    simulation
        .nodes(d3.values(nodes))
        .alpha(0.1)
        .alphaTarget(0)
        .restart()
      .force("link")
        .links(links);

    var t = d3.transition()
        .ease(d3.easeBounce)
        .duration(5000);

    // Disable animation inherited from parents' css when we are adding a link
    var animation = isFirst ? '' : 'none';

    var markers = defs.selectAll('marker').data(links, linkKey);

    markers.enter()
      .append("marker")
        .attr("id", arrowheadId)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", isFirst ? 15 : 12)
        .attr("refY", isFirst ? -0.5 : -0.2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .style('animation', animation)
      .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .style('fill', linkColor)
        .style('animation', animation)
      .transition(t)
        .attr("refX", 15)
        .attr("refY", -0.5)

    var link = lines.selectAll("g.link").data(links, linkKey);

    var linkEnter = link.enter()
      .append('g')
        .attr('class', 'link')
        .style('animation', animation);

    linkEnter.append("path")
        .attr("class", "link")
        .attr("marker-end", function(d) {
          return "url(#" + arrowheadId(d) + ")";
        })
        .style('stroke', linkColor)
        .text(function(d) { return d.predicate; })
        .style('animation', animation)
        .style('stroke-width', isFirst ? '2px' : '4px')
      .transition(t)
        .style('stroke-width', '2px');

    // Create dummy paths to attach predicate text to
    // We can't use the regular line because we want to flip the direction of
    // this path to keep the text right-side up
    linkEnter.append("path")
        .attr("id", pathId)
        .attr("class", "textPath");

    link = linkEnter.merge(link);
    linkPath = link.select('path.link');
    textPath = link.select('path.textPath');

    circle = circles.selectAll("circle")
        .data(simulation.nodes(), nodeKey);
    circleEnter = circle.enter()
      .append("circle")
        .attr("r", 6)
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
        );
    circle = circleEnter.merge(circle);

    text = svg.selectAll("g.text")
      .data(simulation.nodes(), nodeKey);
    textEnter = text.enter()
      .append("g")
        .attr('class', 'text')
        .style('animation', animation);

    // A copy of the text with a thick white stroke for legibility.
    textEnter.append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")
        .text(function(d) { return d.uri; });

    textEnter.append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "entity")
        .text(function(d) { return d.uri; });

    text = textEnter.merge(text);

    svg.selectAll("text.path_label")
      .data(links, linkKey)
      .enter().append("text")
        .attr("dy", "-.5em")
        .attr("class", "path_label")
        .style('animation', animation)
      .append("textPath")
        .attr("class", "predicate")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle")
        .attr("xlink:href", function(d) { return "#" + pathId(d); })
        .style('fill', linkColor)
        .text(function(d) { return d.predicate; })
        .style('animation', animation)
        .style('font-size', isFirst ? '12px' : '16px')
      .transition(t)
        .style('font-size', '12px')

    simulation.restart();
  }

  function arcPath(leftHand, d) {
    var start = leftHand ? d.source : d.target,
        end = leftHand ? d.target : d.source,
        dx = end.x - start.x,
        dy = end.y - start.y,
        dr = Math.sqrt(dx * dx + dy * dy),
        sweep = leftHand ? 1 : 0;
    return "M" + start.x + "," + start.y + "A" + dr + "," + dr + " 0 0," + sweep + " " + end.x + "," + end.y;
  }

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    linkPath.attr("d", function(d) {
      return arcPath(true, d);
    });
      
    textPath.attr("d", function(d) {
      return arcPath(d.source.x < d.target.x, d);
    });

    circle.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    text.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  var pushed = false;
  function pushTriple() {
    if (!pushed) {
      triples.push(
        {subject:"Latham_&_Watkins", predicate:"hasPastClient", object:"Coca_Cola"}
      );
      update(false);
      pushed = true;
    }
  }

  update(true);

  return {
    pushTriple: pushTriple,
    color: color,
    nodes: nodes,
    circles: circles,
    svg: svg,
  };
}

var knowledgeGraph = makeGraph('graph');
var extractionGraph = makeGraph('extraction');

function highlightEntities(on) {
  var bgColor = function(d) {
     return on ? extractionGraph.color(d.uri) : 'transparent';
  };
  var nodeColor = function(d) {
    return on ? extractionGraph.color(d.uri) : '';
  }
  var textColor = function(d) {
    if (on) {
      var color = d3.hsl(extractionGraph.color(d.uri));
      color.l  = (color.l + 0.5) % 1;
      return '' + color;
    }
    return 'black';
  }

  var r = on ? 12 : 6;
  var x = on ? 16 : 8;
  var fontSize = on ? "16px" : "12px";
  var padding = on ? '5px' : '0px';
  var borderWidth = on ? '2px' : '0px';

  var t = d3.transition();
  var data = [
    extractionGraph.nodes['Coca_Cola'],
    extractionGraph.nodes['Latham_&_Watkins']
  ]

  d3.selectAll('span.entity')
    .data(data, function(d) {
       return d ? d.uri : this.id;
    })
    .transition(t)
      .style('background-color', bgColor)
      .style('padding', padding)
      .style('margin-top', padding)
      .style('border-width', borderWidth)
      .style('color', textColor)

  extractionGraph.circles.selectAll("circle")
    .data(data, nodeKey)
    .transition(t)
      .style('fill', nodeColor)
      .attr("r", r)

  var text = extractionGraph.svg.selectAll("g.text")
    .data(data, nodeKey)

  text.selectAll("text")
    .transition(t)
      .attr("x", x)

  text.select(".entity")
    .transition(t)
      .style("font-size", fontSize);
}

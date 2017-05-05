// Adapted from http://stackoverflow.com/a/18319089/2605678

var triples = [
  {subject:"Globality",        predicate:"location",      object:"Menlo_Park"},
  {subject:"Menlo_Park",       predicate:"type",          object:"City"},
  {subject:"Atlanta,_Georgia", predicate:"type",          object:"City"},
  {subject:"Globality",        predicate:"hasPastClient", object:"Coca_Cola"},
  {subject:"Globality",        predicate:"hasPastClient", object:"Latham_&_Watkins"},
  {subject:"Latham_&_Watkins", predicate:"industry",      object:"Legal"},
  {subject:"Coca_Cola",        predicate:"location",      object:"Atlanta,_Georgia"},
  {subject:"Coca_Cola",        predicate:"foundingDate",  object:"1886"},
];

var nodes = {
  "1886": {uri: "1886", x: 326.07842908129186, y: 45.67108617475361},
  "Globality": {uri: "Globality", x: 324.1976344959891, y: 307.99888027136035},
  "Menlo_Park": {uri: "Menlo_Park", x: 322.1923622804831, y: 495.67554647562184},
  "City": {uri: "City", x: 140.19257596576654, y: 462.96650749465084},
  "Atlanta,_Georgia": {uri: "Atlanta,_Georgia", x: 60.49266279476002, y: 294.4064534254175},
  "Coca_Cola": {uri: "Coca_Cola", x: 196.10474044637402, y: 172.54335370978723},
  "Latham_&_Watkins": {uri: "Latham_&_Watkins", x: 485.3261715837793, y: 214.7531640780634},
  "Legal": {uri: "Legal", x: 528.3838046366114, y: 394.1161344790291}
};

var w = 600,
    h = 600;

var centerX = w / 2;
var centerY = h / 2;

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(-2000))
    .force("link", d3.forceLink().distance(180).iterations(5))
    .force("center", d3.forceCenter(centerX, centerY))
    .force("x", d3.forceX(centerX).strength(0.25))
    .force("y", d3.forceY(centerY).strength(0.25))
    .on("tick", tick);

var svg = d3.select("#svg-body").append("svg:svg")
    .attr("class", "bg-white")
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

function linkColor(d) {
  return (d.predicate == "type" ? "green" : "black");
}

function linkKey(d) {
  return d.id;
}

function nodeKey(d) {
  return d.uri;
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
    .nodes(d3.values(nodes));
  simulation.force("link")
    .links(links);
  simulation
    .alpha(0.1)
    .alphaTarget(0)
    .restart();

  var t = d3.transition()
      .duration(5000);

  var markers = defs.selectAll('marker').data(links, linkKey);

  var initialColor = isFirst ? linkColor : 'red';
  var animation = isFirst ? '' : 'none';

  markers.enter()
    .append("marker")
      .attr("id", function(d) { return "arrowhead_" + d.id; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -0.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .style('animation', animation)
    .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .style('fill', initialColor)
      .style('animation', animation)
    .transition(t)
      .style('fill', linkColor);

  var link = lines.selectAll("g.link").data(links, linkKey);
  var linkEnter = link.enter()
    .append('g')
    .attr('class', 'link')
    .style('animation', animation);

  linkEnter.append("path")
      .attr("class", "link")
      .attr("marker-end", function(d) {
        return "url(#arrowhead_" + d.id + ")";
      })
      .style('stroke', initialColor)
      .text(function(d) { return d.predicate; })
      .style('animation', animation)
    .transition(t)
      .style('stroke', linkColor);

  linkEnter.append("path")
    .attr("id", function(d) { return d.source.index + "_" + d.target.index; })
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
      .attr("xlink:href", function(d) { return "#" + d.source.index + "_" + d.target.index; })
      .style('fill', initialColor)
      .text(function(d) { return d.predicate; })
      .style('animation', animation)
    .transition(t)
      .style('fill', linkColor);

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

function pushTriple() {
  triples.push(
    {subject:"Latham_&_Watkins", predicate:"hasPastClient", object:"Coca_Cola"}
  );
  update(false);
}

update(true);

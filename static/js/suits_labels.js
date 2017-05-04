// http://blog.thomsonreuters.com/index.php/mobile-patent-suits-graphic-of-the-day/

var triples = [
  {subject:"gspr:Globality",        predicate:"gspo:location",      object:"gspr:Menlo_Park"},
  {subject:"gspr:Menlo_Park",       predicate:"rdf:type",           object:"gspr:City"},
  {subject:"gspr:Globality",        predicate:"gspo:hasPastClient", object:"gspr:Coca_Cola"},
  {subject:"gspr:Globality",        predicate:"gspo:hasPastClient", object:"gspr:Latham_&_Watkins"},
  {subject:"gspr:Latham_&_Watkins", predicate:"gspo:industry",      object:"gspr:Legal"},
  {subject:"gspr:Coca_Cola",        predicate:"gspo:location",      object:"gspr:Atlanta,_Georgia"},
  {subject:"gspr:Coca_Cola",        predicate:"gspo:foundingDate",  object:"1886"},
];

var nodes = {};

// Compute the distinct nodes from the links.
triples.forEach(function(triple) {
  triple.source = nodes[triple.subject] || (nodes[triple.subject] = {uri: triple.subject});
  triple.target = nodes[triple.object] || (nodes[triple.object] = {uri: triple.object});
});

var w = 800,
    h = 600;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(triples)
    .size([w, h])
    .linkDistance(120)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("#svg-body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

// Per-type markers, as they don't inherit styles.
svg.append("svg:defs").selectAll("marker")
    .data(["arrowhead", "arrowheadtype"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var link = svg.append("svg:g").selectAll("g.link")
    .data(force.links())
  .enter().append('g')
    .attr('class', 'link');

var linkPath = link.append("svg:path")
    .attr("class", function(d) {
      return "link " + (d.predicate == "rdf:type" ? "type" : "");
    })
    .attr("marker-end", function(d) {
      return "url(#arrowhead" + (d.predicate == "rdf:type" ? "type" : "") + ")";
    });

var textPath = link.append("svg:path")
    .attr("id", function(d) { return d.source.index + "_" + d.target.index; })
    .attr("class", "textpath");

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", 6)
    .call(force.drag);

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.uri; });

text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.uri; });

var path_label = svg.append("svg:g").selectAll(".path_label")
    .data(force.links())
  .enter().append("svg:text")
    .attr("class", "path_label")
    .append("svg:textPath")
      .attr("startOffset", "50%")
      .attr("text-anchor", "middle")
      .attr("xlink:href", function(d) { return "#" + d.source.index + "_" + d.target.index; })
      .style("fill", "#000")
      .style("font-family", "Arial")
      .text(function(d) { return d.predicate; });

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



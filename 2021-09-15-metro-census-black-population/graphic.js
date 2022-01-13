var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var topojson = require("topojson")

var colors = require("./lib/helpers/colors")

var d3 = {
  ...require("d3-array/dist/d3-array.min"),
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-fetch/dist/d3-fetch.min"),
  ...require("d3-geo/dist/d3-geo.min")
};

var pymChild = null;
pym.then(function(child) {
  pymChild = child;
  child.sendHeight();
  window.addEventListener("resize", render);
});

var render = function() {
  var containerElement = document.querySelector(".graphic");
  //remove fallback
  containerElement.innerHTML = "";
  var containerWidth = containerElement.offsetWidth;

  var container = d3.select(containerElement);
  
  d3.json('stl_metro_pop_race_2010_2020.json')
  .then(function(data) {

    county_obj = topojson.feature(data, data.objects.stl_metro_pop_race_2010_2020).features;
    counties = {
      "type":"FeatureCollection",
      "features": [ ]
    }

    county_obj.forEach(function(d) { counties.features.push(d)})


    const projection = d3.geoTransverseMercator()
    .rotate([90 + 30 / 60, -35 - 50 / 60])
    .fitExtent([[0,0],[containerWidth,containerWidth]],counties);

    const pathGenerator = d3.geoPath(projection);

  var pop_div = container.append("div").attr("class","pop")
  
  
  var pop_svg = pop_div.append("svg").attr("viewBox", [0, 0, containerWidth, containerWidth]);
  
  const pop_g = pop_svg.append("g");
  
  const colorRange = ["#f26522",
  "#faa21b",
  "#edd232",
  "#999",
  "#b3ca2d",
  "#639d48",
  "#006b71"]

// population

  const pop_counties2 = pop_g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer");

      function getPopFill(d) {
        var pct = (d.properties.black_2020 - d.properties.black_2010) / d.properties.black_2010

        var color = d3.scaleThreshold()
    .domain([-.10,-.05,-.001,.001,.05,.10])
    .range(colorRange);

    return color(pct)
      
  }
    
    pop_counties2.selectAll("path")
    .data(counties.features)
    .enter()
    .append("path")
      .attr("d", function(d) {return pathGenerator(d.geometry)})
      .attr("fill", function(d) {return getPopFill(d)})
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")


    pop_key = pop_div.append("div").append("div")
    .attr("class", "key")
    .selectAll("div")
    .data(colorRange)
    .enter()
    .append("div")
    .attr("class", function(d, i) { return "key-item item-" + i })
    .append("b")

    var pop_labels_text = ["Lost more than 10%", "Lost between 5 and 10%", "Lost less than 5%", "Neither gained nor lost", "Gained less than 5%", "Gained between 5 and 10%", "Gained more than 10%"]

    pop_labels = pop_div
    .select(".key")
    .selectAll("div")
    .data(pop_labels_text)
    .join()
    .append("label")
    .text(d=>d)
    
    
    pymChild.sendHeight();
  
  });

};

//first render
render();

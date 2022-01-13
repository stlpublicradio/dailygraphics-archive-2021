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

  var asian_div = container.append("div").attr("class","asian")
  asian_div.append("h5").attr("class","label").text("Asian")
  var asian_svg = asian_div.append("svg").attr("viewBox", [0, 0, containerWidth, containerWidth]);
  const asian_g = asian_svg.append("g");

  var hispanic_div = container.append("div").attr("class","hispanic")
  hispanic_div.append("h5").attr("class","label").text("Hispanic")
  var hispanic_svg = hispanic_div.append("svg").attr("viewBox", [0, 0, containerWidth, containerWidth]);
  const hispanic_g = hispanic_svg.append("g");

  var multiple_div = container.append("div").attr("class","multiple")
  multiple_div.append("h5").attr("class","label").text("Two or more races")
  var multiple_svg = multiple_div.append("svg").attr("viewBox", [0, 0, containerWidth, containerWidth]);
  const multiple_g = multiple_svg.append("g");
  
  
// asian
const AcolorRange = ["#9a104f",
        "#999",
        "#d4dcf0",
        "#594f91",
        "#24206e"]

  const asian_counties2 = asian_g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer");

      function getasianFill(d) {
        var pct = (d.properties.asian_2020 - d.properties.asian_2010)

        console.log(d.properties.NAMELSAD + "; Asian: " + pct)
        
        

        var color = d3.scaleThreshold()
    .domain([-1,1,500,5000])
    .range(AcolorRange);

    return color(pct)
      
  }
    
    asian_counties2.selectAll("path")
    .data(counties.features)
    .enter()
    .append("path")
      .attr("d", function(d) {return pathGenerator(d.geometry)})
      .attr("fill", function(d) {return getasianFill(d)})
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")


    asian_key = asian_div.append("div").append("div")
    .attr("class", "key")
    .selectAll("div")
    .data(AcolorRange)
    .enter()
    .append("div")
    .attr("class", function(d, i) { return "key-item item-" + i })
    .append("b")

    var asian_labels_text = ["Lost fewer than 10 Asian residents", "No change", "Gained fewer than 500", "Gained between 500 and 5,000", "Gained more than 5,000"]

    asian_labels = asian_div
    .select(".key")
    .selectAll("div")
    .data(asian_labels_text)
    .join()
    .append("label")
    .text(d=>d)

// hispanic
const HcolorRange = [
  "#d4dcf0",
  "#594f91",
  "#24206e"]

const hispanic_counties2 = hispanic_g.append("g")
.attr("fill", "#444")
.attr("cursor", "pointer");

function gethispanicFill(d) {
  var pct = (d.properties.hispanic_2020 - d.properties.hispanic_2010)

  console.log(d.properties.NAMELSAD + "; Hispanic: " + pct)


  var color = d3.scaleThreshold()
.domain([500,5000])
.range(HcolorRange);

return color(pct)

}

hispanic_counties2.selectAll("path")
.data(counties.features)
.enter()
.append("path")
.attr("d", function(d) {return pathGenerator(d.geometry)})
.attr("fill", function(d) {return gethispanicFill(d)})
.attr("stroke", "white")
.attr("stroke-linejoin", "round")


hispanic_key = hispanic_div.append("div").append("div")
.attr("class", "key")
.selectAll("div")
.data(HcolorRange)
.enter()
.append("div")
.attr("class", function(d, i) { return "key-item item-" + (i+2) })
.append("b")

var hispanic_labels_text = ["Gained fewer than 500 Hispanic residents", "Gained between 500 and 5,000", "Gained more than 5,000"]

hispanic_labels = hispanic_div
.select(".key")
.selectAll("div")
.data(hispanic_labels_text)
.join()
.append("label")
.text(d=>d)    


// multiple
const McolorRange = [
  "#d4dcf0",
  "#594f91",
  "#24206e"]

const multiple_counties2 = multiple_g.append("g")
.attr("fill", "#444")
.attr("cursor", "pointer");

function getmultipleFill(d) {
  var pct = (d.properties.multiple_2020 - d.properties.multiple_2010)

  console.log(d.properties.NAMELSAD + "; Multiracial: " + pct)


  var color = d3.scaleThreshold()
.domain([500,5000])
.range(McolorRange);

return color(pct)

}

multiple_counties2.selectAll("path")
.data(counties.features)
.enter()
.append("path")
.attr("d", function(d) {return pathGenerator(d.geometry)})
.attr("fill", function(d) {return getmultipleFill(d)})
.attr("stroke", "white")
.attr("stroke-linejoin", "round")


multiple_key = multiple_div.append("div").append("div")
.attr("class", "key")
.selectAll("div")
.data(McolorRange)
.enter()
.append("div")
.attr("class", function(d, i) { return "key-item item-" + (i+2) })
.append("b")

var multiple_labels_text = ["Gained fewer than 500 residents of two or more races", "Gained between 500 and 5,000", "Gained more than 5,000"]

multiple_labels = multiple_div
.select(".key")
.selectAll("div")
.data(multiple_labels_text)
.join()
.append("label")
.text(d=>d)    
    
    
    pymChild.sendHeight();
  
  });

};

//first render
render();

// Global vars
var pym = require("./lib/pym");
require("./lib/webfonts");
var pymChild;

var renderBarChart = require("./renderBars");

// Initialize the graphic.
var onWindowLoaded = function() {
  var data = window.DATA;
  render(data);

  window.addEventListener("resize", () => render(data));

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });
};

// Render the graphic(s). Called by pym with the container width.
var render = function(data) {

  renderBarChart({
    container: "#bar-chart-earnings-tax",
    element: document.querySelector("#bar-chart-earnings-tax"),
    width: document.querySelector("#bar-chart-earnings-tax").offsetWidth,
    data: data.filter(candidate => candidate.race == "propE"),
    labelColumn: "label",
    valueColumn: "amt",
    winnerColumn: "winner"
  });

  props = ['Y','1','2','3','4','5']

  props.forEach(function(prop) {
    container_name = "#bar-chart-msd-" + prop;
    filter = "prop" + prop;

    renderBarChart({
      container: container_name,
      element: document.querySelector(container_name),
      width: document.querySelector(container_name).offsetWidth,
      data: data.filter(candidate => candidate.race == filter),
      labelColumn: "label",
      valueColumn: "amt",
      winnerColumn: "winner"
    });
  })


  container_name = "#bar-chart-school-bd";
  filter = "school_bd";

  renderBarChart({
    container: container_name,
    element: document.querySelector(container_name),
    width: document.querySelector(container_name).offsetWidth,
    data: data.filter(candidate => candidate.race == filter),
    labelColumn: "label",
    valueColumn: "amt",
    winnerColumn: "winner"
  });


  
  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Initially load the graphic
window.onload = onWindowLoaded;

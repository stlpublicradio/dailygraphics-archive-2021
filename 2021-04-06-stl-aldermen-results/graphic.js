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
  wards = ['1','3','4','5','7','9','11','12','13','15','17','19','21','23','25','27']

  wards.forEach(function(ward) {
    container_name = "#bar-chart-ward-" + ward;
    filter = "ward" + ward;

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

  
  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Initially load the graphic
window.onload = onWindowLoaded;

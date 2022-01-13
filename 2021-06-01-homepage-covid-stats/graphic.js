var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var d3 = {
    ...require("d3-selection/dist/d3-selection.min"),
    ...require("d3-format/dist/d3-format.min"),
    ...require("d3-fetch/dist/d3-fetch.min")
    
  };

  var fmtThousands = d3.format(',.0f')
  var fmtPct = d3.format('.0%')

  var onWindowLoaded = function() {
    render();
    window.addEventListener("resize", () => render());
  
    pym.then(child => {
      pymChild = child;
      child.sendHeight();
    });
  };

var render = function() {
d3.json("https://raw.githubusercontent.com/stlpublicradio/covid-data/main/output/covid.json").then( data => {
    data = Object.entries(data)

    console.log(data)

    var dates = []

    data.forEach(function(d) {
      dates.push(d[1]['vaccinations']['date']);
      dates.push(d[1]['cases']['date'])
    })

    table = d3.select('tbody')

    var states = {'IL': {'name':'Illinois','pop':12671821
}, 'MO': {'name':'Missouri','pop':6137428
}}

    var state_row = table
    .selectAll('tr')
    .data(data)
    .enter()
    .append('tr')
    
    
    state_row
    .append('td')
    .attr('class','state')
    .html(function(d) {
        var stateName = states[d[0]].name;
        if (stateName == 'Illinois') {
          var stateLetter = 'N'
        }
        else if (stateName == 'Missouri') {
          var stateLetter = 'X'
        }
        return '<span class="stateIcon">' + stateLetter + '</span> <span class="stateName">' + stateName + '</span>'
    } )

    state_row
    .append('td').html(function(d) {
        return fmtPct(d[1]['vaccinations']['first_dose'] / states[d[0]].pop)
    } )

    state_row
    .append('td').html(function(d) {
        return fmtPct(d[1]['vaccinations']['complete'] / states[d[0]].pop)
    } )

    state_row
    .append('td').html(function(d) {
        return fmtThousands(d[1]['cases']['deaths'])
    } )

    d3.select('.last-updated')
    .html(function() { return dates.sort()[dates.length - 1] })

    


    if (pymChild) {
        pymChild.sendHeight();
      }

    
})

}

window.onload = onWindowLoaded;
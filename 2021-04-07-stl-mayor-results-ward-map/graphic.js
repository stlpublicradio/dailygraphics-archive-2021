var pym = require("./lib/pym");
// var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var {
  isMobile
} = require("./lib/breakpoints");

var d3 = {
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-fetch/dist/d3-fetch.min"),
  ...require("d3-format/dist/d3-format.min")
};

var fmtPct = d3.format('.1%')


var colors = require("./lib/helpers/colors");
var fmtComma = require("./lib/helpers/fmtComma");


var topojson = require("topojson");

var L = require("leaflet");

var pymChild = null;

pym.then(function (child) {
  pymChild = child;
  child.sendHeight();

  // window.addEventListener("resize", render);
});

var render = function () {


  var containerElement = document.querySelector(".graphic");
  //remove fallback
  containerElement.innerHTML = "";
  var containerWidth = containerElement.offsetWidth;

  var container = d3.select(containerElement);

  container.attr("id", "map");

  var map_styles = {
    'dark': 'stlpr/ckbco8znk10cn1jlz0d8kpr7n',
    'light': 'stlpr/ckbcob9ja0p2q1it4nwvvx9zs',
    'satellite': 'stlpr/ckbcolxk2040t1jmlxiwd503j'
  }

  var geo_bounds = {
    'stl_city': L.latLngBounds(L.latLng(38.347763, -90.380802),L.latLng(38.969741, -90.108203)),
    'stl_metro': L.latLngBounds(L.latLng(38.0882,-91.029),L.latLng(39.2185,-89.5239)),
    'missouri': L.latLngBounds(L.latLng(35.25,-96.5),L.latLng(41.26,-88.09)),
  }
    
  var bounds = geo_bounds.stl_city;

  var map = new L.map('map', {
    scrollWheelZoom: false,
    attribution: ''
  }).setView(bounds.getCenter(), 11).setMaxBounds(bounds);

  var tiles = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: map_styles.light,
      accessToken: "pk.eyJ1Ijoic3RscHIiLCJhIjoicHNFVGhjUSJ9.WZtzslO6NLYL8Is7S-fdxg",
    }
  ).addTo(map);

  var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");


  d3.json("2021-04-06-stl-mayor-by-ward.json").then(function(data) {
    var regions = topojson.feature(data, data.objects.stl_mayor_by_ward);
    var geojson;

    function getColor(d) {

      return d.vote_spencer > d.vote_jones ? colors.blue :
        colors.orange;

          }

    function getOpacity(d) {


      return d < 250 ? .1 :
            d < 500 ? .3 :
            d < 1000 ? .6 :
            .9

    }
        
        function style(feature) {
            return {
              // update property
                  fillColor: getColor(feature.properties),
                  weight: 1,
                  opacity: 1,
                  color: '#fff',
                  fillOpacity: getOpacity(Math.abs(feature.properties.vote_spencer - feature.properties.vote_jones))
              };
          }
        
        //set up highlighting function
        
        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
          
          info.update(layer.feature.properties);

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
        
        function resetHighlight(e) {
            geojson.resetStyle(e.target);
       	 info.update();
        }
        
                function clickHighlight(e) {
                    geojson.eachLayer( function (layer) {
                        geojson.resetStyle(layer);
                    });
                    highlightFeature(e)
                }

        function onEachFeature(feature, layer) {
            layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight,
                        click: clickHighlight
            });
        }
        
        geojson = L.geoJson(regions, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
        
        // add infobox
        
        var info = L.control();

        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
				 info.update = function (props) {

            if (props) {
              var total_votes = props.vote_spencer + props.vote_jones + props.vote_write_in

              if (props.vote_jones > props.vote_spencer) {
                var winner = 'Tishaura Jones';
                var loser = 'Cara Spencer';
                var winner_votes = props.vote_jones;
                var loser_votes = props.vote_spencer;
              }
              else {
                var winner = 'Cara Spencer';
                var loser = 'Tishaura Jones';
                var winner_votes = props.vote_spencer;
                var loser_votes = props.vote_jones;
                
              }
            }
				     this._div.innerHTML = '<h4>Where did each candidate have support?</h4>' 
          
					 // example ternary logic for infobox
					 +  (
						 props ?
             '<strong>Ward ' + props.WARD10 + '</strong><br>' +
             winner +
             ' won the ward by ' + fmtComma(Math.abs(props.vote_jones - props.vote_spencer)) + ' votes.<br><br>' +
             '<strong>' + winner + ': ' + fmtComma(winner_votes) + ' (' + fmtPct(winner_votes/total_votes) + ')</strong><br>' +
             loser + ': ' + fmtComma(loser_votes) + ' (' + fmtPct(loser_votes/total_votes) + ')<br>' +
             'Write-in: ' + fmtComma(props.vote_write_in) + ' (' + fmtPct(props.vote_write_in/total_votes) + ')<br>'
 						 : 'Overall, Tishaura Jones won by 2,280 votes.<br>Hover over a ward to see results there.');
				 };

				 info.addTo(map);
        
        // add legend
        
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

          var div = L.DomUtil.create('div', 'info legend')
                    
          // Legend with strings
          // div.innerHTML = '<i style="background:' + colors.red + '"></i> Added to the suit<br /><i style="background:' + colors.maroon + '"></i> Also named in the suit<br /><i style="background:' + colors.green + '"></i> Dropped from the suit<br />';
          
          // Legend with numbers
          title = ["<h4>Margin of win in ward</h4>"];
      (grades = [0,250,500,1000]),
        (text = ["Fewer than 250 votes","250-500","500-1,000","More than 1,000"]);
      labels = [];
      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];
        labels.push(
          '<i style="background:' + colors.orange + ';opacity:' +
            getOpacity(grades[i] + 0.001) +
            '"></i><i style="background:' + colors.blue + ';opacity:' +
            getOpacity(grades[i] + 0.001) +
            '"></i> ' +
            text[i]
        );
      }
      div.innerHTML = '<h4>Margin of victory</h4><div class="legend_labels"><span class="legend_label">Tishaura Jones</span><span class="legend_label">Cara Spencer</span></div><br><br>' +  labels.join("<br>");

      return div;
    };

        legend.addTo(map);
        
        })


};

//first render
render();


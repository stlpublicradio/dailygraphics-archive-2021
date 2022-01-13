var pym = require("./lib/pym");
// var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var {
  isMobile
} = require("./lib/breakpoints");

var d3 = {
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-fetch/dist/d3-fetch.min")
};

var topojson = require("topojson");

var L = require("leaflet");
const fmtComma = require("./lib/helpers/fmtComma");

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

  var colors = {
    'ltgreen'	: '#b3ca2d',
    'green'		: '#639d48',
    'dkgreen' 	: '#006b71',
    'ltblue' 	: '#90cef1',
    'blue'		: '#00abc3',
    'dkblue'	: '#237bbd',
    'yellow'	: '#edd232',
    'orange' 	: '#faa21b',
    'tangerine' : '#f26522',
    'red'		: '#d62021',
    'pink'		: '#e03669',
    'maroon' 	: '#9a104f',
    'purple' 	: '#592059',
  };

  var map_styles = {
    'dark': 'stlpr/ckbco8znk10cn1jlz0d8kpr7n',
    'light': 'stlpr/ckbcob9ja0p2q1it4nwvvx9zs',
    'satellite': 'stlpr/ckbcolxk2040t1jmlxiwd503j'
  }

  var geo_bounds = {
    'stl_city': L.latLngBounds(L.latLng(38.447763, -90.380802),L.latLng(38.869741, -90.108203)),
    'stl_metro': L.latLngBounds(L.latLng(37.0882,-92.029),L.latLng(40.2185,-88.5239)),
    'missouri': L.latLngBounds(L.latLng(35.25,-96.5),L.latLng(41.26,-88.09)),
  }
    
  var bounds = geo_bounds.stl_metro;

  var map = new L.map('map', {
    scrollWheelZoom: false,
    attribution: ''
  }).setView(bounds.getCenter(), 9).setMaxBounds(bounds);

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


  d3.json("2020_asian_change.json").then(function(data) {
    var regions = topojson.feature(data, data.objects['asian_change']);
    var geojson;

    function getColor(d) {

      //example logic to get color based on number
      // return d < -100 ? colors.tangerine :
      //     d < -50 ? colors.orange :
      //     d < 0 ? colors.yellow :
      //     d < 50 ? colors.ltgreen:
      //     d < 100 ? colors.green :
      //     colors.dkgreen;
            
      //     }

      return d < -250 ? colors.tangerine :
          d < -25 ? colors.orange :
          d < 25 ? colors.yellow:
          d < 250 ? colors.ltgreen :
          colors.green;
            
          }
        
        function style(feature) {
            return {
              // update property
                  fillColor: getColor(feature.properties['2020_asian_alone'] - feature.properties['2010_asian_alone']),
                  weight: 1,
                  opacity: 0,
                  color: '#000',
                  fillOpacity: 0.7
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
            if (props.tract_change == 'split') {
              var tract_change = '<br><br><em>Note: This tract was created by splitting up a 2010 tract because of population growth here.</em>'
            }
            else if (props.tract_change == 'combine') {
              var tract_change = '<br><br><em>Note: This tract was created by combining two 2010 tracts because of population loss here.'
            }
            else {
              var tract_change = ''
            }
           }


				     this._div.innerHTML = '<h4>Asian population change 2010-2020</h4>' 

              
          
					 // example ternary logic for infobox
					 +  (
						 props ?
						 "<strong>Tract " + props.NAME20 + "</strong><br>2020 Asian population: " + fmtComma(Math.round(props['2020_asian_alone'])) + "<br>2010 Asian population: " + fmtComma(Math.round(props['2010_asian_alone'])) + tract_change
						 : 'Hover over a tract');
				 };

				 info.addTo(map);
        
        // add legend
        
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

          var div = L.DomUtil.create('div', 'info legend')
                    
          // Legend with strings
          // div.innerHTML = '<i style="background:' + colors.red + '"></i> Added to the suit<br /><i style="background:' + colors.maroon + '"></i> Also named in the suit<br /><i style="background:' + colors.green + '"></i> Dropped from the suit<br />';
          
          // Legend with numbers
          var title = ['<h4>Legend</h4>']
          var grades = [-252, -27, 0, 25, 250];
          var text = ['Lost more than 250','-250 to -25','-25 to 25','25 to 250','Gained more than 250']
          var labels = [];
          for (var i = 0; i < grades.length; i++) {
              var from = grades[i];
             var to = grades[i + 1];
             labels.push(
               '<i style="background:' + getColor(grades[i] + .001) + '"></i> ' +
               text[i] );
           }
           div.innerHTML = title + labels.join('<br>');
          

            return div;
        };

        legend.addTo(map);
        
        })


};

//first render
render();


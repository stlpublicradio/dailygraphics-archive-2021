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

var colors = 
  require("./lib/helpers/colors.js")


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

  var colors = {
    'brown': '#6b6256',
    'tan': '#a5a585',
    'ltgreen': '#70a99a',
    'green': '#449970',
    'dkgreen': '#31716e',
    'ltblue': '#55b7d9',
    'blue': '#358fb3',
    'dkblue': '#006c8e',
    'yellow': '#f1bb4f',
    'orange': '#f6883e',
    'tangerine': '#e8604d',
    'red': '#cc203b',
    'pink': '#c72068',
    'maroon': '#8c1b52',
    'purple': '#571751'
  };

  var map_styles = {
    'dark': 'stlpr/ckbco8znk10cn1jlz0d8kpr7n',
    'light': 'stlpr/ckbcob9ja0p2q1it4nwvvx9zs',
    'satellite': 'stlpr/ckbcolxk2040t1jmlxiwd503j'
  }

  var geo_bounds = {
    'stl_city': L.latLngBounds(L.latLng(38.447763, -90.380802),L.latLng(38.869741, -90.108203)),
    'stl_metro': L.latLngBounds(L.latLng(38.0882,-91.029),L.latLng(39.2185,-89.5239)),
    'missouri': L.latLngBounds(L.latLng(35.25,-96.5),L.latLng(41.26,-88.09)),
  }

    
  var bounds =   L.latLngBounds(L.latLng(36.9701,-91.5131),L.latLng(42.5082,-87.0199))
  ;

  var map = new L.map('map', {
    scrollWheelZoom: false,
    attribution: ''
  }).setView(bounds.getCenter(), 6).setMaxBounds(bounds);

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


  d3.json("coal_plants.json").then(function(data) {
    var regions = topojson.feature(data, data.objects.coal_plants);
    var geojson;

    function getColor(d) {

      //example logic to get color based on number
      return d < 15 ? '#F4ECF7' :
          d < 20 ? '#D2B4DE' :
          d < 25 ? '#BB8FCE' :
          d < 30 ? '#8E44AD':
          d < 35 ? '#5B2C6F' :
          '#0f0712';
            
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

        function getColor(d) {
          if (d.status == 'Closed') {
            if (d.demolished == 'Yes') {
              return colors.yellow
            }
            else {
              return colors.red
            }
          }
          else {
            return colors.blue
          }
        }

        var geojsonmarkeroptions = 
        
        geojson = L.geoJson(regions, {
          pointToLayer: function(feature, latlng) {
            var fillColor = getColor(feature.properties);
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: fillColor,
              color: "#000",
              weight: 1,
              opacity: .8,
              fillOpacity: .8
    
            })
          },
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
				     this._div.innerHTML = '<h4>Coal plants in Illinois</h4>' 
          
					 // example ternary logic for infobox
					 +  (
						 props ?
            "<strong>" + props.name + "</strong><br/><strong>" + props.parent + "</strong><br/>Status: " + props.status + "<br/>" + (props.close_date ? "Close date: " + props.close_date + "<br/>" : '') + "Demolished: " + props.demolished + "<br/>" + (props.notes ? "Notes: " + props.status + "<br/>" : '')
						 : 'Hover over a plant');
				 };

				 info.addTo(map);
        
        // add legend
        
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

          var div = L.DomUtil.create('div', 'info legend')
                    
          // Legend with strings
          div.innerHTML = '<i style="background:' + colors.red + '"></i> Closed but not fully demolished<br /><i style="background:' + colors.yellow + '"></i> Closed and demolished<br /><i style="background:' + colors.blue + '"></i> Not fully closed<br />';
          
          

            return div;
        };

        legend.addTo(map);
        
        })


};

//first render
render();


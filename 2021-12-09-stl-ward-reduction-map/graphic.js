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
    'purple' 	: '#592059'
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


  d3.json("redistrict-perfected.topojson").then(function(data) {

    d3.json("aldermen.topojson").then(function(a_data) {
      var aldermen = topojson.feature(a_data, a_data.objects.collection);
      var a_geojson;
    
      console.log(data)

    var regions = topojson.feature(data, data.objects.collection);
    var geojson;

    function getColor(d) {

      //example logic to get color based on number
      return d == 'Ward 1' ? colors.red
          :  d == 'Ward 2' ? colors.blue
          :  d == 'Ward 3' ? colors.orange
          :  d == 'Ward 4' ? colors.red
          :  d == 'Ward 5' ? colors.green
          :  d == 'Ward 6' ? colors.purple
          :  d == 'Ward 7' ? colors.blue
          :  d == 'Ward 8' ? colors.green
          :  d == 'Ward 9' ? colors.orange
          :  d == 'Ward 10' ? colors.purple
          :  d == 'Ward 11' ? colors.red
          :  d == 'Ward 12' ? colors.blue
          :  d == 'Ward 13' ? colors.green
          :  d == 'Ward 14' ? colors.orange
      : '#fff'
            
          }
        
        function style(feature) {
            return {
              // update property
                  fillColor: getColor(feature.properties.NAME),
                  weight: 1,
                  opacity: 1,
                  color: '#fff',
                  fillOpacity: 0.3
              };
          }
        
        //set up highlighting function
        
        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 5,
            });
          
          info.update(layer.feature.properties);

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }
        
        function resetHighlight(e) {
            a_geojson.resetStyle(e.target);
       	 info.update();
        }
        
                function clickHighlight(e) {
                    a_geojson.eachLayer( function (layer) {
                        a_geojson.resetStyle(layer);
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
        }).addTo(map);

        var geojsonMarkerOptions = {
          
      };

      function getOpacity(d) {
        return d == 'Carol Howard' ? .5
        : .8
      }

      function styleAldermen(feature) {
        return {
        radius: 8,
          fillColor: getColor(feature.properties.ward),
          color: "#000",
          weight: 1,
          opacity: getOpacity(feature.properties.name),
          fillOpacity: getOpacity(feature.properties.name)
        }
      }

        a_geojson = L.geoJson(aldermen, {
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          
        },
        style: styleAldermen,
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
				     this._div.innerHTML = '<h4>Perfected ward map</h4>' 
          
					 // example ternary logic for infobox
					 +  (
						 props ?
						 '<strong>' + props.name + '</strong></br>New ward: ' + props.ward
             + ( props.note ? '</br></br>' + props.note : '' )
						 : 'Hover over a dot.');
				 };

				 info.addTo(map);
        
        // add legend
        
        // var legend = L.control({position: 'bottomright'});

        // legend.onAdd = function (map) {

        //   var div = L.DomUtil.create('div', 'info legend')
                    
        //   // Legend with strings
        //   // div.innerHTML = '<i style="background:' + colors.red + '"></i> Added to the suit<br /><i style="background:' + colors.maroon + '"></i> Also named in the suit<br /><i style="background:' + colors.green + '"></i> Dropped from the suit<br />';
          
        //   // Legend with numbers
        //   title = ['<h4>Legend</h4>']
        //   grades = [0, 15, 20, 25, 30, 35],
        //   text = ['< 15%','15-19%','20-24%','25-29%','30-35%', '>35%']
        //   labels = [];
        //   for (var i = 0; i < grades.length; i++) {
        //       from = grades[i];
        //      to = grades[i + 1];
        //      labels.push(
        //        '<i style="background:' + getColor(grades[i] + .001) + '"></i> ' +
        //        text[i] );
        //    }
        //    div.innerHTML = title + labels.join('<br>');
          

        //     return div;
        // };

        // legend.addTo(map);


    })  
        })

              


};

//first render
render();


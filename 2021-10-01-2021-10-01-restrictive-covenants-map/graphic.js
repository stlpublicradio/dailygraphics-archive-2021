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

var L = require("leaflet/dist/leaflet.js");

require("leaflet-groupedlayercontrol");

require("@mapbox/assembly/dist/assembly.js")

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

  d3.select(containerElement).append('div')
  .attr('id','slider')
  .attr('class','range w300 round py6 border--gray-light px12 leaflet-control')
  .append('input')
  .attr('class','slider')
  .attr('type','range')
  .attr('min','1870')
  .attr('max','1950')
  .attr('value','1950')
  .attr('step','1')

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

  // var geo_bounds = {
  //   'stl_city': L.latLngBounds(L.latLng(38.447763, -90.380802),L.latLng(38.869741, -90.108203)),
  //   'stl_metro': L.latLngBounds(L.latLng(38.0882,-91.029),L.latLng(39.2185,-89.5239)),
  //   'missouri': L.latLngBounds(L.latLng(35.25,-96.5),L.latLng(41.26,-88.09)),
  // }
    
  // var bounds = geo_bounds.stl_city;

  const southWest = L.latLng(38.443222, -90.547778),
  northEast = L.latLng(38.843222, -89.947778),
  bounds = L.latLngBounds(southWest, northEast);

// Initialize the map
const map = L.map('map', { dragging: !L.Browser.mobile, tap: !L.Browser.mobile
})
.setView([38.643222,-90.247778], 12)
.setMinZoom(12)
.setMaxZoom(18)
.setMaxBounds(bounds);

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

    map.createPane('myPane2');
    map.createPane('myPane3');
    map.getPane('myPane2').style.zIndex = 500;
    map.getPane('myPane3').style.zIndex = 600;

    let currentYear = $('.slider').val();

    const percBl = L.layerGroup();

    const parcel = L.layerGroup();
    const petition = L.layerGroup();
    const priv = L.layerGroup();
    const privR = L.layerGroup();
    const subdivision = L.layerGroup();

    map.addLayer(percBl);
    map.addLayer(parcel);
    map.addLayer(petition);
    map.addLayer(priv);
    map.addLayer(privR);
    map.addLayer(subdivision);

  //   var groupedOverlays = {
  //     "<b>Type of Restriction</b>": {
  //       "Parcel": parcel,
  //       "Petition": petition,
  //       "Private Street": priv,
  //       "Private Street With Restrictions": privR,
  //       "Subdivision": subdivision,
  //       //"Other": other
  //     },
  //     //"Undated Covenants": {
  //       //"Parcel": parcelND, // None of these
  //       //"Petition": petitionND,
  //       //"Private Street": privRND,
  //       //"Subdivision": subdivisionND, // None of these
  //       //"Other": otherND // None of these
  //     //},
  //     "<b>Census Demographics</b>": {
  //       "Share Black": percBl,
  //     }
  //   };

  //   L.control.groupedLayers(null, groupedOverlays, {
  //     collapsed: false,
  // }).addTo(map);


  function getColorPOC(d) {
    return d >= 0.90 ? '#050505' :
      d >= 0.75 ? '#363636' :
      d >= 0.50 ? '#676767' :
      d >= 0.25 ? '#989898' :
      d >= 0.10 ? '#c9c9c9' :
      d > 0.00 ? '#fafafa' :
      'rgba(0,0,0,0.0)';
  };

  function getColorRestrictive(d) {
    return d === 'par' ? 'blue' :
      d === 'pet' ? 'red' :
      d === 'priv' ? '#54cc20':
      d === 'privR' ? '#2d6e11':
      d === 'sub' ? 'orange' :
      d === null ? '#ff9966':
      'rgba(0,0,0,0.0)';
  };

  // create legend for the covenants
  var covenantLegend = L.control({
    position: 'topright'
  });

  

  // add content to the legend
  covenantLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend');

    // generate a label with a colored square for each
    div.innerHTML +=
        "<div class='column1' style='width: 50%; float: left;'>" +
          "<b style='font-size:14px'>Restriction Type</b>" +
          '<br>' + '<i style="background:' + getColorRestrictive('par') + '"></i> ' + 'Parcel' +
          '<br>' + '<i style="background:' + getColorRestrictive('pet') + '"></i> ' + 'Petition' +
          '<br>' + '<i style="background:' + getColorRestrictive('priv') + '"></i> ' + 'Private Street' +
          '<br>' + '<i style="background:' + getColorRestrictive('privR') + '"></i> ' + 'Private Street With Restrictions' +
          '<br>' + '<i style="background:' + getColorRestrictive('sub') + '"></i> ' + 'Subdivision' +
          //'<br>' + '<i style="background:' + getColorRestrictive(null) + '"></i> ' + 'Other' +
        "</div>" +
        "<div class='column2' style='margin-left: 55%;'>" +
          "<b style='font-size:14px'>Share Black</b>" +
          '<br>' + '<i style="background:' + getColorPOC(0.91) + '"></i> ' + '>90%' +
          '<br>' + '<i style="background:' + getColorPOC(0.76) + '"></i> ' + '75% - 89%' +
          '<br>' + '<i style="background:' + getColorPOC(0.51) + '"></i> ' + '50% - 74%' +
          '<br>' + '<i style="background:' + getColorPOC(0.26) + '"></i> ' + '25% - 49%' +
          '<br>' + '<i style="background:' + getColorPOC(0.11) + '"></i> ' + '10% - 24%' +
          '<br>' + '<i style="background:' + getColorPOC(0.01) + '"></i> ' + '>0% - 9%' +
        "</div>";

    return div;
  };

  // add this legend to the map, because this legend is on by default
  covenantLegend.addTo(map);

    // add a scale bar
    L.control.scale({ position: 'topright' }).addTo(map);


  $.when(
    $.getJSON("data/STL_ED_1900.geojson"),
    $.getJSON("data/STL_ED_1910.geojson"),
    $.getJSON("data/STL_ED_1920.geojson"),
    $.getJSON("data/STL_ED_1930.geojson"),
    $.getJSON("data/STL_ED_1940.geojson"),
    $.getJSON("data/stl_covs_topo.json"),
  ).done(function(stl1900, stl1910, stl1920, stl1930, stl1940, restrictive) {

    const poc1900 = L.geoJson(stl1900, {
      // style the layer
      style: function(feature) {

        return {
          color: getColorPOC(feature.properties.pb),
          opacity: 0.35,
          weight: 1.0,
          fillColor: getColorPOC(feature.properties.pb),
          fillOpacity: 0.35,
        };
      },
    });

    const poc1910 = L.geoJson(stl1910, {
      // style the layer
      style: function(feature) {

        return {
          color: getColorPOC(feature.properties.pb),
          opacity: 0.35,
          weight: 1.0,
          fillColor: getColorPOC(feature.properties.pb),
          fillOpacity: 0.35,
        };
      },
    });

    const poc1920 = L.geoJson(stl1920, {
      // style the layer
      style: function(feature) {

        return {
          color: getColorPOC(feature.properties.pb),
          opacity: 0.35,
          weight: 1.0,
          fillColor: getColorPOC(feature.properties.pb),
          fillOpacity: 0.35,
        };
      },
    });

    const poc1930 = L.geoJson(stl1930, {
      // style the layer
      style: function(feature) {

        return {
          color: getColorPOC(feature.properties.pb),
          opacity: 0.35,
          weight: 1.0,
          fillColor: getColorPOC(feature.properties.pb),
          fillOpacity: 0.35,
        };
      },
    });

    const poc1940 = L.geoJson(stl1940, {
      // style the layer
      style: function(feature) {

        return {
          color: getColorPOC(feature.properties.pb),
          opacity: 0.35,
          weight: 1.0,
          fillColor: getColorPOC(feature.properties.pb),
          fillOpacity: 0.35,
        };
      },
    });
  

  if (currentYear >= 1900 && currentYear < 1910) {
    percBl.addLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (currentYear >= 1910 && currentYear < 1920) {
    percBl.addLayer(poc1910);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (currentYear >= 1920 && currentYear < 1930) {
    percBl.addLayer(poc1920);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (currentYear >= 1930 && currentYear < 1940) {
    percBl.addLayer(poc1930);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1940);
  } else if (currentYear >= 1940 && currentYear < 1951) {
    percBl.addLayer(poc1940);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
  } else {
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  };
  

  const restrictivePs = topojson.feature(restrictive[0], restrictive[0].objects.stl_covs_topo);

  const restrictiveParcels = L.geoJson(restrictivePs, {
    // style the layer
    style: function(feature) {

      return {
        stroke: 0.25,
        color: getColorRestrictive(feature.properties.cv),
        strokeOpacity: 1,
        weight: 0.25,
        fillColor: getColorRestrictive(feature.properties.cv),
        fillOpacity: 0.5,
        pane: 'myPane2'
      };
    },

    // for each feature...
    onEachFeature: function(feature, layer) {


      // isolate the year of the feature
      if (layer.feature.properties.day == null) {
        var date = '00000';
      } else {
        var date = layer.feature.properties.day;
      }
      let year = parseInt(date.substring(0,4));

      // isolate the type of restrictive covenant
      let type = layer.feature.properties.cv;

      if (type == 'par') {
        var restr = 'Parcel';
      } else if (type == 'pet') {
        var restr = 'Petition';
      } else if (type == 'priv') {
        var restr = 'Private Street';
      } else if (type == 'privR') {
        var restr = 'Private Street With Restrictions';
      } else if (type == 'sub') {
        var restr = 'Subdivision';
      } else {
        var restr = 'Other';
      };
      

      // bind a popup window
      layer.bindPopup("<h2 style='font-size:14px'><b>" + layer.feature.properties.ad + "</b></h2><span class='br'></span><h3 style='font-size:12px'>City Block: " + layer.feature.properties.blk + "<br>Legal: " + layer.feature.properties.sub +
        /*"<br>Covenant Type: " + restr + */"<br>Record Number: " + layer.feature.properties.rec + "<br>Date of Restriction: " + layer.feature.properties.day + "</h3>", {
          pane: 'myPane3'
      });

      // change layer style on mouseover
      layer.on("mouseover", function(e) {
        layer.setStyle({
          stroke: 0.25,
          color: getColorRestrictive(feature.properties.cv),
          strokeOpacity: 1,
          weight: 0.25,
          fillColor: getColorRestrictive(feature.properties.cv),
          fillOpacity: 0.25,
        }).bringToFront();
        layer.openPopup();
      });
      // reset style on mouseout
      layer.on("mouseout", function(e) {
        restrictiveParcels.resetStyle(e.target);
        layer.closePopup();
      });

      // if the covenant is a parcel
      if (type == 'par') {
        console.log(year,+currentYear, year <=+currentYear)
        if (year <= +currentYear && year != '0000') {
          parcel.addLayer(layer); // add the layer to the layer group
        } else {
          parcel.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          parcelND.addLayer(layer);
        };
      };

      // if the covenant is a petition
      if (type == 'pet') {
        if (year <= +currentYear && year != '0000') {
          petition.addLayer(layer); // add the layer to the layer group
        } else {
          petition.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          petitionND.addLayer(layer);
        };
      };

      // if the covenant is a private street
      if (type == 'priv') {
        if (year <= +currentYear && year != '0000') {
          priv.addLayer(layer); // add the layer to the layer group
        } else {
          priv.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          privRND.addLayer(layer);
        };
      };

      // if the covenant is a private street with restrictions
      if (type == 'privR') {
        if (year <= +currentYear && year != '0000') {
          privR.addLayer(layer); // add the layer to the layer group
        } else {
          privR.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          privRND.addLayer(layer);
        };
      };

      // if the covenant is a subdivision
      if (type == 'sub') {
        if (year <= +currentYear && year != '0000') {
          subdivision.addLayer(layer); // add the layer to the layer group
        } else {
          subdivision.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          subdivisionND.addLayer(layer);
        };
      };
/*
      // if the covenant type is null
      if (type == null) {
        if (year <= currentYear && year != '0000') {
          other.addLayer(layer); // add the layer to the layer group
        } else {
          other.removeLayer(layer); // remove the layer from the layer group;
        };
        if (year == '0000') {
          otherND.addLayer(layer);
        };
      };
*/
    }
  });
  
  // call functions defined below
  sequenceUI(poc1900, poc1910, poc1920, poc1930, poc1940, restrictiveParcels, currentYear);
  createTemporalLegend(currentYear);
});


// add a UI slider
function sequenceUI(poc1900, poc1910, poc1920, poc1930, poc1940, restrictiveParcels, currentYear) {

  // create Leaflet control for the slider
  const sliderControl = L.control({
    position: 'bottomleft',
    follow: true
  });
  

  // add controls to the slider
  sliderControl.onAdd = function(map) {

    const controls = L.DomUtil.get("slider");

    L.DomEvent.disableScrollPropagation(controls);
    L.DomEvent.disableClickPropagation(controls);

    return controls;

  }

  // add the control to the map
  sliderControl.addTo(map);

  // use the jQuery ajax method to get the slider element
  $('.slider')
    .on('input change', function() { // when the input changes...
      $(".temporal-legend").html("<h6><span class='year-label span'>Year: " + this.value + "</span></h6>");
      let currentYear = $(this).val(); // identify the year selected with "currentYear"
      updateParcels(poc1900, poc1910, poc1920, poc1930, poc1940, restrictiveParcels, currentYear);
    });

}; // end sequenceUI function

// add a temporal legend in sync with the UI slider
function createTemporalLegend(currentYear) {

  const temporalLegend = L.control({
    position: 'bottomleft' // place the temporal legend at bottom left corner
  });

  temporalLegend.onAdd = function(map) {
    var output = L.DomUtil.create("div", "temporal-legend");
    $(output).html("<h6><span class='year-label span'>Year: " + currentYear + "</span></h6>"); // set grade value to the year selected on map load
    return output;
  }

  temporalLegend.addTo(map);

}; // end createTemporalLegend function

// add a function to update the restrictive covenants by selected year
function updateParcels(poc1900, poc1910, poc1920, poc1930, poc1940, restrictiveParcels, currentYear) {

  if (+currentYear >= 1900 && +currentYear < 1910) {
    percBl.addLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (+currentYear >= 1910 && +currentYear < 1920) {
    percBl.addLayer(poc1910);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (+currentYear >= 1920 && +currentYear < 1930) {
    percBl.addLayer(poc1920);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  } else if (+currentYear >= 1930 && +currentYear < 1940) {
    percBl.addLayer(poc1930);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1940);
  } else if (+currentYear >= 1940 && +currentYear < 1951) {
    percBl.addLayer(poc1940);
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
  } else {
    percBl.removeLayer(poc1900);
    percBl.removeLayer(poc1910);
    percBl.removeLayer(poc1920);
    percBl.removeLayer(poc1930);
    percBl.removeLayer(poc1940);
  };

  // access each layer in the covenants data
  restrictiveParcels.eachLayer(function(layer) {

    // isolate the year of the feature
    if (layer.feature.properties.day == null) {
      var date = '00000';
    } else {
      var date = layer.feature.properties.day;
    }
    let year = parseInt(date.substring(0,4));

    // isolate the type of restrictive covenant
    let type = layer.feature.properties.cv;

    // if the covenant is a parcel
    if (type == 'par') {
      if (year <= +currentYear && year != '0000') {
        parcel.addLayer(layer); // add the layer to the layer group
      } else {
        parcel.removeLayer(layer); // remove the layer from the layer group;
      };
    };

    // if the covenant is a petition
    if (type == 'pet') {
      if (year <= +currentYear && year != '0000') {
        petition.addLayer(layer); // add the layer to the layer group
      } else {
        petition.removeLayer(layer); // remove the layer from the layer group;
      };
    };

    // if the covenant is a private street
    if (type == 'priv') {
      if (year <= +currentYear && year != '0000') {
        priv.addLayer(layer); // add the layer to the layer group
      } else {
        priv.removeLayer(layer); // remove the layer from the layer group;
      };
    };

    // if the covenant is a private street with restrictions
    if (type == 'privR') {
      if (year <= +currentYear && year != '0000') {
        privR.addLayer(layer); // add the layer to the layer group
      } else {
        privR.removeLayer(layer); // remove the layer from the layer group;
      };
    };

    // if the covenant is a subdivision
    if (type == 'sub') {
      if (year <= +currentYear && year != '0000') {
        subdivision.addLayer(layer); // add the layer to the layer group
      } else {
        subdivision.removeLayer(layer); // remove the layer from the layer group;
      };
    };
/*
    // if the covenant type is null
    if (type == null) {
      if (year <= currentYear && year != '0000') {
        other.addLayer(layer); // add the layer to the layer group
      } else {
        other.removeLayer(layer); // remove the layer from the layer group;
      };
    };
*/
  });

};

//   var map = new L.map('map', {
//     scrollWheelZoom: false,
//     attribution: ''
//   }).setView(bounds.getCenter(), 11).setMaxBounds(bounds);

//   var tiles = L.tileLayer(
//     "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//       attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
//       tileSize: 512,
//       maxZoom: 18,
//       zoomOffset: -1,
//       id: map_styles.dark,
//       accessToken: "pk.eyJ1Ijoic3RscHIiLCJhIjoicHNFVGhjUSJ9.WZtzslO6NLYL8Is7S-fdxg",
//     }
//   ).addTo(map);

//   var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//     g = svg.append("g").attr("class", "leaflet-zoom-hide");


//   d3.json("data.topojson").then(function(data) {
//     var regions = topojson.feature(data, data.objects.collection);
//     var geojson;

//     function getColor(d) {

//       //example logic to get color based on number
//       return d < 15 ? '#F4ECF7' :
//           d < 20 ? '#D2B4DE' :
//           d < 25 ? '#BB8FCE' :
//           d < 30 ? '#8E44AD':
//           d < 35 ? '#5B2C6F' :
//           '#0f0712';
            
//           }
        
//         function style(feature) {
//             return {
//               // update property
//                   fillColor: getColor(feature.properties.response_score),
//                   weight: 1,
//                   opacity: 1,
//                   color: '#fff',
//                   fillOpacity: 0.7
//               };
//           }
        
//         //set up highlighting function
        
//         function highlightFeature(e) {
//             var layer = e.target;

//             layer.setStyle({
//                 weight: 5,
//                 color: '#666',
//                 dashArray: '',
//                 fillOpacity: 0.7
//             });
          
//           info.update(layer.feature.properties);

//             if (!L.Browser.ie && !L.Browser.opera) {
//                 layer.bringToFront();
//             }
//         }
        
//        //  function resetHighlight(e) {
//        //      geojson.resetStyle(e.target);
//        // 	 info.update();
//        //  }
        
//                //  function clickHighlight(e) {
//                //      geojson.eachLayer( function (layer) {
//                //          geojson.resetStyle(layer);
//                //      });
//                //      highlightFeature(e)
//                //  }

//         function onEachFeature(feature, layer) {
//            //  layer.on({
//                    //     //  mouseover: highlightFeature,
//                    //     //  mouseout: resetHighlight,
//                    //     //  click: clickHighlight
//            //  });
//         }
        
//         geojson = L.geoJson(regions, {
//           style: style,
//           onEachFeature: onEachFeature
//         }).addTo(map);
        
//         // add infobox
        
//         var info = L.control();

//         info.onAdd = function (map) {
//             this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
//             this.update();
//             return this._div;
//         };

//         // method that we will use to update the control based on feature properties passed
// // 				 info.update = function (props) {
// // 				     this._div.innerHTML = '<h4>Low Response Ratings</h4>Hover over a census tract.<br><br>' 
          
// // 					 // example ternary logic for infobox
// // 					 // +  (
// // // 						 props ?
// // // 						 props.STATUS == 'new' ?
// // // 						 "<strong>" + props.MUNICIPALI + '</strong> was added to the suit.'
// // // 						 : props.STATUS == 'old' ?
// // // 						 "<strong>" + props.MUNICIPALI + '</strong> is another municipality named in the suit.'
// // // 						 : "<strong>" + props.MUNICIPALI + '</strong> has been dropped from the suit.'
// // // 						 : 'Hover over a county');
// // 				 };

// // 				 info.addTo(map);
        
//         // add legend
        
//         var legend = L.control({position: 'bottomright'});

//         legend.onAdd = function (map) {

//           var div = L.DomUtil.create('div', 'info legend')
                    
//           // Legend with strings
//           // div.innerHTML = '<i style="background:' + colors.red + '"></i> Added to the suit<br /><i style="background:' + colors.maroon + '"></i> Also named in the suit<br /><i style="background:' + colors.green + '"></i> Dropped from the suit<br />';
          
//           // Legend with numbers
//           title = ['<h4>Legend</h4>']
//           grades = [0, 15, 20, 25, 30, 35],
//           text = ['< 15%','15-19%','20-24%','25-29%','30-35%', '>35%']
//           labels = [];
//           for (var i = 0; i < grades.length; i++) {
//               from = grades[i];
//              to = grades[i + 1];
//              labels.push(
//                '<i style="background:' + getColor(grades[i] + .001) + '"></i> ' +
//                text[i] );
//            }
//            div.innerHTML = title + labels.join('<br>');
          

//             return div;
//         };

//         legend.addTo(map);
        
//         })


};

//first render
render();


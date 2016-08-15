// hide sidebar onload
/*$(function(){
    $("#sidebar").hide();
});
*/
var map, featureLayers = [], featureLayersName = [];

//Site specific variables...
//these probably should be abstrated out into an optional local config file and/or local values pulled in from the getcapabilities request

//Native projection from GeoServer WFS
var src = new Proj4js.Proj('EPSG:3857');
var dst = new Proj4js.Proj('EPSG:3857')
//var dst = new Proj4js.Proj('EPSG:28355');

//Attribution, get from WMS?
//var layerAttribution = 'Data &copy <a href=http://www.geo-nred.nu.ac.th/webmap/isnre2_mb/isnre2_bs//>MAP@NU</a>, <a href="http://www.geo-nred.nu.ac.th/webmap/isnre2_mb/isnre2_bs/">CC-BY</a>';

//Define base layers
/* var LISTTopographic = new L.tileLayer("https://services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Topographic/ImageServer/tile/{z}/{y}/{x}", {
    attribution: "Basemap &copy The LIST",
    maxZoom: 20,
    maxNativeZoom: 19
});*/

var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
// add bing
//var imagerySet = "AerialWithLabels"; //Aerial AerialWithLabels | Birdseye | BirdseyeWithLabels | Road
var bingSet = new L.BingLayer("LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc", {type: "AerialWithLabels"});

//var imageryRoad = "Road"; //Aerial AerialWithLabels | Birdseye | BirdseyeWithLabels | Road
var bingRoad = new L.BingLayer("LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc", {type: "Road"});

// esri
//ESRI layers
//"Streets", "Topographic", "Oceans", "OceansLabels", "NationalGeographic", "Gray", "GrayLabels", "DarkGray", "DarkGrayLabels", "Imagery", "ImageryLabels", "ImageryTransportation", "ShadedRelief", "ShadedReliefLabels", "Terrain" or "TerrainLabels"

var ESRIStreets = new L.esri.basemapLayer("Streets", {
    attribution: "ESRI Streets",
    //maxZoom: 20,
    //maxNativeZoom: 18
});

var ESRITopographic = new L.esri.basemapLayer("Topographic", {
    attribution: "ESRI Topographic",
    //maxZoom: 20,
    //maxNativeZoom: 18
});

var ImageryLabels = new L.esri.basemapLayer("ImageryLabels", {
    attribution: "ESRI ImageryLabels",
    //maxZoom: 20,
    //maxNativeZoom: 18
});

var World_Navigation_Charts = new L.esri.tiledMapLayer({
    url: "//services.arcgisonline.com/ArcGIS/rest/services/Specialty/World_Navigation_Charts/MapServer",
    detectRetina: false,
    minZoom: 3,
    maxZoom: 10
});

//rtsd
var topo = new L.esri.imageMapLayer({
      url: '//gissvr.rtsd.mi.th/arcgis/rest/services/L7018/L7018/ImageServer'
});

// add google map
var gterrain = new L.Google('TERRAIN');
var ghybrid = new L.Google('HYBRID');
var groad = new L.Google('ROAD');

var baseLayers = {
  "Aerial maps": bingSet,
  "Road maps": bingRoad,
  //"Google Hybrid Map": ghybrid,
  //"Google Terrain Map": gterrain,
  //"Google Street Map": groad,
  //"World Navigation Charts": World_Navigation_Charts,
  //"ESRIImagery Labels": ImageryLabels,
  //"ESRI Topographic": ESRITopographic,
  //"ESRI Streets": ESRIStreets,
  //"แผนที่ภูมิประเทศ 1:50000": topo,

//  "OSM topography": LISTTopographic,
//  "OSM satellite": mapquestOAM,
//  "OSM hybrid": mapquestHYB,

};

var bkCenter = new L.LatLng(18.148834,103.710285);
var bkZoom = 10;

var kbCenter = new L.LatLng(8.162758,99.005707);
var kbZoom = 10;

var ptCenter = new L.LatLng(7.516296,100.069899);
var ptZoom = 10;

var plCenter = new L.LatLng(16.982697,100.542852);
var plZoom = 9;

var udCenter = new L.LatLng(17.749565,100.516856);
var udZoom = 9;

var kkCenter = new L.LatLng(16.408715,102.578544);
var kkZoom = 9;

var ryCenter = new L.LatLng(12.85408,101.428612);
var ryZoom = 10;

//var startCenter = new L.LatLng(-42.8232,147.2555); //uddit 17.631549, 100.092170 //mg 12.4,102.5 //plk 16.941423, 100.427628
var startCenter = new L.LatLng(17.6214772,100.9595328);
var startZoom = 8;
var searchBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(13.112764, 100.915003),
    new google.maps.LatLng(11.877127, 102.815626));

// xMin,yMin 97.3437,5.61274 : xMax,yMax 105.637,20.4649

//get the url parameters
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
      // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
    return query_string;
} ();

//WMS Base URL
var owsurl = QueryString.owsurl;
var ipnow = 'www2.cgistln.nu.ac.th';
if(!owsurl) {
  owsurl = "http://"+ipnow+"/geoserver/nanrunoff/ows";
}

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr('id')),layerControl);
});

$("#full-extent-btn").click(function() {
  map.setView(startCenter, startZoom);
  return false;
});

$("#full-extent-bk").click(function() {
  map.setView(bkCenter, bkZoom);
  return false;
});

$("#full-extent-kb").click(function() {
  map.setView(kbCenter, kbZoom);
  return false;
});

$("#full-extent-pt").click(function() {
  map.setView(ptCenter, ptZoom);
  return false;
});

$("#full-extent-ry").click(function() {
  map.setView(ryCenter, ryZoom);
  return false;
});

$("#full-extent-pl").click(function() {
  map.setView(plCenter, plZoom);
  return false;
});

$("#full-extent-ud").click(function() {
  map.setView(udCenter, udZoom);
  return false;
});

$("#full-extent-kk").click(function() {
  map.setView(kkCenter, kkZoom);
  return false;
});

$("#legend-btn").click(function() {
  //TODO: add all the currently added layers here, not just one...
  var text = "";
  for (i = 0; i < intLayers.length; i++) {
     //alert(intLayers[i] );
    //text += "<b>" + intLayers[i] + "</b><br><img src=https://maps.gcc.tas.gov.au/geoserver/GCC_cc/ows?service=wms&request=getlegendgraphic&layer=" + intLayers[i] + "&format=image/png><br>";
	text += "<b>" + intLayers[i] + "</b><br><img src="+owsurl+"?service=wms&request=getlegendgraphic&layer=" + intLayers[i] + "&format=image/png><br>";
  }
  $("#legend").html(text);
  $('#legendModal').modal('show');
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

/*
$("#chart-btn").click(function() {
  $("#chartModal").modal("show");
  return false;
})
*/

$("#measure-btn").click(function() {
  //$('#sidebar').toggle();
  measureControl.addTo(map);
  return false;
});


$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
})

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

$('#search-form').submit(function(e) {
    alert("Working....");
});



//this is where I add the layer.
function sidebarClick(id) {
  var layer = featureLayers[id];
  var index = $.inArray(layer, intLayers);//intLayers.indexOf(layer);
  //only add the layer if it's not added already...
  if(index == -1) {
    addLayer(layer);
  }
}

function addLayer(layer) {
  var id = $.inArray(layer, featureLayers);
  if(id === -1) {
    return;
  }
  var newLayer = new L.TileLayer.WMS(owsurl + "?SERVICE=WMS&", {
          layers: layer,
          format: 'image/png',
          transparent: true,
          maxZoom: 20,
          attribution: layerAttribution
  });
  lOverlays[featureLayersName[id]] = newLayer;
  map.addLayer(newLayer);
  map.removeControl(layerControl);
  updateInteractiveLayers(layer);
  layerControl = L.control.layers(baseLayers, lOverlays, {
    collapsed: isCollapsed
  }).addTo(map);
  /* Hide sidebar and go to the map on small screens */

  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

// overlay
/*
var test = new L.TileLayer.WMS("http://ip/geoserver/mg/wms?SERVICE=WMS&", {
          layers: 'mg:mangrove_union_4326',
          format: 'image/png',
          transparent: true,
          maxZoom: 20,
          //attribution: layerAttribution
  });
//GeoServer Layers
var lOverlays = {
	'test': test
};
*/

var nanrf = L.tileLayer.wms("http://www2.cgistln.nu.ac.th/geoserver/ows?", {
    layers: 'nanrunoff:nanrunoff20160815_060502',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: "myattribution"
});

// var tempidw = L.tileLayer.wms("http://www2.cgistln.nu.ac.th/geoserver/ows?", {
//     layers: 'temp:tempidw',
//     format: 'image/png',
//     transparent: true,
//     version: '1.1.0',
//     attribution: "myattribution"
// });

var lOverlays = {
	"ข้อมูลน้ำท่าผิวดิน":	nanrf
	//"อุณหภูมิ": tempidw
};

var intLayers = [];
var intLayersString = "";
function updateInteractiveLayers(layer) {
    var index = $.inArray(layer, intLayers);//intLayers.indexOf(layer);
    if(index > -1) {
        intLayers.splice(index,1);
    } else {
        intLayers.push(layer);
    }
    intLayersString = intLayers.join();
};

function handleJson(data) {
    selectedFeature = L.geoJson(data, {
        style: function (feature) {
            return {color: 'yellow'};
        },
        onEachFeature: function (feature, layer) {
            var content = "";
            content = content + "<b><u>" + feature.id.split('.')[0] + "</b></u><br>";
            delete feature.properties.bbox;
			//for (var name in feature.properties) {content = content + "<b>" + name + ":</b> " + feature.properties[name] + "<br>"};
            for (var name in feature.properties) {
				if(name=='img'){
					content = content + "<b>" + name + ":</b> " + feature.properties[name] + "<br>" + "<img src='http://"+ipnow+"/map/vmobile/uploads/"+feature.properties["img"]+"' height='142' />" + "<br>";
				}else{
					content = content + "<b>" + name + ":</b> " + feature.properties[name] + "<br>";
				//alert(name);
				}

				};
            var popup = L.popup({minWidth:240})
                .setLatLng(queryCoordinates)
                .setContent(content)
                .openOn(map);
            layer.bindPopup(content);
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5,
                fillColor: "yellow",
                color: "#000",
                weight: 5,
                opacity: 0.6,
                fillOpacity: 0.2
            });
        }
    });
    selectedFeature.addTo(map);
}

//Query layer functionality.
var selectedFeature;
var queryCoordinates;

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        fillColor: "yellow",
        color: "yellow",
        weight: 5,
        opacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
        radius: 5,
        fillColor: "yellow",
        color: "yellow",
        weight: 5,
        opacity: 0.6,
        fillOpacity: 0.2
    });
}
// Add map
map = L.map("map", {
  zoom: startZoom,
  center: startCenter,
  layers: [bingRoad],
  zoomControl: false,
  attributionControl: false,
  //measureControl: true
});

//add control
//mouse position
L.control.mousePosition().addTo(map);

//measure
var measureControl = L.control.measure({
	position: 'topleft'
});


//measureControl.addTo(map);

// add point
/*
map.on('click', function(e) {
    alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
});
*/

//Set up trigger functions for adding layers to interactivity.
map.on('overlayadd', function(e) {
    updateInteractiveLayers(e.layer.options.layers);
});
map.on('overlayremove', function(e) {
    updateInteractiveLayers(e.layer.options.layers);
});





map.on('click', function(e) {

    if(intLayers.length === 0) {
      return;
    }
    if (selectedFeature) {
        map.removeLayer(selectedFeature);
    };
    //alert("ggggggggggggggg");
    Proj4js.defs["EPSG:3857"]="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
    var src = new Proj4js.Proj('EPSG:4326');
    var dst = new Proj4js.Proj('EPSG:4326');



    var p = new Proj4js.Point(e.latlng.lat,e.latlng.lng);

    //alert(p);

    Proj4js.transform(src, dst, p);
    queryCoordinates = e.latlng;


    var defaultParameters = {
        service : 'WFS',
        version : '1.1.0',
        request : 'GetFeature',
        typeName : intLayersString,
        maxFeatures : 100,
        outputFormat : 'text/javascript',
        format_options : 'callback:getJson',
        SrsName : 'EPSG:4326'
    };

    //alert( p.x + ' ' + p.y );

    var customParams = {
        cql_filter:'DWithin(geom, POINT(' + p.x + ' ' + p.y + '), 10, meters)'
    };

    var parameters = L.Util.extend(defaultParameters,customParams);

    var url = owsurl + L.Util.getParamString(parameters)
	//prompt("test",url);
    $.ajax({
        url : owsurl + L.Util.getParamString(parameters),
        dataType : 'jsonp',
        jsonpCallback : 'getJson',
        success : handleJson
    });
});

/* Attribution control */
function updateAttribution(e) {
  var attributiontext = "";
  var attributions = []
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      if($.inArray(layer.getAttribution(), attributions) === -1) {
        attributiontext = attributiontext + layer.getAttribution() + '<br>'
        attributions.push(layer.getAttribution())
      }
    }
  });
  $("#attribution").html((attributiontext));
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
/* attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://www.cgistln.nu.ac.th.com'>eileen</a> and <a href='http://agl.pw'>agl</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
}; */
//map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

$.ajax({
    type: "GET",
    url: owsurl + "?SERVICE=WMS&request=getcapabilities",
    dataType: "xml",
    success: parseXml
  });

function parseXml(xml)
{
  var layerIndex = 0
  $(xml).find("Layer").find("Layer").each(function()
  {
    var title = $(this).find("Title").first().text();
    var name = $(this).find("Name").first().text();

    //Check for layer groups
    var patt = new RegExp("Group");
    var res = patt.test(title);
    if(!res) {
    featureLayers.push(name)
      featureLayersName.push(title)
	   $("#feature-list tbody").append('<tr class="feature-row" id="'+layerIndex+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">'+title+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      layerIndex = layerIndex + 1;
    }
  });

//Check for initial layers.
var layersString = QueryString.layers;
if(layersString) {
  var layersList = layersString.split(',')
  for (i = 0; i < layersList.length; i++) {
    addLayer(layersList[i].replace('/',''));
  }
}

//Ok, got to get the searching working...
$(document).ready(function () {
    (function ($) {
        $('#layerfilter').keyup(function () {
            var rex = new RegExp($(this).val(), 'i');
            $('.searchable tr').hide();
            $('.searchable tr').filter(function () {
                return rex.test($(this).text());
            }).show();
        })
    }(jQuery));
});
$("#searchclear").click(function(){
    $("#layerfilter").val('');
    $('.searchable tr').show();
});

var options = {
  bounds: searchBounds
};
var searchinput = document.getElementById("searchbox");
var autocomplete = new google.maps.places.Autocomplete(searchinput, options);
var leafMarker;
google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      input.className = 'notfound';
      return;
    }
    if(leafMarker){
        map.removeLayer(leafMarker);
    }
    var leafLocation = new L.LatLng(place.geometry.location.lat(),place.geometry.location.lng())
    leafMarker = L.marker(leafLocation, {title: place.formatted_address}).bindPopup(place.formatted_address).addTo(map);
	//alert("da");
    map.setView(leafLocation, 18)
});
}

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}
/*
var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters": theaterLayer,
    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums": museumLayer
  },
  "Reference": {
    "Boroughs": boroughs,
    "Subway Lines": subwayLines
  }
};
*/
var layerControl = L.control.layers(baseLayers, lOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});
$("#loading").hide();

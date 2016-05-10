// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );    

    function onDeviceReady() {           
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    
})();

$(document).delegate("#yobikePage", "pageinit", function () {    
    var map; //地圖
    var currentPosition; //取得目前的位置
    var destinationPosition; //設定目的地
    var directionsService;//導航
    var startAddr; //起始點
    var destionAddr; //結束點
    var currentMarker;//取得起點座標   

    function setCurrentLocation(lat, lon) {       
        currentPosition = new google.maps.LatLng(lat, lon);
        map.setCenter(currentPosition);
        currentMarker = new google.maps.Marker({
            position: currentPosition,
            map: map,
            title: '目前位置',
            icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
        });

        //經過經緯度反查住址
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'latLng': currentPosition
        }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {                
                if (results) {
                    startAddr = results[0].formatted_address;
                    var contentString = '目前位置:' + results[0].formatted_address;
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    google.maps.event.addListener(currentMarker, 'click', function () {
                        infowindow.open(map, currentMarker);
                    });
                }
            } else {
                alert("Reverse Geocoding failed because: " + status);
            }
        });
    }

    function success(position) {
        setCurrentLocation(position.coords.latitude, position.coords.longitude);
    };

    function error() {
        alert("取得經緯失敗");
    };

    function setMarket(color, title, myLatlng, map) {
        var strMakerLink = "";
        switch (color) {
            case "red":
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                break;
            case "blue":
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
                break;
            case "yellow":
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
                break;
            case "purple":
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
                break;
            case "green":
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
                break;
            default:
                strMakerLink = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
                break;
        }
        //建立地圖google座標
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: title.title,
            icon: strMakerLink,
        })
        //google座標放進地圖
        marker.setMap(map);
        google.maps.event.addListener(marker, 'click', function () {
            var myLatLng = this.position;
            $("#markerTitle").text(this.title);
            $("#markerLat").text(myLatLng.A);
            $("#markerLong").text(myLatLng.F);
            destinationPosition = myLatLng;
            destionAddr = title.addr;
            $("#markerAddr").text(destionAddr);
            var meters = google.maps.geometry.spherical.computeDistanceBetween(currentMarker.getPosition(), marker.getPosition());
            $("#markerDistance").text(meters);
            $("#markerSbi").text(title.sbi);
            $("#markerBemp").text(title.bemp);
            $("#geolocation_showDialog").click(); //點選座標後，跳出視窗
            return false;
        });
    }

    function setPath(map) {
        directionsService = new google.maps.DirectionsService();
        //規畫路徑呈現選項
        var rendererOptions = {
            suppressMarkers: true,
        };
        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(map);
    }

    function calcRoute(startPoint, endPoint) {
        var request = {
            origin: startPoint,
            destination: endPoint,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    }

     var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
     };

     var mapOptions = {
         zoom: 12,
         center: new google.maps.LatLng(25.051150, 121.566002),
         mapTypeId: google.maps.MapTypeId.ROADMAP
     }


     map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
     setPath(map);
     navigator.geolocation.getCurrentPosition(success, error, options);
     $.getJSON('scripts/youbike.json', function (data) {
         //逐筆加入youbike 站
         var youBikeData = data["retVal"];         
         $.each(youBikeData, function (i, v) {
             $('#youBikes').append('<li><a href="#"><h2>' + v["sna"] + '</h2><p>' + v["ar"] + '</p><span class="ui-li-count">' + v["sbi"] + '</span></a></li>');
             var myLatlng = new google.maps.LatLng(v["lat"], v["lng"]); //youbike經緯度
             var intSbi = parseInt(v["sbi"]);//剩下腳踏車數量
             var color = "";
             if (intSbi == 0) {
                 color = "red";
             }
             else if (intSbi > 0 && intSbi <= 5) {
                 color = "yellow";
             } else {
                 color = "green";
             }
             //可以用JSON格式，將多重值傳遞的方式
             setMarket(color, { "title": v["sna"], "addr": v["ar"], "bemp": v["bemp"], "sbi": v["sbi"] }, myLatlng, map);
         });
     });
  
    $("#btnDestination").click(function () {
        calcRoute(currentPosition, destinationPosition);
    });
});





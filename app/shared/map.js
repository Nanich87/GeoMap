var observableModule = require("data/observable");
var mapbox = require("nativescript-mapbox");
var dialogs = require("ui/dialogs");
var platform = require("platform");
var Toast = require('nativescript-toast');
var moment = require('moment');
var mapService = require('../services/map-service');
var isIOS = platform.device.os === platform.platformNames.ios;

var markerDataCollection = [];
var markerIndexCollection = [];

var userLocationMarkerId = 0;

var center = {
    lat: 42.654195,
    lng: 24.756395
};

function Map(data) {
    data = data || {};

    var viewModel = new observableModule.Observable({
        donwloading: false
    });

    var accessToken = 'pk.eyJ1IjoibmFuaWNoODciLCJhIjoiY2l3YXM1M3BwMDAyZjJ6cDRhNmprYmgzMSJ9.AH2364BQFmNNQgaJkOcLzQ';

    function getNextUserLocationMarkerId() {
        return ++userLocationMarkerId;
    }

    viewModel.show = function () {
        mapbox.show({
            accessToken: accessToken,
            style: mapbox.MapStyle.HYBRID,
            margins: {
                left: 16,
                right: 16,
                top: isIOS ? 300 : 150,
                bottom: isIOS ? 50 : 5
            },
            center: center,
            zoomLevel: 15,
            showUserLocation: true,
            hideAttribution: true,
            hideLogo: true,
            hideCompass: false,
            disableRotation: false,
            disableScroll: false,
            disableZoom: false,
            disableTilt: false,
            markers: markerDataCollection
        }).then(function (result) {
            mapbox.setOnCameraChangeListener(function () {
                mapbox.getCenter()
                    .then(function (result) {
                        JSON.stringify(result);
                    }, function (error) {
                        console.log('Error in function MapViewModel.prototype.doShow() -> mapbox.getCenter(): ' + error);
                    });
            });
        }, function (error) {
            console.log('Error in function MapViewModel.prototype.doShow() -> mapbox.show(): ' + error);
        });
    };

    viewModel.getLocalNetworkPoints = function () {
        return mapbox.getViewport()
            .then(function (viewport) {
                return mapService.getPointData(2, viewport.bounds);
            }, function (error) {
                console.log('Error in function getPoints() -> mapbox.getViewport(): ' + error);
            }).then(function (result) {
                var markers = [];

                result.features.forEach(function (feature) {
                    if (markerIndexCollection.indexOf(feature.attributes.objectid) === -1) {
                        markerIndexCollection.push(feature.attributes.objectid);

                        var marker = {
                            id: feature.attributes.objectid,
                            lat: feature.geometry.y,
                            lng: feature.geometry.x,
                            title: feature.attributes.gnsspointnumber,
                            subtitle: feature.attributes.description,
                            iconPath: 'res/markers/local-network-point.png',
                        };

                        markers.push(marker);
                        markerDataCollection.push(marker);
                    }
                });

                mapbox.addMarkers(markers);

                return markers.length;
            }, function (error) {
                console.log('Error in function getPoints() -> mapService.getPoints(viewport.bounds): ' + error);
            });
    };

    viewModel.getTriangularPoints = function () {
        return mapbox.getViewport()
            .then(function (viewport) {
                return mapService.getPointData(1, viewport.bounds);
            }, function (error) {
                console.log('Error in function getPoints() -> mapbox.getViewport(): ' + error);
            }).then(function (result) {
                var markers = [];

                result.features.forEach(function (feature) {
                    if (markerIndexCollection.indexOf(feature.attributes.objectid) === -1) {
                        markerIndexCollection.push(feature.attributes.objectid);

                        var marker = {
                            id: feature.attributes.objectid,
                            lat: feature.geometry.y,
                            lng: feature.geometry.x,
                            title: feature.attributes.pointnumber,
                            subtitle: feature.attributes.pointdescription,
                            iconPath: 'res/markers/triangular-point.png',
                        };

                        markers.push(marker);
                        markerDataCollection.push(marker);
                    }
                });

                mapbox.addMarkers(markers);

                return markers.length;
            }, function (error) {
                console.log('Error in function getPoints() -> mapService.getPoints(viewport.bounds): ' + error);
            });
    };

    viewModel.removeMarkers = function () {
        markerDataCollection = [];
        markerIndexCollection = [];

        mapbox.removeMarkers();
    }

    viewModel.getMarkers = function () {
        return markerDataCollection;
    }

    viewModel.setCenter = function (position) {
        mapbox.setCenter({
            lat: position.lat,
            lng: position.lng,
            animated: true
        }).then(function (result) {
            center.lat = position.lat;
            center.lng = position.lng;

            var marker = {
                id: getNextUserLocationMarkerId(),
                lat: position.lat,
                lng: position.lng,
                title: 'Your location',
                subtitle: 'Latitude: ' + position.lat + ' Longitude: ' + position.lng,
                iconPath: 'res/markers/location.png',
            };

            mapbox.addMarkers([marker]);

            Toast.makeText('Map location has been updated!', 'long').show();
        }, function (error) {
            dialogs.alert({
                title: 'Error',
                message: 'Cannot set map location: ' + error,
                okButtonText: 'OK'
            });
        });
    }

    viewModel.checkHasFineLocationPermission = function () {
        mapbox.hasFineLocationPermission()
            .then(function (granted) {
                dialogs.alert({
                    title: 'Permission granted?',
                    message: granted ? 'YES' : 'NO',
                    okButtonText: 'OK'
                });
            });
    };

    viewModel.requestFineLocationPermission = function () {
        mapbox.requestFineLocationPermission()
            .then(function () {
                console.log('Fine Location permission requested');
            });
    };

    viewModel.downloadCurrentViewportAsOfflineRegion = function (pageData) {
        if (viewModel.get('downloading') === true) {
            return;
        }

        mapbox.getViewport()
            .then(function (viewport) {
                viewModel.set('downloading', true);

                mapbox.downloadOfflineRegion({
                    name: 'Map-' + moment().format('YYYY-MM-DD-hh-mm-ss'),
                    style: mapbox.MapStyle.HYBRID,
                    minZoom: viewport.zoomLevel,
                    maxZoom: viewport.zoomLevel,
                    bounds: viewport.bounds,
                    onProgress: function (progress) {
                        pageData.set('progress', progress.percentage);
                    }
                }).then(function () {
                    viewModel.set('downloading', false);

                    dialogs.alert({
                        title: 'Download complete',
                        message: 'Downloaded viewport with bounds ' + JSON.stringify(viewport.bounds) + ' at zoom level ' + viewport.zoomLevel,
                        okButtonText: 'OK'
                    });
                }, function (error) {
                    viewModel.set('downloading', false);

                    dialogs.alert({
                        title: 'Error',
                        message: error,
                        okButtonText: 'OK'
                    });
                });
            }, function (error) {
                dialogs.alert({
                    title: 'Error',
                    message: error,
                    okButtonText: 'OK'
                });
            });
    };

    return viewModel;
}

module.exports = Map;
var frameModule = require('ui/frame');
var dialogs = require('ui/dialogs');
var geolocation = require('nativescript-geolocation');
var orientationModule = require("nativescript-screen-orientation");
var Observable = require('data/observable').Observable;
var Accuracy = require('ui/enums');
var Toast = require('nativescript-toast');

var Map = require('../../shared/map');
var mainMap = new Map();

var page;
var pageData = new Observable();
pageData.set('downloading', false);

function loaded() {
    orientationModule.setCurrentOrientation("portrait", function () {

    });
}

function onNavigatingFrom() {
    orientationModule.orientationCleanup();
}

function navigatedTo(args) {
    page = args.object;
    page.bindingContext = pageData;

    mainMap.show();
}

function getTriangularPoints() {
    pageData.set('busy', true);

    mainMap.getTriangularPoints()
        .then(function (markersCount) {
            pageData.set('busy', false);

            Toast.makeText('Triangular points added: ' + markersCount, 'long').show();
        }, function (error) {
            pageData.set('busy', false);

            dialogs.alert({
                title: 'Error',
                message: error.message,
                okButtonText: 'OK'
            });
        });
}

function getLocalNetworkPoints() {
    pageData.set('busy', true);

    mainMap.getLocalNetworkPoints()
        .then(function (markersCount) {
            pageData.set('busy', false);

            Toast.makeText('Local points added: ' + markersCount, 'long').show();
        }, function (error) {
            pageData.set('busy', false);

            dialogs.alert({
                title: 'Error',
                message: error.message,
                okButtonText: 'OK'
            });
        });
}

function getLocation() {
    pageData.set('busy', true);

    var location = geolocation.getCurrentLocation({
        desiredAccuracy: Accuracy.high,
        updateDistance: 0.1,
        maximumAge: 5000,
        timeout: 20000
    }).then(function (position) {
        if (position) {
            mainMap.setCenter({
                lat: position.latitude,
                lng: position.longitude
            });

            pageData.set('busy', false);
        }
    }, function (error) {
        pageData.set('busy', false);

        dialogs.alert({
            title: 'Error',
            message: error.message,
            okButtonText: 'OK'
        });
    });
}

function search() {
    var navigationEntry = {
        moduleName: 'views/search/search',
        context: {}
    };

    frameModule.topmost().navigate(navigationEntry);
}

function upload() {
    var navigationEntry = {
        moduleName: 'views/upload/upload',
        context: {}
    };

    frameModule.topmost().navigate(navigationEntry);
}

function save() {
    var navigationEntry = {
        moduleName: 'views/save/save',
        context: {
            markers: mainMap.getMarkers()
        }
    };

    frameModule.topmost().navigate(navigationEntry);
}

function removeMarkers() {
    dialogs.confirm({
        title: 'Confirm',
        message: 'Are you sure you want to remove all markers from the map?',
        okButtonText: 'YES',
        cancelButtonText: 'NO'
    }).then(function (dialogResult) {
        if (dialogResult) {
            mainMap.removeMarkers();

            Toast.makeText('All markers have been successfully removed from the map!', 'long').show();
        }
    });
}

function download() {
    if (mainMap.get('downloading') === true) {
        Toast.makeText('Please wait until the current viewport is finished downloading!', 'long').show();

        return;
    }

    pageData.set('downloading', true);

    mainMap.downloadCurrentViewportAsOfflineRegion(pageData);
}

exports.navigatedTo = navigatedTo;
exports.loaded = loaded;
exports.onNavigatingFrom = onNavigatingFrom;
exports.search = search;
exports.upload = upload;
exports.save = save;
exports.download = download;
exports.removeMarkers = removeMarkers;
exports.getLocation = getLocation;
exports.getTriangularPoints = getTriangularPoints;
exports.getLocalNetworkPoints = getLocalNetworkPoints;
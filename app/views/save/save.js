var frameModule = require('ui/frame');
var dialogs = require('ui/dialogs');
var gestures = require('ui/gestures');
var fs = require("file-system");
var Observable = require('data/observable').Observable;
var Toast = require('nativescript-toast');
var moment = require('moment');

var markers = [];

var pageData = new Observable();
var page;

function navigatedTo(args) {
    page = args.object;

    markers = page.navigationContext.markers;

    page.bindingContext = pageData;
}

function loadFile() {
    var navigationEntry = {
        moduleName: 'views/upload/upload',
        context: {}
    };

    frameModule.topmost().navigate(navigationEntry);
}

function saveFile() {
    if (markers.length === 0) {
        Toast.makeText('There are no markers to save!', 'long').show();

        return;
    }

    var fileExtension = '.json';

    var inputFileName = page.getViewById('filename').text;
    var outputFileName = inputFileName.length === 0 ? moment().format('YYYY-MM-DD hh-mm-ss') + fileExtension : inputFileName + fileExtension;

    var documents = fs.knownFolders.documents();

    var file = documents.getFile(outputFileName);

    file.writeText(JSON.stringify(markers))
        .then(function () {
            Toast.makeText('File ' + outputFileName + ' was successfully saved!', 'long').show();
        }, function (error) {
            dialogs.alert({
                title: 'Error',
                message: error.message,
                okButtonText: 'OK'
            });
        });
}

function back() {
    navigateToMap();
}

function swipe(args) {
    if (args.direction === 1) { // swipe from left to right
        navigateToMap();
    }
}

function navigateToMap() {
    var navigationEntry = {
        moduleName: 'views/map/map',
        context: {}
    };

    frameModule.topmost().navigate(navigationEntry);
}

exports.navigatedTo = navigatedTo;
exports.loadFile = loadFile;
exports.saveFile = saveFile;
exports.back = back;
exports.swipe = swipe;
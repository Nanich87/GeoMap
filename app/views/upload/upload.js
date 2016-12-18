var frameModule = require('ui/frame');
var dialogs = require('ui/dialogs');
var gestures = require('ui/gestures');
var fs = require("file-system");
var Observable = require('data/observable').Observable;
var _ = require('lodash');

var documents = fs.knownFolders.documents();

var entitiesCollection = [];
var markers = [];

var pageData = new Observable();
pageData.set('entitiesCollection', entitiesCollection);
pageData.set('directory', documents.path);

function navigatedTo(args) {
    var page = args.object;
    page.bindingContext = pageData;
}

function listFiles() {
    documents.getEntities()
        .then(function(entities) {
            entitiesCollection = [];

            entities.forEach(function(entity) {
                var path = fs.path.join(documents.path, entity.name);
                var file = documents.getFile(path);

                entitiesCollection.push({
                    name: entity.name,
                    isFolder: file.extension.indexOf('/') === -1 ? false : true
                });
            });

            entitiesCollection = _.sortBy(entitiesCollection, ['isFolder', 'name'])
                .reverse();

            pageData.set('entitiesCollection', entitiesCollection);
        }, function(error) {
            console.log(error.message);
        });
}

function readFile(args) {
    dialogs.confirm({
        title: 'Confirm',
        message: 'Do you really want to load markers from file ' + entitiesCollection[args.index].name + '?',
        okButtonText: 'YES',
        cancelButtonText: 'NO'
    }).then(function(dialogResult) {
        if (dialogResult && !entitiesCollection[args.index].isFolder) {
            var file = documents.getFile(entitiesCollection[args.index].name);
            file.readText()
                .then(function(content) {
                    markers = JSON.parse(content);
                }, function(error) {
                    console.log(error.message);
                });

        }
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
        context: {
            markers: markers
        }
    };

    frameModule.topmost().navigate(navigationEntry);
}

exports.navigatedTo = navigatedTo;
exports.listFiles = listFiles;
exports.readFile = readFile;
exports.back = back;
exports.swipe = swipe;
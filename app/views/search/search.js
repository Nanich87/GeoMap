var frameModule = require('ui/frame');
var viewModule = require('ui/core/view');
var ImageModule = require('ui/image');
var gestures = require('ui/gestures');
var Observable = require('data/observable').Observable;
var Toast = require('nativescript-toast');
var mapService = require('../../services/map-service');

var pointCollection = [];

var currentPage = 0;
var totalPages = 0;

var itemsPerPage = 10;
var itemsCount = 0;

var page;
var pageData = new Observable();
pageData.set('busy', false);
pageData.set('pointCollection', pointCollection);
pageData.set('pointsCount', itemsCount);
pageData.set('currentPage', currentPage);
pageData.set('totalPages', totalPages);

function getData() {
    pageData.set('busy', true);

    var keyword = page.getViewById('keyword').text.toLowerCase();

    pointCollection = [];
    currentPage = 0;
    totalPages = 0;
    itemsCount = 0;

    mapService.search(keyword, 1)
        .then(function(result) {
            result.features.forEach(function(feature) {
                pointCollection.push({
                    name: feature.attributes.pointnumber,
                    description: feature.attributes.pointdescription
                });
            });

            itemsCount = pointCollection.length;

            var offset = currentPage * itemsPerPage;
            var pointList = getList(offset, itemsPerPage);

            pageData.set('pointCollection', pointList);
            pageData.set('pointsCount', itemsCount);
            pageData.set('currentPage', getCurrentPage());
            pageData.set('totalPages', getTotalPages(itemsCount, itemsPerPage));
            pageData.set('busy', false);
        }, function(error) {
            dialogs.alert({
                title: 'Error',
                message: error.message,
                okButtonText: 'OK'
            });
        });

    var listView = page.getViewById('point-collection');
    listView.animate({
        opacity: 1,
        duration: 1000
    });
}

function getTotalPages(itemsCount, itemsPerPage) {
    return itemsPerPage === 0 ? 0 : Math.ceil(itemsCount / itemsPerPage);
}

function getCurrentPage() {
    return itemsCount === 0 ? 0 : currentPage + 1;
}

function getList(offset, limit) {
    return pointCollection.slice(offset, offset + limit);
}

function navigateToMap() {
    page.getViewById('keyword').dismissSoftInput();

    var navigationEntry = {
        moduleName: 'views/map/map',
        context: {
            markers: pointCollection
        }
    };

    frameModule.topmost().navigate(navigationEntry);
}

function navigatedTo(args) {
    page = args.object;
    page.bindingContext = pageData;
}

function back() {
    navigateToMap();
}

function swipe(args) {
    if (args.direction === 1) { // swipe from left to right
        navigateToMap();
    }
}

function search(args) {
    page.getViewById('keyword').dismissSoftInput();

    getData();
}

function viewDetails(args) {
    var navigationEntry = {
        moduleName: 'views/view-details/view-details',
        context: {

        },
        animated: true
    };

    frameModule.topmost().navigate(navigationEntry);
}

function previousPage() {
    if (currentPage === 0) {
        return;
    }

    currentPage--;

    pageData.set('busy', true);

    var offset = currentPage * itemsPerPage;
    var pointList = getList(offset, itemsPerPage);

    pageData.set('pointCollection', pointList);
    pageData.set('currentPage', getCurrentPage());
    pageData.set('busy', false);
}

function nextPage() {
    if ((currentPage + 1) * itemsPerPage >= itemsCount) {
        return;
    }

    currentPage++;

    pageData.set('busy', true);

    var offset = currentPage * itemsPerPage;
    var pointList = getList(offset, itemsPerPage);

    pageData.set('pointCollection', pointList);
    pageData.set('currentPage', getCurrentPage());
    pageData.set('busy', false);
}

exports.navigatedTo = navigatedTo;
exports.back = back;
exports.swipe = swipe;
exports.viewDetails = viewDetails;
exports.search = search;
exports.previousPage = previousPage;
exports.nextPage = nextPage;

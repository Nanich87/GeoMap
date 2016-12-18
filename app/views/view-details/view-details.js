var frameModule = require('ui/frame');
var dialogs = require('ui/dialogs');
var gestures = require('ui/gestures');
var Observable = require('data/observable').Observable;

var pageData = new Observable();

function navigatedTo(args) {
    var page = args.object;
    page.bindingContext = pageData;
}

function back() {
    navigateToSearch();
}

function swipe(args) {
    if (args.direction === 1) { // swipe from left to right
        navigateToSearch();
    }
}

function navigateToSearch() {
    var navigationEntry = {
        moduleName: 'views/search/search'
    };

    frameModule.topmost().navigate(navigationEntry);
}

exports.navigatedTo = navigatedTo;
exports.back = back;
exports.swipe = swipe;
var mapServerUrl = 'http://gkf.cadastre.bg/arcgis/rest/services/GKF_PublicData/MapServer';

function getPointData(layer, bounds) {
    var requestUrl = mapServerUrl + '/' + layer + '/query?returnGeometry=true&geometryType=esriGeometryEnvelope&geometry={"xmin":' + bounds.west + ',"ymin":' + bounds.south + ',"xmax":' + bounds.east + ',"ymax":' + bounds.north + ',"spatialReference":{"wkid":4326}}&outSR=4326&inSR=4326&spatialRel=esriSpatialRelIntersects&where=1=1&outFields=*&returnZ=true&f=json';

    return fetch(requestUrl, {
        method: 'get'
    }).then(response => {
        return response.json();
    });
}

function search(keyword, layerId) {
    var requestUrl = mapServerUrl + '/' + layerId + '/query?returnGeometry=true&geometryType=esriGeometryEnvelope&outSR=4326&inSR=4326&where=pointnumber%20like%20%27%25' + keyword + '%25%27&outFields=*&returnZ=true&f=json';

    return fetch(requestUrl, {
        method: 'get'
    }).then(response => {
        return response.json();
    });
}

exports.getPointData = getPointData;
exports.search = search;
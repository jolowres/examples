var _ = require('lodash'),
    ElectronicDocument = require('malstrom-models/lib/electronic-document.model');

module.exports = angular.module('aah-electronic-documents-service-module', [

    require('../../constants/electronic-documents/electronic-documents-urls.constants').name

]).service('aahElectronicDocumentsService', [
    '$http',
    'aahElectronicDocumentUrls',

    function($http ,
             URLs) {

        var svc = this,
            _electronicDocuments = [];

        _.extend(svc, {
            electronicDocuments: function electronicDocumentsAccessor(){
                return _electronicDocuments;
            },
            listByTaskId: function listByTaskId(taskId) {
                var url = URLs.LIST_BY_TASK_ID.replace(':id', taskId);
                _electronicDocuments = [];
                return $http.get(url).then(function (response) {
                    _.forEach(response.data, function(raw) {
                        _electronicDocuments.push(new ElectronicDocument(raw));
                    });
                });
            },
            getDocument: function getDocument(documentId) {
                var url = URLs.GET_DOCUMENT.replace(':id', documentId);
                return $http.get(url).then(function (response) {
                   return response.data;
                });
            }
        });

    }]);

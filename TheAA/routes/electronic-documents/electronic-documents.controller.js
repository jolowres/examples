var _=require('lodash');

module.exports = angular.module('aah-electronic-documents-controller-module',[
    require('../../services/electronic-documents/electronic-documents.service').name
]).controller('aahElectronicDocumentsController', [
    'aahElectronicDocumentsService',
    function ElectronicDocumentsController(ElectronicDocumentsService) {
        var ctrl = this,
            _documentHtml;

        _.extend(ctrl, {
            electronicDocuments: function electronicDocumentsAccessor() {
                return ElectronicDocumentsService.electronicDocuments();
            },
            getDocument: function getDocument(documentId) {
                ElectronicDocumentsService.getDocument(documentId).then(function getDocumentSuccess(documentHtml) {
                    _documentHtml = documentHtml;
                });
            },
            documentHtml: function documentHtmlAccessor() {
                return _documentHtml;
            }
        });
    }
]);
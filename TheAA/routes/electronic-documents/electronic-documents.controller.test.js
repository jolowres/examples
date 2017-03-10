describe('test the electronic-documents controller', function() {

    var ctrl,
        q,
        rootScope,
        mockElectronicDocumentsService;

    beforeEach(function () {
        angular.mock.module(require('./electronic-documents.controller').name);
    });

    beforeEach(angular.mock.inject(function (aahElectronicDocumentsService) {
        mockElectronicDocumentsService = aahElectronicDocumentsService;
        spyOn(mockElectronicDocumentsService, 'electronicDocuments');
        spyOn(mockElectronicDocumentsService, 'getDocument');
    }));

    beforeEach(angular.mock.inject(function ($q) {
        q = $q;
    }));

    beforeEach(angular.mock.inject(function ($rootScope) {
        rootScope = $rootScope;
    }));

    beforeEach(angular.mock.inject(function ($controller) {
        ctrl = $controller('aahElectronicDocumentsController');
    }));

    it('should call the electronic documents on the service when ctrl.electronicDocuments is called', function() {
        ctrl.electronicDocuments();
        expect(mockElectronicDocumentsService.electronicDocuments).toHaveBeenCalled();
    });

    it('should call the electronic documents service to get the document when getDocument is called', function (){
        var deferred = q.defer();
        mockElectronicDocumentsService.getDocument.and.returnValue(deferred.promise);
        ctrl.getDocument();
        expect(mockElectronicDocumentsService.getDocument).toHaveBeenCalled();
    });

    it('should return the data from getDocuments through the accessor one the promise resolves', function() {
        var deferred = q.defer(),
            testVal = 'test';
        mockElectronicDocumentsService.getDocument.and.returnValue(deferred.promise);
        ctrl.getDocument();
        deferred.resolve(testVal);
        rootScope.$apply();
        expect(ctrl.documentHtml()).toEqual(testVal);
    });



});
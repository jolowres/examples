describe('test the electronic documents service', function() {

    var svc,
        http,
        urls;

    beforeEach(function () {
        angular.mock.module(require('./electronic-documents.service').name);
    });

    beforeEach(angular.mock.inject(function($httpBackend) {
        http = $httpBackend;
    }));

    beforeEach(angular.mock.inject(function(aahElectronicDocumentUrls) {
        urls = aahElectronicDocumentUrls;
    }));

    beforeEach(angular.mock.inject(function (aahElectronicDocumentsService) {
       svc =  aahElectronicDocumentsService;
    }));

    it('should expect 1 to equal 1', function() {
        expect(1).toEqual(1);
    });

    it('should call the http url when the listByTaskId method is called', function(){
    var taskId = 99999,
        url = urls.LIST_BY_TASK_ID.replace(':id', taskId);
        http.expectGET(url).respond({});
        svc.listByTaskId(taskId);
        http.flush();
    });

    it('should return electronic documents through the accessor when the http request resolves', function(){
        var taskId = 99999,
            url = urls.LIST_BY_TASK_ID.replace(':id', taskId);
        http.whenGET(url).respond([
            {documentId: '1'},
            {documentId: '2'}
        ]);
        svc.listByTaskId(taskId);
        http.flush();
        expect(svc.electronicDocuments().length).toBe(2);
    });


    it('should return a fresh set of electronic documents through the accessor after each call', function(){
        var taskId = 99999,
            url = urls.LIST_BY_TASK_ID.replace(':id', taskId);
        http.whenGET(url).respond([
            {documentId: '1'},
            {documentId: '2'}
        ]);
        svc.listByTaskId(taskId);
        http.flush();
        expect(svc.electronicDocuments().length).toBe(2);

        http.whenGET(url).respond([
            {documentId: '1'},
            {documentId: '2'},
            {documentId: '3'}
        ]);
        svc.listByTaskId(taskId);
        http.flush();
        expect(svc.electronicDocuments().length).toBe(2);
    });

    it('should call the http url to get document when the getDocument method is called', function(){
        var documentId = 99999,
            url = urls.GET_DOCUMENT.replace(':id', documentId);
        http.expectGET(url).respond({});
        svc.getDocument(documentId);
        http.flush();
    });

    it('return data when the get documnet url resolves', function(done){
        var documentId = 99999,
            url = urls.GET_DOCUMENT.replace(':id', documentId);
        http.expectGET(url).respond('<h1>Hello</h1>');
        svc.getDocument(documentId).then(function svcResponseSuccess(data) {
            expect(data).toEqual('<h1>Hello</h1>');
            done();
        });
        http.flush();
    });

});
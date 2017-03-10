var EligibilityDetails = require('malstrom-models/lib/eligibility-details.model');

describe('eligibility details controller tests', function(){

    var ctrl,
        mockState,
        mockStateParams,
        mockEligibilityService,
        mockEntitlementHelper,
        mockSearchService,
        mockAlertService,
        q,
        rootScope;

    beforeEach(function () {
        angular.mock.module(require('./eligibility-details.controller.js').name);
    });

    beforeEach(angular.mock.module(function ($provide)  {
        $provide.value('night-theme', false);
    }));

    beforeEach(angular.mock.module(function ($provide) {
        mockState = {
            go: jasmine.createSpy()
        };
        $provide.value('$state', mockState);
    }));

    beforeEach(angular.mock.module(function ($provide) {
        mockStateParams = {
            willJoin: false,
            newMember: false
        };
        $provide.value('$stateParams', mockStateParams);
    }));

    beforeEach(angular.mock.inject(function(aahEligibilityService) {
        mockEligibilityService = aahEligibilityService;
        spyOn(mockEligibilityService, 'eligibilityDetails');
        spyOn(mockEligibilityService, 'riskCode');
        spyOn(mockEligibilityService, 'customerGroup');
        spyOn(mockEligibilityService, 'save');
    }));

    beforeEach(angular.mock.inject(function(aahEntitlementHelperService) {
        mockEntitlementHelper = aahEntitlementHelperService;
        spyOn(mockEntitlementHelper, 'findByEntitlement');
        spyOn(mockEntitlementHelper, 'addNewCase');
    }));

    beforeEach(angular.mock.inject(function(aahSearchService) {
        mockSearchService = aahSearchService;
        spyOn(mockSearchService, 'membershipSearchTerm');
        spyOn(mockSearchService, 'vehicleSearch');
    }));

    beforeEach(angular.mock.inject(function(aahAlertService) {
        mockAlertService = aahAlertService;
        spyOn(mockAlertService, 'createAlert');
    }));

    beforeEach(angular.mock.inject(function ($q) {
        q = $q;
    }));

    beforeEach(angular.mock.inject(function ($rootScope) {
        rootScope = $rootScope;
    }));

    beforeEach(angular.mock.inject(function ($controller) {
        ctrl = $controller('aahEligibilityDetailsController');
    }));


    it('should set eligibility details on ctrl.init', function(){
        mockEligibilityService.riskCode.and.returnValue('riskCode');
        mockEligibilityService.customerGroup.and.returnValue('customerGroup');
        mockEligibilityService.eligibilityDetails.and.returnValue({
            surname: jasmine.createSpy(),
            riskCode: jasmine.createSpy(),
            customerGroup: jasmine.createSpy(),
            role: jasmine.createSpy()
        });
        ctrl.init();
        expect(mockEligibilityService.eligibilityDetails().riskCode).toHaveBeenCalledWith('riskCode');
        expect(mockEligibilityService.eligibilityDetails().customerGroup).toHaveBeenCalledWith('customerGroup');
    });

    it('should set surname when it is a  will join on ctrl.init', function(){
        mockEligibilityService.riskCode.and.returnValue('riskCode');
        mockEligibilityService.customerGroup.and.returnValue('customerGroup');
        mockEligibilityService.eligibilityDetails.and.returnValue({
            surname: jasmine.createSpy(),
            riskCode: jasmine.createSpy(),
            customerGroup: jasmine.createSpy(),
            role: jasmine.createSpy()
        });
        mockStateParams.willJoin = true;
        mockSearchService.membershipSearchTerm.and.returnValue({
            param: jasmine.createSpy().and.returnValue({
                surname: jasmine.createSpy().and.returnValue('surname')
            })
        });
        ctrl.init();
        expect(mockEligibilityService.eligibilityDetails().surname).toHaveBeenCalledWith('surname');
    });

    it('the eligibility details should be set eligibility details via the accessor', function (){
        var testVal = 'testVal';
        ctrl.eligibilityDetails(testVal);
        expect(mockEligibilityService.eligibilityDetails).toHaveBeenCalledWith(testVal);
    });

    it('the accessor for eligibility details should return eligibaility details', function(){
        var testVal = 'testVal';
        mockEligibilityService.eligibilityDetails.and.returnValue(testVal);
        expect(ctrl.eligibilityDetails()).toEqual(testVal);
    });

    it('should perform vehicle search', function () {
        var deferred = q.defer();
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails());
        mockSearchService.vehicleSearch.and.returnValue(deferred.promise);
        ctrl.getVehileDetails();
        expect(mockSearchService.vehicleSearch).toHaveBeenCalled();
    });

    it('should return vehicle details after the vehicle search resovles', function () {
        var deferred = q.defer();
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails());
        mockSearchService.vehicleSearch.and.returnValue(deferred.promise);
        ctrl.getVehileDetails();
        deferred.resolve({
            vehicle: {
                colour: jasmine.createSpy().and.returnValue('RED'),
                experianDetails: jasmine.createSpy().and.returnValue({
                    make: jasmine.createSpy().and.returnValue('FORD'),
                    model: jasmine.createSpy().and.returnValue('FIESTA')
                })
            }
        });

        rootScope.$apply();
        expect(ctrl.vehicleDetails()).toEqual('RED FORD FIESTA');
    });

    it('should return isWillJoin value through the accessor as true when the risk code is WJ', function() {
        var testVal = 'test';
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails({
            riskCode: 'WJ'
        }));
        expect(ctrl.isWillJoin()).toBe(true);
    });

    it('should return an array of four when the roles is accessed', function () {
        mockEligibilityService.riskCode.and.returnValue('riskCode');
        mockEligibilityService.customerGroup.and.returnValue('customerGroup');
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails());
        ctrl.init();
        expect(ctrl.roles().length).toEqual(4);
    });

    it('should call state.go with the home value when cancelClick is called', function () {
        ctrl.cancelClick();
        expect(mockState.go).toHaveBeenCalledWith('home');
    });

    it('should not call the eligibility details service save feature when the OK button is selected but not all required values are entered', function () {
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails());
        ctrl.saveEligibility();
        expect(mockEligibilityService.save).not.toHaveBeenCalled();

    });

    it('should call the eligibility details service save feature when the OK button is selected but all required values are entered', function () {
        var deferred = q.defer(),
            helperDefered = q.defer();
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails(
            {
                title: 'title',
                forename: 'forename',
                surname: 'surname',
                address: {
                    addressLines: ['line 1'],
                    postcode: 'postcode'
                }
            }
        ));
        mockEligibilityService.save.and.returnValue(deferred.promise);
        mockEntitlementHelper.findByEntitlement.and.returnValue(helperDefered.promise);
        ctrl.saveEligibility();
        deferred.resolve({});
        helperDefered.resolve({});
        rootScope.$apply();
        expect(mockEligibilityService.save).toHaveBeenCalled();
    });

    it('should call the eligibility details service save feature when the OK button is selected but all required values are entered', function () {
        var deferred = q.defer();
        mockStateParams.newMember = true;
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails(
            {
                title: 'title',
                forename: 'forename',
                surname: 'surname',
                address: {
                    addressLines: ['line 1'],
                    postcode: 'postcode'
                }
            }
        ));
        mockEligibilityService.save.and.returnValue(deferred.promise);
        ctrl.saveEligibility();
        deferred.resolve({});
        rootScope.$apply();
        expect(mockState.go).toHaveBeenCalled();
    });

    it('should call the alert service when the OK button is selected but all required values are entered, but the eligibility save fails', function () {
        var deferred = q.defer();

        mockEligibilityService.save.and.returnValue(deferred.promise);
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails(
            {
                title: 'title',
                forename: 'forename',
                surname: 'surname',
                address: {
                    addressLines: ['line 1'],
                    postcode: 'postcode'
                }
            }
        ));

        ctrl.saveEligibility();
        deferred.reject({
            data: {
                error: 'error message'
            }
        });
        rootScope.$apply();
        expect(mockAlertService.createAlert).toHaveBeenCalledWith('Problem saving eligibility: error message', 'danger');
    });

    it('should call the eligibility details service save feature when the OK button is selected and only will join details are entered', function () {
        var deferred = q.defer(),
            helperDefered = q.defer();
        mockEligibilityService.eligibilityDetails.and.returnValue(new EligibilityDetails(
            {
                riskCode: 'WJ',
                address: {
                    postcode: 'postcode'
                }
            }
        ));
        mockEligibilityService.save.and.returnValue(deferred.promise);
        mockEntitlementHelper.findByEntitlement.and.returnValue(helperDefered.promise);
        ctrl.saveEligibility();
        deferred.resolve({});
        helperDefered.resolve({});
        rootScope.$apply();
        expect(mockEligibilityService.save).toHaveBeenCalled();
    });

    it('should call the eligibility service customergroup is personal when the isPersonalCustomerGroup accessor is called', function(){
        mockEligibilityService.customerGroup.and.returnValue(
            {
                isPersonal: jasmine.createSpy()
            });
        ctrl.isPersonalCustomerGroup();
        expect(mockEligibilityService.customerGroup().isPersonal).toHaveBeenCalled();
    });

    it('should call the eligibility service customergroup is fleet when the isFleetCustomerGroup accessor is called', function(){
        mockEligibilityService.customerGroup.and.returnValue(
            {
                isFleet: jasmine.createSpy()
            });
        ctrl.isFleetCustomerGroup();
        expect(mockEligibilityService.customerGroup().isFleet).toHaveBeenCalled();
    });

    it('should set and retrive roles through the accessor', function() {
        var testVal = 'test';
        ctrl.roles(testVal);
        expect(ctrl.roles()).toEqual(testVal);
    });

});


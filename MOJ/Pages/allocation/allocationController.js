(function() {
    'use strict';

    angular
        .module('YJB-Placements')
        .controller('AllocationController', Controller);

    Controller.$inject = ['PLACEMENT_CONTENT'];
    function Controller(PLACEMENT_CONTENT) {
        var ctrl = this;

        init();

        function init() {

            ctrl.pageHeader = {
                title: PLACEMENT_CONTENT.Allocation.PageHeader.Title,
                icon: PLACEMENT_CONTENT.Allocation.PageHeader.Icon,
                module: PLACEMENT_CONTENT.ModuleName
            };

        }
    }
})();

(function () {
    'use strict';

    var currentURL = window.location.href.toUpperCase();
    if (currentURL.indexOf('/SITEPAGES/APP.ASPX') >= 0) {
        angular.element(document).ready(function () { angular.bootstrap(document, ['singlePageApp']); });
    }

    var globalConfig = {
        appErrorPrefix: '[Exercise Application Error] ',
        appTitle: 'Exercise Application',
        baseUrl: 'http://localhost:3000/spa'
    };

    angular.module('singlePageApp', [
        'app.core',
        'app.data',
        'app.layout'
    ]);

    angular.module('app.core', [
        'officeuifabric.core',
        'officeuifabric.components',
        'ngAnimate',
        'ngSanitize',
        'ngResource',
        'blocks.exception',
        'blocks.logger',
        'blocks.router',
        'ui.router',
        'ngplus'
    ])
        .constant('_', _)
        .constant('toastr', toastr)
        .constant('moment', moment)
        .value('config', globalConfig)
        .config(configureCoreModule);

    angular.module('blocks.exception', [
        'blocks.logger'
    ])
        .factory('exception', exceptionService)
        .provider('exceptionHandler', exceptionHandlerProvider)
        .config(configureExceptionModule);

    angular.module('blocks.router', [
        'ui.router',
        'blocks.logger'
    ])
        .provider('routerHelper', routerHelperProvider);

    angular.module('blocks.logger', [])
        .factory('logger', loggerService);

    angular.module('app.layout', [
        'app.core'
    ])
        .controller('ShellController', ShellController);


    configureCoreModule.$inject = ['$logProvider', 'exceptionHandlerProvider', 'routerHelperProvider', 'toastr'];
    function configureCoreModule($logProvider, exceptionHandlerProvider, routerHelperProvider, toastr) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(globalConfig.appErrorPrefix);
        routerHelperProvider.configure({ docTitle: globalConfig.appTitle + ': ' });
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    configureExceptionModule.$inject = ['$provide'];
    function configureExceptionModule($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
    }

    extendExceptionHandler.$inject = ['$delegate', 'exceptionHandler', 'logger'];
    function extendExceptionHandler($delegate, exceptionHandler, logger) {
        return function (exception, cause) {
            var appErrorPrefix = exceptionHandler.config.appErrorPrefix || '';
            var errorData = { exception: exception, cause: cause };
            exception.message = appErrorPrefix + exception.message;
            $delegate(exception, cause);
            logger.error(exception.message, errorData);
        };
    }

    routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
    function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
        /* jshint validthis:true */
        var config = {
            docTitle: undefined,
            resolveAlways: {}
        };

        if (!(window.history && window.history.pushState)) {
            window.location.hash = '/';
        }

        //$locationProvider.html5Mode(true);

        this.configure = function (cfg) {
            angular.extend(config, cfg);
        };

        this.$get = RouterHelper;
        RouterHelper.$inject = ['$location', '$rootScope', '$state', 'logger'];
        /* @ngInject */
        function RouterHelper($location, $rootScope, $state, logger) {
            var handlingStateChangeError = false;
            var hasOtherwise = false;
            var stateCounts = {
                errors: 0,
                changes: 0
            };

            var service = {
                configureStates: configureStates,
                getStates: getStates,
                stateCounts: stateCounts
            };

            init();

            return service;

            ///////////////

            function configureStates(states, otherwisePath) {
                states.forEach(function (state) {
                    state.config.resolve =
                        angular.extend(state.config.resolve || {}, config.resolveAlways);
                    $stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function handleRoutingErrors() {
                // Route cancellation:
                // On routing error, go to the dashboard.
                // Provide an exit clause if it tries to do it twice.
                $rootScope.$on('$stateChangeError',
                    function (event, toState, toParams, fromState, fromParams, error) {
                        if (handlingStateChangeError) {
                            return;
                        }
                        stateCounts.errors++;
                        handlingStateChangeError = true;
                        var destination = (toState &&
                            (toState.title || toState.name || toState.loadedTemplateUrl)) ||
                            'unknown target';
                        var msg = 'Error routing to ' + destination + '. ' +
                            (error.data || '') + '. <br/>' + (error.statusText || '') +
                            ': ' + (error.status || '');
                        logger.warning(msg, [toState]);
                        $location.path('/');
                    }
                );
            }

            function init() {
                handleRoutingErrors();
                updateDocTitle();
            }

            function getStates() { return $state.get(); }

            function updateDocTitle() {
                $rootScope.$on('$stateChangeSuccess',
                    function (event, toState, toParams, fromState, fromParams) {
                        stateCounts.changes++;
                        handlingStateChangeError = false;
                        var title = config.docTitle + ' ' + (toState.title || '');
                        $rootScope.title = title; // data bind to <title>
                    }
                );
            }
        }
    }

    function exceptionHandlerProvider() {
        /* jshint validthis:true */
        this.config = {
            appErrorPrefix: undefined
        };

        this.configure = function (appErrorPrefix) {
            this.config.appErrorPrefix = appErrorPrefix;
        };

        this.$get = function () {
            return { config: this.config };
        };
    }

    exceptionService.$inject = ['$q', 'logger'];
    function exceptionService($q, logger) {
        var service = {
            catcher: catcher
        };
        return service;

        function catcher(message) {
            return function (e) {
                var thrownDescription;
                var newMessage;
                if (e.data && e.data.description) {
                    thrownDescription = '\n' + e.data.description;
                    newMessage = message + thrownDescription;
                }
                e.data.description = newMessage;
                logger.error(newMessage);
                return $q.reject(e);
            };
        }
    }

    loggerService.$inject = ['$log', 'toastr'];
    function loggerService($log, toastr) {
        var service = {
            showToasts: true,

            error: error,
            info: info,
            success: success,
            warning: warning,

            // straight to console; bypass toastr
            log: $log.log
        };

        return service;
        /////////////////////

        function error(message, data, title) {
            toastr.error(message, title);
            $log.error('Error: ' + message, data);
        }

        function info(message, data, title) {
            toastr.info(message, title);
            $log.info('Info: ' + message, data);
        }

        function success(message, data, title) {
            toastr.success(message, title);
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            toastr.warning(message, title);
            $log.warn('Warning: ' + message, data);
        }
    }

    ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger'];
    function ShellController($rootScope, $timeout, config, logger) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        $rootScope.showSplash = true;
        vm.navline = {
            title: config.appTitle,
            text: 'Created by John Papa',
            link: 'http://twitter.com/john_papa'
        };

        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
            hideSplash();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function () {
                $rootScope.showSplash = false;
            }, 1000);
        }
    }

})();

var lpm = lpm || {};
lpm.models = lpm.models || {};

// learning item entity
lpm.models.learningItem = function () {
  this.Id = undefined;
  this.Title = undefined;
  this.ItemType = undefined;
  this.LearningPathId = undefined;
  this.__metadata = {
    type: 'SP.Data.LearningItemsListItem'
  };
};

(function () {
    'use strict';
     
     angular.module('app.models', [])
        .factory('RFI', RfiModel);

    RfiModel.$inject = ['RfiRepository'];
    function RfiModel(RfiRepository){
        var RFI = function(data){
            if(!data){
                this.Id = undefined; //number
                this.Title = undefined; //string
                this.DateClosed = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.Details = undefined; //string or null
                this.InsufficientExplanation = undefined; //string or null
                this.LTIOV = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.ManageRFIId = undefined; // object or null {results: [8, 16, 23]}  
                this.MissionId = undefined; //integer or null
                this.PocNameId = undefined; //integer
                this.PocOrganization = undefined; //string
                this.PocPhone = undefined; //string
                this.Priority = undefined; //string
                this.RecommendedOPR = undefined; //string
                this.RespondentNameId = undefined; //integer or null
                this.RespondentPhone = undefined; //string or null
                this.ResponseSufficient = undefined; //string or null
                this.ResponseToRequest = undefined; //string or null
                this.RfiTrackingNumber = undefined; //integer or null
                this.Status = undefined; //string
                this.__metadata = {
                    type: "SP.Data.RfiListItem"
                };
            } else {
                for(var prop in data){
                    if(data.hasOwnProperty(prop)){
                        this[prop] = data[prop];
                    }
                }
            }
        }

        RFI.prototype.complete = function(){
            console.log('business object saving...');
            RfiRepository.save(this);
        }

        return RFI;
    }
})();

(function () {
    'use strict';

    angular.module('app.data', ['app.models'])
        .service('spContext', spContext)
        .service('RfiRepository', RfiRepository)
        .run(['spContext', function(spContext) {
            //simply requiring this singleton runs it initialization code..
        }]);


    RfiRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function RfiRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            save: save
        };

        var fieldsToSelect = [
                spContext.SP2013REST.selectForCommonFields, 
                'Status,RfiTrackingNumber,MissionId,Details,Priority,LTIOV,PocNameId,PocPhone,PocOrganization,RecommendedOPR',
                'ManageRFIId,RespondentNameId,RespondentPhone,ResponseToRequest,DateClosed,ResponseSufficient,InsufficientExplanation',
                'Mission/FullName,PocName/Title,ManageRFI/Title,RespondentName/Title'
            ].join(',');
        
        var fieldsToExpand = [
                spContext.SP2013REST.expandoForCommonFields,
                'Mission,PocName,ManageRFI,RespondentName'
            ].join(',');

        function getDataContextForCollection(params){
            return $resource("../_api/web/lists/getbytitle('RFI')/items",
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': fieldsToSelect,
                            '$expand': fieldsToExpand
                        },
                        headers: {
                            'Accept': 'application/json;odata=verbose;'
                        }
                    },
                    post: {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json;odata=verbose',
                            'Content-Type': 'application/json;odata=verbose;',
                            'X-RequestDigest': spContext.securityValidation
                        }
                    }
                });
        }

        function getDataContextForResource(item){
             return $resource("../_api/web/lists/getbytitle('RFI')/items(:itemId)",
                { itemId: item.Id },
                {
                get: {
                    method: 'GET',
                    params: {
                        '$select': 'Id,Title,Comments,Created,Modified'
                    },
                    headers: {
                        'Accept': 'application/json;odata=verbose;'
                    }
                },
                post: {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose;',
                        'Content-Type': 'application/json;odata=verbose;',
                        'X-RequestDigest': spContext.securityValidation,
                        'X-HTTP-Method': 'MERGE',
                        'If-Match': item.__metadata.etag
                    }
                },
                delete: {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json;odata=verbose;',
                        'Content-Type': 'application/json;odata=verbose;',
                        'X-RequestDigest': spContext.securityValidation,
                        'If-Match': '*'
                    }
                }
            });
        }

        function getAll(){
            var dfd = $q.defer();
            getDataContextForCollection().get({}, 
                function (data){
                    dfd.resolve(data.d.results);
                }, 
                function (error){
                     dfd.reject(error);
                }); 
            return dfd.promise;
        }

        function save(rfi){
            console.log('Repository method...');
        }

        return service;
    }

    spContext.$inject = ['$resource', '$timeout', 'logger'];
    function spContext($resource, $timeout, logger) {
        var service = this;

        service.SP2013REST ={
            selectForCommonFields: 'Id,Title,Created,Modified,AuthorId,EditorId,Attachments,Author/Title,Editor/Title',
            expandoForCommonFields: 'Author,Editor'
        }

        init();

        function init() {
            refreshSecurityValidation();
        }

        function refreshSecurityValidation() {
            if(service.securityValidation){
                logger.info("refreshing soon-to-expire security validation: " + service.securityValidation);
            }

            var siteContextInfoResource = $resource('_api/contextinfo?$select=FormDigestValue', {}, {
                post: {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json;odata=verbose;',
                        'Content-Type': 'application/json;odata=verbose;'
                    }
                }
            });

            // request validation
            siteContextInfoResource.post({}, success, fail);

            function success(data) {
                // obtain security digest timeout & value & store in service
                var validationRefreshTimeout = data.d.GetContextWebInformation.FormDigestTimeoutSeconds - 10;
                service.securityValidation = data.d.GetContextWebInformation.FormDigestValue;
                logger.info("refreshed security validation: " + service.securityValidation);
                logger.info("next refresh of security validation: " + validationRefreshTimeout + " seconds");

                // repeat this in FormDigestTimeoutSeconds-10
                $timeout(
                    function () {
                        refreshSecurityValidation();
                    },
                    validationRefreshTimeout * 1000);
            }

            function fail(error) {
                common.logger.logError("response from contextinfo", error, serviceId);
            }

        }
    }

  
})();

(function () {
    'use strict';

    angular
        .module('app.core')
        .run(registerRfiRoute)
        .controller('RfiController', RfiController);

    registerRfiRoute.$inject = ['config', 'routerHelper'];
    function registerRfiRoute(config, routerHelper) {
        routerHelper.configureStates(getStates());

        function getStates() {
            return [
                {
                    state: 'rfi',
                    config: {
                        url: '/rfi',
                        templateUrl: config.baseUrl + '/rfi.html',
                        controller: 'RfiController',
                        controllerAs: 'vm',
                        title: 'RFI'
                    }
                }
            ];
        }
    }

    RfiController.$inject = ['_', 'logger', 'RFI', 'RfiRepository'];
    function RfiController(_, logger, RFI, RFIRepository) {
        var vm = this;
        vm.title = "Mike";
        vm.rfiList = [];
        vm.tabConfig = {
            selectedSize: "large",
            selectedType: "tabs",
            pivots: [
                { title: "Open" },
                { title: "Closed" },
                { title: "My RFIs" },
                { title: "Manage RFIs" }
            ],
            selectedPivot: { title: "Open" },
            menuOpened: false
        }
        vm.openMenu = function () {
            vm.tabConfig.menuOpened = !vm.tabConfig.menuOpened;
        }

        activate();

        function activate() {
            RFIRepository.getAll()
                .then(function(data){
                    vm.rfiList = _.map(data, function(item){ return new RFI(item); })
                    _.each(vm.rfiList, function(item){
                        console.log(item);
                        item.complete();
                    });
                })

            logger.info('Activated RFI View');
        }


    }

})();
(function () {
    'use strict';
    var globalConfig = {
        appErrorPrefix: '[Exercise Application Error] ',
        appTitle: 'Exercise Application',
        baseUrl: 'http://localhost:3000/spaArtifacts'
    };
    
    $(document).ready(bootstrapNgApplication);

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
        'ngJsTree',
        'ngplus'
    ])
        .constant('_', extendLoDash(_))
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

    function bootstrapNgApplication(){
        var currentURL = S(window.location.href.toUpperCase());
        var spPage = $("body");
        if(currentURL.include('/SITEPAGES/SOCC.ASPX')){
            spPage.attr('ng-controller', 'SoccAspxController as vm');
        }
        
        //BOOTSTRAP NG-APP
        angular.element(document).ready(function () { angular.bootstrap(document, ['singlePageApp']); });
    }

    configureCoreModule.$inject = ['$logProvider', '$sceDelegateProvider', 'exceptionHandlerProvider', 'routerHelperProvider', 'toastr'];
    function configureCoreModule($logProvider, $sce, exceptionHandlerProvider, routerHelperProvider, toastr) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(globalConfig.appErrorPrefix);
        routerHelperProvider.configure({ docTitle: globalConfig.appTitle + ': ' });
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';

        //override security because our HTML templates violate CORS
	    $sce.resourceUrlWhitelist(['**']);
    }

    configureExceptionModule.$inject = ['$provide'];
    function configureExceptionModule($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
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

    function extendLoDash(_){
        _.parseQueryString = function(qstr) {
            var query = {};
            var a = qstr.substr(1).split('&');
            for (var i = 0; i < a.length; i++) {
                var b = a[i].split('=');
                query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
            }
            return query;
        }
        return _;
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

    ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger'];
    function ShellController($rootScope, $timeout, config, logger) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        $rootScope.showSplash = true;


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

/* Module: app.data and app.models */
(function () {
    angular.module('app.models', []);
    angular.module('app.data', ['app.models'])
        .service('spContext', spContext)
        .run(['spContext', function (spContext) {
            //simply requiring this singleton runs it initialization code..
        }]);

    spContext.$inject = ['$resource', '$timeout', 'logger'];
    function spContext($resource, $timeout, logger) {
        var service = this;

        service.SP2013REST = {
            selectForCommonDocumentFields: 'Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title,File/CheckOutType,File/MajorVersion,File/Name,File/ServerRelativeUrl,File/TimeCreated,File/TimeLastModified',
            expandoForCommonDocumentFields: 'Author,Editor,File',
            selectForCommonListFields: 'Attachments,Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title',
            expandoForCommonListFields: 'Author,Editor'
        }
        service.constructNgResourceForRESTCollection = constructNgResourceForRESTCollection;
        service.constructNgResourceForRESTResource = constructNgResourceForRESTResource;
        service.htmlHelpers = {};
        service.htmlHelpers.buildHeroButton = function(text, href, ngShowAttrValue){
            var html = 
                '<table dir="none" cellpadding="0" cellspacing="0" border="0" ng-show="'+ ngShowAttrValue +'">\
                    <tbody>\
                        <tr>\
                            <td class="ms-list-addnew ms-textXLarge ms-list-addnew-aligntop ms-soften">\
                                <a class="ms-heroCommandLink ms-hero-command-enabled-alt" href="'+ href + '">\
                                    <span class="ms-list-addnew-imgSpan20">\
                                        <img src="/_layouts/15/images/spcommon.png?rev=44" class="ms-list-addnew-img20">\
                                    </span>\
                                    <span>'+ text +'</span>\
                                </a>\
                            </td>\
                        </tr>\
                    </tbody>\
                </table>';
            return html;
        }

        init();

        function constructNgResourceForRESTCollection(opts) {
            return $resource(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('"+opts.listName+"')/items",
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': opts.fieldsToSelect,
                            '$expand': opts.fieldsToExpand
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
                            'X-RequestDigest': service.securityValidation
                        }
                    }
                });
        }

        function constructNgResourceForRESTResource(opts) {
            return $resource(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('"+opts.listName+"')/items(:itemId)",
                { itemId: opts.item.Id },
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': opts.fieldsToSelect,
                            '$expand': opts.fieldsToExpand
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
                            'X-RequestDigest': service.securityValidation,
                            'X-HTTP-Method': 'MERGE',
                            'If-Match': (!!opts.item.__metadata) ? opts.item.__metadata.etag : ''
                        }
                    },
                    delete: {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json;odata=verbose;',
                            'Content-Type': 'application/json;odata=verbose;',
                            'X-RequestDigest': service.securityValidation,
                            'If-Match': '*'
                        }
                    }
                });
        }

        function init() {
            refreshSecurityValidation();
        }

        function refreshSecurityValidation() {
            if (service.securityValidation) {
                logger.info("refreshing soon-to-expire security validation: " + service.securityValidation);
            }

            var siteContextInfoResource = $resource(_spPageContextInfo.webServerRelativeUrl + '/_api/contextinfo?$select=FormDigestValue', {}, {
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
                logger.logError("response from contextinfo: " + error);
            }

        }
    }
})();

/* Model: RFI */
(function () {
    angular.module('app.models')
        .factory('RFI', RfiModel);

    RfiModel.$inject = ['RfiRepository'];
    function RfiModel(RfiRepository) {
        var RFI = function (data) {
            if (!data) {
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
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        this[prop] = data[prop];
                    }
                }
            }
        }

        RFI.prototype.complete = function () {
            console.log('business object saving...');
            RfiRepository.save(this);
        }

        return RFI;
    }
})();

/* Model: Mission Document */
(function () {
    angular.module('app.models')
        .factory('MissionDocument', MissionDocumentModel);

    MissionDocumentModel.$inject = ['MissionDocumentRepository'];
    function MissionDocumentModel(MissionDocumentRepository) {
        var MissionDocument = function (data) {
            if (!data) {
                this.Id = undefined; //number
                this.Title = undefined; //string or null
                this.Organization = undefined; //string
                this.TypeOfDocument = undefined; //string
                this.MissionId = undefined; //integer or null
                this.FlaggedForSoacDailyUpdate = undefined; //string or null
                this.ChopProcess  = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.__metadata = {
                    type: "SP.Data.MissionDocumentsItem"
                };
            } else {
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        this[prop] = data[prop];
                    }
                }
            }
        }

        MissionDocument.prototype.initiateChop = function () {
            //convert model to DTO that will be used for save...HTTP MERGE should ignore any 'undefined'' props in the request body
            var dto = new MissionDocument();
            dto.Id = this.Id;
            dto.__metadata = this.__metadata;
            dto.ChopProcess = (new Date()).toISOString();
            return MissionDocumentRepository.save(dto);
        }

        return MissionDocument;
    }
})();

/* Model: Mission Tracker */
(function () {
    angular.module('app.models')
        .factory('Mission', MissionModel);

    MissionModel.$inject = ['MissionTrackerRepository'];
    function MissionModel(MissionTrackerRepository) {
        var Mission = function (data) {
            if (!data) {
                this.Id = undefined; //number
                this.Identifier = undefined; //string
                this.FullName = undefined; //string
                this.ObjectiveName = undefined; //string 
                this.Organization = undefined; //string
                this.MissionType = undefined; //string
                this.ApprovalAuthority = undefined; //string
                this.OperationName = undefined; //string or null
                this.Status = undefined; //string
                this.MissionApproved  = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.ExpectedExecution = undefined; //string (ISO) "2016-08-01T07:00:00Z"
                this.ExpectedTermination = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.ParticipatingOrganizations = undefined; //object {results: ['SOTG 10', 'SOTG 15', 'SOTG 25']} 
                this.Comments = undefined; //string or null
                this.__metadata = {
                    type: "SP.Data.MissionTrackerListItem"
                };
            } else {
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        this[prop] = data[prop];
                    }
                }
            }
        }

        Mission.prototype.complete = function () {
  
        }

        Mission.prototype.buildOnHoverText = function (){
            var hoverTextParts = [];
            hoverTextParts.push(this.Status);
            hoverTextParts.push(this.ObjectiveName);
            if(this.OperationName){
                hoverTextParts.push(this.OperationName);
            }
            hoverTextParts.push(this.ApprovalAuthority);
            var timePortion = moment.utc(this.ExpectedExecution).format("DDHHmm[Z]MMMYY").toUpperCase();
            if(this.ExpectedTermination){
                timePortion += " - " + moment.utc(this.ExpectedTermination).format("DDHHmm[Z]MMMYY").toUpperCase();
            }
            hoverTextParts.push(timePortion);

            return hoverTextParts.join(', ');
        }

        return Mission;
    }
})();

/* Data Repository: RFI */
(function () {
    angular.module('app.data')
        .service('RfiRepository', RfiRepository);
    RfiRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function RfiRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            'Status,RfiTrackingNumber,MissionId,Details,Priority,LTIOV,PocNameId,PocPhone,PocOrganization,RecommendedOPR',
            'ManageRFIId,RespondentNameId,RespondentPhone,ResponseToRequest,DateClosed,ResponseSufficient,InsufficientExplanation',
            'Mission/FullName,PocName/Title,ManageRFI/Title,RespondentName/Title'
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields,
            'Mission,PocName,ManageRFI,RespondentName'
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'RFI'
        };
        var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams);

        function getAll() {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            restCollection.get(qsParams,
                function (data) {
                    dfd.resolve(data.d.results);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function save(rfi) {
            console.log('Repository method...');
        }

        return service;
    }
})();

/* Data Repository: Mission Documents */
(function () {
    angular.module('app.data')
        .service('MissionDocumentRepository', MissionDocumentRepository);
    MissionDocumentRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function MissionDocumentRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            getById: getById,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonDocumentFields,
            'Organization,TypeOfDocument,MissionId,FlaggedForSoacDailyUpdate,DailyProductDate,ChopProcess',
            'Mission/FullName'
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonDocumentFields,
            'Mission'
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Mission Documents'
        };
        var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams);

        function getAll() {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            restCollection.get(qsParams,
                function (data) {
                    dfd.resolve(data.d.results);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function getById(id){
            var constructParams = angular.extend({}, {item: {Id: id}}, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.get({}).$promise.then(function(response){ return response.d; });
        }

        function save(item) {
            var constructParams = angular.extend({}, {item: item}, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.post(item).$promise;
        }

        return service;
    }
})();

/* Data Repository: Mission Tracker */
(function () {
    angular.module('app.data')            
        .service('MissionTrackerRepository', MissionTrackerRepository)
    MissionTrackerRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function MissionTrackerRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getByOrganization: getByOrganization,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "Identifier,FullName,ObjectiveName,Organization,MissionType,ApprovalAuthority,OperationName,Status,MissionApproved",
            "ExpectedExecution,ExpectedTermination,ParticipatingOrganizations,Comments"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Mission Tracker'
        };
        var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams);

        function getByOrganization(orgFilter) {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            restCollection.get(qsParams,
                function (data) {
                    var queryResults = data.d.results;
                    if(orgFilter){
                        queryResults = _.filter(queryResults, function(item){
                            return item.Organization === orgFilter || _.includes(item.ParticipatingOrganizations.results, orgFilter);
                        })
                    }
                    dfd.resolve(queryResults);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function save(rfi) {
            console.log('Repository method...');
        }

        function getTestData(orgFilter){
            var staticData = [
                {
                    Id: 3,
                    Identifier: "SOTG10_003_KS",
                    Status: 'COA Approved',
                    ExpectedExecution: moment(),
                    ExpectedTermination: moment().add(3, 'days'),
                    Organization: 'SOTG 10',
                    ParticipatingOrganizations: {
                        results: [
                            'SOAC', 'SOTG 20'
                        ]
                    },
                    ObjectiveName: "OBJ_HAN",
                    ApprovalAuthority: "2B: SOCC NRF",
                    OperationName: "OP_SOLO"
                },
                {
                    Id: 8,
                    Identifier: "SOTG10_004_DA",
                    Status: 'Mission Closed',
                    ExpectedExecution: moment().add(-3, 'days'),
                    ExpectedTermination: moment().add(1, 'days'),
                    Organization: 'SOTG 10',
                    ParticipatingOrganizations: {
                        results: [
                            'SOTG 20', 'SOTG 30'
                        ]
                    },
                    ObjectiveName: "OBJ_DARTH",
                    ApprovalAuthority: "3A: NRF SOCC",
                    OperationName: "OP_VADER"
                },
                {
                    Id: 9,
                    Identifier: "SOTG15_004_DA",
                    Status: 'Mission Closed',
                    ExpectedExecution: moment().add(-9, 'days'),
                    ExpectedTermination: moment().add(-2, 'days'),
                    Organization: 'SOTG 15',
                    ParticipatingOrganizations: {
                        results: [
                            'SOLTG 35', 'SOAC'
                        ]
                    },
                    ObjectiveName: "OBJ_YODA",
                    ApprovalAuthority: "3A: NRF SOCC",
                    OperationName: "OP_SITHLORD"
                },
                {
                    Id: 11,
                    Identifier: "SOMTG35_001_DA",
                    Status: 'EXORD Released',
                    ExpectedExecution: moment().add(2, 'days'),
                    ExpectedTermination: '',
                    Organization: 'SOMTG 35',
                    ParticipatingOrganizations: {
                        results: []                
                    },
                    ObjectiveName: "OBJ_LUKE",
                    ApprovalAuthority: "3A: NRF SOCC",
                    OperationName: "OP_SKYWALKER"
                }
            ];

            if(orgFilter){
                staticData = _.filter(staticData, function(item){
                    return item.Organization === orgFilter || _.includes(item.ParticipatingOrganizations.results, orgFilter);
                })
            }
            return $q.when(staticData);
        }

        return service;
    }
})();

/* Data Repository: Calendar */
(function () {
    angular.module('app.data')            
        .service('CalendarRepository', CalendarRepository)
    CalendarRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function CalendarRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getEvents: getEvents
        };
        return service;

        function convertToFullCalendarEvent(xmlNode){
            var itemID = xmlNode.attr('ows_ID');
            return {
                "start": moment.utc(xmlNode.attr("ows_EventDate")),
                "end": moment.utc(xmlNode.attr("ows_EndDate")),
                "title": xmlNode.attr("ows_Title"),
                "location": xmlNode.attr("ows_Location"),
                "allDay": xmlNode.attr("ows_fAllDayEvent") == 1 ? true : false,                                   
                "url" : _spPageContextInfo.webServerRelativeUrl  + "/Lists/Calendar/DispForm.aspx?ID=" + itemID + '&Source=' + window.location,
                "isRecurrence" : xmlNode.attr("ows_fRecurrence") == 1 ? true : false,
                "organization": xmlNode.attr("ows_Organization")
            }
        }

        function getEvents(start, end, intervalUnit, organizationFilter){
            var diff = end.diff(start, 'hours');
            var midPoint = start.clone().add((diff/2), 'hours');
            //using midpoint in CAML query seems to worker
            //http://www.nothingbutsharepoint.com/2012/04/26/use-spservices-to-get-recurring-events-as-distinct-items-aspx/
            var camlCalendarDate = midPoint.format("YYYY-MM-DD[T]HH:mm:ss[Z]");

            var camlIntervals = {
                "month": "<Month />",
                "week": "<Week />"
            };

            /* 
            CAML query for recurring events takes two params (1) Date e.g. 2016-02-04T12:00:00Z and (2) <Month /> or <Week />
            Results not intuitive: 
            9/14/2016	<Month/>	returns events 8/25/2016 to 10/8/2016
            12/14/2016	<Month />	returns events 11/24/2016 to 1/8/2017
            1/18/2017	<Month/>	returns events 12/25/2016 to 2/08/2017
            2/15/2017	<Month/>	returns events 1/25/2017 to 3/08/2017

            3/5/2017	<Week/>	returns events 2/26/2017 to 3/5/2017 (Sunday)
            3/6/2017	<Week/>	returns events 3/5/2017 to 3/12/2017 (Monday)
            3/8/2017	<Week/>	returns events 3/5/2017 to 3/12/2017 (Wednesday)
            3/12/207	<Week/>	returns events 3/5/2017 to 3/12/2017 (Sunday)
            */

            var getListItemsSoap = 
                "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body><GetListItemChangesSinceToken xmlns='http://schemas.microsoft.com/sharepoint/soap/'><listName>Calendar</listName><viewName></viewName><query><Query><Where><DateRangesOverlap><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='RecurrenceID' /><Value Type='DateTime'>"+ camlIntervals[intervalUnit]+"</Value></DateRangesOverlap></Where><OrderBy><FieldRef Name='EventDate' /></OrderBy></Query></query><viewFields><ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='Location' /><FieldRef Name='Description' /><FieldRef Name='Category' /><FieldRef Name='fRecurrence' /><FieldRef Name='RecurrenceData' /><FieldRef Name='fAllDayEvent' /><FieldRef Name='Organization' /></ViewFields></viewFields><rowLimit>300</rowLimit><queryOptions><QueryOptions><CalendarDate>"
                +camlCalendarDate+"</CalendarDate><ExpandRecurrence>TRUE</ExpandRecurrence><RecurrenceOrderBy>TRUE</RecurrenceOrderBy><DatesInUtc>True</DatesInUtc><ViewAttributes Scope='RecursiveAll'/></QueryOptions></queryOptions></GetListItemChangesSinceToken></soap:Body></soap:Envelope>";
            
            return $http({
                url: _spPageContextInfo.webServerRelativeUrl +"/_vti_bin/Lists.asmx",
                method: "POST",
                data: getListItemsSoap,
                headers: {
                    "Accept": "application/xml, text/xml, */*; q=0.01",
                    "Content-Type": 'text/xml; charset="utf-8"'
                }
            })
            .then(function(response){
                var events = [];
                $(response.data).find("listitems").find("[ows_ID]").each(function () {    
                    events.push(convertToFullCalendarEvent($(this)));   
                });

                if(organizationFilter){
                    events = _.filter(events, {organization: organizationFilter});
                }

                return events;
            });
        }
    }
})();

/* Controller: MissionTrackerController */
(function () {
    'use strict';
    //nicer looking plugin found here but requires bootstrap: http://www.dijit.fr/demo/angular-weekly-scheduler/
    angular
        .module('app.core')
        .run(registerMissionTrackerRoute)
        .controller('MissionTrackerController', MissionTrackerController);

    registerMissionTrackerRoute.$inject = ['config', 'routerHelper'];
    function registerMissionTrackerRoute(config, routerHelper) {
        routerHelper.configureStates(getStates());

        function getStates() {
            return [
                {
                    state: 'missionTracker',
                    config: {
                        url: '/missionTracker',
                        templateUrl: config.baseUrl + '/assets/missionTracker.html',
                        controller: 'MissionTrackerController',
                        controllerAs: 'vm',
                        title: 'Mission Tracker'
                    }
                }
            ];
        }
    }

    MissionTrackerController.$inject = ['$q', '_', 'logger', 'MissionTrackerRepository'];
    function MissionTrackerController($q, _, logger, MissionTrackerRepository) {
        var vm = this;

        activate();

        function activate() {
            initTabs();
            $q.all([
                    getDataForVerticalTimeline(),
                    getDataForProcess()
                ])
                .then(function (data) {
                    vm.missionLifecycleEvents = data[0];
                    vm.routingSteps = data[1];
                    logger.info('Activated Mission Tacker View');
                });
        }

        function initTabs() {
            vm.tabConfig = {
                selectedSize: "large",
                selectedType: "tabs",
                pivots: [
                    { title: "Timeline" },
                    { title: "Products" },
                    { title: "Product Chop" }
                ],
                selectedPivot: { title: "Timeline" },
                menuOpened: false
            }
            vm.openMenu = function () {
                vm.tabConfig.menuOpened = !vm.tabConfig.menuOpened;
            }
        }

        
        function getDataForVerticalTimeline(){
            var staticData = [
                {
                    direction: 'right',
                    subject: 'Born on this date',
                    message: 'Lodash makes JavaScript easier by taking the hassle out of working with arrays, numbers, objects, strings, etc. Lodash’s modular methods are great',
                    moment: moment()
                },
                {
                    direction: 'left',
                    subject: 'Got footprint',
                    message: 'When choosing a motion for side panels, consider the origin of the triggering element. Use the motion to create a link between the action and the resulting UI.',
                    moment: moment().add(1, 'days')
                }       
            ];
            return $q.when(staticData);
        }

        function getDataForProcess(){
            var staticData = [
                {
                    status: 'complete',
                    text: "Shift Created"
                },
                {
                    status: 'complete',
                    text: "Email Sent"
                },
                {
                    status: 'incomplete',
                    text: "SIC Approval"
                },
                {
                    status: '',
                    text: "Shift Completed"
                }
            ];
            return $q.when(staticData);
        }

        



    }
})();

/* Controller: EditNavController */
(function () {
    angular
        .module('app.core')
        .run(registerEditNavRoute)
        .controller('EditNavController', EditNavController);

    registerEditNavRoute.$inject = ['config', 'routerHelper'];
    function registerEditNavRoute(config, routerHelper) {
        routerHelper.configureStates(getStates());

        function getStates() {
            return [
                {
                    state: 'editNav',
                    config: {
                        url: '/editNav',
                        templateUrl: config.baseUrl + '/assets/editnav.html',
                        controller: 'EditNavController',
                        controllerAs: 'vm',
                        title: 'Edit Navigation'
                    }
                }
            ];
        }
    }

    EditNavController.$inject = ['$q', '$timeout', '_', 'logger'];
    function EditNavController($q, $timeout, _, logger) {
        var vm = this;

        var newId = 1;
        vm.ignoreChanges = false;
        vm.newNode = {};
        vm.originalData = [
            { id: 'ajson1', parent: '#', text: 'Simple root node', state: { opened: true } },
            { id: 'ajson2', parent: '#', text: 'Root node 2', state: { opened: true } },
            { id: 'ajson3', parent: 'ajson2', text: 'Child 1', state: { opened: true } },
            { id: 'ajson4', parent: 'ajson2', text: 'Child 2', state: { opened: true } }
        ];
        vm.treeData = [];
        angular.copy(vm.originalData, vm.treeData);
        vm.treeConfig = {
            core: {
                multiple: false,
                animation: true,
                error: function (error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                },
                check_callback: true,
                worker: true
            },
            types: {
                default: {
                    icon: 'glyphicon glyphicon-flash'
                },
                star: {
                    icon: 'glyphicon glyphicon-star'
                },
                cloud: {
                    icon: 'glyphicon glyphicon-cloud'
                }
            },
            version: 1,
            plugins: ['dnd', 'contextmenu']
        };


        vm.reCreateTree = function () {
            vm.ignoreChanges = true;
            angular.copy(this.originalData, this.treeData);
            vm.treeConfig.version++;
        };

        vm.simulateAsyncData = function () {
            vm.promise = $timeout(function () {
                vm.treeData.push({ id: (newId++).toString(), parent: vm.treeData[0].id, text: 'Async Loaded' })
            }, 3000);
        };

        vm.addNewNode = function () {
            vm.treeData.push({ id: (newId++).toString(), parent: vm.newNode.parent, text: vm.newNode.text });
        };

        this.setNodeType = function () {
            var item = _.findWhere(this.treeData, { id: this.selectedNode });
            item.type = this.newType;
            console.log('Changed the type of node ' + this.selectedNode);
        };

        this.readyCB = function () {
            $timeout(function () {
                vm.ignoreChanges = false;
                console.log('Js Tree issued the ready event');
            });
        };

        this.createCB = function (e, item) {
            $timeout(function () { console.log('Added new node with the text ' + item.node.text) });
        };

        this.applyModelChanges = function () {
            return !vm.ignoreChanges;
        };

        activate();

        function activate() {
            fetchData()
                .then(function (data) {
                    logger.info('Activated Edit Nav View');
                });
        }

        function fetchData() {
            var staticData = [];
            return $q.when(staticData);
        }

    }
})();

/* Directive: exerciseCalendar */
(function () {
    angular
        .module('app.core')
        .directive('exerciseCalendar', exerciseCalendar);

    exerciseCalendar.$inject = ['CalendarRepository','spContext'];
    function exerciseCalendar(CalendarRepository, spContext) {
        /* 
        USAGE: <exercise-calendar list-name=""></exercise-calendar>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
            },
            link:link
        };
        return directiveDefinition;

        function buildHeroButtonHtml(){
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function link(scope, elem, attrs) {
            $(elem).before(buildHeroButtonHtml());
            $(elem).fullCalendar({
                // Assign buttons to the header of the calendar. See FullCalendar documentation for details.
                header: {
                    left:'prev,next today',
                    center: 'title',
                    right: 'month, agendaWeek'
                },
                defaultView: "month", // Set the default view to month
                firstHour: "0", // Set the first visible hour in agenda views to 5 a.m.
                weekMode: "liquid", // Only display the weeks that are needed
                theme: false, // Use a jQuery UI theme instead of the default fullcalendar theme
                editable: false, // Set the calendar to read-only; events can't be dragged or resized

                // Add events to the calendar. This is where the "magic" happens!
                events: function( start, end, timezone, callback ) {
                    var qsParams = _.parseQueryString(location.search);
                    var calView = $(elem).fullCalendar('getView');
                    CalendarRepository.getEvents(start, end, calView.intervalUnit, (qsParams.org || ""))
                        .then(function(data){
                            callback(data);
                        })
                    
                }
	        });

        }
    }

})();

/* Directive: missionTimeline */
(function () {
    angular
        .module('app.core')
        .directive('missionTimeline', missionTimeline);
    
    missionTimeline.$inject = ['Mission', 'MissionTrackerRepository', 'spContext'];
    function missionTimeline(Mission, MissionTrackerRepository, spContext) {
        /* 
        USAGE: <timeline></timeline>
        */
        var directiveDefinition = {
            link: link,
            restrict: 'E',
            scope:{
                showNewItemLink: '='
            },
            template: buildHeroButtonHtml() + buildCheckboxHtml() + buildLegendHtml() + '<div class="mission-timeline" ng-show="missions.length"></div>' + buildMessageBarHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            var options = {
                stack: false,
                start: moment(),
                end: moment().add(15, 'days'),
                editable: false,
                margin: {
                    item: 5, // minimal margin between items
                    axis: 3   // minimal margin between items and the axis
                },
                orientation: 'top'
            };
            var items = [];
            scope.showPastMissions = false;
            scope.statusColorLegend = [
			    	{ name: "Initial Targeting", cssStyle : 'background-color:#FFFF00; border-color: #FFFF00; color: #000;'}, //yellow,black
			        { name: "JPG Assigned", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;'}, //yellow,black
					{ name: "COA Approved", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;'}, //yellow,black
					{ name: "CONOP Received - In Chop", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;'}, //yellow,black
					
					{ name: "CONOP Disapproved", cssStyle: 'background-color:#ff0000; border-color: #ff0000; color: #fff;'}, //red,white	
					
					{ name: "CONOP Approved", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;'}, //green,black
					{ name: "FRAGO In-Chop", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;'}, //green,black
					{ name: "FRAGO Released", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;'}, //green,black
					{ name: "EXORD Released", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;'}, //green,black

					{ name: "Mission In Progress", cssStyle: 'background-color:#ffa500; border-color: #ffa500; color: #000;'}, //orange, black
					
                    { name: "Return to Base", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;'}, //blue, black		
					{ name: "QuickLook", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;'}, //blue, black	
					{ name: "StoryBoard", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;'}, //blue, black
					{ name: "OPSUM", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;'}, //blue, black

					{ name: "Mission Closed", cssStyle: 'background-color:#000; border-color: #000; color: #fff;'} //black, white
		    ];

            var qsParams = _.parseQueryString(location.search);
            scope.selectedOrg = (qsParams.org || ""); 

            MissionTrackerRepository.getByOrganization(qsParams.org).then(function(data){ 
                items = _.map(data, function(item){ return new Mission(item); });
                renderTimeline(items)
            })

            scope.$watch('showPastMissions', function () {
                renderTimeline(items);
            })

            var timeline = null;
            function renderTimeline(items) {
                if(timeline){
                    timeline.destroy();
                }
                
                var now = moment();
                scope.missions = _.filter(items, function(item){
                    return scope.showPastMissions || (!item.ExpectedTermination || moment(item.ExpectedTermination) > now); 
                });

                var groups = new vis.DataSet(_.map(scope.missions, function (item) { return { id: item.Id, content: item.Identifier }; }));
                var items = new vis.DataSet(
                    _.map(scope.missions, function (item) {
                        return {
                            id: item.Id,
                            group: item.Id,
                            start: moment(item.ExpectedExecution),
                            end: moment(item.ExpectedTermination),
                            style: _.find(scope.statusColorLegend, {name: item.Status}).cssStyle,
                            title: item.buildOnHoverText()
                        };
                    })
                );

                timeline = new vis.Timeline($(elem).find(".mission-timeline").get(0), null, options);
                timeline.setGroups(groups);
                timeline.setItems(items);
                timeline.on('click', function(props){
                    if(props.what === 'group-label' || props.what === 'item'){
                        var url = _spPageContextInfo.webServerRelativeUrl + '/Lists/MissionTracker/DispForm.aspx?ID=' + props.group + "&Source=" + document.location.href;
                        document.location.href = url;
                        //window.open(url , '_blank');    
                    }
                })

                
            }
        }

        function buildLegendHtml(){
            var html = '<div style="position:relative;">';
            html += buildShowLegendHyperlink();
            html += buildCalloutHtml();
            html += "</div>";
            return html;

            function buildCalloutHtml(){
                var html = 
                    '<div class="ms-Callout ms-Callout--arrowLeft" style="position:absolute;left:80px;top:-56px;" ng-show="showLegend">\
                        <div class="ms-Callout-main">\
                            <div class="ms-Callout-header">\
                                <p class="ms-Callout-title">Mission Statuses</p>\
                            </div>\
                            <div class="ms-Callout-inner">\
                                <div class="ms-Callout-content">\
                                    <p class="ms-Callout-subText ms-Callout-subText--s">\
                                        <table>\
                                            <tr ng-repeat="status in statusColorLegend">\
                                                <td style="{{status.cssStyle + \';width:25px;\'}}">&nbsp;</td>\
                                                <td>{{status.name}}</td>\
                                            </tr>\
                                        </table>\
                                    </p>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
                return html;
            }

            function buildShowLegendHyperlink(){
                return '<a ng-mouseover="showLegend = true" ng-mouseleave="showLegend = false" ng-show="missions.length">Show Legend</a>';
            }
        }

        function buildCheckboxHtml(){
            var html = '<uif-choicefield-option uif-type="checkbox" value="value1" ng-model="showPastMissions" ng-true-value="true" ng-false-value="false"> Show Past Missions</uif-choicefield-option>';
            return html;
        }       

        function buildHeroButtonHtml(){
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/MissionTracker/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function buildMessageBarHtml(){
            return '<uif-message-bar ng-show="missions.length === 0"> <uif-content>No {{showPastMissions ? "past/ongoing" : "ongoing" }} {{selectedOrg}} missions</uif-content> </uif-message-bar>';
        }
    }
})();

/* Directive: verticalTimeline */
(function () {
    angular
        .module('app.core')
        .directive('verticalTimeline', verticalTimeline);

    function verticalTimeline() {
        /* 
        USAGE: <vertical-timeline items=""></vertical-timeline>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                items: "="
            },
            template: 
                '<ul class="vertical-timeline">\
                    <li ng-repeat="item in items | orderBy: \'moment\': \'desc\'">\
                        <div ng-class="(item.direction === \'right\' ? \'direction-r\' : \'direction-l\' )">\
                            <div class="timeline-flag-wrapper">\
                                <span class="timeline-flag">{{item.subject}}</span>\
                                <span class="time-wrapper"><span class="time">{{item.moment.format("DD MMM YY")}}</span></span>\
                            </div>\
                            <div class="desc">{{item.message}}</div>\
                        </div>\
                    </li>\
                </ul>'
        };
        return directiveDefinition;
    }

})();

/* Directive: routingProcessVisualization */
(function () {
    angular
        .module('app.core')
        .directive('routingProcessVisualization', routingProcessVisualization);

    function routingProcessVisualization() {
        /* 
        USAGE: <routing-process-visualization steps=""></routing-process-visualization>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                steps: "="
            },
            template: 
                '<ul class="horizontal-timeline">\
                    <li ng-repeat="step in steps" class="li" ng-class="{\'complete\': step.status===\'complete\', \'incomplete\': step.status===\'incomplete\' }">\
                        <div class="status">\
                            <h4>\
                                {{step.text}}\
                            </h4>\
                        </div>\
                    </li>\
                </ul>'
        };
        return directiveDefinition;
    }

})();

/* Directive: rfibutton */
(function () {
    angular
        .module('app.core')
        .directive('rfibutton', rfibutton);

    function rfibutton() {
        /* 
        SP2013 display template will render ActionsHtml column (anytime it appears in LVWP) as:
            <a class="custombtn" rfibutton="" data-id="1">Respond</a>
        */
        var directiveDefinition = {
            restrict: 'A',
            scope: {},
            link: link
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            var $elem = $(elem);
            var listItemID = $elem.attr("data-id");
            var buttonText = $elem.text();

            $elem.on('click', function(){
                var redirect = _spPageContextInfo.webServerRelativeUrl + "/Lists/RFI/EditForm.aspx?action="+buttonText+"&ID="+listItemID+"&Source="+document.location.href;
                window.location.href = redirect; 
            });
        }
    }

})();

/* Directive: initiatechopbutton */
(function () {
    angular
        .module('app.core')
        .directive('initiatechopbutton', initiatechopbutton);

    function initiatechopbutton(MissionDocument, MissionDocumentRepository) {
         /* 
        SP2013 display template will render ChopProcess column (anytime it appears in LVWP) as:
            <a class="custombtn" initiatechopbutton="" data-id="1" data-chop-process='10/7/2016 19:08'>Chop</a>
        */
        var directiveDefinition = {
            restrict: 'A',
            scope: {},
            link: link,
            replace: true,
            template: "<a ng-class='getButtonClass()' title='{{getHoverText()}}' ng-click='initiateChoppingProcess()'>Chop</a>"
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            var $elem = $(elem);

            var tempClass = $elem.attr("class");
            var tempID = $elem.attr("data-id");
            var chopProcessTimestamp = $elem.attr("data-chop-process");
            $elem.removeClass(tempClass);
            $elem.removeAttr("data-id");
            $elem.removeAttr("data-chop-process");
            
            scope.listItemID = tempID
            scope.btnClass = tempClass;
            scope.chopProcessTimestamp = chopProcessTimestamp;
            scope.getHoverText = function(){
                return (!!scope.chopProcessTimestamp) ? 'Process initiated on ' + scope.chopProcessTimestamp : 'Click to start chop process now';
            }

            scope.getButtonClass = function(){
                return (!!scope.chopProcessTimestamp) ? 'disabled-custombtn' : 'custombtn';
            }

            scope.initiateChoppingProcess = function(){
                if(!!scope.chopProcessTimestamp){ return; }

                MissionDocumentRepository.getById(scope.listItemID)
                    .then(function(data){
                        var missionDoc = new MissionDocument(data);
                        missionDoc.initiateChop().then(onChopStartedSuccessfully);
                    })
                function onChopStartedSuccessfully(item){
                    scope.chopProcessTimestamp = item.ChopProcess;
                    //write service for SPLogger, and use it here
                }
            }
        }
    }

})();

/* Directive: scrollableCurrentOpsSummary */
(function () {
    angular
        .module('app.core')
        .directive('scrollableCurrentOpsSummary', scrollableCurrentOpsSummary);

        scrollableCurrentOpsSummary.$inject = ['$timeout', 'config'];
        function scrollableCurrentOpsSummary($timeout, config) {
      
	        function controller() {
                var vm = this;
				var slideNames = ['alpha', 'bravo', 'charlie', 'delta'];
				vm.currentVisibleSlide = 'alpha';				

			
				vm.nextSlide = function(){
					var indexOfCurrentSlide = _.indexOf(slideNames, vm.currentVisibleSlide);
					var indexForNextSlide = (indexOfCurrentSlide === slideNames.length-1) ? 0 :  indexOfCurrentSlide+1;
					vm.currentVisibleSlide = slideNames[indexForNextSlide];
					console.log('next slide clicked ' + new Date());
				};
				
				
				vm.prevSlide = function(){
					var indexOfCurrentSlide = _.indexOf(slideNames, vm.currentVisibleSlide);
					var indexForNextSlide = (indexOfCurrentSlide === 0) ? slideNames.length-1 :  indexOfCurrentSlide-1;
					vm.currentVisibleSlide = slideNames[indexForNextSlide];
				};
				
				
				vm.slideShowTimer = null;
				
				function startSlideShowTimer(){
					vm.slideShowTimer = $timeout(
						function(){
							vm.nextSlide();
							vm.slideShowTimer = $timeout(startSlideShowTimer, 2000);
						},
						2000);
				};
				
				startSlideShowTimer();
				
				vm.startShow = function(){
					startSlideShowTimer();				
				};
				
				vm.stopShow = function(){
					$timeout.cancel(vm.slideShowTimer);	
					vm.slideShowTimer = null;			
				};    
		    };    
		       
            return {
                restrict: 'EA', //Default for 1.3+
                scope: {
                    datasource: '=',
                    add: '&',
                },
                controller: controller,
                controllerAs: 'vm',
                bindToController: true, //required in 1.3+ with controllerAs
                templateUrl: config.baseUrl + '/assets/current-operations-summary.html'
            };
        }
})();

/* Controller: SoccAspxController */
(function () {
    angular
        .module('app.core')
        .controller('SoccAspxController', SoccAspxController);



    SoccAspxController.$inject = ['_', 'MissionTrackerRepository'];
    function SoccAspxController(_, MissionTrackerRepository) {
        var vm = this;
        
    }
})();

/* Controller: RfiController */
(function () {
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
                        url: '/rfi/:tabIndex',
                        templateUrl: config.baseUrl + '/assets/rfi.html',
                        controller: 'RfiController',
                        controllerAs: 'vm',
                        title: 'Request for Information'
                    }
                }
            ];
        }
    }

    RfiController.$inject = ['$scope', '$state', '$stateParams', '_', 'logger', 'RFI', 'RfiRepository'];
    function RfiController($scope, $state, $stateParams, _, logger, RFI, RFIRepository){
        var vm = this;

        activate();

        function activate() {
            initTabs();
            fetchData().then(function () {
                logger.info('Activated RFI View');
            });
        }

        function initTabs() {
            var pivots = [
                { title: "Open" },
                { title: "Closed" },
                { title: "My RFIs" },
                { title: "Manage RFIs" }
            ];

            var selectedIndex = (!$stateParams.tabIndex || $stateParams.tabIndex >= pivots.length) ? 0 : $stateParams.tabIndex;
        
            vm.tabConfig = {
                selectedSize: "large",
                selectedType: "tabs",
                pivots: pivots,
                selectedPivot: pivots[selectedIndex],
                menuOpened: false
            }
            vm.openMenu = function () {
                vm.tabConfig.menuOpened = !vm.tabConfig.menuOpened;
            }

        }

        function fetchData() {
            return RFIRepository.getAll()
                .then(function (data) {
                    vm.rfiList = _.map(data, function (item) { return new RFI(item); })
                    _.each(vm.rfiList, function (item) {
                        console.log(item);
                        item.complete();
                    });
                })
        }
    }
})();

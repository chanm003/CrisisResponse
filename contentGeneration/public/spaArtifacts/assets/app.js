(function () {
    'use strict';
    var globalConfig = {
        appErrorPrefix: '[Exercise Application Error] ',
        appTitle: 'Exercise Application',
        showDebugToasts: true
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
        'ngRoute',
        'ngplus'
    ])
        .constant('_', extendLoDash(_))
        .constant('SPUtility', configSPUtility())
        .constant('Lobibox', Lobibox)
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
        'ngRoute',
        'blocks.logger'
    ])
        .config(registerRoutes);

    angular.module('blocks.logger', [])
        .factory('logger', loggerService);

    angular.module('app.layout', [
        'app.core'
    ])
        .controller('ShellController', ShellController);

    function configSPUtility() {
        SPUtility.Setup({
            'timeFormat': '24HR'
        });
        return SPUtility;
    }

    configureCoreModule.$inject = ['$logProvider', '$sceDelegateProvider', 'exceptionHandlerProvider', 'Lobibox'];
    function configureCoreModule($logProvider, $sce, exceptionHandlerProvider, Lobibox) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        exceptionHandlerProvider.configure(globalConfig.appErrorPrefix);
        Lobibox.notify.DEFAULTS = $.extend({}, Lobibox.notify.DEFAULTS, {
            iconSource: 'fontAwesome',
            sound: false,
            size: 'mini',
            rounded: true,
            //position: 'right top',
            delayIndicator: false
        });

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
            logger.error(exception.message, { data: errorData });
        };
    }

    function extendLoDash(_) {
        _.getQueryStringParam = function (name, url) {
            if (!url) {
                url = window.location.href;
            }
            url = decodeURIComponent(url);
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        _.extractOrgFromQueryString = function () {
            // /TF16/Lists/MissionTracker/NewForm.aspx?Source=/TF16/SitePages/socc.aspx?org=SOCC
            var isChildWindow = window.parent.location.href !== window.location.href;
            var selectedOrg = (isChildWindow) ? _.getQueryStringParam("org", window.parent.location.href) : _.getQueryStringParam("org", window.location.href);
            return selectedOrg;
        }

        return _;
    }

    loggerService.$inject = ['$log', 'config', 'Lobibox'];
    function loggerService($log, config, Lobibox) {
        var service = {
            showToasts: true,

            error: error,
            info: info,
            success: success,
            warning: warning,

            // straight to console; bypass Lobibox
            log: $log.log
        };

        return service;
        /////////////////////

        function showToast(message, toastType, opts) {
            if (config.showDebugToasts || (opts && opts.alwaysShowToEnduser)) {
                opts = angular.extend({}, { msg: message }, opts);
                Lobibox.notify(toastType, opts);
            }
        }

        function error(message, opts) {
            showToast(message, 'error', opts);
            var data = (opts && opts.data) || "";
            $log.error('Error: ' + message, data);
        }

        function info(message, opts) {
            showToast(message, 'info', opts);
            var data = (opts && opts.data) || "";
            $log.info('Info: ' + message, data);
        }

        function success(message, opts) {
            showToast(message, 'success', opts);
            var data = (opts && opts.data) || "";
            $log.info('Success: ' + message, data);
        }

        function warning(message, opts) {
            showToast(message, 'warning', opts);
            var data = (opts && opts.data) || "";
            $log.warn('Warning: ' + message, data);
        }
    }

    registerRoutes.$inject = ['$routeProvider'];
    function registerRoutes($routeProvider){

        $routeProvider
            .when('/missiontracker/:tabIndex?', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/missionTracker.html',
                controller: 'MissionTrackerController as vm'
            })
            .when('/rfi/:tabIndex?', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/rfi.html',
                controller: 'RfiController as vm'
            })
            .when('/editnav', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/editnav.html',
                controller: 'EditNavController as vm'
            })
            .when('/sandbox', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/devsandbox.html',
                controller: 'DeveloperSandboxController as vm'
            })
            .otherwise({
                controller : function(){
                    
                }, 
                template : '<uif-message-bar uif-type="error"><uif-content>404 Not Found (or currently under construction)</uif-content></uif-message-bar>'
            });
    }

    ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger'];
    function ShellController($rootScope, $timeout, config, logger) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        $rootScope.showSplash = true;


        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!');
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

        var defaultHeaders = {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-Requested-With': 'XMLHttpRequest'
        }

        service.SP2013REST = {
            selectForCommonDocumentFields: 'Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title,File/CheckOutType,File/MajorVersion,File/Name,File/ServerRelativeUrl,File/TimeCreated,File/TimeLastModified',
            expandoForCommonDocumentFields: 'Author,Editor,File',
            selectForCommonListFields: 'Attachments,Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title',
            expandoForCommonListFields: 'Author,Editor'
        }
        service.constructNgResourceForRESTCollection = constructNgResourceForRESTCollection;
        service.constructNgResourceForRESTResource = constructNgResourceForRESTResource;
        service.makeMultiChoiceRESTCompliant = makeMultiChoiceRESTCompliant;
        service.makeMomentRESTCompliant = makeMomentRESTCompliant;
        service.makeHyperlinkFieldRESTCompliant = makeHyperlinkFieldRESTCompliant;
        service.getContextFromEditFormASPX = getContextFromEditFormASPX;
        service.getSelectedUsersFromPeoplePicker = getSelectedUsersFromPeoplePicker;
        service.getIdFromLookupField = getIdFromLookupField;
        service.defaultHeaders = defaultHeaders;

        service.htmlHelpers = {};
        service.htmlHelpers.buildHeroButton = function (text, href, ngShowAttrValue) {
            var html =
                '<table dir="none" cellpadding="0" cellspacing="0" border="0" ng-show="' + ngShowAttrValue + '">\
                    <tbody>\
                        <tr>\
                            <td class="ms-list-addnew ms-textXLarge ms-list-addnew-aligntop ms-soften">\
                                <a class="ms-heroCommandLink ms-hero-command-enabled-alt" href="'+ href + '">\
                                    <span class="ms-list-addnew-imgSpan20">\
                                        <img src="/_layouts/15/images/spcommon.png?rev=44" class="ms-list-addnew-img20">\
                                    </span>\
                                    <span>'+ text + '</span>\
                                </a>\
                            </td>\
                        </tr>\
                    </tbody>\
                </table>';
            return html;
        }

        init();

        function constructNgResourceForRESTCollection(opts) {
            var defaultPostheaders = angular.extend({}, defaultHeaders, { 'X-RequestDigest': service.securityValidation });
            return $resource(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + opts.listName + "')/items",
                {},
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': opts.fieldsToSelect,
                            '$expand': opts.fieldsToExpand
                        },
                        headers: defaultHeaders
                    },
                    post: {
                        method: 'POST',
                        headers: defaultPostheaders
                    }
                });
        }

        function constructNgResourceForRESTResource(opts) {
            var ifMatchHeaderVal = (!!opts.item.__metadata && !!opts.item.__metadata.etag) ? opts.item.__metadata.etag : "*";
            var defaultPostheaders = angular.extend({}, defaultHeaders, {
                            'X-RequestDigest': service.securityValidation,
                            'X-HTTP-Method': 'MERGE',
                            'If-Match': ifMatchHeaderVal
                        });
            var httpDeleteHeaders = angular.extend({}, defaultHeaders, {
                            'X-RequestDigest': service.securityValidation,
                            'If-Match': '*'
                        });
            return $resource(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('" + opts.listName + "')/items(:itemId)",
                { itemId: opts.item.Id },
                {
                    get: {
                        method: 'GET',
                        params: {
                            '$select': opts.fieldsToSelect,
                            '$expand': opts.fieldsToExpand
                        },
                        headers: defaultHeaders
                    },
                    post: {
                        method: 'POST',
                        headers: defaultPostheaders
                    },
                    delete: {
                        method: 'DELETE',
                        headers: httpDeleteHeaders
                    }
                });
        }

        function getContextFromEditFormASPX() {
            /**
             * on EditForm.aspx "Organization" should be rendered as read-only label, so no dropdown
             * Assumptions about what SP2013 would included inside EditForm.aspx: 
             * - there exists a e.g. <div id="WebPartWPQ1"></div>
             * - there exists a global variable e.g. var WPQ1FormCtx = {ListData: {}};
            */
            var listItem = null;
            var listFormDiv = $("table.ms-formtable").closest("[id^=WebPartWPQ]");
            var globalVarOnEditFormAspx = listFormDiv.attr("id").replace("WebPart", "") + "FormCtx";
            if (window[globalVarOnEditFormAspx]) {
                listItem = window[globalVarOnEditFormAspx].ListData;
            }
            return listItem;
        }

        function getIdFromLookupField(internalName) {
            var selectedId = null;
            var spUtilityField = SPUtility.GetSPFieldByInternalName(internalName);

            if (spUtilityField.Textbox) {
                //could be a relic of SP2010
                //rendering of control in NewForm.aspx/EditForm.aspx depended on how many items lookup list have
            } else {
                var val = $(spUtilityField.ControlsRow.cells[1]).find("option:selected").val()
                if (val !== "0") {
                    selectedId = parseInt(val, 10);
                }
            }
            return selectedId;
        }

        function getPeoplePickerInstance(internalName) {
            var containerDiv = $("[id^='" + internalName + "_'][spclientpeoplepicker]");
            if (containerDiv.length) {
                var editor = containerDiv.find("[data-sp-peoplepickereditor]");
                var picker = SPClientPeoplePicker.SPClientPeoplePickerDict[containerDiv[0].id];
                return {
                    picker: picker,
                    editor: editor
                };
            }
        }

        function getSelectedUsersFromPeoplePicker(internalName) {
            var pickerInstance = getPeoplePickerInstance(internalName);
            if (pickerInstance) {
                return pickerInstance.picker.GetAllUserInfo();
            } else {
                return [];
            }
        }

        function init() {
            refreshSecurityValidation();
        }

        function makeHyperlinkFieldRESTCompliant(model, propName) {
            if (angular.isString(model[propName])) {
                model[propName] = {
                    __metadata: {
                        type: "SP.FieldUrlValue"
                    },
                    Description: "Document",
                    Url: model[propName]
                }
            }
        }

        function makeMomentRESTCompliant(model, propName) {
            if (model[propName] === undefined) { return; }
            if (model[propName].isValid()) {
                model[propName] = model[propName].toISOString();
            }
        }

        function makeMultiChoiceRESTCompliant(model, propName) {
            if (angular.isArray(model[propName])) {
                model[propName] = {
                    "__metadata": {
                        "type": "Collection(Edm.String)"
                    },
                    "results": model[propName]
                }
            }
        }

        function refreshSecurityValidation() {
            SP.SOD.executeOrDelayUntilScriptLoaded(performHttpPost, 'sp.js');
            
            function performHttpPost(){
                var siteContextInfoResource = $resource(_spPageContextInfo.webServerRelativeUrl + '/_api/contextinfo?$select=FormDigestValue', {}, {
                    post: {
                        method: 'POST',
                        headers: defaultHeaders
                    }
                });

                // request validation
                siteContextInfoResource.post({}, success, fail);
            }

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
                logger.error("response from contextinfo: " + error);
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
                        this[prop] = remap(data, prop);
                    }
                }
            }
        }

        function remap(item, propName) {
            var funcMap = {
                "Created": function (item, propName) {
                    return moment(item[propName]);
                },
                "DateClosed": function (item, propName) {
                    return moment(item[propName]);
                },
                "LTIOV": function (item, propName) {
                    return moment(item[propName]);
                }
            }

            if (funcMap[propName]) {
                return funcMap[propName](item, propName);
            } else {
                return item[propName];
            }
        }

        RFI.prototype.save = function (formState) {
            return RfiRepository.save(this, formState);
        }

        RFI.prototype.setHiddenFieldsPriorToSave = function (formState, rfiOnAspxLoad) {
            if (formState === "reopen") {
                checkIfRfiNeedsToBeReopened(this, rfiOnAspxLoad);
            }

            if (formState === 'respond') {
                checkIfRfiShouldBeClosed(this, rfiOnAspxLoad);
            }

            function checkIfRfiNeedsToBeReopened(rfi, rfiOnAspxLoad) {
                if (rfiOnAspxLoad.ResponseSufficient === "Yes") {
                    //on load Response Sufficient was "Yes"
                    //but since they navigated to this page we should set it to "No" for them
                    rfi.ResponseSufficient = "No";
                    rfi.DateClosed = null;
                    rfi.Status = "Open";
                }
            }

            function checkIfRfiShouldBeClosed(rfi, rfiOnAspxLoad) {
                if (!rfiOnAspxLoad.DateClosed && rfi.DateClosed.isValid()) {
                    //on load Date Closed was blank, now it is populated with valid date
                    rfi.Status = "Closed";
                    rfi.ResponseSufficient = "Yes";
                }
            }
        }

        RFI.prototype.validate = function (formState) {
            var errors = [];

            if (formState === 'new' || formState === 'edit') {
                if (!this.Title) {
                    errors.push("Title is a required field");
                }

                if (!this.Priority) {
                    errors.push("Priority is a required field");
                }

                if (this.PocNameSelectedKeys.length === 0) {
                    errors.push("POC Name is a required field");
                }

                if (!this.PocPhone) {
                    errors.push("POC Phone is a required field");
                }

                if (!this.PocOrganization) {
                    errors.push("POC Organization is a required field");
                }

                if (!this.RecommendedOPR) {
                    errors.push("Recommended OPR is a required field");
                }
            }

            if (formState === "reopen") {
                if (!this.InsufficientExplanation) {
                    errors.push("Insufficient Explanation is a required field");
                }
            }

            if (formState === 'respond') {
                if (this.RespondentNameSelectedKeys.length === 0) {
                    errors.push("Respondent Name is a required field");
                }
                if (!this.RespondentPhone) {
                    errors.push("Respondent Phone is a required field")
                }
                if (!this.ResponseToRequest) {
                    errors.push("Response to Request is a required field");
                }
            }

            return (errors.length) ? "\n\t-" + errors.join("\n\t-") : "";
        }


        return RFI;
    }
})();

/* Model: Message Traffic */
(function () {
    angular.module('app.models')
        .factory('MessageTraffic', MessageTrafficModel);

    MessageTrafficModel.$inject = ['MessageTrafficRepository'];
    function MessageTrafficModel(MessageTrafficRepository) {
        var MessageTraffic = function (data) {
            if (!data) {
                this.Id = undefined; //number
                this.Title = undefined; //string
                this.OriginatorSender = undefined; //string
                this.Receiver = undefined; //object {results: ['SOTG 10', 'SOTG 15', 'SOTG 25']} 
                this.DateTimeGroup = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.TaskInfo = undefined; //string
                this.Initials = undefined; //string or null
                this.Significant = undefined; //string
                this.Comments = undefined; //string or null
                this.LinkToMissionDocument = undefined; //object or null  (see notes below for object graph)
                this.__metadata = {
                    type: "SP.Data.MessageTrafficListItem"
                };
            } else {
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        this[prop] = data[prop];
                    }
                }
            }

            /**
             * URL Link 
             * {
                    __metadata: {
                        type: "SP.FieldUrlValue"
                    },
                    Description: "Google Search Engine",
                    Url: "http://www.google.com"
                }
             */
        }

        MessageTraffic.prototype.save = function () {
            return MessageTrafficRepository.save(this);
        }

        MessageTraffic.prototype.validate = function () {
            var errors = [];

            if (!this.Title) {
                errors.push("Title is a required field");
            }

            if (!this.OriginatorSender) {
                errors.push("Originator/Sender is a required field");
            }

            if (!this.Receiver || !this.Receiver.length) {
                errors.push("Receiver is a required field");
            }

            if (!this.DateTimeGroup || !this.DateTimeGroup.isValid()) {
                errors.push("Date Time Group is a required field");
            }

            if (!this.TaskInfo) {
                errors.push("Task/Info is a required field");
            }

            if (!this.Significant) {
                errors.push("Significant is a required field");
            }

            return (errors.length) ? "\n\t-" + errors.join("\n\t-") : "";
        }

        return MessageTraffic;
    }
})();

/* Model: Mission Document */
(function () {
    angular.module('app.models')
        .factory('MissionDocument', MissionDocumentModel);

    MissionDocumentModel.$inject = ['DocumentChopsRepository', 'MissionDocumentRepository'];
    function MissionDocumentModel(DocumentChopsRepository, MissionDocumentRepository) {
        var MissionDocument = function (data) {
            if (!data) {
                this.Id = undefined; //number
                this.Title = undefined; //string or null
                this.Organization = undefined; //string
                this.TypeOfDocument = undefined; //string
                this.MissionId = undefined; //integer or null
                this.FlaggedForSoacDailyUpdate = undefined; //string or null
                this.ChopProcess = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.VersionBeingChopped = undefined; //integer or null
                this.ChopRouteSequence = undefined; //string or null
                this.__metadata = {
                    type: "SP.Data.MissionDocumentsItem"
                };
            } else {
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        this[prop] = remap(data, prop);
                    }
                }
            }

            function remap(item, propName) {
                var funcMap = {
                    "Created": function (item, propName) {
                        return moment(item[propName]);
                    },
                    "Modified": function (item, propName) {
                        return moment(item[propName]);
                    }
                }

                if (funcMap[propName]) {
                    return funcMap[propName](item, propName);
                } else {
                    return item[propName];
                }
            }
        }

        MissionDocument.prototype.checkIn = function () {
            return MissionDocumentRepository.checkInFile(this);
        }

        MissionDocument.prototype.deriveRouteSequence = function (mission, orgConfig) {
            var sequence = "";
            if (mission && orgConfig) {
                var route = _.find(orgConfig.routes, { name: mission.ApprovalAuthority });
                if (route && route.sequence && route.sequence.length) {
                    this.ChopRouteSequence = route.sequence.join(';');
                }
            }
        }

        MissionDocument.prototype.initiateChop = function () {
            //convert model to DTO that will be used for save...HTTP MERGE should ignore any 'undefined'' props in the request body
            var dto = new MissionDocument();
            dto.Id = this.Id;
            dto.__metadata = this.__metadata;
            //_api/web/lists/getByTitle('Mission Documents')/items?$select=Id,MissionId,ChopProcess,VersionBeingChopped,ChopRouteSequence,File/MajorVersion&$expand=File
            dto.ChopProcess = (new Date()).toISOString();
            dto.MissionId = this.Mission.Id;
            dto.ChopRouteSequence = this.ChopRouteSequence;
            dto.VersionBeingChopped = (this.File.MajorVersion + 1);  //initiating the chop process itself should bump the version up by one
            return MissionDocumentRepository.save(dto);
        }

        MissionDocument.prototype.save = function () {
            return MissionDocumentRepository.save(this);
        }

        MissionDocument.prototype.validate = function () {
            var errors = [];

            var fileNameWithoutExtension = _.includes(this.FileLeafRef, '.') ? this.FileLeafRef.substr(0, this.FileLeafRef.lastIndexOf('.')) : this.FileLeafRef;
            if (!fileNameWithoutExtension) {
                errors.push("Name is a required field");
            }

            if (!this.Organization) {
                errors.push("Organization is a required field");
            }

            if (!this.TypeOfDocument) {
                errors.push("Type of Document is a required field");
            }

            return (errors.length) ? "\n\t-" + errors.join("\n\t-") : "";
        }

        MissionDocument.prototype.checkIfChoppingOutOfTurn = function (organizationName) {
            if (!this.chopProcessInfo) { throw "Chop Process has not been initiated"; }

            if (organizationName === this.chopProcessInfo.lastKnownLocationAlongRoute) {
                //no errors
                return null;
            }
            var routeStageNames = _.map(this.chopProcessInfo.routeStages, "name");
            var positionInChopSequence = _.indexOf(routeStageNames, organizationName);
            var positionOfCurrentLocation = _.indexOf(routeStageNames, this.chopProcessInfo.lastKnownLocationAlongRoute);

            if (positionInChopSequence < positionOfCurrentLocation) {
                return {
                    errorType: 'TooLate',
                    message: "This form is read-only.  Too late for " + organizationName + " to chop.  This is now sitting on the desk of the " + this.chopProcessInfo.lastKnownLocationAlongRoute
                };
            } else {
                var whoStillNeedsToApprove = routeStageNames.slice(positionOfCurrentLocation, positionInChopSequence).join(', ');
                return {
                    errorType: 'TooEarly',
                    message: "This document is not ready for " + organizationName + " to chop. It still needs to be approved by the following organization(s): " + whoStillNeedsToApprove
                };
            }
        }

        MissionDocument.prototype.createChop = function (org, orgRole, verdict, comments) {
            var dto = {
                DocumentId: (this.Id).toString(),
                Organization: org,
                OrganizationalRole: orgRole,
                Verdict: verdict,
                Comments: comments,
                __metadata: {
                    type: "SP.Data.DocumentChopsListItem"
                }
            };
            return DocumentChopsRepository.save(dto);
        }

        MissionDocument.prototype.refreshChopProcessInfo = function () {
            if (!this.ChopRouteSequence) {
                this.chopProcessInfo = null;
                return;
            }

            this.chopProcessInfo = {
                routeStages: buildRouteStages(this, jocInBoxConfig)
            };

            this.chopProcessInfo.overallChopStatus = deriveOverallChopStatus(this);
            this.chopProcessInfo.routeStepsVisualizationDataSource = buildRouteStepsVisualizationDataSource(this);

            var noLongerRequiresAction = (this.chopProcessInfo.overallChopStatus === "Approved" || this.chopProcessInfo.overallChopStatus === "Disapproved");

            if (noLongerRequiresAction) {
                this.chopProcessInfo.requiresDecisionFrom = null;
                this.chopProcessInfo.selectedRouteStage = null;
            } else {
                var stageThatMustTakeAction = findCommandThatMustTakeAction(this);
                this.chopProcessInfo.requiresDecisionFrom = stageThatMustTakeAction.name;
                this.chopProcessInfo.selectedRouteStage = stageThatMustTakeAction;
            }
            var lastKnownRouteStage = findLastKnownLocationAlongRoute(this);
            this.chopProcessInfo.lastKnownLocationAlongRoute = lastKnownRouteStage.name;
            if(!this.chopProcessInfo.selectedRouteStage){
                this.chopProcessInfo.selectedRouteStage = lastKnownRouteStage;
            }
        }

        function buildRouteStages(doc, jocInBoxConfig) {
            var stageNames = doc.ChopRouteSequence.split(';');
            var routeStages = _.map(stageNames, function (stageName) {
                var routeStage = {
                    name: stageName,
                    cdrDecisions: buildCommanderDecisionsList(stageName, doc.relatedChops),
                    staffSectionDecisions: buildStaffDecisionsDictionaryLookup(jocInBoxConfig, stageName, doc.relatedChops)
                };
                return routeStage;
            });
            return routeStages;

            function buildCommanderDecisionsList(organizationName, documentChops) {
                return _.chain(documentChops)
                    .filter({ Organization: organizationName, OrganizationalRole: "CDR" })
                    .orderBy(['Created'], ['desc'])
                    .map(addCreatedToMomentProp) //AFTER the orderBy operation!
                    .value();
            }

            function buildStaffDecisionsDictionaryLookup(jocInBoxConfig, organizationName, documentChops) {
                var decisionLookup = {};
                _.each(jocInBoxConfig.dashboards[organizationName].optionsForChoiceField, function (staffSectionName) {
                    if (staffSectionName !== organizationName) {
                        decisionLookup[staffSectionName] = _.chain(documentChops)
                            .filter({ Organization: organizationName, OrganizationalRole: staffSectionName })
                            .orderBy(['Created'], ['desc'])
                            .map(addCreatedToMomentProp) //AFTER the orderBy operation!
                            .value();
                    }
                });
                return decisionLookup;
            }

            function addCreatedToMomentProp(item) {
                item.CreatedMoment = moment.utc(item.Created);
                return item;
            }
        }

        function buildRouteStepsVisualizationDataSource(doc) {
            var map = {
                'Concur': 'complete',
                'Nonconcur': 'incomplete',
                'Pending': ''
            };

            var steps = _.map(doc.chopProcessInfo.routeStages, function (routeStage) {
                var mostRecentCdrDecision = routeStage.cdrDecisions[0] || null;
                return {
                    text: routeStage.name,
                    status: (mostRecentCdrDecision) ? map[mostRecentCdrDecision.Verdict] : ''
                }
            });
            return steps;
        }

        function deriveOverallChopStatus(doc) {
            //check for "Approved"
            var decisionsByFinalCommander = _.last(doc.chopProcessInfo.routeStages).cdrDecisions;
            var mostRecentDecisionByFinalCommander = (decisionsByFinalCommander.length && decisionsByFinalCommander[0]) || null;
            if (mostRecentDecisionByFinalCommander && mostRecentDecisionByFinalCommander.Verdict === "Concur") {
                return "Approved";
            }

            //check for "Disapproved" i.e. if even one commander has Disapproved
            var evenOneCommanderHasDisapproved = _.find(doc.chopProcessInfo.routeStages, function (routeStage) {
                var mostRecentCdrDecision = (routeStage.cdrDecisions.length && routeStage.cdrDecisions[0]) || null;
                return mostRecentCdrDecision && mostRecentCdrDecision.Verdict === "Nonconcur";
            });
            if (evenOneCommanderHasDisapproved) {
                return "Disapproved";
            }

            //fall-thru
            return "In Chop";
        }

        function findCommandThatMustTakeAction(doc) {
            var stage = _.find(doc.chopProcessInfo.routeStages, function (routeStage) {
                var mostRecentCdrDecision = routeStage.cdrDecisions[0] || null;
                return !mostRecentCdrDecision || mostRecentCdrDecision.Verdict === "Pending";
            });
            return stage;
        }

        function findLastKnownLocationAlongRoute(doc) {
            //need to iterate array starting from the back
            var indexesReversed = _.reverse(_.range(doc.chopProcessInfo.routeStages.length));
            var indexCorrespondingToRouteStageWhereCommanderMadeDecision = _.find(indexesReversed, function (index) {
                var routeStage = doc.chopProcessInfo.routeStages[index];
                return routeStage.cdrDecisions.length;
            });

            if (indexCorrespondingToRouteStageWhereCommanderMadeDecision === undefined) {
                //not a single commander along the route has made a decisionLookup, so the first commander has the "conch"
                return doc.chopProcessInfo.routeStages[0];
            }

            var mostRecentCdrDecision = doc.chopProcessInfo.routeStages[indexCorrespondingToRouteStageWhereCommanderMadeDecision].cdrDecisions[0];
            var isFinalCommander = (indexCorrespondingToRouteStageWhereCommanderMadeDecision === doc.chopProcessInfo.routeStages.length);
            if (isFinalCommander || mostRecentCdrDecision.Verdict !== "Concur") {
                //commander has disapproved, or marked as pending, so "conch" has not been passed to next commander on the route
                return doc.chopProcessInfo.routeStages[indexCorrespondingToRouteStageWhereCommanderMadeDecision];
            } else {
                var indexOfFinalStage = doc.chopProcessInfo.routeStages.length - 1;
                var stage = doc.chopProcessInfo.routeStages[indexCorrespondingToRouteStageWhereCommanderMadeDecision + 1];
                return (!!stage) ? stage:  doc.chopProcessInfo.routeStages[indexOfFinalStage];
            }
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
                this.MissionApproved = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
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

        Mission.prototype.deriveFullName = function () {
            var parts = [this.Identifier, " (", this.ObjectiveName];
            if (this.OperationName) {
                parts.push(", ");
                parts.push(this.OperationName);
            }
            parts.push(")");
            this.FullName = parts.join("");
        }

        Mission.prototype.deriveIdentifier = function (numMissionsCommanded) {
            var orgAsOneWord = _.words(this.Organization, /[a-zA-Z0-9-_]+/g).join("").toUpperCase(); //from "SOTG 10" to "SOTG10"
            numMissionsCommanded = numMissionsCommanded + 1;
            var threeDigitKey = _.padStart(numMissionsCommanded, 3, 0);  //from "8" to "008"
            var missionTypeAcronym = this.MissionType.split(":")[0]; //from "MA: Military Assistance" to "MA"
            this.Identifier = [orgAsOneWord, threeDigitKey, missionTypeAcronym].join("_");
        }

        Mission.prototype.validate = function () {
            var errors = [];
            if (!this.ObjectiveName) {
                errors.push("Objective Name is a required field");
            }
            if (!this.Id && !this.Organization) {
                //only required on NewForm, is read-only label on EditForm
                errors.push("Organization is a required field");
            }
            if (!this.Id && !this.MissionType) {
                //only required on NewForm, is read-only label on EditForm
                errors.push("Mission Type is a required field");
            }
            if (!this.ApprovalAuthority) {
                errors.push("Approval Authority is a required field");
            }
            if (!this.Status) {
                errors.push("Status is a required field");
            }
            if (!this.ExpectedExecution || !this.ExpectedExecution.isValid()) {
                errors.push("Expected Execution is a required field");
            }
            if (!this.ParticipatingOrganizations || !this.ParticipatingOrganizations.length) {
                errors.push("Participating Organizations is a required field");
            }
            if (this.ExpectedTermination && this.ExpectedTermination.isValid() && (this.ExpectedExecution >= this.ExpectedTermination)) {
                errors.push("Expected Execution must preceded Expected Termination");
            }

            if (errors.length === 0) {
                //sanitize user input
                this.ObjectiveName = _.words(this.ObjectiveName, /[a-zA-Z0-9-_]+/g).join("").toUpperCase();
                this.OperationName = _.words(this.OperationName, /[a-zA-Z0-9-_]+/g).join("").toUpperCase();
            }

            return errors;
        }

        Mission.prototype.save = function () {
            return MissionTrackerRepository.save(this);
        }

        Mission.prototype.buildOnHoverText = function () {
            var hoverTextParts = [];
            hoverTextParts.push(this.Status);
            hoverTextParts.push(this.ObjectiveName);
            if (this.OperationName) {
                hoverTextParts.push(this.OperationName);
            }
            hoverTextParts.push(this.ApprovalAuthority);
            var timePortion = moment.utc(this.ExpectedExecution).format("DDHHmm[Z]MMMYY").toUpperCase();
            if (this.ExpectedTermination) {
                timePortion += " - " + moment.utc(this.ExpectedTermination).format("DDHHmm[Z]MMMYY").toUpperCase();
            }
            hoverTextParts.push(timePortion);

            return hoverTextParts.join(', ');
        }

        return Mission;
    }
})();

/* Data Repository: Config */
(function () {
    angular.module('app.data')
        .service('ConfigRepository', ConfigRepository)
    ConfigRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function ConfigRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getByKey: getByKey,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "JSON"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Config'
        };

        function getByKey(configKey) {
            var qsParams = { $filter: "Title eq '" + configKey + "'" };
            var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams);
            return restCollection.get(qsParams).$promise
                .then(function (response) {
                    var queryResults = response.d.results;
                    var firstMatch = queryResults[0];
                    return {
                        Id: firstMatch.Id,
                        JSON: JSON.parse(firstMatch.JSON)
                    };
                });
        }

        function save(id, config) {
            config = JSON.stringify(config);
            var httpPostBody = {
                __metadata: {
                    type: "SP.Data.ConfigListItem"
                },
                JSON: config
            };

            var constructParams = angular.extend({}, { item: { Id: id } }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.post(httpPostBody).$promise;
        }

        return service;
    }
})();

/* Data Repository: Document Chops */
(function () {
    angular.module('app.data')
        .service('DocumentChopsRepository', DocumentChopsRepository)
    DocumentChopsRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function DocumentChopsRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "DocumentId,Organization,OrganizationalRole,Verdict,Comments"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'DocumentChops'
        };

        function getAll() {
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams).$promise
                .then(function (response) {
                    return response.d.results;
                });
        }

        function save(item) {
            var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams)
            return restCollection.post(item).$promise.then(function (response) {
                return response.d;
            });
        }

        return service;
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
            'ManageRFIId,RespondentNameId,RespondentPhone,ResponseToRequest,DateClosed,ResponseSufficient,InsufficientExplanation,PrioritySort',
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

        function getAll() {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    dfd.resolve(data.d.results);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function convertToFieldLookupValue(lookupID) {
            if (!lookupID) { return null; }
            var flv = new SP.FieldLookupValue();
            flv.set_lookupId(lookupID);
            return flv;
        }

        function save(rfi, formState) {
            var dfd = $q.defer();

            var ctx = new SP.ClientContext(_spPageContextInfo.webServerRelativeUrl);
            var list = ctx.get_web().get_lists().getByTitle('RFI');
            var listItem;

            if (_.includes(['edit', 'respond', 'reopen'], formState)) {
                listItem = list.getItemById(rfi.Id);
            }

            if (_.includes(['new'], formState)) {
                var itemCreateInfo = new SP.ListItemCreationInformation();
                listItem = list.addItem(itemCreateInfo);
            }

            if (_.includes(['new', 'edit'], formState)) {
                listItem.set_item('Title', rfi.Title);
                listItem.set_item('RfiTrackingNumber', (rfi.RfiTrackingNumber || null));
                listItem.set_item('Mission', convertToFieldLookupValue(rfi.MissionId));
                listItem.set_item('Details', rfi.Details);
                listItem.set_item('Priority', rfi.Priority);
                listItem.set_item('LTIOV', rfi.LTIOV.isValid() ? rfi.LTIOV.toISOString() : null);
                listItem.set_item('PocName', SP.FieldUserValue.fromUser(rfi.PocNameSelectedKeys[0]));
                listItem.set_item('PocPhone', rfi.PocPhone);
                listItem.set_item('PocOrganization', rfi.PocOrganization);
                listItem.set_item('RecommendedOPR', rfi.RecommendedOPR);
                listItem.set_item('ManageRFI', _.map(rfi.ManageRFISelectedKeys, function (key) { return SP.FieldUserValue.fromUser(key); }));
            }

            if (formState === 'respond') {
                listItem.set_item('Mission', convertToFieldLookupValue(rfi.MissionId));
                listItem.set_item('RecommendedOPR', rfi.RecommendedOPR);
                listItem.set_item('RespondentName', SP.FieldUserValue.fromUser(rfi.RespondentNameSelectedKeys[0]));
                listItem.set_item('RespondentPhone', rfi.RespondentPhone);
                listItem.set_item('ResponseToRequest', rfi.ResponseToRequest);
                listItem.set_item('DateClosed', (rfi.DateClosed && rfi.DateClosed.isValid()) ? rfi.DateClosed.toISOString() : null);
                listItem.set_item('ResponseSufficient', rfi.ResponseSufficient);
                listItem.set_item('Status', rfi.Status);
            }

            if (formState === 'reopen') {
                listItem.set_item('Mission', convertToFieldLookupValue(rfi.MissionId));
                listItem.set_item('ResponseSufficient', rfi.ResponseSufficient);
                listItem.set_item('InsufficientExplanation', rfi.InsufficientExplanation);
                listItem.set_item('DateClosed', (rfi.DateClosed && rfi.DateClosed.isValid()) ? rfi.DateClosed.toISOString() : null);
                listItem.set_item('Status', rfi.Status);
            }

            listItem.update();

            ctx.load(listItem);
            ctx.executeQueryAsync(
                Function.createDelegate(this, function () {
                    dfd.resolve(listItem.get_id());
                }),
                Function.createDelegate(this, function (sender, args) {
                    dfd.reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                }));

            return dfd.promise;
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
            checkInFile: checkInFile,
            getAll: getAll,
            getById: getById,
            getMissionRelated: getMissionRelated,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonDocumentFields,
            'Organization,TypeOfDocument,MissionId,FlaggedForSoacDailyUpdate,DailyProductDate',
            'ChopRouteSequence,VersionBeingChopped,ChopProcess',
            'Mission/Id,Mission/FullName'
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

        function checkInFile(opts) {
            var webUrl = _spPageContextInfo.webServerRelativeUrl;
            var fileUrl = webUrl + "/MissionDocuments/" + opts.FileLeafRef;
            var url = webUrl + "/_api/web/GetFileByServerRelativeUrl('" + fileUrl + "')/CheckIn(comment='',checkintype=2)";

            var defaultPostheaders = angular.extend({}, spContext.defaultHeaders, {
                            'X-RequestDigest': spContext.securityValidation,
                            'X-HTTP-Method': 'MERGE',
                            'If-Match': '*'
                        });

            return $http({
                method: "post",
                url: url,
                headers: defaultPostheaders
            })
                .catch(function (response) {
                    if (!_.endsWith(response.data.error.message.value, "is not checked out.")) {
                        return $q.reject(response);
                    }
                });
        }

        function getAll() {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    dfd.resolve(data.d.results);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function getMissionRelated() {
            var dfd = $q.defer();
            var qsParams = {};  //{ $filter: "MissionId ne null" };
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    var missionRelated = _.filter(data.d.results, function(item){ return !!item.MissionId; });
                    dfd.resolve(missionRelated);
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function getById(id) {
            var constructParams = angular.extend({}, { item: { Id: id } }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.get({}).$promise.then(function (response) { return response.d; });
        }

        function save(item) {
            var constructParams = angular.extend({}, { item: item }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.post(item).$promise;
        }

        return service;
    }
})();

/* Data Repository: Message Traffic */
(function () {
    angular.module('app.data')
        .service('MessageTrafficRepository', MessageTrafficRepository);
    MessageTrafficRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function MessageTrafficRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            save: save
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            'OriginatorSender,Receiver,DateTimeGroup,TaskInfo,Initials, Significant,Comments,LinkToMissionDocument,DTG'
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Message Traffic'
        };

        function getAll() {
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams).$promise
                .then(function (response) {
                    return response.d.results;
                });
        }

        function save(item) {
            spContext.makeMomentRESTCompliant(item, "DateTimeGroup");
            spContext.makeMultiChoiceRESTCompliant(item, "Receiver");
            spContext.makeHyperlinkFieldRESTCompliant(item, "LinkToMissionDocument");
            if (!item.Id) {
                var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams)
                return restCollection.post(item).$promise;
            } else {
                var constructParams = angular.extend({}, { item: { Id: item.Id } }, ngResourceConstructParams);
                var restResource = spContext.constructNgResourceForRESTResource(constructParams);
                return restResource.post(item).$promise;
            }
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

        function generateMissionIdentifier(item) {
            if (item.Id) {
                //do nothing, since Identifer column only gets generated on new item created
                item.deriveFullName();
                return $q.when(item);
            }

            var qsParams = { $filter: "Organization eq '" + item.Organization + "'" };
            var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams);
            return restCollection.get(qsParams).$promise
                .then(function (response) {
                    var numberOfMissionsCommandedByOrganizaton = response.d.results.length;
                    item.deriveIdentifier(numberOfMissionsCommandedByOrganizaton);
                    item.deriveFullName();
                    return item;
                });
        }

        function getByOrganization(orgFilter) {
            var dfd = $q.defer();
            var qsParams = {}; //{$filter:"FavoriteNumber eq 8"};
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    var queryResults = data.d.results;
                    if (orgFilter) {
                        queryResults = _.filter(queryResults, function (item) {
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

        function save(item) {
            return validate(item)
                .then(generateMissionIdentifier)
                .then(performHttpPost);

            function performHttpPost(item) {
                spContext.makeMomentRESTCompliant(item, "MissionApproved");
                spContext.makeMomentRESTCompliant(item, "ExpectedExecution");
                spContext.makeMomentRESTCompliant(item, "ExpectedTermination");
                spContext.makeMultiChoiceRESTCompliant(item, "ParticipatingOrganizations");
                if (!item.Id) {
                    var restCollection = spContext.constructNgResourceForRESTCollection(ngResourceConstructParams)
                    return restCollection.post(item);
                } else {
                    var constructParams = angular.extend({}, { item: { Id: item.Id } }, ngResourceConstructParams);
                    var restResource = spContext.constructNgResourceForRESTResource(constructParams);
                    return restResource.post(item);
                }
            }

            function validate(item) {
                var errors = item.validate();
                if (errors.length) {
                    return $q.reject("\n\t-" + errors.join("\n\t-"));
                } else {
                    return $q.when(item);
                }
            }
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

        function convertToFullCalendarEvent(xmlNode) {
            var itemID = xmlNode.attr('ows_ID');
            return {
                "start": moment.utc(xmlNode.attr("ows_EventDate")),
                "end": moment.utc(xmlNode.attr("ows_EndDate")),
                "title": xmlNode.attr("ows_Title"),
                "location": xmlNode.attr("ows_Location"),
                "allDay": xmlNode.attr("ows_fAllDayEvent") == 1 ? true : false,
                "url": _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/DispForm.aspx?ID=" + itemID + '&Source=' + window.location,
                "isRecurrence": xmlNode.attr("ows_fRecurrence") == 1 ? true : false,
                "organization": xmlNode.attr("ows_Organization")
            }
        }

        function getEvents(start, end, intervalUnit, organizationFilter) {
            var diff = end.diff(start, 'hours');
            var midPoint = start.clone().add((diff / 2), 'hours');
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
                "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body><GetListItemChangesSinceToken xmlns='http://schemas.microsoft.com/sharepoint/soap/'><listName>Calendar</listName><viewName></viewName><query><Query><Where><DateRangesOverlap><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='RecurrenceID' /><Value Type='DateTime'>" + camlIntervals[intervalUnit] + "</Value></DateRangesOverlap></Where><OrderBy><FieldRef Name='EventDate' /></OrderBy></Query></query><viewFields><ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='Location' /><FieldRef Name='Description' /><FieldRef Name='Category' /><FieldRef Name='fRecurrence' /><FieldRef Name='RecurrenceData' /><FieldRef Name='fAllDayEvent' /><FieldRef Name='Organization' /></ViewFields></viewFields><rowLimit>300</rowLimit><queryOptions><QueryOptions><CalendarDate>"
                + camlCalendarDate + "</CalendarDate><ExpandRecurrence>TRUE</ExpandRecurrence><RecurrenceOrderBy>TRUE</RecurrenceOrderBy><DatesInUtc>True</DatesInUtc><ViewAttributes Scope='RecursiveAll'/></QueryOptions></queryOptions></GetListItemChangesSinceToken></soap:Body></soap:Envelope>";

            return $http({
                url: _spPageContextInfo.webServerRelativeUrl + "/_vti_bin/Lists.asmx",
                method: "POST",
                data: getListItemsSoap,
                headers: {
                    "Accept": "application/xml, text/xml, */*; q=0.01",
                    "Content-Type": 'text/xml; charset="utf-8"'
                }
            })
                .then(function (response) {
                    var events = [];
                    $(response.data).find("listitems").find("[ows_ID]").each(function () {
                        events.push(convertToFullCalendarEvent($(this)));
                    });

                    if (organizationFilter) {
                        events = _.filter(events, function (evt) {
                            return _.includes(evt.organization, organizationFilter);
                        });
                    }

                    return events;
                });
        }
    }
})();

/* Directive: navTree */
(function () {
    angular
        .module('app.core')
        .directive('navTree', generateDirectiveDef);

    generateDirectiveDef.$inject = ['ConfigRepository', 'logger'];
    function generateDirectiveDef(ConfigRepository, logger) {
        /* 
        USAGE: <nav-tree></nav-tree>
        */
        $.jstree.defaults.contextmenu.select_node = false;  //Ensure node can only be selected with left-mouse-click
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                nodeToEdit: "="
            },
            link: link,
            template: buildSaveButtonHtml() + '<div class="edit-nav-tree"></div>'
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.jsTreeInstance = $(elem).find(".edit-nav-tree");

            scope.onSaveClicked = function () {
                var treeState = scope.jsTreeInstance.jstree(true).get_json('#', { 'flat': true });
                ConfigRepository.save(scope.listItemId, treeState)
                    .then(function () {
                        logger.success('Navigation updated', {
                            alwaysShowToEnduser: true
                        });
                    });
            }

            ConfigRepository.getByKey("MENU_CONFIG")
                .then(function (data) {
                    scope.listItemId = data.Id;
                    initializeJstree(data);
                    listenForNodeSelection();
                });

            function initializeJstree(data) {
                var opts = {
                    core: {
                        animation: 0,
                        check_callback: function (op, node, par, pos, more) {
                            if (op === "delete_node" || op === "rename_node") {
                                if (node.parent === '#') {
                                    alert('Cannot delete or rename root menu item');
                                    return false;
                                }
                            }
                        },
                        themes: { stripes: true },
                        data: data.JSON
                    },
                    types: {
                        "#": {
                            max_children: 1,
                            max_depth: 4
                        }
                    },
                    plugins: ["contextmenu", "dnd", "search", "state", "types", "wholerow"],
                    contextmenu: configureContextMenu()
                };

                scope.jsTreeInstance.jstree(opts);

                function configureContextMenu() {
                    return {
                        items: function (node) {
                            var tree = scope.jsTreeInstance.jstree(true);
                            return {
                                "Create": {
                                    "separator_before": false,
                                    "separator_after": false,
                                    "label": "Create",
                                    "action": function (obj) {
                                        var $node = tree.create_node(node);
                                        tree.edit($node);
                                    }
                                },
                                "Rename": {
                                    "separator_before": false,
                                    "separator_after": false,
                                    "label": "Rename",
                                    "action": function (obj) {
                                        tree.edit(node);
                                    }
                                },
                                "Remove": {
                                    "separator_before": true,
                                    "separator_after": false,
                                    "label": "Delete",
                                    "action": function (obj) {
                                        if (confirm('Are you sure to remove this menu item?')) {
                                            tree.delete_node(node);
                                        }
                                    }
                                }
                            };
                        }
                    }
                }
            }
            function listenForNodeSelection() {
                scope.jsTreeInstance.bind("select_node.jstree", function (evt, data) {
                    scope.$apply(function () {
                        scope.nodeToEdit = data.node;
                    });
                })
            }
        }

        function buildSaveButtonHtml() {
            return '<p><uif-button type="button" ng-click="onSaveClicked()" uif-type="primary">Save Changes</uif-button></p>';
        }
    }
})();

/* Directive: exerciseCalendar */
(function () {
    angular
        .module('app.core')
        .directive('exerciseCalendar', exerciseCalendar);

    exerciseCalendar.$inject = ['CalendarRepository', 'spContext'];
    function exerciseCalendar(CalendarRepository, spContext) {
        /* 
        USAGE: <exercise-calendar list-name=""></exercise-calendar>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
            },
            link: link
        };
        return directiveDefinition;

        function buildHeroButtonHtml() {
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function link(scope, elem, attrs) {
            $(elem).before(buildHeroButtonHtml());
            $(elem).fullCalendar({
                // Assign buttons to the header of the calendar. See FullCalendar documentation for details.
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month, agendaWeek'
                },
                defaultView: "month", // Set the default view to month
                firstHour: "0", // Set the first visible hour in agenda views to 5 a.m.
                weekMode: "liquid", // Only display the weeks that are needed
                theme: false, // Use a jQuery UI theme instead of the default fullcalendar theme
                editable: false, // Set the calendar to read-only; events can't be dragged or resized

                // Add events to the calendar. This is where the "magic" happens!
                events: function (start, end, timezone, callback) {
                    var calView = $(elem).fullCalendar('getView');
                    CalendarRepository.getEvents(start, end, calView.intervalUnit, (_.getQueryStringParam("org") || ""))
                        .then(function (data) {
                            callback(data);
                        })

                }
            });

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

    routingProcessVisualization.$inject = ['$rootScope'];
    function routingProcessVisualization($rootScope) {
        /* 
        USAGE: <routing-process-visualization steps=""></routing-process-visualization>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                document: "="
            },
            link: link,
            template:
            '<ul class="horizontal-timeline">\
                    <li ng-click="onStepClicked(step.text)" ng-repeat="step in document.chopProcessInfo.routeStepsVisualizationDataSource" class="li" ng-class="{\'complete\': step.status===\'complete\', \'incomplete\': step.status===\'incomplete\' }">\
                        <div class="status">\
                            <h4>\
                                {{step.text}}\
                            </h4>\
                        </div>\
                    </li>\
                </ul>'
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.onStepClicked = function (stepName) {
                scope.document.chopProcessInfo.selectedRouteStage = _.find(scope.document.chopProcessInfo.routeStages, {name: stepName});
                
            }
        }
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

            $elem.on('click', function () {
                var redirect = _spPageContextInfo.webServerRelativeUrl + "/Lists/RFI/EditForm.aspx?action=" + buttonText + "&ID=" + listItemID + "&Source=" + document.location.href;
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

    function initiatechopbutton($q, logger, Mission, MissionDocument, MissionDocumentRepository, MissionTrackerRepository) {
        /* 
       SP2013 display template will render ChopProcess column (anytime it appears in LVWP) as:
           <a class="custombtn" initiatechopbutton="" data-id="1" data-chop-process='10/7/2016 19:08'>Chop</a>
       */
        var directiveDefinition = {
            restrict: 'A',
            scope: {
                chopDialogCtx: '='
            },
            link: link,
            replace: true,
            template: generateChopButtonHtml()
        };
        return directiveDefinition;

        function generateChopButtonHtml() {
            return "<a ng-class='getButtonClass()' title='{{getHoverText()}}' ng-click='openChopDialog()'>Chop</a>";
        }

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
            scope.getHoverText = function () {
                return (!!scope.chopProcessTimestamp) ? 'Process initiated on ' + scope.chopProcessTimestamp : 'Click to start chop process now';
            }

            scope.getButtonClass = function () {
                return (!!scope.chopProcessTimestamp) ? 'disabled-custombtn' : 'custombtn';
            }

            scope.openChopDialog = function () {
                if (!!scope.chopProcessTimestamp) { return; }
                if (!scope.chopDialogCtx) {
                    alert("Chopping process should be initiated from Component Command or Task Group pages")
                    return;
                }
                //fetch missions, fetch Mission document properties
                //on success set three properties on chopDialogCtx (show, missions, listItem)
                $q.all([
                    MissionDocumentRepository.getById(scope.listItemID),
                    MissionTrackerRepository.getByOrganization(_.getQueryStringParam("org") || '')
                ])
                    .then(function (data) {
                        scope.chopDialogCtx.listItem = new MissionDocument(data[0]);
                        scope.chopDialogCtx.missions = _.map(data[1], function (item) { return new Mission(item); });
                        scope.chopDialogCtx.show = true;
                        scope.chopDialogCtx.submitButtonClicked = false;
                        scope.chopDialogCtx.submit = submit;
                        scope.chopDialogCtx.isFormValid = isFormValid;
                        scope.chopDialogCtx.getSelectedMission = getSelectedMission;
                    });
            }

            function isFormValid() {
                return !scope.chopDialogCtx.listItem.Mission.Id && scope.chopDialogCtx.submitButtonClicked;
            }

            function getSelectedMission() {
                //two-way binding from ng-office UI dropdown binds the mission.Id dropdownOption to the Mission Document's Mission.Id  
                var selectedMission = _.find(scope.chopDialogCtx.missions, { Id: parseInt(scope.chopDialogCtx.listItem.Mission.Id, 10) });
                return selectedMission;
            }

            function submit() {
                scope.chopDialogCtx.submitButtonClicked = true;
                if (scope.chopDialogCtx.isFormValid()) { return; }

                var selectedMission = scope.chopDialogCtx.getSelectedMission();
                var orgConfig = jocInBoxConfig.dashboards[selectedMission.Organization];

                scope.chopDialogCtx.listItem.deriveRouteSequence(selectedMission, orgConfig);

                if (scope.chopDialogCtx.listItem.ChopRouteSequence) {
                    scope.chopDialogCtx.listItem.initiateChop().then(onChopStartedSuccessfully);
                } else {
                    alert(selectedMission.Organization + 'does not have a configured route sequence for "' + selectedMission.ApprovalAuthority + '"');
                }

                function onChopStartedSuccessfully(item) {
                    scope.chopProcessTimestamp = item.ChopProcess;
                    scope.chopDialogCtx.show = false;
                    var missionTrackerUrl = _spPageContextInfo.webServerRelativeUrl + "/SitePages/app.aspx/#/missiontracker/2";
                    logger.success('Track the process using the <a href="' + missionTrackerUrl + '" style="text-decoration:underline;color:white;">Mission Tracker</a>', {
                        title: "Chop Process initiated",
                        alwaysShowToEnduser: true,
                        delay: false
                    });
                }

            }
        }
    }

})();

/* Directive: includeReplace */
(function () {
    /**USAGE
     * <div ng-include src="dynamicTemplatePath" include-replace></div>
     */
    angular
        .module('app.core')
        .directive('includeReplace', function () {
            return {
                require: 'ngInclude',
                restrict: 'A', /* optional */
                link: function (scope, el, attrs) {
                    el.replaceWith(el.children());
                }
            };
        });
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


            vm.nextSlide = function () {
                var indexOfCurrentSlide = _.indexOf(slideNames, vm.currentVisibleSlide);
                var indexForNextSlide = (indexOfCurrentSlide === slideNames.length - 1) ? 0 : indexOfCurrentSlide + 1;
                vm.currentVisibleSlide = slideNames[indexForNextSlide];
                console.log('next slide clicked ' + new Date());
            };


            vm.prevSlide = function () {
                var indexOfCurrentSlide = _.indexOf(slideNames, vm.currentVisibleSlide);
                var indexForNextSlide = (indexOfCurrentSlide === 0) ? slideNames.length - 1 : indexOfCurrentSlide - 1;
                vm.currentVisibleSlide = slideNames[indexForNextSlide];
            };


            vm.slideShowTimer = null;

            function startSlideShowTimer() {
                vm.slideShowTimer = $timeout(
                    function () {
                        vm.nextSlide();
                        vm.slideShowTimer = $timeout(startSlideShowTimer, 2000);
                    },
                    2000);
            };

            startSlideShowTimer();

            vm.startShow = function () {
                startSlideShowTimer();
            };

            vm.stopShow = function () {
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
            templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/current-operations-summary.html'
        };
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
            scope: {
                missions: '=',
                selectedOrg: '=',
                showNewItemLink: '=',
                onMissionsFiltered: '&'
            },
            template: buildHeroButtonHtml() + buildCheckboxHtml() + buildLegendHtml() + '<div class="mission-timeline" ng-show="missionsToShow.length"></div>' + buildMessageBarHtml()
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

            scope.showPastMissions = false;
            scope.statusColorLegend = [
                { name: "Initial Targeting", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;' }, //yellow,black
                { name: "JPG Assigned", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;' }, //yellow,black
                { name: "COA Approved", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;' }, //yellow,black
                { name: "CONOP Received - In Chop", cssStyle: 'background-color:#FFFF00; border-color: #FFFF00; color: #000;' }, //yellow,black

                { name: "CONOP Disapproved", cssStyle: 'background-color:#ff0000; border-color: #ff0000; color: #fff;' }, //red,white	

                { name: "CONOP Approved", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;' }, //green,black
                { name: "FRAGO In-Chop", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;' }, //green,black
                { name: "FRAGO Released", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;' }, //green,black
                { name: "EXORD Released", cssStyle: 'background-color:#007f00; border-color: #007f00; color: #fff;' }, //green,black

                { name: "Mission In Progress", cssStyle: 'background-color:#ffa500; border-color: #ffa500; color: #000;' }, //orange, black

                { name: "Return to Base", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;' }, //blue, black		
                { name: "QuickLook", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;' }, //blue, black	
                { name: "StoryBoard", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;' }, //blue, black
                { name: "OPSUM", cssStyle: 'background-color:#2C5197; border-color: #2C5197; color: #000;' }, //blue, black

                { name: "Mission Closed", cssStyle: 'background-color:#000; border-color: #000; color: #fff;' } //black, white
            ];



            scope.$watch('showPastMissions', function () {
                renderTimeline();
            });

            scope.$watch('missions', function () {
                renderTimeline();
            })

            var timeline = null;
            function renderTimeline() {
                if (timeline) {
                    timeline.destroy();
                }

                var now = moment();
                scope.missionsToShow = _.filter(scope.missions, function (item) {
                    return scope.showPastMissions || (!item.ExpectedTermination || moment(item.ExpectedTermination) > now);
                });

                scope.onMissionsFiltered({ missions: scope.missionsToShow });

                var groups = new vis.DataSet(_.map(scope.missionsToShow, function (item) { return { id: item.Id, content: item.Identifier }; }));
                var items = new vis.DataSet(
                    _.map(scope.missionsToShow, function (item) {
                        return {
                            id: item.Id,
                            group: item.Id,
                            start: moment(item.ExpectedExecution),
                            end: moment(item.ExpectedTermination),
                            style: _.find(scope.statusColorLegend, { name: item.Status }).cssStyle,
                            title: item.buildOnHoverText()
                        };
                    })
                );

                timeline = new vis.Timeline($(elem).find(".mission-timeline").get(0), null, options);
                timeline.setGroups(groups);
                timeline.setItems(items);
                timeline.on('click', function (props) {
                    if (props.what === 'group-label' || props.what === 'item') {
                        var url = _spPageContextInfo.webServerRelativeUrl + '/Lists/MissionTracker/DispForm.aspx?ID=' + props.group + "&Source=" + document.location.href;
                        document.location.href = url;
                        //window.open(url , '_blank');    
                    }
                })


            }
        }

        function buildLegendHtml() {
            var html = '<div style="position:relative;">';
            html += buildShowLegendHyperlink();
            html += buildCalloutHtml();
            html += "</div>";
            return html;

            function buildCalloutHtml() {
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

            function buildShowLegendHyperlink() {
                return '<a ng-mouseover="showLegend = true" ng-mouseleave="showLegend = false" ng-show="missionsToShow.length">Show Legend</a>';
            }
        }

        function buildCheckboxHtml() {
            var html = '<uif-choicefield-option uif-type="checkbox" value="value1" ng-model="showPastMissions" ng-true-value="true" ng-false-value="false"> Show Past Missions</uif-choicefield-option>';
            //var html = '<input type="checkbox" ng-model="showPastMissions"> <label>Show Past Missions</label>';
            return html;
        }

        function buildHeroButtonHtml() {
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/MissionTracker/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function buildMessageBarHtml() {
            return '<uif-message-bar ng-show="missionsToShow.length === 0"> <uif-content>No {{showPastMissions ? "past/ongoing" : "ongoing" }} {{selectedOrg}} missions</uif-content> </uif-message-bar>';
        }
    }
})();

/* Directive: navMenu */
(function () {
    angular
        .module('app.core')
        .directive('navMenu', generateDirectiveDef);

    generateDirectiveDef.$inject = ['config', 'ConfigRepository', 'logger'];
    function generateDirectiveDef(config, ConfigRepository, logger) {
        /* 
        USAGE: <nav-menu></nav-menu>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
            },
            link: link,
            template: generateContainerHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            ConfigRepository.getByKey("MENU_CONFIG")
                .then(function (data) {
                    _.remove(data.JSON, isRootNode);
                    _.each(data.JSON, associateToFlag);
                    generateMenu(convertToRecursive(data.JSON));
                });

            function generateMenu(menuDataSource) {
                var baseMenuUL = $(elem).find("#jocboxmenu ul");
                _.each(menuDataSource, function (node) {
                    generateMenuItem(node, baseMenuUL);
                });
            }

            function generateMenuItem(node, container) {
                var li = $("<li>");
                container.append(li);

                if (node.flagCode) {
                    li.append(generateAnchor_withFlagIcon(node));
                } else {
                    li.append(generateAnchor_standard(node));
                }

                //check for children
                if (node.children && node.children.length) {
                    //append chevron
                    li.append('<i class="ms-ContextualMenu-subMenuIcon ms-Icon ms-Icon--chevronRight"></i>')

                    //append child menu
                    var childUL = $("<ul>");
                    li.append(childUL);
                    _.each(node.children, function (node) {
                        generateMenuItem(node, childUL);
                    });
                }
            }

            function generateAnchor_standard(node) {
                var url = node.li_attr.url || "#";
                var parts = [
                    '<a class="noflag" href="' + url + '" target="' + node.li_attr.target + '">',
                    '   <span class="menu-label-when-no-flag">' + node.text + '</span>',
                    '</a>'
                ].join('');
                return parts;
            }

            function generateAnchor_withFlagIcon(node) {
                var url = node.li_attr.url || "#";
                var parts = [
                    '<a href="' + url + '" target="' + node.li_attr.target + '">',
                    '   <span class="f32"><span class="flag ' + node.flagCode + '"><span class="menu-label-when-flag">' + node.text + '</span></span></span>',
                    '</a>'
                ].join('');
                return parts;
            }
        }
        function associateToFlag(item) {
            var orgConfig = jocInBoxConfig.dashboards[item.text]
            if (orgConfig && orgConfig.flagCode) {
                item.flagCode = orgConfig.flagCode;
            }
        }

        function convertToRecursive(dataSource) {
            return getChildNodes("rootNode");
            function getChildNodes(parent) {
                var nodes = _.filter(dataSource, { parent: parent });
                _.each(nodes, function (node) {
                    node.children = getChildNodes(node.id);
                });
                return nodes;
            }
        }

        function isRootNode(item) {
            return item.parent === "#";
        }

        function generateContainerHtml() {
            var parts = [
                '<div id="jocboxmenu">',
                '   <ul>',
                '   </ul>',
                '</div>'
            ].join('');
            return parts;
        }
    }
})();

/* Directive: commanderDecisionButton */
(function () {
    angular
        .module('app.core')
        .directive('commanderDecisionButton', directiveDefinitionFunc);

    function directiveDefinitionFunc($rootScope) {
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                document: "="
            },
            link: link,
            template: buildButtonHtml()
        };
        return directiveDefinition;

        function buildButtonHtml() {
            var parts = [
            '<button ng-click="chopButtonClicked()" ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions.length === 0" type="button" class="cdr-chop-button-no-decisions-yet">',
            '   {{document.chopProcessInfo.selectedRouteStage.name}} CDR',
            '</button>',
            '<button ng-click="chopButtonClicked()" ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions.length !== 0" type="button" class="cdr-chop-button">',
            '   <span>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Concur\'" class="fa fa-thumbs-up" style="color:green;font-size:1.4em;"></i>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Nonconcur\'" class="fa fa-thumbs-down" style="color:red;font-size:1.4em;"></i>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Pending\'" class="fa fa-hourglass-start" style="font-size:1.2em;"></i>',
            '       {{document.chopProcessInfo.selectedRouteStage.name}} CDR',
            '   </span>',
            '</button>'
            ].join('');
            return parts;
        }

        function link(scope, elem, attrs) {
            scope.chopButtonClicked = function(){
                $rootScope.$broadcast("missionTracker:chopButtonClicked", {
                    organization: scope.document.chopProcessInfo.selectedRouteStage.name,
                    section: 'CDR',
                    document: scope.document
                });
            }
        }
    }

})();

/* Directive: routingProcessParticipants */
(function () {
    angular
        .module('app.core')
        .directive('routingProcessParticipants', directiveDefinitionFunc);

    function directiveDefinitionFunc($rootScope) {
        /* 
        USAGE: <routing-process-participants process-info=""></routing-process-participants>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
                document: "="
            },
            link: link,
            template: buildParticipantButtonsHtml()
        };
        return directiveDefinition;

        function buildParticipantButtonsHtml() {
            var parts = [
                '       <span ng-click="chopButtonClicked(sectionName)" ng-repeat="(sectionName, decisions) in document.chopProcessInfo.selectedRouteStage.staffSectionDecisions" style="padding:0;">',
                '           <button ng-if="decisions.length === 0" type="button" class="staff-chop-button-no-decisions-yet">',
                '               {{tryToShorten(sectionName)}}',
                '           </button>',
                '           <button ng-if="decisions.length !== 0" type="button" class="staff-chop-button">',
                '               <span>',
                '                   <i ng-if="decisions[0].Verdict === \'Concur\'" class="fa fa-thumbs-up" style="color:green;font-size:1.4em;"></i>',
                '                   <i ng-if="decisions[0].Verdict === \'Nonconcur\'" class="fa fa-thumbs-down" style="color:red;font-size:1.4em;"></i>',
                '                   <i ng-if="decisions[0].Verdict === \'Pending\'" class="fa fa-hourglass-start" style="font-size:1.2em;"></i>',
                '                   {{tryToShorten(sectionName)}}',
                '               </span>',
                '           </button>',
                '       </span>'
            ].join('');
            return parts;
        }

        function link(scope, elem, attrs) {
            scope.tryToShorten = function(sectionName){
                return sectionName.substr(sectionName.lastIndexOf('-')+1);;
            }

            scope.chopButtonClicked = function(sectionName){
                $rootScope.$broadcast("missionTracker:chopButtonClicked", {
                    organization: scope.document.chopProcessInfo.selectedRouteStage.name,
                    section: sectionName,
                    document: scope.document
                });
            }
        }
    }

})();

/* Directive: routingSheet */
(function () {
    angular
        .module('app.core')
        .directive('routingSheet', directiveDefinitionFunc);

    function directiveDefinitionFunc($rootScope, logger, MissionDocument) {
        /* 
        USAGE: <routing-sheet></routing-sheet>
        SIMPLY listens for an event
        */
        var directiveDefinition = {
            restrict: 'E',
            link: link,
            scope: {
                onChopCreated: '&'
            },
            template: buildPanelHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            $rootScope.$on("missionTracker:chopButtonClicked", function (evt, args) {
                scope.document = args.document;
                scope.selectedStage = _.find(scope.document.chopProcessInfo.routeStages, { name: args.organization });
                buildSignatureBlocks(args.section);
                scope.errors = scope.document.checkIfChoppingOutOfTurn(scope.selectedStage.name);
                scope.showPanel = true;
            });

            scope.onTabClicked = function (block) {
                scope.selectedTab = !block ? '' : block.signOnBehalfOf;
            }

            scope.replaceLineBreaks = function (text) {
                return !!text ? text.replace(/(?:\r\n|\r|\n)/g, '<br />') : '';
            }

            scope.saveChop = function (block) {
                block.errors = "";
                if (!block.Verdict) {
                    block.errors = "Please specify 'Concur', 'Nonconcur', or 'Pending'";
                    return;
                }
                if (block.Verdict === "Nonconcur" && !block.Comments) {
                    block.errors = "Comments are required when nonconcurring";
                    return;
                }

                scope.document.createChop(scope.selectedStage.name, block.signOnBehalfOf, block.Verdict, block.Comments).then(function (item) {
                    item.Author = {
                        Title: "You"
                    };

                    //TODO: display logger message
                    scope.document.relatedChops.push(item);
                    scope.document.refreshChopProcessInfo();
                    scope.onChopCreated()
                    scope.showPanel = false
                });
            }

            function buildSignatureBlocks(section) {
                scope.selectedTab = section;
                var blocks = []
                //add one for CDR
                blocks.push({
                    title: "Commander",
                    signOnBehalfOf: "CDR",
                    previousChops: scope.selectedStage.cdrDecisions
                });
                //then one for each section
                _.each(scope.selectedStage.staffSectionDecisions, function (decisions, sectionName) {
                    blocks.push({
                        title: sectionName.replace(scope.selectedStage.name + " - ", ""),
                        signOnBehalfOf: sectionName,
                        previousChops: decisions
                    });
                });
                scope.signatureBlocks = blocks;
            }
        }
    }

    function buildPanelHtml() {
        var parts = [
            '<uif-panel uif-type="large" uif-is-open="showPanel" uif-show-overlay="true" uif-show-close="true" close-panel="onPanelClosed()">',
            '   <uif-panel-header>',
            '       {{selectedStage.name}} Routing Sheet',
            '   </uif-panel-header>',
            '   <uif-content>',
            generateTabsHtml(),
            generateChoppingOutOfSequenceError(),
            generateShowAllSectionsMessage(),
            generateDetailsAboutDocument(),
            '       <div class="ms-Grid" ng-if="!errors || errors.errorType !== \'TooEarly\'" >',
            '           <div class="ms-Grid-row" ng-show="!selectedTab || selectedTab === block.signOnBehalfOf" ng-repeat="block in signatureBlocks" style="margin-top: 20px;">',
            '               <div class="ms-Grid-col ms-u-md12">',
            '                   <div class="form-header"><span class="ms-font-xl">{{block.title}}</span></div>',
            '                   <div class="ms-Grid">',
            '                       <div class="ms-Grid-row">',
            '                           <div class="ms-Grid-col ms-u-md12">',
            '                               <uif-textfield uif-label="Comments" ng-model="block.Comments" uif-multiline="true" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name" />',
                                            generateVerdictPicker(),
                                            generateBlockErrorMessages(),
                                            generateButtonsHtml(),
            '                           </div>',
            '                       </div>',
            '                   </div>',
            '                   <br/>',
            '                   <div class="form-header"><span class="ms-font-xl">Previous Comments</span></div>',
            '                   <div class="ms-Grid">',
            '                       <div class="ms-Grid-row">',
            '                           <div class="ms-Grid-col ms-u-md12">',
                                            generatePreviousChopsHtml(),
            '                           </div>',
            '                       </div>',
            '                   </div>',
            '               </div>',
            '           </div>',
            '       </div>',
            '   </uif-content>',
            '</uif-panel>'
        ].join('');
        return parts;

        function generateBlockErrorMessages() {
            var parts = [
                '<div style="margin-bottom:5px;"><uif-message-bar uif-type="error" ng-if="!!block.errors"> <uif-content>{{block.errors}}</uif-content></uif-message-bar></div>'
            ]
                .join('');

            return parts;
        }

        function generateButtonsHtml() {
            return '<uif-button type="button" uif-type="primary" ng-click="saveChop(block)" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name">Chop</uif-button>';
        }

        function generateChoppingOutOfSequenceError() {
            var parts = [
                '<uif-message-bar uif-type="error" ng-if="!!errors"> <uif-content>{{errors.message}}</uif-content></uif-message-bar>'
            ]
                .join('');

            return parts;
        }

        function generateDetailsAboutDocument() {
            return '<br/><uif-message-bar> <uif-content>The document being chopped can be referenced </uif-content> <uif-link ng-href="{{document.File.ServerRelativeUrl}}">here</uif-link> </uif-message-bar>';
        }

        function generateVerdictPicker() {
            var parts = [
                '<uif-choicefield-group ng-model="block.Verdict" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name">',
                '   <uif-choicefield-option uif-type="radio" value="Concur">Concur</uif-choicefield-option>',
                '   <uif-choicefield-option uif-type="radio" value="Nonconcur">Nonconcur</uif-choicefield-option>',
                '   <uif-choicefield-option uif-type="radio" value="Pending">Pending</uif-choicefield-option>',
                '</uif-choicefield-group>'
            ].join('');
            return parts;
        }

        function generatePreviousChopsHtml() {
            var parts = [
                '<div ng-if="block.previousChops.length === 0" style="padding-top:9px;">',
                '   <uif-message-bar><uif-content>{{selectedStage.name}} {{block.title}} has no previous chops for this document</uif-content></uif-message-bar>',
                '</div>',
                '<div ng-if="block.previousChops.length" class="chop-comments-container ">',
                '   <ul class="chop-comments">',
                '       <li class="cmmnt" ng-repeat="item in block.previousChops" ng-class="{\'border-top\': $index !== 0}">',
                '           <div class="avatar">',
                '               <i ng-if="item.Verdict === \'Concur\'" class="fa fa-thumbs-up fa-2x" style="color:green;"></i>',
                '               <i ng-if="item.Verdict === \'Nonconcur\'" class="fa fa-thumbs-down fa-2x" style="color:red;"></i>',
                '               <i ng-if="item.Verdict === \'Pending\'" class="fa fa-hourglass-start fa-2x"></i>',
                '           </div>',
                '           <div class="cmmnt-content">',
                '               <header><a class="userlink">{{item.Author.Title}}</a> - <span class="pubdate">{{item.CreatedMoment.format(\'DD MMM YY HHmm[Z]\').toUpperCase()}}</span></header>',
                '               <p ng-bind-html="replaceLineBreaks(item.Comments)"></p>',
                '           </div>',
                '       </li>',
                '   </ul>',
                '</div>'
            ].join('');

            return parts;
        }

        function generateShowAllSectionsMessage() {
            //NOT USED
            var parts = [
                '<div class="ms-MessageBanner" ng-show="!!selectedTab">',
                '   <div class="ms-MessageBanner-content">',
                '       <div class="ms-MessageBanner-text">',
                '           <div class="ms-MessageBanner-clipper">',
                '               <span> You are only looking at </span><strong>one section</strong><span> of the {{selectedStage.name}} routing sheet. To see the other sections click the button.</span>',
                '           </div>',
                '       </div>',
                '       <div class="ms-MessageBanner-action">',
                '           <button class="ms-fontColor-neutralLight ms-Button ms-Button--primary" type="button" ng-click="onTabClicked()">',
                '	            <span class="ms-Button-label"><span>Show All Sections</span></span>',
                '           </button>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('');

            return "";
        }

        function generateTabsHtml() {
            //NOT USED
            var parts = [
                '<ul ng-if="signatureBlocks.length > 1 && !errors" class="ms-Pivot ms-Pivot--tabs ms-Pivot--large">',
                '   <li class="ms-Pivot-link" ng-repeat="block in signatureBlocks" ng-click="onTabClicked(block)" ng-class="{\'is-selected\': block.signOnBehalfOf === selectedTab}">{{block.title}}</li>',
                '</ul>'
            ].join('');
            return "";
        }
    }

})();

/* Controller: OrgDashboardAspxController */
(function () {
    angular
        .module('app.core')
        .controller('OrgDashboardAspxController', OrgDashboardAspxController);

    OrgDashboardAspxController.$inject = ['_', 'Mission', 'MissionTrackerRepository'];
    function OrgDashboardAspxController(_, Mission, MissionTrackerRepository) {
        var vm = this;
        vm.chopDialogCtx = {
            show: false
        }

        vm.selectedOrg = (_.getQueryStringParam("org") || "");
        MissionTrackerRepository.getByOrganization(vm.selectedOrg).then(function (data) {
            vm.missions = _.map(data, function (item) { return new Mission(item); });
        })
    }


})();

/* Controller: MissionTrackerDataEntryAspxController*/
(function () {
    angular
        .module('app.core')
        .controller('MissionTrackerDataEntryAspxController', controller);

    controller.$inject = ['$scope', '_', 'Mission', 'spContext', 'SPUtility'];
    function controller($scope, _, Mission, spContext, SPUtility) {
        var vm = this;
        var itemOnEditFormAspxLoad = null;

        $scope.routeMessage = "";

        init();

        window.PreSaveAction = function () {
            var msn = new Mission();
            msn.ApprovalAuthority = SPUtility.GetSPFieldByInternalName("ApprovalAuthority").GetValue();
            msn.Comments = SPUtility.GetSPFieldByInternalName("Comments").GetValue();
            msn.ExpectedExecution = moment.utc(SPUtility.GetSPFieldByInternalName("ExpectedExecution").GetValue().toString());
            msn.ExpectedTermination = moment.utc(SPUtility.GetSPFieldByInternalName("ExpectedTermination").GetValue().toString());
            msn.MissionApproved = moment.utc(SPUtility.GetSPFieldByInternalName("MissionApproved").GetValue().toString());
            msn.ObjectiveName = SPUtility.GetSPFieldByInternalName("ObjectiveName").GetValue();
            msn.OperationName = SPUtility.GetSPFieldByInternalName("OperationName").GetValue();
            msn.ParticipatingOrganizations = SPUtility.GetSPFieldByInternalName("ParticipatingOrganizations").GetValue();
            msn.Status = SPUtility.GetSPFieldByInternalName("Status").GetValue();
            msn.Identifier = (itemOnEditFormAspxLoad) ? itemOnEditFormAspxLoad.Identifier : "";

            var currentURL = document.location.pathname.toUpperCase();
            if (_.includes(currentURL, "/NEWFORM.ASPX")) {
                msn.Organization = SPUtility.GetSPFieldByInternalName("Organization").GetValue();
                msn.MissionType = SPUtility.GetSPFieldByInternalName("MissionType").GetValue();
            } else if (_.includes(currentURL, "/EDITFORM.ASPX")) {
                msn.Id = _.getQueryStringParam("ID");
            }

            msn.save()
                .then(function () {
                    $("input:button[value='Cancel'][id!='attachCancelButton']").eq(0).click();
                })
                .catch(function (error) {
                    alert(error);
                })

            return false;
        }

        function init() {
            itemOnEditFormAspxLoad = spContext.getContextFromEditFormASPX();
            wireUpEventHandlers();
        }

        function wireUpEventHandlers() {
            var ddlMissionType = $(SPUtility.GetSPFieldByInternalName("MissionType").Dropdown);
            var ddlOrganization = $(SPUtility.GetSPFieldByInternalName("Organization").Dropdown);
            var ddlApprovalAuthority = $(SPUtility.GetSPFieldByInternalName("ApprovalAuthority").Dropdown);

            //run handler initially on load and any time the Mission Type dropdown changes
            setApprovalAuthorityBasedOnSelectedMissionType();
            ddlMissionType.on("change", setApprovalAuthorityBasedOnSelectedMissionType);
            function setApprovalAuthorityBasedOnSelectedMissionType() {
                var selectedMissionType = ddlMissionType.val();
                if (selectedMissionType) {
                    //should never hit this line on EditForm.aspx (since "Mission Type" is read only and not rendered as dropdown)
                    var defaultLevel = jocInBoxConfig.missionTypes[selectedMissionType];
                    ddlApprovalAuthority.val(defaultLevel || "");
                    showRouteBasedOnSelectedApprovalAuthorityAndOrganization();
                }
            }

            //run handler initially on load and any time the Mission Type dropdown changes
            showRouteBasedOnSelectedApprovalAuthorityAndOrganization()
            ddlOrganization.on("change", showRouteBasedOnSelectedApprovalAuthorityAndOrganization);
            ddlApprovalAuthority.on("change", showRouteBasedOnSelectedApprovalAuthorityAndOrganization);
            function showRouteBasedOnSelectedApprovalAuthorityAndOrganization() {
                var msg = "";
                var selectedOrganization = getSelectedOrganization();
                var selectedApprovalAuthority = ddlApprovalAuthority.val();
                if (selectedOrganization && selectedApprovalAuthority) {
                    var orgConfig = jocInBoxConfig.dashboards[selectedOrganization];
                    if (orgConfig) {
                        var route = _.find(orgConfig.routes, { name: selectedApprovalAuthority });
                        if (route && route.sequence && route.sequence.length) {
                            msg = route.sequence.join(' --> ');
                        }
                    }
                }

                $scope.$evalAsync(
                    function ($scope) {
                        $scope.routeMessage = msg;
                    }
                );

                function getSelectedOrganization() {
                    var selectedDropdownOption = SPUtility.GetSPFieldByInternalName("Organization").GetValue();
                    if (selectedDropdownOption) {
                        return selectedDropdownOption;
                    }

                    return getOrganizationFromReadOnlyLabel();

                    function getOrganizationFromReadOnlyLabel() {
                        return (itemOnEditFormAspxLoad) ? itemOnEditFormAspxLoad.Organization : "";
                    }
                }
            }
        }
    }
})();

/* Controller: RfiDataEntryAspxController*/
(function () {
    angular
        .module('app.core')
        .controller('RfiDataEntryAspxController', controller);

    controller.$inject = ['$scope', '_', 'RFI', 'spContext', 'SPUtility'];
    function controller($scope, _, RFI, spContext, SPUtility) {
        var vm = this;

        init();

        window.PreSaveAction = function () {
            var formState = getStateForRfiForm();

            var rfi = generateModelFromSpListForm();

            var errors = rfi.validate(formState);
            if (errors) {
                alert(errors);
            } else {
                var itemOnAspxLoad = spContext.getContextFromEditFormASPX();
                rfi.setHiddenFieldsPriorToSave(formState, itemOnAspxLoad);
                rfi.save(formState)
                    .then(function () {
                        $("input:button[value='Cancel'][id!='attachCancelButton']").eq(0).click();
                    })
                    .catch(function (error) {
                        alert(error);
                    })
            }

            //prevent default save behavior
            return false;
        }

        function generateModelFromSpListForm(formState) {
            var rfi = new RFI();
            rfi.Id = _.getQueryStringParam("ID");
            rfi.Title = SPUtility.GetSPFieldByInternalName("Title").GetValue();
            rfi.Status = SPUtility.GetSPFieldByInternalName("Status").GetValue();
            rfi.RfiTrackingNumber = SPUtility.GetSPFieldByInternalName("RfiTrackingNumber").GetValue();
            rfi.MissionId = spContext.getIdFromLookupField("Mission");
            rfi.Details = SPUtility.GetSPFieldByInternalName("Details").GetValue();
            rfi.Priority = SPUtility.GetSPFieldByInternalName("Priority").GetValue();
            rfi.LTIOV = moment.utc(SPUtility.GetSPFieldByInternalName("LTIOV").GetValue().toString());
            rfi.PocNameSelectedKeys = getSelectedUserKeys("PocName");
            rfi.PocPhone = SPUtility.GetSPFieldByInternalName("PocPhone").GetValue();
            rfi.PocOrganization = SPUtility.GetSPFieldByInternalName("PocOrganization").GetValue();
            rfi.ManageRFISelectedKeys = getSelectedUserKeys("ManageRFI"); // object or null {results: [8, 16, 23]} 
            rfi.RecommendedOPR = SPUtility.GetSPFieldByInternalName("RecommendedOPR").GetValue();
            rfi.RespondentNameSelectedKeys = getSelectedUserKeys("RespondentName");
            rfi.RespondentPhone = SPUtility.GetSPFieldByInternalName("RespondentPhone").GetValue()
            rfi.ResponseToRequest = SPUtility.GetSPFieldByInternalName("ResponseToRequest").GetValue()
            rfi.DateClosed = moment.utc(SPUtility.GetSPFieldByInternalName("DateClosed").GetValue().toString());
            rfi.InsufficientExplanation = SPUtility.GetSPFieldByInternalName("InsufficientExplanation").GetValue();
            rfi.ResponseSufficient = SPUtility.GetSPFieldByInternalName("ResponseSufficient").GetValue();
            return rfi;
        }

        function getSelectedUserKeys(internalName) {
            return _.map(spContext.getSelectedUsersFromPeoplePicker(internalName), function (user) { return user.Key });
        }

        function getStateForRfiForm() {
            var currentPath = document.location.pathname.toUpperCase();
            if (!_.includes(currentPath, "/LISTS/RFI/")) { return ""; }
            var qsParamAction = _.getQueryStringParam("action");
            if (_.includes(currentPath, "/LISTS/RFI/NEWFORM.ASPX")) {
                return "new";
            } else if (_.includes(currentPath, "/LISTS/RFI/EDITFORM.ASPX")) {
                if (!qsParamAction) {
                    return "edit";
                } else if (qsParamAction === "Respond") {
                    return "respond";
                } else if (qsParamAction === "Reopen") {
                    return "reopen";
                }
            }
        }

        function init() {
        }


    }
})();

/* Controller: MissionProductsDataEntryAspxController*/
(function () {
    angular
        .module('app.core')
        .controller('MissionProductsDataEntryAspxController', controller);

    controller.$inject = ['$q', '_', 'MessageTraffic', 'MissionDocument', 'spContext', 'SPUtility'];
    function controller($q, _, MessageTraffic, MissionDocument, spContext, SPUtility) {
        var vm = this;
        var itemOnEditFormAspxLoad = null;


        init();

        window.PreSaveAction = function () {
            var doc = generateMissionDocumentModelFromSpListForm();
            var message = generateMessageTrafficModelFromSpListForm();

            var errors = doc.validate();
            if (message) {
                var msgTrafficErrors = message.validate();
                if (msgTrafficErrors) {
                    errors += "\n\t- When 'Send as Message' box is checked, the next six fields are also required";
                }
            }

            if (errors) {
                alert(errors);
            } else {
                doc.save()
                    .then(checkInFile)
                    .then(generateMessage)
                    .then(redirectToSource)
                    .catch(function (error) {
                        alert(error);
                    });
            }

            function checkInFile() {
                return doc.checkIn();
            }

            function generateMessage() {
                if (!message) { return $q.when(); }
                message.LinkToMissionDocument = _spPageContextInfo.webServerRelativeUrl + "/MissionDocuments/" + doc.FileLeafRef;
                return message.save();
            }

            function redirectToSource() {
                $("input:button[value='Cancel'][id!='attachCancelButton']").eq(0).click();
            }

            return false;
        }

        function generateMessageTrafficModelFromSpListForm() {
            if (!SPUtility.GetSPFieldByInternalName("SendAsMessage").GetValue()) {
                //user did not check 'Send as Message' box
                return null;
            }
            var item = new MessageTraffic();

            //item.LinkToMissionDocument

            item.Title = SPUtility.GetSPFieldByInternalName("MessageTitle").GetValue();
            item.TaskInfo = SPUtility.GetSPFieldByInternalName("MessageDetails").GetValue();
            item.OriginatorSender = SPUtility.GetSPFieldByInternalName("MessageOriginatorSender").GetValue();
            item.Receiver = SPUtility.GetSPFieldByInternalName("MessageRecipients").GetValue(); //object {results: ['SOTG 10', 'SOTG 15', 'SOTG 25']} 
            item.DateTimeGroup = moment.utc(SPUtility.GetSPFieldByInternalName("MessageDTG").GetValue().toString());
            item.Significant = SPUtility.GetSPFieldByInternalName("SignificantMessage").GetValue();

            return item;
        }

        function generateMissionDocumentModelFromSpListForm() {
            var doc = new MissionDocument();
            doc.FileLeafRef = SPUtility.GetSPFieldByInternalName("FileLeafRef").GetValue();
            doc.Title = SPUtility.GetSPFieldByInternalName("Title").GetValue();
            doc.Organization = SPUtility.GetSPFieldByInternalName("Organization").GetValue();
            doc.TypeOfDocument = SPUtility.GetSPFieldByInternalName("TypeOfDocument").GetValue();
            doc.MissionId = spContext.getIdFromLookupField("Mission");
            doc.FlaggedForSoacDailyUpdate = SPUtility.GetSPFieldByInternalName("FlaggedForSoacDailyUpdate").GetValue();
            doc.Id = _.getQueryStringParam("ID");
            return doc;
        }

        function init() {
            itemOnEditFormAspxLoad = spContext.getContextFromEditFormASPX();
            wireUpEventHandlers();
        }

        function wireUpEventHandlers() {
            var spUtilityField = SPUtility.GetSPFieldByInternalName("SendAsMessage");
            var spUtilityFieldParentTableRow = $(spUtilityField.ControlsRow);
            var nextSixRows = spUtilityFieldParentTableRow.nextAll().slice(0, 6);
            $(spUtilityField.Checkbox).on('change', function () {
                var isChecked = this.checked;
                if (isChecked) {
                    nextSixRows.show();
                    nextSixRows.find('.ms-formlabel, .ms-formbody').show();
                } else {
                    nextSixRows.hide();
                }
            })
        }
    }
})();

/* Controller: EditNavController with route for SPA */
(function () {
    angular
        .module('app.core')
        .controller('EditNavController', EditNavController); 

    EditNavController.$inject = ['$q', '$timeout', '_', 'logger', 'ConfigRepository'];
    function EditNavController($q, $timeout, _, logger, ConfigRepository) {
        var vm = this;
    }
})();

/* Controller: MissionTrackerController with route for SPA*/
(function () {
    'use strict';
    //nicer looking plugin found here but requires bootstrap: http://www.dijit.fr/demo/angular-weekly-scheduler/
    angular
        .module('app.core')
        .controller('MissionTrackerController', MissionTrackerController);

    MissionTrackerController.$inject = ['$q', '$routeParams', '_', 'logger', 'DocumentChopsRepository', 'MissionDocument', 'MissionDocumentRepository', 'Mission', 'MissionTrackerRepository'];
    function MissionTrackerController($q, $routeParams, _, logger, DocumentChopsRepository, MissionDocument, MissionDocumentRepository, Mission, MissionTrackerRepository) {
        var vm = this;
        var dataSources = {
            missionRelatedDocs: [],
            chopProcesses: []
        };

        vm.filterOptions = {
            chopProcesses: {
                overallChopStatus: []
            },
            products: {
                organization: []
            }
        };

        activate();

        vm.onMissionsFiltered = function (selectedMissions) {
            vm.selectedMissions_idList = _.map(selectedMissions, 'Id');
            applyFilters();
        }

        vm.onFilterOptionClicked = function (option, dataSourceName) {
            if (option) {
                option.isSelected = !option.isSelected;
            }
            applyFilters(dataSourceName);
        }

        vm.onChopCreated = function () {
            applyFilters();
        }

        function applyFilters(dataSourceName) {
            filterChopProcesses();
            filterProducts();

            function filterChopProcesses() {
                if (dataSourceName && dataSourceName !== 'chopProcesses') { return; }
                if (!dataSources.chopProcesses.length) {
                    vm.chopProcessesDataSource = [];
                    return;
                }
                vm.chopProcessesDataSource =
                    _.chain(dataSources.chopProcesses)
                        .filter(shouldShowBasedOnSelectedMissions)
                        .filter(shouldShowBasedOnSelectedChopStatuses)
                        .value();
            }

            function filterProducts() {
                if (dataSourceName && dataSourceName !== 'missionRelatedDocs') { return; }
                if (!dataSources.missionRelatedDocs.length) {
                    vm.missionProductsDataSource = {};
                    return;
                }
                vm.missionProductsDataSource =
                    _.chain(dataSources.missionRelatedDocs)
                        .filter(shouldShowBasedOnSelectedMissions)
                        .filter(shouldShowBasedOnSelectedOrganizations)
                        .groupBy(function (item) { return item.Mission.FullName; })
                        .value();
            }
        }

        function shouldShowBasedOnSelectedMissions(item) {
            if (vm.selectedMissions_idList.length === 0) { return false; }
            return _.includes(vm.selectedMissions_idList, item.MissionId);
        }

        function shouldShowBasedOnSelectedChopStatuses(item) {
            var selectedOptions = _.map(_.filter(vm.filterOptions.chopProcesses.overallChopStatus, { isSelected: true }), 'key');
            return _.includes(selectedOptions, item.chopProcessInfo.overallChopStatus);
        }

        function shouldShowBasedOnSelectedOrganizations(item) {
            var selectedOptions = _.map(_.filter(vm.filterOptions.products.organization, { isSelected: true }), 'key');
            return _.includes(selectedOptions, item.Organization);
        }

        function activate() {
            initTabs();
            $q.all([
                getMissionRelatedDocumentsWithTheirAssociatedChops(),
                getMissions()
            ])
                .then(function (data) {
                    var docs = data[0];
                    dataSources.missionRelatedDocs = data[0];
                    dataSources.chopProcesses = _.filter(dataSources.missionRelatedDocs, function (doc) { return !!doc.ChopProcess; });
                    buildFilterControlsForProducts();
                    buildFilterControlsForChopProcesses();
                    vm.missions = data[1];
                    logger.info('Activated Mission Tacker View');
                });
        }

        function buildFilterControlsForChopProcesses() {
            buildStatusFilter();

            function buildStatusFilter() {
                var statuses = ["In Chop", "Approved", "Disapproved"];
                vm.filterOptions.chopProcesses.overallChopStatus = _.map(statuses, function (status) {
                    return {
                        key: status,
                        isSelected: true
                    };
                });
            }
        }

        function buildFilterControlsForProducts() {
            buildOrganizationFilter();

            function buildOrganizationFilter() {
                var uniqueOrgs = _.sortBy(_.uniq(_.map(dataSources.missionRelatedDocs, "Organization")));
                vm.filterOptions.products.organization = _.map(uniqueOrgs, function (item) {
                    return {
                        key: item,
                        isSelected: true
                    };
                });
            }
        }

        function initTabs() {
            var pivots = [
                { title: "Timeline" },
                { title: "Products" },
                { title: "Product Chop" }
            ];

            var selectedIndex = (!$routeParams.tabIndex || $routeParams.tabIndex >= pivots.length) ? 0 : $routeParams.tabIndex;

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

        function getMissions() {
            return MissionTrackerRepository.getByOrganization("").then(function (data) {
                return _.map(data, function (item) { return new Mission(item); });
            })
        }

        function getMissionRelatedDocumentsWithTheirAssociatedChops() {

            return $q.all([
                MissionDocumentRepository.getMissionRelated(),
                DocumentChopsRepository.getAll()
            ])
                .then(function (data) {
                    var chopsJSON = data[1];
                    var docs = _.map(data[0], function (item) {
                        var doc = new MissionDocument(item);
                        doc.relatedChops = getRelatedChops(doc, chopsJSON);
                        doc.refreshChopProcessInfo();
                        return doc;
                    });
                    return docs;
                });

            function getRelatedChops(doc, chopsJSON) {
                return _.filter(chopsJSON, function (docChop) {
                    return parseInt(docChop.DocumentId, 10) === doc.Id;
                });
            }
        }
    }
})();

/* Controller: RfiController with route for SPA*/
(function () {
    angular
        .module('app.core')
        .controller('RfiController', RfiController);

    RfiController.$inject = ['$q', '$scope', '$routeParams', '_', 'logger', 'RFI', 'RfiRepository', 'Mission', 'MissionTrackerRepository', 'ConfigRepository'];
    function RfiController($q, $scope, $routeParams, _, logger, RFI, RFIRepository, Mission, MissionTrackerRepository, ConfigRepository) {
        var vm = this;
        var rfiList = null;
        activate();

        function activate() {
            initTabs();
            fetchData()
                .then(function (data) {
                    rfiList = data;
                    buildFilterControlDataSource();
                    vm.applyFilters();
                });
        }

        vm.getAction = function (item) {
            var action;

            if (vm.tabConfig.selectedPivot.title === "My RFIs") {
                action = (item.Status === "Open") ? "Respond" : "Edit";
            } else {
                action = (item.Status === "Open") ? "Respond" : "Reopen";
            }

            return action;
        }

        vm.goToEditForm = function (item) {
            var url = _spPageContextInfo.webServerRelativeUrl + "/Lists/RFI/EditForm.aspx?ID=" + item.Id + "&Source=" + encodeURIComponent(document.location.href);
            var action = vm.getAction(item);

            if (action !== "Edit") {
                url += "&action=" + action;
            }
            window.location.href = url;
        }

        vm.getButtonText = function (item) {

            window.location.href = url;
        }

        var dataSources = {
            "Open": [],
            "Closed": [],
            "My RFIs": [],
            "Manage RFIs": []
        };

        $scope.$watch('vm.tabConfig.selectedPivot', function () {
            vm.applyFilters();
        });

        vm.goToNewRfiForm = function () {
            window.location.href = _spPageContextInfo.webServerRelativeUrl + "/Lists/Rfi/NewForm.aspx?&Source=" + encodeURIComponent(document.location.href);
        }

        vm.applyFilters = function (clickedOpr) {
            if (clickedOpr) {
                clickedOpr.isSelected = !clickedOpr.isSelected;
            }

            var selectedOprs = _.chain(vm.filterControlDataSource)
                .filter({ isSelected: true })
                .map('key')
                .value();
            var filteredList = _.filter(rfiList, isRecommendedOprOneOfTheSelected);

            dataSources["Open"] = _.filter(filteredList, { Status: "Open" });
            dataSources["Closed"] = _.filter(filteredList, { Status: "Closed" });
            dataSources["My RFIs"] = _.filter(filteredList, { AuthorId: _spPageContextInfo.userId });
            dataSources["Manage RFIs"] = _.filter(filteredList, isCurrentUserTaggedAsManagerForRfi);

            vm.selectedDataSource = dataSources[vm.tabConfig.selectedPivot.title]

            function isCurrentUserTaggedAsManagerForRfi(item) {
                if (!item.ManageRFIId) { return false; }
                return _.includes(item.ManageRFIId.results, _spPageContextInfo.userId);
            }

            function isRecommendedOprOneOfTheSelected(item) {
                return _.includes(selectedOprs, item.RecommendedOPR);
            }
        }

        vm.truncateText = function (str, length) {
            if (!str.length || str.length <= length) { return str; }
            return str.substr(0, length) + "...";
        }

        function buildFilterControlDataSource() {
            vm.filterControlDataSource = _.chain(rfiList)
                .groupBy('RecommendedOPR')
                .map(function (items, groupName) { return { key: groupName, count: items.length, isSelected: true }; })
                .sortBy(['key'])
                .value();
        }

        function initTabs() {
            var pivots = [
                { title: "Open" },
                { title: "Closed" },
                { title: "My RFIs" },
                { title: "Manage RFIs" }
            ];

            var selectedIndex = (!$routeParams.tabIndex || $routeParams.tabIndex >= pivots.length) ? 0 : $routeParams.tabIndex;

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
                    return _.map(data, function (item) { return new RFI(item); })
                })
        }
    }
})();

/* Controller: SandboxController with route for SPA*/
(function () {
    'use strict';
    angular
        .module('app.core')
        .controller('DeveloperSandboxController', ControllerDefFunc);

    ControllerDefFunc.$inject = ['$q', '$routeParams', '_', 'logger'];
    function ControllerDefFunc($q, $routeParams, _, logger) {
        var vm = this;

        activate();

        function activate() {
            $q.all([
                getDataForVerticalTimeline(),
                getDataForProcess()
            ])
                .then(function (data) {
                    vm.missionLifecycleEvents = data[0];
                    vm.routingSteps = data[1];
                    logger.info('Activated Developer Sandbox View');
                });
        }

        function getDataForVerticalTimeline() {
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

        function getDataForProcess() {
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

(function () {
    $(document).ready(bootstrapNgApplication);
    function bootstrapNgApplication() {
        var currentURL = window.location.pathname.toUpperCase();
        var spPage = $("body");
        if (_.includes(currentURL, '/SITEPAGES/SOCC.ASPX') || _.includes(currentURL, '/SITEPAGES/SOTG.ASPX')) {
            spPage.attr('ng-controller', 'OrgDashboardAspxController as vm');
            spPage.append(generateChopDialogHtml());
        }

        if (_.includes(currentURL, '/LISTS/MISSIONTRACKER/NEWFORM.ASPX') || _.includes(currentURL, '/LISTS/MISSIONTRACKER/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'MissionTrackerDataEntryAspxController as vm');
        }

        if (_.includes(currentURL, '/LISTS/RFI/NEWFORM.ASPX') || _.includes(currentURL, '/LISTS/RFI/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'RfiDataEntryAspxController as vm');
        }

        if (_.includes(currentURL, '/MISSIONDOCUMENTS/FORMS/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'MissionProductsDataEntryAspxController as vm');
        }

        addMenuDirective();
        //BOOTSTRAP NG-APP
        angular.bootstrap(document, ['singlePageApp']); 

        function addMenuDirective() {
            spPage.find("#sideNavBox").prepend("<nav-menu></nav-menu>");
        }

        function generateChopDialogHtml() {
            var html = [
                '<uif-dialog uif-close="false" uif-overlay="light" uif-type="multiline" ng-show="vm.chopDialogCtx.show">',
                '   <uif-dialog-header>',
                '       <p class="ms-Dialog-title">',
                '           Initiate Chop Process',
                '       </p>',
                '   </uif-dialog-header>',
                '   <uif-dialog-inner>',
                '       <uif-dialog-content>',
                '           <uif-dialog-subtext>',
                '               <span>Associate this document to a Mission:</span>',
                '           </uif-dialog-subtext>',
                '           <uif-dropdown ng-model="vm.chopDialogCtx.listItem.Mission.Id">',
                '               <uif-dropdown-option ng-repeat="mission in vm.chopDialogCtx.missions" value="{{mission.Id}}" title="{{mission.Identifier}}">{{mission.Identifier}}</uif-dropdown-option>',
                '           </uif-dropdown>',
                '           <uif-message-bar uif-type="error" ng-show="vm.chopDialogCtx.isFormValid()">',
                '               <uif-content>This is a required field</uif-content>',
                '           </uif-message-bar>',
                '       </uif-dialog-content>',
                '       <uif-dialog-actions uif-position="right">',
                '           <button class="ms-Dialog-action ms-Button ms-Button--primary" ng-click="vm.chopDialogCtx.submit()">',
                '               <span class="ms-Button-label">Start Chop</span>',
                '           </button>',
                '           <button class="ms-Dialog-action ms-Button" ng-click="vm.chopDialogCtx.show = false">',
                '               <span class="ms-Button-label">Cancel</span>',
                '           </button>',
                '       </uif-dialog-actions>',
                '   </uif-dialog-inner>',
                '</uif-dialog>'].join('');
            return html;
        }
    }
})();
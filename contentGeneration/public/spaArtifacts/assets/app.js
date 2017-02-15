(function ($, _) {
    'use strict';
    var globalConfig = {
        appErrorPrefix: '[Exercise Application Error] ',
        appTitle: 'Exercise Application',
        showDebugToasts: true  //CHANGE THIS TO 'FALSE' FOR THE PRODUCTION RELEASE
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
        .config(registerRoutes)
        .run(listenForFrouteChanges)

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

    listenForFrouteChanges.$inject = ['$rootScope', '$window'];
    function listenForFrouteChanges($rootScope, $window){
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
    
        });
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
            .when('/currentops', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/projection-scrollable.html',
                controller: 'ProjectionScrollableAspxController as vm'
            })
            .when('/helpdesk/:tabIndex?', {
                templateUrl: jocInBoxConfig.htmlTemplatesLocation + '/helpdesk.html',
                controller: 'HelpDeskController as vm'
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Module: app.data and app.models */
(function ($, _) {
    angular.module('app.models', []);
    angular.module('app.data', ['app.models'])
        .service('spContext', spContext)
        .run(['spContext', function (spContext) {
            //simply requiring this singleton runs it initialization code..
        }]);

    spContext.$inject = ['$http', '$q', '$resource', '$timeout', 'logger'];
    function spContext($http, $q, $resource, $timeout, logger) {
        var service = this;

        var defaultHeaders = {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-Requested-With': 'XMLHttpRequest'
        }

        service.SP2013REST = {
            //ServerRedirectedEmbedUrl is not a standard field within on-premise Document Libraries
            selectForCommonDocumentFields: 'Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title,File/CheckOutType,File/MajorVersion,File/Name,File/ServerRelativeUrl,File/TimeCreated,File/TimeLastModified',
            expandoForCommonDocumentFields: 'Author,Editor,File',
            selectForCommonListFields: 'Attachments,Id,Title,Created,Modified,AuthorId,EditorId,Author/Title,Editor/Title',
            expandoForCommonListFields: 'Author,Editor'
        }
        service.constructNgResourceForRESTCollection = constructNgResourceForRESTCollection;
        service.constructNgResourceForRESTResource = constructNgResourceForRESTResource;
        service.copyAttachmentsBetweenListItems = copyAttachmentsBetweenListItems;
        service.makeMultiChoiceRESTCompliant = makeMultiChoiceRESTCompliant;
        service.makeMomentRESTCompliant = makeMomentRESTCompliant;
        service.makeHyperlinkFieldRESTCompliant = makeHyperlinkFieldRESTCompliant;
        service.getContextFromEditFormASPX = getContextFromEditFormASPX;
        service.getSelectedUsersFromPeoplePicker = getSelectedUsersFromPeoplePicker;
        service.getIdFromLookupField = getIdFromLookupField;
        service.defaultHeaders = defaultHeaders;
        service.copyFile = copyFile;
        service.sendEmail = sendEmail;
        service.generateEmailBody = generateEmailBody;
        service.getUserInfoListItem = getUserInfoListItem;
        service.getGroupByDescription = getGroupByDescription

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
                            '$expand': opts.fieldsToExpand,
                            '$top': 5000
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

        function copyAttachmentsBetweenListItems(operations){
            patchSpRequestExecutor();
            var promiseChain = operations.reduce(function (previousPromise, operation) {
				return previousPromise.then(function () {
					return copyAttachment(operation);
				});
			}, $q.when());

			//returning promise chain that caller can resolve...
			return promiseChain;
        }

        function copyAttachment(opts){
            return getListItemAttachmentBinary(opts).then(uploadListItemAttachmentBinary);
        
            function getListItemAttachmentBinary(opts){
                var dfd = $q.defer();

                var fileContentUrl = opts.webUrl + "/_api/web/Lists/getByTitle('"+opts.sourceListName+"')/Items("+opts.sourceListItemID+")/AttachmentFiles('"+opts.fileName+"')/$value";
                var executor = new SP.RequestExecutor(opts.webUrl);
                var request = {
                    url: fileContentUrl,
                    method: "GET",
                    binaryStringResponseBody: true,
                    success: function (data) {
                        //binary data available in data.body
                        opts.binary = data.body;
                        dfd.resolve(opts);
                    },
                    error: function (err) {
                        dfd.reject(JSON.stringify(err));
                    }
                };
                executor.executeAsync(request);

                return dfd.promise;
            }

            function uploadListItemAttachmentBinary(opts){
                var dfd = $q.defer();

                var fileContentUrl = opts.webUrl + "/_api/web/Lists/getByTitle('"+opts.destinationListName+"')/Items("+opts.destinationListItemID+")/AttachmentFiles/add(FileName='"+opts.fileName+"')";
                var executor = new SP.RequestExecutor(opts.webUrl);
                var request = {
                    url: fileContentUrl,
                    method: "POST",
                    binaryStringRequestBody: true,
                    body: opts.binary,
                    state: "Update",
                    success: function (data) {
                        dfd.resolve();
                    },
                    error: function (err) {
                        var error = JSON.stringify(err);
                        dfd.reject(error);
                    }
                };
                executor.executeAsync(request);

                return dfd.promise;
            }
        }

        function copyFile(webUrl, source, destination){
            var url =  webUrl + "/_api/web/getfilebyserverrelativeurl('"+source+"')/copyto(strnewurl='"+destination+"',boverwrite=false)";
            var headers = angular.extend({}, service.defaultHeaders, {'X-RequestDigest': service.securityValidation});
            return $http({
                method: "post",
                url: url,
                headers: headers
            });
        }

        function generateEmailBody(templateUrl, data){
            return $http({url: templateUrl}).then(function(response){
                var compiled = jocInBoxConfig.noConflicts.lodash.template(response.data);
                return compiled(data);
            })
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

        function getUserInfoListItem(userID){
            var ngResource = $resource( _spPageContextInfo.webServerRelativeUrl + "/_api/web/SiteUserInfoList/Items(:userId)",
                { userId: userID },
                {
                    get: {
                        method: 'GET',
                        headers: defaultHeaders
                    }
                });
            return ngResource.get().$promise
                .then(function(response){
                    return response.d;
                });
        }

        function getGroupByDescription(description){
            var ngResource = $resource( _spPageContextInfo.siteAbsoluteUrl + "/_api/web/SiteGroups?$filter=Description eq ':description'",
                { description: description },
                {
                    get: {
                        method: 'GET',
                        headers: defaultHeaders
                    }
                });
            return ngResource.get().$promise
                .then(function(response){
                    return response.d;
                });
        }

        function patchSpRequestExecutor(){
            SP.RequestExecutorInternalSharedUtility.BinaryDecode = function SP_RequestExecutorInternalSharedUtility$BinaryDecode(data) {
               var ret = '';
             
               if (data) {
                  var byteArray = new Uint8Array(data);
             
                  for (var i = 0; i < data.byteLength; i++) {
                     ret = ret + String.fromCharCode(byteArray[i]);
                  }
               }
               ;
               return ret;
            };
             
            SP.RequestExecutorUtility.IsDefined = function SP_RequestExecutorUtility$$1(data) {
               var nullValue = null;
             
               return data === nullValue || typeof data === 'undefined' || !data.length;
            };
             
            SP.RequestExecutor.ParseHeaders = function SP_RequestExecutor$ParseHeaders(headers) {
               if (SP.RequestExecutorUtility.IsDefined(headers)) {
                  return null;
               }
               var result = {};
               var reSplit = new RegExp('\r?\n');
               var headerArray = headers.split(reSplit);
             
               for (var i = 0; i < headerArray.length; i++) {
                  var currentHeader = headerArray[i];
             
                  if (!SP.RequestExecutorUtility.IsDefined(currentHeader)) {
                     var splitPos = currentHeader.indexOf(':');
             
                     if (splitPos > 0) {
                        var key = currentHeader.substr(0, splitPos);
                        var value = currentHeader.substr(splitPos + 1);
             
                        key = SP.RequestExecutorNative.trim(key);
                        value = SP.RequestExecutorNative.trim(value);
                        result[key.toUpperCase()] = value;
                     }
                  }
               }
               return result;
            };
             
            SP.RequestExecutor.internalProcessXMLHttpRequestOnreadystatechange = function SP_RequestExecutor$internalProcessXMLHttpRequestOnreadystatechange(xhr, requestInfo, timeoutId) {
               if (xhr.readyState === 4) {
                  if (timeoutId) {
                     window.clearTimeout(timeoutId);
                  }
                  xhr.onreadystatechange = SP.RequestExecutorNative.emptyCallback;
                  var responseInfo = new SP.ResponseInfo();
             
                  responseInfo.state = requestInfo.state;
                  responseInfo.responseAvailable = true;
                  if (requestInfo.binaryStringResponseBody) {
                     responseInfo.body = SP.RequestExecutorInternalSharedUtility.BinaryDecode(xhr.response);
                  }
                  else {
                     responseInfo.body = xhr.responseText;
                  }
                  responseInfo.statusCode = xhr.status;
                  responseInfo.statusText = xhr.statusText;
                  responseInfo.contentType = xhr.getResponseHeader('content-type');
                  responseInfo.allResponseHeaders = xhr.getAllResponseHeaders();
                  responseInfo.headers = SP.RequestExecutor.ParseHeaders(responseInfo.allResponseHeaders);
                  if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 1223) {
                     if (requestInfo.success) {
                        requestInfo.success(responseInfo);
                     }
                  }
                  else {
                     var error = SP.RequestExecutorErrors.httpError;
                     var statusText = xhr.statusText;
             
                     if (requestInfo.error) {
                        requestInfo.error(responseInfo, error, statusText);
                     }
                  }
               }
            };
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

        function sendEmail(from, to, subject, body){
            var recipients = (angular.isArray(to)) ? to : [to];
            var postData = {
                'properties': {
                    '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
                    'From': from,
                    'To': { 'results': recipients },
                    'Subject': subject,
                    'Body': body
                }
            };
            
            var headers = angular.extend({}, service.defaultHeaders, {'X-RequestDigest': service.securityValidation});

            return $http({
                method: "post",
                url: "/_api/SP.Utilities.Utility.SendEmail",
                data: JSON.stringify(postData), 
                headers: headers
            });
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Model: RFI */
(function ($, _) {
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
                    return moment.utc(item[propName]);
                },
                "DateClosed": function (item, propName) {
                    return moment.utc(item[propName]);
                },
                "LTIOV": function (item, propName) {
                    return moment.utc(item[propName]);
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
                if (rfiOnAspxLoad.ResponseSufficient === "Yes" && rfi.ResponseSufficient === "No") {
                    //on load Response Sufficient was "Yes"
                    //but since they navigated to this page we should set it to "No" for them
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

        RFI.prototype.validate = function (formState, itemOnEditFormAspxLoad) {
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
                if (this.ResponseSufficient === "No" && !this.InsufficientExplanation) {
                    errors.push("Insufficient Explanation is a required field");
                }
            }

            var userAttemptedToPassTheBuck = itemOnEditFormAspxLoad.RecommendedOPR !== this.RecommendedOPR;
            if (formState === 'respond' && !userAttemptedToPassTheBuck) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Model: Message Traffic */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Model: Mission Document */
(function ($, _) {
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
                this.DailyProductDate = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.ChopProcessInitiationDate = undefined; //string (ISO) or null "2016-08-01T07:00:00Z"
                this.VersionBeingChopped = undefined; //integer or null
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
                        return moment.utc(item[propName]);
                    },
                    "Modified": function (item, propName) {
                        return moment.utc(item[propName]);
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

        MissionDocument.prototype.initiateChop = function () {
            //convert model to DTO that will be used for save...HTTP MERGE should ignore any 'undefined'' props in the request body
            var dto = new MissionDocument();
            dto.Id = this.Id;
            dto.__metadata = this.__metadata;
            dto.ChopProcessInitiationDate = (new Date()).toISOString();
            dto.MissionId = this.Mission.Id;
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

            //validate client-side (these fields are required, but not enforced at schema-level, so we can enable drag-drop scenarios)
            if(!this.Title){
                this.Title = fileNameWithoutExtension;
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
            if (!this.ChopProcessInitiationDate) {
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
            //approval chain (lookup based on Organization conducting the mission and approval authority for the mission)
            var stageNames = _.find(jocInBoxConfig.dashboards[doc.Mission.Organization].routes, { name: doc.Mission.ApprovalAuthority }).sequence;
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Model: Mission Tracker */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Config */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Document Chops */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Inject */
(function ($, _) {
    angular.module('app.data')
        .service('InjectRepository', repositoryFunc)
    repositoryFunc.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function repositoryFunc($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getById: getById,
            save: save        
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "AttachmentFiles,Status,DateTimeGroup,TaskInfo,DeskResponsible,OriginatorSender,Receiver,IIRNumber,ReviewedForRelease,TargetEvent,TargetEventDate,ReportType"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields,
            "AttachmentFiles"
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Inject'
        };

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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: RFI */
(function ($, _) {
    angular.module('app.data')
        .service('RfiRepository', RfiRepository);
    RfiRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function RfiRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            getMissionRelated: getMissionRelated,
            getOpenHighPriority: getOpenHighPriority,
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

        function getAll(){
            return getItems();
        }

        function getItems(params) {
            var qsParams = params || {}; //{$filter:"FavoriteNumber eq 8"};
            var dfd = $q.defer();
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    dfd.resolve(_.map(data.d.results, function(item){
                        item.LTIOV = moment(item.LTIOV);
                        item.Created = moment(item.Created);
                        return item;
                    }));
                },
                function (error) {
                    dfd.reject(error);
                });
            return dfd.promise;
        }

        function getMissionRelated() {
            //FOLLOWING does not work on-premise: { $filter: "Mission/Id ne null" };
            return getItems()
                        .then(function(results){
                            var missionRelated = _.filter(results, function(item){ return !!item.Mission.FullName; });
                            return missionRelated;
                        });
        }

        function getOpenHighPriority(org){
            var params = {$filter:"Priority eq 'Immediate (< 24 hrs)' and Status eq 'Open'"};
            return getItems(params)
                .then(function(data){
                    if(org){
                        return _.filter(data, function(item){ return _.includes(item.RecommendedOPR, org);});
                    } else {
                        return data;
                    }
                });
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
                listItem.set_item('RfiTrackingNumber', (rfi.RfiTrackingNumber || null));
                listItem.set_item('Mission', convertToFieldLookupValue(rfi.MissionId));
                listItem.set_item('RecommendedOPR', rfi.RecommendedOPR);

                if(rfi.RespondentNameSelectedKeys.length){
                    listItem.set_item('RespondentName', SP.FieldUserValue.fromUser(rfi.RespondentNameSelectedKeys[0]));
                }
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Mission Documents */
(function ($, _) {
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
            'VersionBeingChopped,ChopProcessInitiationDate',
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
            //SP.CheckinType enumeration (overwriteCheckin requires elevated permissions)
            var url = webUrl + "/_api/web/GetFileByServerRelativeUrl('" + fileUrl + "')/CheckIn(comment='',checkintype=1)";

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

        function getAll(){
            return getItems();
        }

        function getItems(params) {
            var dfd = $q.defer();
            var qsParams = params || {}; //{$filter:"FavoriteNumber eq 8"};
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
            //FOLLOWING does not work on-premise: { $filter: "Mission/Id ne null" };
            return getItems()
                        .then(function(results){
                            var missionRelated = _.filter(results, function(item){ return !!item.Mission.FullName; });
                            return missionRelated;
                        });
        }

        function getById(id) {
            var constructParams = angular.extend({}, { item: { Id: id } }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.get({}).$promise.then(function (response) { return response.d; });
        }

        function save(item) {
            spContext.makeMomentRESTCompliant(item, "DailyProductDate");
            var constructParams = angular.extend({}, { item: item }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.post(item).$promise;
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Message Traffic */
(function ($, _) {
    angular.module('app.data')
        .service('MessageTrafficRepository', MessageTrafficRepository);
    MessageTrafficRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function MessageTrafficRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll,
            getSignificantItemsCreatedInLast24Hours: getSignificantItemsCreatedInLast24Hours,
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
            return getItems();
        }

        function getSignificantItemsCreatedInLast24Hours(org){
            return getItems({$filter: "Significant eq 'Yes' and Created gt '" + moment.utc().add(-24, 'hours').toISOString() + "'"})
                .then(function(items){
                    if(org){
                       return _.filter(items, function(item){
                            return item.OriginatorSender === org || _.includes(item.Receiver.results, org);
                        }); 
                    } else{
                        return items;
                    }
                });
        }

        function getItems(params) {
            var qsParams = params || {}; //{$filter:"FavoriteNumber eq 8"};
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Mission Tracker */
(function ($, _) {
    angular.module('app.data')
        .service('MissionTrackerRepository', MissionTrackerRepository)
    MissionTrackerRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function MissionTrackerRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getByOrganization: getByOrganization,
            getOpenMissionsByApprovalChain: getOpenMissionsByApprovalChain,
            save: save,
            updateMissionStatusBasedOnConopChopDecision: updateMissionStatusBasedOnConopChopDecision
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

        function getById(id) {
            var constructParams = angular.extend({}, { item: { Id: id } }, ngResourceConstructParams);
            var restResource = spContext.constructNgResourceForRESTResource(constructParams);
            return restResource.get({}).$promise.then(function (response) { return response.d; });
        }

        function getByOrganization(org){
            return getItems()
                        .then(function(results){
                            if (org) {
                                results = _.filter(results, function (item) {
                                    return item.Organization === org || _.includes(item.ParticipatingOrganizations.results, org);
                                })
                            }
                            return results;
                        });
        }

        function getOpenMissionsByApprovalChain(org){
            return getItems({$filter:"Status ne 'Mission Closed'"})
                        .then(function(results){
                            if (org) {
                                results = _.filter(results, function (item) {
                                    var sequenceOfReviewers = _.find(jocInBoxConfig.dashboards[item.Organization].routes, {name: item.ApprovalAuthority}).sequence;
                                    return _.includes(sequenceOfReviewers, org);
                                })
                            }
                            results = _.map(results, decorateMission);
                            return results;
                        });

            function decorateMission(item){
                item.ExpectedExecution = moment.utc(item.ExpectedExecution);
                item.ExpectedTermination = moment.utc(item.ExpectedTermination);
                return item;
            }
        }

        function getItems(params) {
            var qsParams = params || {}; //{$filter:"FavoriteNumber eq 8"};
            var dfd = $q.defer();
            spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams,
                function (data) {
                    var queryResults = data.d.results;
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

        function updateMissionStatusBasedOnConopChopDecision(conopStatus, missionId){
            getById(missionId)
                .then(function(mission){
                    var newMissionStatus = "";
                    if(conopStatus === "Approved" && _.includes(['Initial Targeting', 'JPG Assigned', 'COA Approved', 'CONOP Received - In Chop', 'CONOP Disapproved'], mission.Status)){
                        newMissionStatus = "CONOP Approved";
                    } else if(conopStatus === "Disapproved"){
                        newMissionStatus = "CONOP Disapproved";
                    }
                    
                    if(newMissionStatus){
                        var item = { 
                            Id: mission.Id, 
                            Status: newMissionStatus,
                            __metadata: mission.__metadata
                        };
                        var constructParams = angular.extend({}, { item: { Id: item.Id } }, ngResourceConstructParams);
                        var restResource = spContext.constructNgResourceForRESTResource(constructParams);
                        return restResource.post(item);
                    }
                });
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Calendar */
(function ($, _) {
    angular.module('app.data')
        .service('CalendarRepository', CalendarRepository)
    CalendarRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function CalendarRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getOptionsForCategoryField: getOptionsForCategoryField,
            getBattleRhythmNext24: getBattleRhythmNext24,
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
                "category": cleanupMultiChoice(xmlNode.attr("ows_Category")),
                "created": xmlNode.attr("ows_Created"),
                "allDay": xmlNode.attr("ows_fAllDayEvent") == 1 ? true : false,
                "url": _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/DispForm.aspx?ID=" + itemID + '&Source=' + window.location,
                "isRecurrence": xmlNode.attr("ows_fRecurrence") == 1 ? true : false,
                "organization": xmlNode.attr("ows_Organization")
            };

            function cleanupMultiChoice(xmlAttrValue){
                /**
                 *  converts string:
                 *      ;#Battle Rhythm;#Briefing;#
                 *  to an array
                 *      ["Battle Rhythm", "Briefing"]
                 * */
                if(!xmlAttrValue){
                    return [];
                }
                return _.filter(xmlAttrValue.split(';#'))
            }
        }

        function getOptionsForCategoryField(){
            return $http({
                    url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getByTitle('Calendar')/fields?$filter=InternalName eq 'Category'",
                    method: "GET",
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(function (response) {
                    return response.data.d.results[0].Choices.results;
                });
        }

        function getBattleRhythmNext24(org){
            moment.relativeTimeThreshold('h', 24);
            var now = moment.utc();
            var nowPlus24Hours = moment.utc().add(24, 'hours');
            return getEvents(moment.utc().startOf('week'), moment.utc().endOf('week'), 'week', org).then(function(items){
                var filteredItems = _.filter(items, function(item){
                    return _.includes(item.category, "Battle Rhythm") && item.start.isSameOrBefore(nowPlus24Hours) && item.end.isSameOrAfter(now);
                });

                return _.chain(filteredItems)
                            .sortBy('end')
                            .sortBy('start')
                            .value();
            });
        }

        function getEvents(start, end, intervalUnit, organizationFilter) {
            var diff = end.diff(start, 'hours');
            var midPoint = start.clone().add((diff / 2), 'hours');
            //using midpoint in CAML query seems to worker
            //http://www.nothingbutsharepoint.com/2012/04/26/use-spservices-to-get-recurring-events-as-distinct-items-aspx/
            var camlCalendarDate = midPoint.format("YYYY-MM-DD[T]HH:mm:ss[Z]");

            var camlIntervals = {
                "day": "<Month />",
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
                "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'><soap:Body><GetListItemChangesSinceToken xmlns='http://schemas.microsoft.com/sharepoint/soap/'><listName>Calendar</listName><viewName></viewName><query><Query><Where><DateRangesOverlap><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='RecurrenceID' /><Value Type='DateTime'>" + camlIntervals[intervalUnit] + "</Value></DateRangesOverlap></Where><OrderBy><FieldRef Name='EventDate' /></OrderBy></Query></query><viewFields><ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='EventDate' /><FieldRef Name='EndDate' /><FieldRef Name='Location' /><FieldRef Name='Description' /><FieldRef Name='Category' /><FieldRef Name='fRecurrence' /><FieldRef Name='RecurrenceData' /><FieldRef Name='fAllDayEvent' /><FieldRef Name='Organization' /><FieldRef Name='Created' /></ViewFields></viewFields><rowLimit>300</rowLimit><queryOptions><QueryOptions><CalendarDate>"
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: CCIR */
(function ($, _) {
    angular.module('app.data')
        .service('CCIRRepository', repository)
    repository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function repository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getByOrganization: getByOrganization
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "Category,Status,Number"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'CCIR'
        };

        function getByOrganization(org) {
            //only care about red or yellow CCIRs
            var odataFilter = "Status ne 'Green'";
            if(org){
                odataFilter += "and Organization eq '" + org + "'";
            }
            var qsParams = {
                $filter: odataFilter
            }; 
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams).$promise
                .then(function (response) {
                    return response.d.results;
                });
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Communications Status */
(function ($, _) {
    angular.module('app.data')
        .service('CommunicationsStatusRepository', repository)
    repository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function repository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "Package,SortOrder,UnclassData,BicesData,SecretData,TacsatData,HfData,UnclassPhone,BicesPhone,SecretPhone,TacsatRadio,HfRadio,BicesVtc,SecretVtc,TsVtc,Comments"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Communications Status'
        };

        function getAll(org) {
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get({$orderby:"SortOrder"}).$promise
                .then(function (response) {
                    return response.d.results;
                });
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Watch Log */
(function ($, _) {
    angular.module('app.data')
        .service('WatchLogRepository', WatchLogRepository)
    WatchLogRepository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function WatchLogRepository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getSignificantItemsCreatedInLast24Hours: getSignificantItemsCreatedInLast24Hours
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "ActionTaken,Initials,Significant,DTG,Organization,EventDetails"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Watch Log'
        };

        function getSignificantItemsCreatedInLast24Hours(org) {
            
            //Significant eq 'Yes' and Organization eq 'SOTG 10'
            var odataFilter = "Significant eq 'Yes' and Created gt '" + moment.utc().add(-24, 'hours').toISOString() + "'";
            if(org){
                odataFilter += " and Organization eq '" + org + "'";
            }
            var qsParams = {
                $filter: odataFilter,
                $orderby: 'DateTimeGroup desc'
            }; 
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get(qsParams).$promise
                .then(function (response) {
                    return response.d.results;
                });
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Data Repository: Help Desk */
(function ($, _) {
    angular.module('app.data')
        .service('HelpDeskRepository', repository)
    repository.$inject = ['$http', '$q', '$resource', 'exception', 'logger', 'spContext'];
    function repository($http, $q, $resource, exception, logger, spContext) {
        var service = {
            getAll: getAll
        };

        var fieldsToSelect = [
            spContext.SP2013REST.selectForCommonListFields,
            "Details,CustomerId,Organization,Location,TelephoneNumber,Priority,RequestType,AssignedToId,Comments,Status,ResolutionType,ResolutionDate,PriorityNumber",
            "Customer/Title,AssignedTo/Title"
        ].join(',');

        var fieldsToExpand = [
            spContext.SP2013REST.expandoForCommonListFields,
            'Customer,AssignedTo'
        ].join(',');

        var ngResourceConstructParams = {
            fieldsToSelect: fieldsToSelect,
            fieldsToExpand: fieldsToExpand,
            listName: 'Help Desk'
        };

        function getAll() {
            return spContext.constructNgResourceForRESTCollection(ngResourceConstructParams).get({}).$promise
                .then(function (response) {
                    return _.map(response.d.results, remap);
                });
        }

        function remap(item){
            item.ResolutionDate = moment.utc(item.ResolutionDate);
            item.Created = moment.utc(item.Created);
            return item;
        }

        return service;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: navTree */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: exerciseCalendar */
(function ($, _) {
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
                selectedCategories: "="
            },
            link: link,
            template:  buildHeroButtonHtml() + buildCategoryPicker() + '<div class="exercise-site-calendar"/>'
        };
        return directiveDefinition;

        function buildHeroButtonHtml() {
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/Calendar/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function buildCategoryPicker(){
            return '<div style="border: solid 1px rgb(204,204,204);padding:8px;margin-bottom:5px;"><span ng-repeat="category in categories" ng-click="filterSelected(category)" class="tagfilter" ng-class="{disabled: !category.selected}">{{category.text}}<span data-role="remove"></span></span></div>';
        }

        function link(scope, elem, attrs) {
            scope.showNewItemLink = true;
            initializeCalendar(scope, elem, attrs);
        }

        function initializeCalendar(scope, elem, attrs){
            CalendarRepository.getOptionsForCategoryField().then(function(data){
                initializeCategoriesFilter(data, scope, elem, attrs);
                initPlugin(elem);
            });

            function initializeCategoriesFilter(optionsForChoiceField, scope, elem, attrs){
                scope.categories = _.map(optionsForChoiceField, function(option){
                    return {
                        text: option,
                        selected: !scope.selectedCategories || _.includes(scope.selectedCategories, option)
                    }
                });
                scope.filterSelected = function(category){
                    category.selected = !category.selected;
                    applyFilters();
                }
            }

            function applyFilters(){
                var jqueryWidget = $(elem).find(".exercise-site-calendar");
                jqueryWidget.fullCalendar('rerenderEvents');             
            }

            function initPlugin(elem){
                $(elem).find('.exercise-site-calendar').fullCalendar({
                    // Assign buttons to the header of the calendar. See FullCalendar documentation for details.
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month, agendaWeek, agendaDay'
                    },
                    defaultView: "agendaDay", // Set the default view to month
                    firstHour: "0", // Set the first visible hour in agenda views to 5 a.m.
                    weekMode: "liquid", // Only display the weeks that are needed
                    theme: false, // Use a jQuery UI theme instead of the default fullcalendar theme
                    editable: false, // Set the calendar to read-only; events can't be dragged or resized

                    // Add events to the calendar. This is where the "magic" happens!
                    events: function (start, end, timezone, callback) {
                        var calView = $(elem).find('.exercise-site-calendar').fullCalendar('getView');
                        CalendarRepository.getEvents(start, end, calView.intervalUnit, (_.getQueryStringParam("org") || ""))
                            .then(function (data) {
                                callback(data);
                            })

                    },
                    timeFormat: "HHmm[Z]",
                    slotLabelFormat: "HHmm[Z]",
                    eventRender: function(evt, element, view){
                        var selectedCategories = _.map(_.filter(scope.categories, {selected: true}), 'text');
                        return _.intersection(evt.category, selectedCategories).length > 0;
                    }
                });
            }
        }
    }

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: verticalTimeline */
(function ($, _) {
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

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: routingProcessVisualization */
(function ($, _) {
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
                    <li ng-click="onStepClicked(step.text)" ng-repeat="step in document.chopProcessInfo.routeStepsVisualizationDataSource" class="li" ng-class="{\'complete\': step.status===\'complete\', \'incomplete\': step.status===\'incomplete\', \'ondeck\': step.text === document.chopProcessInfo.requiresDecisionFrom }">\
                        <div class="status">\
                            <i ng-show="step.text === document.chopProcessInfo.requiresDecisionFrom" style="position:absolute;top:-12px;left:19px;" class="fa fa-hourglass-start fa-2x"></i>\
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

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: rfibutton */
(function ($, _) {
    angular
        .module('app.core')
        .directive('rfibutton', rfibutton);

    function rfibutton() {
        /* 
        SP2013 display template will render ActionsHtml column (anytime it appears in LVWP) as:
            <a class="custombtn" rfibutton="" data-id="1">Respond</a>
        Post-link it becomes:
            <a class="custombtn ng-isolate-scope" rfibutton="">Respond</a>
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
            $elem.removeAttr("data-id");
            var buttonText = $elem.text();

            $elem.on('click', function () {
                var action = (buttonText === 'Respond') ? 'Respond' : 'Reopen';
                var redirect = _spPageContextInfo.webServerRelativeUrl + "/Lists/RFI/EditForm.aspx?action=" + action + "&ID=" + listItemID + "&Source=" + document.location.href;
                window.location.href = redirect;
            });
        }
    }

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: initiatechopbutton */
(function ($, _) {
    angular
        .module('app.core')
        .directive('initiatechopbutton', initiatechopbutton);

    function initiatechopbutton($rootScope, $q, logger, Mission, MissionDocument, MissionDocumentRepository, MissionTrackerRepository) {
        /* 
        SP2013 display template will render ChopProcessInitiationDate column (anytime it appears in LVWP) as:
            <a class="custombtn" initiatechopbutton="" data-id="1">Chop</a>
        Post-link it becomes:
            <a ng-class="getButtonClass()" title="Click to start chop process now" ng-click="openChopDialog()" class="custombtn" initiatechopbutton="">Chop</a>
       */
        var directiveDefinition = {
            restrict: 'A',
            scope: {
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


            scope.listItemID = parseInt(tempID, 10);
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
               
                $rootScope.$broadcast("LVWP:initiatechopButtonClicked", {
                    documentID: scope.listItemID,
                    organization: _.getQueryStringParam("org") || ''
                });
            }

            $rootScope.$on("LVWP:chopProcessSuccessfullyInitiated", function (evt, args) {
                if(args.documentID === scope.listItemID){
                    scope.chopProcessTimestamp = args.timestamp;    
                    var missionTrackerUrl = _spPageContextInfo.webServerRelativeUrl + "/SitePages/app.aspx/#/missiontracker/2";
                    logger.success('Track the process using the <a href="' + missionTrackerUrl + '" style="text-decoration:underline;color:white;">Mission Tracker</a>', {
                        title: "Chop Process initiated",
                        alwaysShowToEnduser: true,
                        delay: false
                    });
                }
            });
            
        }
    }

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: chopdialog */
(function ($, _) {
    angular
        .module('app.core')
        .directive('chopdialog', directiveDefinitionFunc);

    function directiveDefinitionFunc($q, $rootScope, logger, Mission, MissionDocument, MissionDocumentRepository, MissionTrackerRepository) {
        /* 
        USAGE: <chopdialog></chopdialog>
        SIMPLY listens for an event
        */
        var directiveDefinition = {
            restrict: 'E',
            link: link,
            scope: {
            },
            template: generateChopDialogHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.closeModal = function(){
                scope.showModal = false;
            };

            scope.isFormValid = function() {
                return scope.listItem && !scope.listItem.Mission.Id && scope.submitButtonClicked;
            }

            scope.submit = function() {
                scope.submitButtonClicked = true;
                if (scope.isFormValid()) { return; }

                scope.listItem.initiateChop().then(onChopStartedSuccessfully)

                function onChopStartedSuccessfully(item) {
                    scope.showModal = false;
                    $rootScope.$broadcast("LVWP:chopProcessSuccessfullyInitiated", {
                        timestamp: item.ChopProcessInitiationDate,
                        documentID: item.Id
                    });    
                }

            }

            $rootScope.$on("LVWP:initiatechopButtonClicked", function (evt, args) {
                $q.all([
                    MissionDocumentRepository.getById(args.documentID),
                    MissionTrackerRepository.getByOrganization("")
                ])
                    .then(function (data) {
                        scope.listItem = new MissionDocument(data[0]);
                        scope.missions = _.map(data[1], function (item) { return new Mission(item); });
                        scope.showModal = true;
                        scope.submitButtonClicked = false;
                        
                        //scope.submit = submit;
                        //scope.getSelectedMission = getSelectedMission;
                    });


            });

            function getSelectedMission() {
                //two-way binding from ng-office UI dropdown binds the mission.Id dropdownOption to the Mission Document's Mission.Id  
                var selectedMission = _.find(scope.missions, { Id: parseInt(scope.listItem.Mission.Id, 10) });
                return selectedMission;
            }
        }
    }

    function generateChopDialogHtml() {
            var html = [
                '<uif-dialog uif-close="false" uif-overlay="light" uif-type="multiline" ng-show="showModal">',
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
                '           <uif-dropdown ng-model="listItem.Mission.Id">',
                '               <uif-dropdown-option ng-repeat="mission in missions" value="{{mission.Id}}" title="{{mission.Identifier}}">{{mission.Identifier}}</uif-dropdown-option>',
                '           </uif-dropdown>',
                '           <uif-message-bar uif-type="error" ng-show="isFormValid()">',
                '               <uif-content>This is a required field</uif-content>',
                '           </uif-message-bar>',
                '       </uif-dialog-content>',
                '       <uif-dialog-actions uif-position="right">',
                '           <button class="ms-Dialog-action ms-Button ms-Button--primary" ng-click="submit()">',
                '               <span class="ms-Button-label">Start Chop</span>',
                '           </button>',
                '           <button class="ms-Dialog-action ms-Button" ng-click="closeModal()" type="button">',
                '               <span class="ms-Button-label">Cancel</span>',
                '           </button>',
                '       </uif-dialog-actions>',
                '   </uif-dialog-inner>',
                '</uif-dialog>'].join('');
            return html;
        }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: genericdialog */
(function ($, _) {
    angular
        .module('app.core')
        .directive('genericdialog', directiveDefinitionFunc);

    function directiveDefinitionFunc($q, $rootScope, logger, Mission, MissionDocument, MissionDocumentRepository, MissionTrackerRepository) {
        /* 
        USAGE: <genericdialog></genericdialog>
        SIMPLY listens for an event
        */
        var directiveDefinition = {
            restrict: 'E',
            link: link,
            template: generateDialogHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.closeModal = function(){
                scope.showGenericModal = false;
            };
        }
    }

    function generateDialogHtml() {
            var html = [
                '<uif-dialog uif-close="false" uif-overlay="light" uif-type="multiline" ng-show="showGenericModal">',
                '   <uif-dialog-header>',
                '       <p class="ms-Dialog-title">',
                '           {{genericModalOptions.title}}',
                '       </p>',
                '   </uif-dialog-header>',
                '   <uif-dialog-inner>',
                '       <uif-dialog-content>',
                '           <uif-dialog-subtext>',
                '               <div ng-bind-html="genericModalOptions.message"></div>',
                '           </uif-dialog-subtext>',
                '       </uif-dialog-content>',
                '       <uif-dialog-actions uif-position="right">',
                '           <button class="ms-Dialog-action ms-Button" ng-click="closeModal()" type="button">',
                '               <span class="ms-Button-label">Close</span>',
                '           </button>',
                '       </uif-dialog-actions>',
                '   </uif-dialog-inner>',
                '</uif-dialog>'].join('');
            return html;
        }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: includeReplace */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: injectbutton */
(function ($, _) {
    angular
        .module('app.core')
        .directive('injectbutton', injectbutton);

    function injectbutton($rootScope, $q, logger, Mission, MissionDocument, MissionDocumentRepository, MissionTrackerRepository) {
        /*
        SP2013 display template will render ActionsHtml column (anytime it appears in LVWP) as: 
            <a class="custombtn" injectbutton="" data-id="1" data-status="Pending" data-injecttitle="Dolore suscipit nihil sunt dolore" data-dtg="091205ZFEB17" data-receivers="SOTG 20;SOTG 30" title="Publish this scenario to SOTG 20, SOTG 30">Inject</a>
        Post-link it becomes:
            <a ng-class="getButtonClass()" title="Publish this scenario to SOTG 20, SOTG 30 " ng-click="openInjectDialog()" class="custombtn" injectbutton="">Inject</a>
        */
        var directiveDefinition = {
            restrict: 'A',
            scope: {
            },
            link: link,
            replace: true,
            template: generateButtonHtml()
        };
        return directiveDefinition;

        function generateButtonHtml() {
            return "<a ng-class='getButtonClass()' title='{{getHoverText()}}' ng-click='openInjectDialog()'>Inject</a>";
        }

        function link(scope, elem, attrs) {
            var $elem = $(elem);

            var tempClass = $elem.attr("class");
            var tempID = $elem.attr("data-id");
            var receivers = $elem.attr("data-receivers");
            var status = $elem.attr("data-status");
            var injecttitle = $elem.attr("data-injecttitle");
            var dtg = $elem.attr("data-dtg");
           
            $elem.removeClass(tempClass);
            $elem.removeAttr("data-id");
            $elem.removeAttr("data-receivers");
            $elem.removeAttr("data-status");
            $elem.removeAttr("data-injecttitle");
            $elem.removeAttr("data-dtg");

            scope.listItemID = parseInt(tempID, 10);
            scope.status = status;
            
            scope.getButtonClass = function () {
                return (scope.status === 'Completed') ? 'disabled-custombtn' : 'custombtn';
            }

            scope.openInjectDialog = function () {               
                $rootScope.$broadcast("LVWP:injectButtonClicked", {
                    ID: scope.listItemID,
                    receivers: receivers,
                    selectedInject: injecttitle,
                    dtg: dtg
                });
            }

            $rootScope.$on("LVWP:scenarioSuccessfullyPublished", function (evt, args) {
                if(args.injectItem.Id === scope.listItemID){  
                    scope.status = args.injectItem.Status;
                    logger.success('MSEL Inject will now appear as "Inbound Message" for the following: ' + args.generatedMessageTrafficItem.Receiver.results.join(', ') , {
                        title: "Scenario injected",
                        alwaysShowToEnduser: true
                    });
                }
            });
            
        }
    }

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: publishscenariodialog */
(function ($, _) {
    angular
        .module('app.core')
        .directive('publishscenariodialog', directiveDefinitionFunc);

    function directiveDefinitionFunc($q, $rootScope, logger, InjectRepository, MessageTraffic, MessageTrafficRepository, spContext) {
        /* 
        USAGE: <publishscenariodialog></publishscenariodialog>
        SIMPLY listens for an event
        */
        var directiveDefinition = {
            restrict: 'E',
            link: link,
            scope: {
            },
            template: generateDialogHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.closeModal = function(){
                scope.showModal = false;
            };

            scope.submit = function() {
                scope.processingTransaction = true;

                publishScenario(scope.injectListItemId)
                    .then(onScenarioPublishedSuccessfully)
                    .finally(function(){
                        scope.processingTransaction = false;    
                    });

                function onScenarioPublishedSuccessfully(transaction) {
                    scope.showModal = false;
                    $rootScope.$broadcast("LVWP:scenarioSuccessfullyPublished", transaction);    
                }
            }

            $rootScope.$on("LVWP:injectButtonClicked", function (evt, args) {
                scope.showModal = true;
                scope.receivers = args.receivers;
                scope.injectListItemId = args.ID;
                scope.selectedInject = '(' + args.dtg + ') ' + args.selectedInject;
            });
        }

        function publishScenario(injectListItemId){
            return retrieveInjectItem(injectListItemId)
                .then(generateMessageTrafficItem)
                .then(copyAttachments)
                .then(updateStatusForInjectItem);

            function retrieveInjectItem(id){
                var transaction = {
                    injectItem: null,
                    generatedMessageTrafficItem: null
                }; 
                return InjectRepository.getById(injectListItemId)
                            .then(function(data){
                                transaction.injectItem = data;
                                return transaction;
                            });
            }

            function generateMessageTrafficItem(transaction){
                var newMsg = new MessageTraffic();
                newMsg.Title = transaction.injectItem.Title;
                newMsg.TaskInfo = transaction.injectItem.TaskInfo;
                newMsg.OriginatorSender = transaction.injectItem.OriginatorSender;
                newMsg.Receiver = transaction.injectItem.Receiver.results; 
                newMsg.DateTimeGroup = moment.utc(transaction.injectItem.DateTimeGroup);
                newMsg.Significant = "No";
                newMsg.Initials = "EXCON";   

                return newMsg.save()
                        .then(function(data){
                            transaction.generatedMessageTrafficItem = data.d;
                            return transaction;
                        });
            }

            function copyAttachments(transaction){
                if(transaction.injectItem.AttachmentFiles.results.length === 0){
                    return $q.when(transaction);
                }

                var copyOperations = [];
                _.each(transaction.injectItem.AttachmentFiles.results, function(item){
                    var copyOperation = {
                        webUrl: _spPageContextInfo.webServerRelativeUrl,
                        sourceListName: 'Inject',
                        sourceListItemID: transaction.injectItem.Id,
                        fileName: item.FileName,
                        destinationListName: 'Message Traffic',
                        destinationListItemID: transaction.generatedMessageTrafficItem.Id
                    }

                    copyOperations.push(copyOperation);    
                });

                return spContext.copyAttachmentsBetweenListItems(copyOperations)
                    .then(function(){
                        return transaction;
                    });
            }

            function updateStatusForInjectItem(transaction){
                
                var postData = {
                    Id: transaction.injectItem.Id, 
                    Status: "Completed",
                    __metadata : {
                        type: "SP.Data.InjectListItem"
                    }
                };
                return InjectRepository
                    .save(postData)
                    .then(function(data){
                        transaction.injectItem.Status = data.Status;
                        return transaction;
                    });    
            }

        }
    }

    function generateDialogHtml() {
            var html = [
                '<uif-dialog uif-close="false" uif-overlay="light" uif-type="multiline" ng-show="showModal">',
                '   <uif-dialog-header>',
                '       <p class="ms-Dialog-title">',
                '           MSEL Inject Confirmation',
                '       </p>',
                '   </uif-dialog-header>',
                '   <uif-dialog-inner>',
                '       <uif-dialog-content>',
                '           <uif-textfield uif-label="Scenario" ng-model="selectedInject" uif-description="" uif-multiline="true" ng-disabled="true"/>',
                '           <uif-dialog-subtext>',
                '               <span>Are you sure above scenario is ready to be injected to the following recipient(s)?</span>',
                '           </uif-dialog-subtext>',
                '           <uif-textfield uif-label="Receiver" ng-model="receivers" uif-description="" uif-multiline="true" ng-disabled="true"/>',
                '       </uif-dialog-content>',
                '       <uif-dialog-actions uif-position="right">',
                '           <button class="ms-Dialog-action ms-Button ms-Button--primary" ng-disabled="processingTransaction" ng-click="submit()">',
                '               <span class="ms-Button-label">Yes, Inject</span>',
                '           </button>',
                '           <button class="ms-Dialog-action ms-Button" ng-click="closeModal()" type="button">',
                '               <span class="ms-Button-label">Cancel</span>',
                '           </button>',
                '       </uif-dialog-actions>',
                '   </uif-dialog-inner>',
                '</uif-dialog>'].join('');
            return html;
        }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: scrollableCurrentOpsSummary */
(function ($, _) {
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: lastChopPopover */
(function ($, _) {
    angular
        .module('app.core')
        .directive('lastChopPopover', function($compile, $timeout) {
            return {
                restrict: 'A',
                controller: function($scope, $element) {
                    $scope.isShown = true;
                    $scope.getClass = function(){
                        if($scope.positionOrientation === 'left'){
                            return 'ms-Callout--arrowRight';
                        } else if($scope.positionOrientation === 'right'){
                            return 'ms-Callout--arrowLeft';
                        }
                    }

                    this.calculatePosition = function(target, popup, tooltipPosition){
                        $scope.positionOrientation = tooltipPosition;
                        $scope.popupCSS = {
                            top: getOffsetTop(target, popup, tooltipPosition), 
                            left: getOffsetLeft(target, popup, tooltipPosition)
                        }
                        $scope.isShown = false;
                    }

                    this.showTooltip = function() {
                        $scope.isShown = true;
                    }

                    this.hideTooltip = function() {
                        $scope.isShown = false;
                    }

                    function getOffsetLeft(target, popup, tooltipPosition){
                        if(tooltipPosition === 'right'){
                            return target.outerWidth() + 'px';
                        } else if(tooltipPosition === 'left'){
                            return -(33+popup.outerWidth()) + 'px';
                        }
                    }

                    function getOffsetTop(target, popup, tooltipPosition){
                        if(tooltipPosition === 'right' || tooltipPosition === 'left'){
                            var offset = (target.outerHeight()/2) + 48;
                            return -(offset) + 'px';
                        }
                    }
                },
                scope: {
                    lastChop: "="
                },
                transclude: true,
                compile: function(element, attrs){
                    return {
                        pre: function(){},
                        post: function(scope, element, attrs, ctrl) {
                            element.css({'position': 'relative', textAlign: 'left', whiteSpace: 'normal'});
                            element.bind('mouseover', function(e) {
                                scope.$apply(function() {
                                    ctrl.showTooltip();
                                });
                            });

                            element.bind('mouseout', function(e) {
                                scope.$apply(function() {
                                    ctrl.hideTooltip();
                                });
                            });

                            $timeout(function(){
                                ctrl.calculatePosition(element, element.find('.ms-Callout'), attrs.tooltipPosition);
                            });
                        }
                    };
                },
                template: buildCalloutHtml()
            }
        });

        function buildCalloutHtml() {
            var html = '\
                <span ng-transclude></span>\
                <div class="ms-Callout" ng-class="getClass()" style="position:absolute;left:-2000px;" ng-style="popupCSS" ng-show="isShown" >\
                    <div class="ms-Callout-main">\
                        <div class="ms-Callout-header">\
                            <span class="ms-fontWeight-light" style="float:right;">{{lastChop.Created  | date:"MM/dd/yyyy @ hhmm": "+0000" }}Z</span> <strong>{{(lastChop.OrganizationalRole === \'CDR\') ? lastChop.Organization : lastChop.OrganizationalRole }}</strong> \
                        </div>\
                        <div class="ms-Callout-inner">\
                            <div class="ms-Callout-content">\
                                <p class="ms-Callout-subText ms-Callout-subText--s">\
                                    <span style="color:#337ab7;font-weight:bold;">{{lastChop.Author.Title}}</span><br/>\
                                    {{lastChop.Comments}}\
                                </p>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
            return html;
        }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: missionTimeline */
(function ($, _) {
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
                onMissionsFiltered: '&',
                redirectUrlReplace: '&'
            },
            template: buildHeroButtonHtml() + buildCheckboxHtml() + buildLegendHtml() + '<div class="mission-timeline" ng-show="missionsToShow.length"></div>' + buildMessageBarHtml()
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            var options = {
                stack: false,
                editable: false,
                moment: function(date){
                    return vis.moment(date).utc();
                },
                margin: {
                    item: 5, // minimal margin between items
                    axis: 3   // minimal margin between items and the axis
                },
                orientation: 'top'
            };

            scope.showCompletedMissions = false;
            scope.statusColorLegend = [
                { name: "Initial Targeting", cssStyle: {'background-color': '#FFFF00', 'border-color': '#FFFF00', 'color': '#000'} }, //yellow,black
                { name: "JPG Assigned", cssStyle: {'background-color': '#FFFF00', 'border-color': '#FFFF00', 'color': '#000'} }, //yellow,black
                { name: "COA Approved", cssStyle: {'background-color': '#FFFF00', 'border-color': '#FFFF00', 'color': '#000'} }, //yellow,black
                { name: "CONOP Received - In Chop", cssStyle: {'background-color': '#FFFF00', 'border-color': '#FFFF00', 'color': '#000'} }, //yellow,black

                { name: "CONOP Disapproved", cssStyle: {'background-color':'#ff0000', 'border-color': '#ff0000', 'color': '#fff' }}, //red,white	

                { name: "CONOP Approved", cssStyle: {'background-color':'#007f00', 'border-color': '#007f00', 'color': '#fff'} }, //green,black
                { name: "FRAGO In-Chop", cssStyle:  {'background-color':'#007f00', 'border-color': '#007f00', 'color': '#fff'} }, //green,black
                { name: "FRAGO Released", cssStyle: {'background-color':'#007f00', 'border-color': '#007f00', 'color': '#fff'} }, //green,black
                { name: "EXORD Released", cssStyle: {'background-color':'#007f00', 'border-color': '#007f00', 'color': '#fff'} }, //green,black

                { name: "Mission In Progress", cssStyle: {'background-color':'#ffa500', 'border-color': '#ffa500', 'color': '#000'} }, //orange, black

                { name: "Return to Base", cssStyle: { 'background-color':'#2C5197', 'border-color': '#2C5197', 'color': '#000' } }, //blue, black		
                { name: "QuickLook", cssStyle: { 'background-color':'#2C5197', 'border-color': '#2C5197', 'color': '#000' } }, //blue, black
                { name: "StoryBoard", cssStyle: { 'background-color':'#2C5197', 'border-color': '#2C5197', 'color': '#000' } }, //blue, black
                { name: "OPSUM", cssStyle: { 'background-color':'#2C5197', 'border-color': '#2C5197', 'color': '#000' } }, //blue, black

                { name: "Mission Closed", cssStyle: {'background-color':'#000', 'border-color': '#000', 'color': '#fff'} } //black, white
            ];



            scope.$watch('showCompletedMissions', function () {
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
                    return scope.showCompletedMissions || item.Status !== 'Mission Closed';
                });

                scope.onMissionsFiltered({ missions: scope.missionsToShow });

                var groups = new vis.DataSet(_.map(scope.missionsToShow, function (item) { return { id: item.Id, content: item.Identifier }; }));
                var items = new vis.DataSet(
                    _.map(scope.missionsToShow, function (item) {
                        var itemStart = moment.utc(item.ExpectedExecution);
                        var itemEnd = null;
                        if(item.ExpectedTermination){
                            itemEnd = moment.utc(item.ExpectedTermination);
                        } else {
                            itemEnd = itemStart.clone().add(24, 'hours');
                        }

                        return {
                            id: item.Id,
                            group: item.Id,
                            start: itemStart,
                            end: itemEnd,
                            style: convertFromCssObjectToString(_.find(scope.statusColorLegend, { name: item.Status }).cssStyle),
                            title: item.buildOnHoverText()
                        };
                    })
                );

                timeline = new vis.Timeline($(elem).find(".mission-timeline").get(0), null, options);
                timeline.setGroups(groups);
                timeline.setItems(items);
                timeline.on('click', function (props) {
                    if (props.what === 'group-label' || props.what === 'item') {
                        var redirect = scope.redirectUrlReplace({url: document.location.href});
                        if(!redirect){
                            redirect = document.location.href;
                        }
                        var url = _spPageContextInfo.webServerRelativeUrl + '/Lists/MissionTracker/DispForm.aspx?ID=' + props.group + "&Source=" + encodeURIComponent(redirect);
                        document.location.href = url;
                    }
                })


            }
        }

        function convertFromCssObjectToString(cssObj){
            return _.map(cssObj, function(val, key){
                return key + ":" + val;
            }).join(';');
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
                                                <td style="width:25px;" ng-style="{{status.cssStyle}}">&nbsp;</td>\
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
            var html = '<uif-choicefield-option uif-type="checkbox" value="value1" ng-model="showCompletedMissions" ng-true-value="true" ng-false-value="false"> Show Closed Missions</uif-choicefield-option>';
            //var html = '<input type="checkbox" ng-model="showCompletedMissions"> <label>Show Closed Missions</label>';
            return html;
        }

        function buildHeroButtonHtml() {
            var newFormUrl = _spPageContextInfo.webServerRelativeUrl + "/Lists/MissionTracker/NewForm.aspx?Source=" + document.location.href;
            return spContext.htmlHelpers.buildHeroButton('new item', newFormUrl, 'showNewItemLink');
        }

        function buildMessageBarHtml() {
            return '<uif-message-bar ng-show="missionsToShow.length === 0"> <uif-content>No {{showCompletedMissions ? "closed/completed" : "ongoing" }} {{selectedOrg}} missions</uif-content> </uif-message-bar>';
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: navMenu */
(function ($, _) {
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
                    _.each(data.JSON, associateToConfigItem);
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
                var cssClass = 'noflag';
                if(node.orgType){
                    cssClass += " " + constructCssClassBasedOnOrgType(node);  
                }
                var parts = [
                    '<a class="' + cssClass + '" href="' + url + '" target="' + node.li_attr.target + '">',
                    '   <span class="menu-label-when-no-flag">' + node.text + constructLockIcon(node) + '</span>',
                    '</a>'
                ].join('');
                return parts;
            }

            function constructLockIcon(node){
                if(node.orgType === "Exercise Control Group"){
                    return ' <i class="fa fa-lock"></i>';
                } else {
                    return "";
                }
            }

            function constructCssClassBasedOnOrgType(node){
                if(!node.orgType){ return ""; }
                if(node.orgType === "Task Group"){
                    return _.camelCase(node.orgType + node.type);
                } else {
                    return  _.camelCase(node.orgType);
                }
            }

            function generateAnchor_withFlagIcon(node) {
                var url = node.li_attr.url || "#";
                var cssClass = '';
                if(node.orgType){
                    cssClass += constructCssClassBasedOnOrgType(node); 
                }
                var parts = [
                    '<a class="' + cssClass + '" href="' + url + '" target="' + node.li_attr.target + '">',
                    '   <span class="f32"><span class="flag ' + node.flagCode + '"><span class="menu-label-when-flag">' + node.text + constructLockIcon(node) + '</span></span></span>',
                    '</a>'
                ].join('');
                return parts;
            }
        }
        function associateToConfigItem(item) {
            var orgConfig = jocInBoxConfig.dashboards[item.text]
            if (orgConfig && orgConfig.flagCode) {
                item.flagCode = orgConfig.flagCode;
            }
            if (orgConfig && orgConfig.orgType) {
                item.orgType = orgConfig.orgType;
            }
            if (orgConfig && orgConfig.type) {
                item.type = orgConfig.type;
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: exconGroupLink */
(function ($, _) {
    angular
        .module('app.core')
        .directive('exconGroupLink', generateDirectiveDef);

    generateDirectiveDef.$inject = ['config', 'spContext', 'logger'];
    function generateDirectiveDef(config, spContext, logger) {
        /* 
        USAGE: <excon-group-link></excon-group-link>
        */
        var directiveDefinition = {
            restrict: 'E',
            scope: {
            },
            link: link,
            template: '<uif-message-bar><uif-content>To grant/revoke users click:</uif-content> <uif-link ng-click="findGroup()">here</uif-link> </uif-message-bar>'
        };
        return directiveDefinition;

        function link(scope, elem, attrs) {
            scope.findGroup = function(){
                var groupDescription = "Created by wizard to support site: " + _spPageContextInfo.webServerRelativeUrl;
                spContext.getGroupByDescription(groupDescription)
                    .then(function(data){
                        if(data.results.length !== 0){
                            var spGroup = data.results[0];
                            var manageUrl = _spPageContextInfo.siteAbsoluteUrl + '/_layouts/15/people.aspx?MembershipGroupId=' + spGroup.Id;
                            window.open(manageUrl, "_blank")
                        } else {
                            alert('Error: Could not find a group with the description: "' + groupDescription + '"');
                        }
                    });
            }
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: commanderDecisionButton */
(function ($, _) {
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
            '   {{document.chopProcessInfo.selectedRouteStage.name}}',
            '</button>',
            '<span ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions.length !== 0" last-chop-popover tooltip-position="left" last-chop="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0]">',
            '<button ng-click="chopButtonClicked()" ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions.length !== 0" type="button" class="cdr-chop-button" style="position: relative; text-align: left; white-space: normal;">',
            '   <span>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Concur\'" class="fa fa-thumbs-up" style="color:green;font-size:1.4em;"></i>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Nonconcur\'" class="fa fa-thumbs-down" style="color:red;font-size:1.4em;"></i>',
            '       <i ng-if="document.chopProcessInfo.selectedRouteStage.cdrDecisions[0].Verdict === \'Pending\'" class="fa fa-hourglass-start" style="font-size:1.2em;"></i>',
            '       {{document.chopProcessInfo.selectedRouteStage.name}}',
            '   </span>',
            '</button>',
            '</span>'
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

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: routingProcessParticipants */
(function ($, _) {
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
                '           <span ng-if="decisions.length !== 0" last-chop-popover tooltip-position="left" last-chop="decisions[0]">',
                '           <button ng-if="decisions.length !== 0" type="button" class="staff-chop-button" style="position: relative; text-align: left; white-space: normal;">',
                '               <span>',
                '                   <i ng-if="decisions[0].Verdict === \'Concur\'" class="fa fa-thumbs-up" style="color:green;font-size:1.4em;"></i>',
                '                   <i ng-if="decisions[0].Verdict === \'Nonconcur\'" class="fa fa-thumbs-down" style="color:red;font-size:1.4em;"></i>',
                '                   <i ng-if="decisions[0].Verdict === \'Pending\'" class="fa fa-hourglass-start" style="font-size:1.2em;"></i>',
                '                   {{tryToShorten(sectionName)}}',
                '               </span>',
                '           </button>',
                '           </span>',
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

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: routingSheet */
(function ($, _) {
    angular
        .module('app.core')
        .directive('routingSheet', directiveDefinitionFunc);

    function directiveDefinitionFunc($rootScope, logger, MissionDocument, MissionTrackerRepository) {
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

            scope.closeChopDialog = function () {
                scope.showPanel = false;
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

                    if(scope.document.chopProcessInfo.overallChopStatus !== "In Chop" && scope.document.TypeOfDocument === "CONOP Concept of Operations"){
                        MissionTrackerRepository.updateMissionStatusBasedOnConopChopDecision(scope.document.chopProcessInfo.overallChopStatus, scope.document.Mission.Id);   
                    }

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
            '<uif-panel uif-type="medium" uif-is-open="showPanel" uif-show-overlay="true" uif-show-close="true" close-panel="onPanelClosed()" uif-is-light-dismiss="false">',
            '   <uif-panel-header>',
            '       {{document.Mission.FullName}}, Reviewer: {{(selectedTab === \'CDR\') ? selectedStage.name : selectedTab}}',
            '   </uif-panel-header>',
            '   <uif-content>',
            generateTabsHtml(),
            generateChoppingOutOfSequenceError(),
            generateShowAllSectionsMessage(),
            generateDetailsAboutDocument(),
            '       <div class="ms-Grid" ng-if="!errors || errors.errorType !== \'TooEarly\'" >',
            '           <div class="ms-Grid-row" ng-show="!selectedTab || selectedTab === block.signOnBehalfOf" ng-repeat="block in signatureBlocks" style="margin-top: 20px;">',
            '               <div class="ms-Grid-col ms-u-md12">',
            '                   <div class="form-header"><span class="ms-font-xl">Chop Status</span></div>',
            '                   <div class="ms-Grid">',
            '                       <div class="ms-Grid-row">',
            '                           <div class="ms-Grid-col ms-u-md12">',
                                            generateVerdictPicker(),
                                            generateBlockErrorMessages(),
            '                               <uif-textfield uif-label="Comments" ng-model="block.Comments" uif-multiline="true" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name" />',
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
            ].join('');

            return parts;
        }

        function generateButtonsHtml() {
            var parts = [
                '<uif-button type="button" uif-type="primary" ng-click="saveChop(block)" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name">Save</uif-button>',
                '<uif-button type="button" ng-click="closeChopDialog()" ng-disabled="document.chopProcessInfo.lastKnownLocationAlongRoute !== selectedStage.name">Cancel</uif-button>'
            ].join('');

            return parts;
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
                '   <uif-choicefield-option uif-type="radio" value="Pending">In Chop</uif-choicefield-option>',
                '</uif-choicefield-group>'
            ].join('');
            return parts;
        }

        function generatePreviousChopsHtml() {
            var parts = [
                '<div ng-if="block.previousChops.length === 0" style="padding-top:9px;">',
                '   <uif-message-bar><uif-content>No previous comments</uif-content></uif-message-bar>',
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

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Directive: commStatusTracker */
(function ($, _) {
    angular
        .module('app.core')
        .directive('commStatusTracker', directiveDefFunc);

    directiveDefFunc.$inject = ['CommunicationsStatusRepository', 'spContext'];
    function directiveDefFunc(CommunicationsStatusRepository, spContext) {
        /* 
        USAGE: <comm-status-tracker></comm-status-tracker>
        */
        var directiveDefinition = {
            link: link,
            restrict: 'E',
            scope: {
            },
            template: '<table ng-click="goToEditableGrid()" class="commStatusTable" border="1"><thead>'+buildFirstHeaderRow()+buildSecondHeaderRow()+'<thead><tbody>'+ buildTableRows() +'</tbody></table>'
        };
        

        return directiveDefinition;

        function link(scope, elem, attrs) {
            CommunicationsStatusRepository.getAll()
                .then(function(data){
                    scope.items = createDataSource(data);
                });

            scope.goToEditableGrid = function(){
                window.location.href = _spPageContextInfo.webServerRelativeUrl + "/Lists/CommunicationsStatus/EditableGrid.aspx";
            }
        }

        
        function createDataSource(data){
            var sequenceOfCells = ["UnclassData", "BicesData", "SecretData", "TacsatData", "HfData", "UnclassPhone", "BicesPhone", "SecretPhone", "TacsatRadio", "HfRadio", "BicesVtc", "SecretVtc", "TsVtc"];
            //array {class: "FMC", innerText: "FMC"}
            return _.map(data, function(item){
                return {
                    element: item.Package,
                    statusCells: buildStatuses(item),
                    comments: item.Comments
                };
            });
           
            function buildStatuses(item){
                return _.map(sequenceOfCells, function(propName){
                    var val = item[propName];

                    if(_.includes(['FMC', 'Planned', 'Degraded', 'NMC', 'Standby'], val)){
                        return { "class": val, "innerText": val};
                    } else if(moment(val).isValid()){
                        //user filled in their own value with a date-like-string
                        return { "class": "Planned", "innerText": val };
                    } else {
                        //user left field blank or status is "N/A" or user entered a string that is not date-like
                        return { "class": "NA", "innerText": "NA" };
                    }
                }); 
            }
        }

        function buildFirstHeaderRow(){
            return '<tr><th></th><th colspan="5">DATA</th><th colspan="5">VOICE</th><th colspan="3">VTC</th><th></th></tr>'
        }

        function buildSecondHeaderRow(){
            return '<tr><th>Element</th><th>UNCLASS</th><th>BICES</th><th>SECRET</th><th>TACSAT</th><th>HF</th><th>UNCLASS</th><th>BICES</th><th>SECRET</th><th>TACSAT</th><th>HF</th><th>BICES</th><th>SECRET</th><th>TS</th><th>Comments</th></tr>'
        }

        function buildTableRows(){
            var parts = [
                '<tr ng-repeat="item in items">',
                '   <td>{{item.element}}</td>',
                '   <td ng-repeat="cell in item.statusCells" ng-class="cell.class">{{cell.innerText}}</td>',
                '   <td>{{item.comments}}</td>',
                '</tr>'
            ].join('');
            return parts;
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: OrgDashboardAspxController */
(function ($, _) {
    angular
        .module('app.core')
        .controller('OrgDashboardAspxController', OrgDashboardAspxController);

    OrgDashboardAspxController.$inject = ['$compile', '$scope', '_', 'Mission', 'MissionTrackerRepository'];
    function OrgDashboardAspxController($compile, $scope, _, Mission, MissionTrackerRepository) {
        var vm = this;

        vm.selectedOrg = (_.getQueryStringParam("org") || "");
        MissionTrackerRepository.getByOrganization(vm.selectedOrg).then(function (data) {
            vm.missions = _.map(data, function (item) { return new Mission(item); });
        });

        $("body").on('webpartRendered', function(evt, domElem){
            var directivesUnknownToWG = $(domElem).find('a[initiatechopbutton][data-id],a[injectbutton][data-id],a[rfibutton][data-id]');
            directivesUnknownToWG.each(function(){
                var parentContainer = $(this).parent();
                var htmlToCompile = parentContainer.html();
                parentContainer.html('');
                var content = $compile(htmlToCompile)($scope);
                parentContainer.append(content);
            });
        });

    }


})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: MissionTrackerDispFormAspxController*/
(function ($, _) {
    angular
        .module('app.core')
        .controller('MissionTrackerDispFormAspxController', controller);

    controller.$inject = ['$scope', '_', 'Mission', 'spContext', 'SPUtility'];
    function controller($scope, _, Mission, spContext, SPUtility) {
        $scope.showApprovalLevels = function(message){
            $scope.genericModalOptions = {
                title: "Approval Levels",
                message: message
            };
            $scope.showGenericModal = true;
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: MissionTrackerDataEntryAspxController*/
(function ($, _) {
    angular
        .module('app.core')
        .controller('MissionTrackerDataEntryAspxController', controller);

    controller.$inject = ['$scope', '_', 'Mission', 'spContext', 'SPUtility'];
    function controller($scope, _, Mission, spContext, SPUtility) {
        var vm = this;
        var itemOnEditFormAspxLoad = null;
        var org = _.extractOrgFromQueryString();

        $scope.showApprovalLevels = function(message){
            $scope.genericModalOptions = {
                title: "Approval Levels",
                message: message
            };
            $scope.showGenericModal = true;
        }

        $scope.routeMessage = "";

        init();

        window.PreSaveAction = function () {
            var msn = new Mission();
            msn.ApprovalAuthority = SPUtility.GetSPFieldByInternalName("ApprovalAuthority").GetValue();
            if(!msn.ApprovalAuthority){
                //check if we are on the EditForm.aspx
                var $domElem = $(SPUtility.GetSPFieldByInternalName("ApprovalAuthority").Controls);
                if($domElem.hasClass("readOnlyLabel")){
                    msn.ApprovalAuthority = $domElem.text();
                }
            }
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: RfiDataEntryAspxController*/
(function ($, _) {
    angular
        .module('app.core')
        .controller('RfiDataEntryAspxController', controller);

    controller.$inject = ['$scope', '_', 'RFI', 'spContext', 'SPUtility'];
    function controller($scope, _, RFI, spContext, SPUtility) {
        var vm = this;
        var itemOnEditFormAspxLoad = null;

        init();

        window.PreSaveAction = function () {
            var formState = getStateForRfiForm();

            var rfi = generateModelFromSpListForm();

            var errors = rfi.validate(formState, itemOnEditFormAspxLoad);
            if (errors) {
                alert(errors);
                //prevent default save behavior
                return false;
            } else {
                var itemOnAspxLoad = spContext.getContextFromEditFormASPX();
                rfi.setHiddenFieldsPriorToSave(formState, itemOnAspxLoad);
                
                if(rfi.DateClosed === null){
                    SPUtility.GetSPFieldByInternalName("DateClosed").SetValue(null);
                    SPUtility.GetSPFieldByInternalName("Status").SetValue("Open");
                }

                if(rfi.Status === "Closed"){
                    SPUtility.GetSPFieldByInternalName("ResponseSufficient").SetValue("Yes");
                    SPUtility.GetSPFieldByInternalName("Status").SetValue("Closed");
                }
                return true;
            }

            
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
            itemOnEditFormAspxLoad = spContext.getContextFromEditFormASPX();
        }


    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: MissionProductsDataEntryAspxController*/
(function ($, _) {
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
                    .then(getCurrentUser)
                    .then(generateMessage)
                    .then(redirectToSource)
                    .catch(function (error) {
                        alert(error);
                    });
            }

            function checkInFile() {
                return doc.checkIn();
            }

            function generateMessage(user) {
                if (!message) { return $q.when(); }
                var initialsForUser = user.FirstName[0] + user.LastName[0];
                message.Initials = initialsForUser;
                message.LinkToMissionDocument = _spPageContextInfo.webServerRelativeUrl + "/MissionDocuments/" + doc.FileLeafRef;
                return message.save();
            }

            function getCurrentUser(){
                return spContext.getUserInfoListItem(_spPageContextInfo.userId);
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
            item.DateTimeGroup = moment.utc(SPUtility.GetSPFieldByInternalName("MessageDateTimeGroup").GetValue().toString());
            item.Significant = SPUtility.GetSPFieldByInternalName("SignificantMessage").GetValue();

            return item;
        }

        function generateMissionDocumentModelFromSpListForm() {
            var doc = new MissionDocument();
            doc.FileLeafRef = SPUtility.GetSPFieldByInternalName("FileLeafRef").GetValue();
            doc.Organization = SPUtility.GetSPFieldByInternalName("Organization").GetValue();
            doc.TypeOfDocument = SPUtility.GetSPFieldByInternalName("TypeOfDocument").GetValue();
            doc.MissionId = spContext.getIdFromLookupField("Mission");
            doc.FlaggedForSoacDailyUpdate = SPUtility.GetSPFieldByInternalName("FlaggedForSoacDailyUpdate").GetValue();
            doc.DailyProductDate = moment.utc(SPUtility.GetSPFieldByInternalName("DailyProductDate").GetValue().toString());
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: EditNavController with route for SPA */
(function ($, _) {
    angular
        .module('app.core')
        .controller('EditNavController', EditNavController); 

    EditNavController.$inject = ['$q', '$timeout', '_', 'logger', 'ConfigRepository'];
    function EditNavController($q, $timeout, _, logger, ConfigRepository) {
        var vm = this;
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: MissionTrackerController with route for SPA*/
(function ($, _) {
    'use strict';
    //nicer looking plugin found here but requires bootstrap: http://www.dijit.fr/demo/angular-weekly-scheduler/
    angular
        .module('app.core')
        .controller('MissionTrackerController', MissionTrackerController);

    MissionTrackerController.$inject = ['$q', '$routeParams', '_', 'logger', 'DocumentChopsRepository', 'MissionDocument', 'MissionDocumentRepository', 'Mission', 'MissionTrackerRepository', 'RfiRepository'];
    function MissionTrackerController($q, $routeParams, _, logger, DocumentChopsRepository, MissionDocument, MissionDocumentRepository, Mission, MissionTrackerRepository, RfiRepository) {
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

        vm.redirectUrlReplace = function(url){
            var pattern = /#\/missiontracker\/[\d]{0,1}/g;
            return url.replace(pattern, '#/missiontracker/0');
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

        vm.openMissionProduct= function(item){
            if(item.TypeOfDocument === "RFI"){
                var url = _spPageContextInfo.webServerRelativeUrl + '/Lists/RFI/DispForm.aspx?ID=' + item.Id;
                window.open(url, "_blank");
            } else {
                openDocument(item);
            }
        }

        function openDocument(item){
            var fileExtension = item.File.ServerRelativeUrl.substr(item.File.ServerRelativeUrl.lastIndexOf('.')+1);
            var url;

            if(_.includes(['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'], fileExtension)){
                url = _spPageContextInfo.webServerRelativeUrl + '/_layouts/15/WopiFrame2.aspx?action=default&sourcedoc=' + item.File.ServerRelativeUrl;
            } else {
                url = item.File.ServerRelativeUrl;
            }

            window.open(url, "_blank");
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
            fetchData().then(function (data) {
                    vm.missions = data.missions;
                    dataSources.missionRelatedDocs = data.documents;
                    dataSources.chopProcesses = _.filter(dataSources.missionRelatedDocs, function (doc) { return !!doc.ChopProcessInitiationDate; });
                    buildFilterControlsForProducts();
                    buildFilterControlsForChopProcesses();
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
                { title: "Chop" }
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

        function fetchData() {

            return $q.all([
                MissionDocumentRepository.getMissionRelated(),
                DocumentChopsRepository.getAll(),
                getMissions(),
                RfiRepository.getMissionRelated()
            ])
                .then(function (data) {
                    var missions = data[2];
                    var chopsJSON = data[1];
                    var docs = _.map(data[0], function (item) {
                        var associatedMission = _.find(missions, {Id: item.MissionId});
                        var doc = new MissionDocument(item);
                        doc.Mission.ApprovalAuthority = associatedMission.ApprovalAuthority;
                        doc.Mission.Organization = associatedMission.Organization;
                        doc.relatedChops = getRelatedChops(doc, chopsJSON);
                        doc.refreshChopProcessInfo();
                        return doc;
                    });

                    var rfis = _.map(data[3], function(item){
                        var rfi = new MissionDocument();
                        rfi.Id = item.Id;
                        rfi.TypeOfDocument = "RFI";
                        rfi.File = {Name: item.Title};
                        rfi.Organization = item.RecommendedOPR;
                        rfi.Modified = moment(item.Modified);
                        rfi.Editor = item.Editor;
                        rfi.Mission = item.Mission;
                        rfi.MissionId = item.MissionId;
                        return rfi; 
                    });

                    return {
                        documents: docs.concat(rfis),
                        missions: missions
                    };
                });

            function getRelatedChops(doc, chopsJSON) {
                return _.filter(chopsJSON, function (docChop) {
                    return parseInt(docChop.DocumentId, 10) === doc.Id;
                });
            }
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: RfiController with route for SPA*/
(function ($, _) {
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
                action = (item.Status === "Open") ? "Edit" : "Reopen";
            } else {
                action = (item.Status === "Open") ? "Respond" : "Reopen";
            }

            return action;
        }

        function buildRedirectUrl(){
            var indexForCurrentlySelectedTab = _.findIndex(vm.tabConfig.pivots, function(pivot){ return pivot.title === vm.tabConfig.selectedPivot.title; });
            var pattern = /#\/rfi\/[\d]{0,1}/g;
            return encodeURIComponent(document.location.href.replace(pattern, '#/rfi/'+indexForCurrentlySelectedTab));
        }

        vm.goToEditForm = function (item) {

            var url = _spPageContextInfo.webServerRelativeUrl + "/Lists/RFI/EditForm.aspx?ID=" + item.Id + "&Source=" + buildRedirectUrl();
            var action = vm.getAction(item);

            if (action !== "Edit") {
                url += "&action=" + action;
            }
            window.location.href = url;
        }

        vm.getButtonText = function (item) {
            var action;

            if (vm.tabConfig.selectedPivot.title === "My RFIs") {
                action = (item.Status === "Open") ? "Edit" : "Review";
            } else {
                action = (item.Status === "Open") ? "Respond" : "Review";
            }

            return action;
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
            window.location.href = _spPageContextInfo.webServerRelativeUrl + "/Lists/Rfi/NewForm.aspx?&Source=" + buildRedirectUrl();
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

            vm.selectedDataSource = _.chain(dataSources[vm.tabConfig.selectedPivot.title])
                .groupBy('RecommendedOPR')
                .map(function (items, groupName) { return { name: groupName, items: _.sortBy(items, function(item){ return item.PrioritySort + item.LTIOV.format('YYYYMMDDHHmm'); }), isExpanded: true }; })
                .sortBy(['name'])
                .value();

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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: SandboxController with route for SPA*/
(function ($, _) {
    'use strict';
    angular
        .module('app.core')
        .controller('DeveloperSandboxController', ControllerDefFunc);

    ControllerDefFunc.$inject = ['$q', '$routeParams', '_', 'logger', 'spContext'];
    function ControllerDefFunc($q, $routeParams, _, logger, spContext) {
        var vm = this;

        vm.replaceExample = {
            pathToFile: _spPageContextInfo.webServerRelativeUrl + '/SitePages/mike.aspx',
            pattern: '<div id="SPProxyWebPartManagerReplace">(.*?)<\/div>'
        };

        vm.updateFile = function(){
            SP.SOD.loadMultiple(['sp.requestexecutor.js'], testUpdate);
            function testUpdate(){
                spContext.modifyExistingFile({
                    webUrl: _spPageContextInfo.webServerRelativeUrl, 
                    fileServerRelativeUrl: vm.replaceExample.pathToFile,
                    pattern: vm.replaceExample.pattern,
                    replace: generateRandomReplaceText()
                })
                .then(function(){
                    console.log("File modified...");
                });
            }
        }

        function generateRandomReplaceText(){
            var newContent = '<asp:Label runat="server" Text="'+moment().toISOString()+'"></asp:Label>';
            return '<div id="SPProxyWebPartManagerReplace">'+newContent+'</div>'
        }     

        activate();

        vm.onSendEmailButtonClicked = function(){
            var body = 'test body generated at ' + moment().toISOString();
            spContext.sendEmail('mike@chanm003.onmicrosoft.com', 'mike@chanm003.onmicrosoft.com', 'test subject', body)
                .then(function(data){
                    console.log(data);
                });
        }

        function openCallout(){
            var calloutObj = CalloutManager.getFromLaunchPointIfExists(document.getElementById('mainContent'));
            console.log(calloutObj.getTitle());
            calloutObj.open();
        }

        vm.onShowCalloutButtonClicked = function(){
            //for some reason have to introduce a delay from ng-click event-handler
            setTimeout(openCallout, 300);
        }

        SP.SOD.loadMultiple(['strings.js', 'sp.js', 'callout.js'], createHiddenCallout);

        function createHiddenCallout(){
            var opts = {
                ID: 'stepOne', 
                launchPoint: document.getElementById('mainContent'),
                //not required below
                title: 'callout title',
                content: 'this is the content...',
                contentWidth: 600,
                beakOrientation: 'leftRight',
                openOptions:{
                    showCloseButton: false,
                    event: 'none'
                }
            };

            var calloutObj = CalloutManager.createNew(opts);
            
            var propertiesAction = new CalloutAction({
                text: "Properties",
                onClickCallback: function() {
                    alert('You clicked Properties');
                },
                isEnabledCallback: function() {
                    return true;
                }
            });

            calloutObj.addAction(propertiesAction);
            
            //setTimeout(openCallout, 1500);
        }

        spContext.generateEmailBody('/ngspa/TF08/mike.txt', { item: {balance: '$89823982983293.32'} })
            .then(function(body){
                console.log(body);
            });
        
        function activate() {
            $q.all([
                getDataForVerticalTimeline()
            ])
                .then(function (data) {
                    vm.missionLifecycleEvents = data[0];
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
                },
                {
                    direction: 'left',
                    subject: 'Got Birth Certificate',
                    message: 'When choosing a motion for side panels, consider the origin of the triggering element. Use the motion to create a link between the action and the resulting UI.',
                    moment: moment().add(2, 'days')
                }
            ];
            return $q.when(staticData);
        }

        vm.testCopyAttachmentOperation = function(){
            copyAttachmentBetweenListItems({
                webUrl: _spPageContextInfo.webServerRelativeUrl,
                sourceListName: 'Inject',
                sourceListItemID: 2,
                fileName: 'style.scss',
                destinationListName: 'Message Traffic',
                destinationListItemID: 1
            })
            .then(function(){
                console.log('Copy complete...');
            });
        }

        function copyAttachmentBetweenListItems(opts){
            return  getListItemAttachmentBinary(opts).then(uploadListItemAttachmentBinary);
        
            function getListItemAttachmentBinary(opts){
                var dfd = $q.defer();
                SP.SOD.loadMultiple(['sp.requestexecutor.js'], _getFileBinary);
                return dfd.promise;

                function _getFileBinary(){
                    var fileContentUrl = opts.webUrl + "/_api/web/Lists/getByTitle('"+opts.sourceListName+"')/Items("+opts.sourceListItemID+")/AttachmentFiles('"+opts.fileName+"')/$value";
                    var executor = new SP.RequestExecutor(opts.webUrl);
                    var request = {
                        url: fileContentUrl,
                        method: "GET",
                        binaryStringResponseBody: true,
                        success: function (data) {
                            //binary data available in data.body
                            opts.binary = data.body;
                            dfd.resolve(opts);
                        },
                        error: function (err) {
                            dfd.reject(JSON.stringify(err));
                        }
                    };
                    executor.executeAsync(request);
                }
            }

            function uploadListItemAttachmentBinary(opts){
                var dfd = $q.defer();

                var fileContentUrl = opts.webUrl + "/_api/web/Lists/getByTitle('"+opts.destinationListName+"')/Items("+opts.destinationListItemID+")/AttachmentFiles/add(FileName='"+opts.fileName+"')";
                var executor = new SP.RequestExecutor(opts.webUrl);
                var request = {
                    url: fileContentUrl,
                    method: "POST",
                    binaryStringRequestBody: true,
                    body: opts.binary,
                    state: "Update",
                    success: function (data) {
                        dfd.resolve();
                    },
                    error: function (err) {
                        var error = JSON.stringify(err);
                        dfd.reject(error);
                    }
                };
                executor.executeAsync(request);

                return dfd.promise;
            }
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: ProjectionScrollableAspxController */
(function ($, _) {
    angular
        .module('app.core')
        .controller('ProjectionScrollableAspxController', ControllerDefFunc);

    ControllerDefFunc.$inject = ['$location','$q', '$routeParams','_', 'CalendarRepository', 'CCIRRepository', 'MessageTrafficRepository','MissionDocumentRepository', 'MissionTrackerRepository', 'WatchLogRepository', 'RfiRepository', 'RFI'];
    function ControllerDefFunc($location, $q, $routeParams,_, CalendarRepository, CCIRRepository, MessageTrafficRepository, MissionDocumentRepository, MissionTrackerRepository, WatchLogRepository,  RFIRepository, RFI) {
        var cutOffToBeConsideredNew = moment().add(-(3), 'hours');

        var timer = null;
        var vm = this;
        vm.isNew = isNew;
        vm.showMissionDocs = showMissionDocs;
        
        init();

        function init(){
            vm.selectedOrg = $routeParams.org;
            refreshData().then(function(){
                listenForWindowScrolling();
                startScrolling();
            });
        }

        function refreshData(){
            return $q.all([
                CCIRRepository.getByOrganization($routeParams.org),
                WatchLogRepository.getSignificantItemsCreatedInLast24Hours($routeParams.org),
                CalendarRepository.getBattleRhythmNext24($routeParams.org),
                MessageTrafficRepository.getSignificantItemsCreatedInLast24Hours($routeParams.org),
                MissionTrackerRepository.getOpenMissionsByApprovalChain($routeParams.org),
                MissionDocumentRepository.getMissionRelated(),
                RFIRepository.getOpenHighPriority($routeParams.org)
            ])
            .then(function(data){
                vm.lastRefreshedTime = moment.utc().format('DD MMM YY HHmm[Z]').toUpperCase();
                vm.ccirItemsGroupedByCategory = _.groupBy(data[0], 'Category');
                vm.watchLogItems = data[1];
                vm.calendarItems = _.map(data[2], function(item){
                    item.start = moment.utc(item.start);
                    item.end = moment.utc(item.end);
                    
                    item.comments = (item.location) ? "Location: " + item.location + ", ": "";
                    var fromNowString = item.start.fromNow();
                    var verb = (_.includes(fromNowString, 'ago')) ? "started" : "will start";
                    item.comments += verb + " " + fromNowString;

                    return item;
                });
                vm.messageTraffic = data[3];

                var missions = data[4];
                var missionRelatedDocs = data[5];
                _.each(missions, function(item){
                    item.relatedDocs = _.filter(missionRelatedDocs, {MissionId: item.Id});
                });
                vm.missionGroupings = groupMissions(missions);

                vm.openRFIs = _.map(data[6], function (item) { return new RFI(item); })
                //scroll to top...
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });
        }

        function groupMissions(missions){
            var groupings = [
                { name: "Initial Targeting" },
                { name: "JPG Assigned" },
                { name: "COA Approved" },
                { name: "CONOP Received - In Chop" },

                { name: "CONOP Disapproved" },	

                { name: "CONOP Approved" },
                { name: "FRAGO In-Chop" },
                { name: "FRAGO Released" },
                { name: "EXORD Released" },

                { name: "Mission In Progress" },

                { name: "Return to Base" },		
                { name: "QuickLook" },	
                { name: "StoryBoard" },
                { name: "OPSUM" },

                { name: "Mission Closed" }
            ];

            _.map(groupings, function(group){
                group.items = _.filter(missions, {Status: group.name});
                return group;
            });

            return groupings;
        }

        function isNew(createdTimeStamp){
            return moment(createdTimeStamp).isAfter(cutOffToBeConsideredNew);
        }

        function showMissionDocs(mission){
            vm.missionDocsDialog = {
                show: true,
                documents: mission.relatedDocs,
                header: "Documents for " + mission.Identifier
            };
        }

        function startScrolling() {
            if(!vm.scrollStarted){ return; }
            timer = setInterval(scrollPage, 50);

            function scrollPage(){
                window.scroll(0, getCurrentPosition());
            }

            function getCurrentPosition() {
                var currentPos;
                if (document.all) {
                    currentPos = document.documentElement.scrollTop + 1;
                } else {
                    currentPos = window.pageYOffset + 1;
                }
                return currentPos;
            }
        }

        function stopScrolling(){
            clearInterval(timer);
        }

        function listenForWindowScrolling(){
            $(window).bind('scroll', function(){
                if(isUserAtBottomOfPage()){
                    refreshData();
                }
            });

            function isUserAtBottomOfPage() {
                return $(window).scrollTop() + $(window).height() == $(document).height();
            }
        }

        vm.scrollButtonClicked = function(){
            vm.scrollStarted = !vm.scrollStarted;

            if(vm.scrollStarted){
                startScrolling();
            } else {
                stopScrolling();
            }
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

/* Controller: HelpDeskController with route for SPA*/
(function ($, _) {
    angular
        .module('app.core')
        .controller('HelpDeskController', ControllerDefFunc);

    ControllerDefFunc.$inject = ['$q', '$scope', '$routeParams', '_', 'logger', 'HelpDeskRepository'];
    function ControllerDefFunc($q, $scope, $routeParams, _, logger, HelpDeskRepository) {
        var vm = this;
        var pivots;

        vm.goToNewHelpDeskForm = function () {
            window.location.href = _spPageContextInfo.webServerRelativeUrl + "/Lists/HelpDesk/NewForm.aspx?Source=" + buildRedirectUrl();
        }

        vm.goToTicket = function(item){
            window.location.href = _spPageContextInfo.webServerRelativeUrl + "/Lists/HelpDesk/EditForm.aspx?ID="+ item.Id +"&Source=" + buildRedirectUrl();
        }

        activate();

        function activate() {
            initTabs();
            fetchData();
        }

        function buildRedirectUrl(){
            var indexForCurrentlySelectedTab = _.findIndex(vm.tabConfig.pivots, function(pivot){ return pivot.title === vm.tabConfig.selectedPivot.title; });
            var pattern = /#\/helpdesk\/[\d]{0,1}/g;
            return encodeURIComponent(document.location.href.replace(pattern, '#/helpdesk/'+indexForCurrentlySelectedTab));
        }

        function initTabs() {
            pivots = [
                { 
                    title: "Open - Help Desk", 
                    groupByFieldName: "Status", 
                    items: [],
                    filterFunc: function(item){
                        return item.RequestType !== "Portal Development/KM" && (_.includes(["Initiated", "Engaged"], item.Status));
                    } 
                },
                { 
                    title: "Open - Portal/KM", 
                    groupByFieldName: 
                    "Status", 
                    items: [],
                    filterFunc: function(item){
                        return item.RequestType === "Portal Development/KM" && (_.includes(["Initiated", "Engaged"], item.Status));
                    } 
                },
                { 
                    title: "Hold", 
                    groupByFieldName: "RequestType", 
                    items: [],
                    filterFunc: function(item){
                        return item.Status === "Hold";
                    }
                },
                { 
                    title: "Resolved", 
                    groupByFieldName: "RequestType", 
                    items: [],
                    filterFunc: function(item){
                        return item.Status === "Resolved";
                    }
                },
                { 
                    title: "My Requests", 
                    groupByFieldName: "Status", 
                    items: [],
                    filterFunc: function(item){
                        return item.AuthorId === _spPageContextInfo.userId;
                    }
                }
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

            $scope.$watch('vm.tabConfig.selectedPivot', function(pivot){
                setCurrentDataSource(pivot);
            })
        }

        function setCurrentDataSource(selected){
            vm.ticketsDataSource = selected.items;
            vm.groupByFieldName = _.startCase(selected.groupByFieldName);
        }

        function fetchData(){
            HelpDeskRepository.getAll()
                .then(function(data){
                   createDataSources(data);
                   var dataSource = _.find(pivots, {title: vm.tabConfig.selectedPivot.title});
                   setCurrentDataSource(dataSource);
                });

        }

        function createDataSources(data){
            _.each(pivots, function(pivot){
                pivot.items = _.chain(data)
                    .filter(pivot.filterFunc)
                    .groupBy(pivot.groupByFieldName)
                    .value();
            });
        }
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

(function ($, _) {
    $(document).ready(bootstrapNgApplication);
    function bootstrapNgApplication() {
        var currentURL = window.location.pathname.toUpperCase();
        var spPage = $("body");
        if (_.includes(currentURL, '/SITEPAGES/SOCC.ASPX') || _.includes(currentURL, '/SITEPAGES/SOTG.ASPX') || _.includes(currentURL, '/SITEPAGES/SOAC.ASPX')) {
            spPage.attr('ng-controller', 'OrgDashboardAspxController as vm');
            spPage.append("<chopdialog></chopdialog>");
        }

        if (_.includes(currentURL, '/SITEPAGES/EXCON.ASPX') ) {
            spPage.attr('ng-controller', 'OrgDashboardAspxController as vm');
            spPage.append("<publishscenariodialog></publishscenariodialog>");
        }

        if (_.includes(currentURL, '/LISTS/MISSIONTRACKER/NEWFORM.ASPX') || _.includes(currentURL, '/LISTS/MISSIONTRACKER/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'MissionTrackerDataEntryAspxController as vm');
            spPage.append("<genericdialog></genericdialog>");
        }

        if (_.includes(currentURL, '/LISTS/MISSIONTRACKER/DISPFORM.ASPX')) {
            spPage.attr('ng-controller', 'MissionTrackerDispFormAspxController as vm');
            spPage.append("<genericdialog></genericdialog>");
        }
        

        if (_.includes(currentURL, '/LISTS/RFI/NEWFORM.ASPX') || _.includes(currentURL, '/LISTS/RFI/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'RfiDataEntryAspxController as vm');
        }

        if (_.includes(currentURL, '/MISSIONDOCUMENTS/FORMS/EDITFORM.ASPX')) {
            spPage.attr('ng-controller', 'MissionProductsDataEntryAspxController as vm');
        }

        addMenuDirective();
        setPageHeader();
        //BOOTSTRAP NG-APP
        angular.bootstrap(document, ['singlePageApp']); 

        function addMenuDirective() {
            spPage.find("#sideNavBox").prepend("<nav-menu></nav-menu>");
        }

        function setPageHeader(){
            var organization = _.getQueryStringParam("org");

            if(organization){
                var header = angular.element("#DeltaPlaceHolderPageTitleInTitleArea");
                header.text(header.text() + " - " + organization);
            }
        }        
    }
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);
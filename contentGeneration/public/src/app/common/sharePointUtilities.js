(function () {
	'use strict';

	angular.module('SharePoint.common', [])
		.factory('sharepointUtilities', dataservice)
		.factory('fieldAttributeValuesValidation', fieldAttributeValuesValidation)
		.factory('fieldXmlGeneration', fieldXmlGeneration);

	dataservice.$inject = ['$http', '$location', '$q', 'fieldXmlGeneration', 'logger'];
	function dataservice($http, $location, $q, fieldXmlGeneration, logger) {

		return {
			copyFile: copyFile,
			createOrUpdateFile: createOrUpdateFile,
			createList: createList,
			createListItem: createListItem,
			createSite: createSite,
			createTypeaheadDataSourceForSiteUsersList: createTypeaheadDataSourceForSiteUsersList,
			deleteFiles: deleteFiles,
			deleteLists: deleteLists,
			getLists: getLists,
			getFilesFromFolder: getFilesFromFolder,
			provisionListViewWebparts: provisionListViewWebparts,
			provisionScriptEditorWebparts: provisionScriptEditorWebparts,
			updateChoiceFields: updateChoiceFields
		};

		function addListViewWebPart(opts) {
			return addWebPartToPage(opts);

			function addWebPartToPage(opts) {
				var dfd = $q.defer();

				var xmlToImport = generateXmlDef(opts);

				var ctx = new SP.ClientContext(opts.webUrl);
				var spWeb = ctx.get_web();
				var aspxFile = spWeb.getFileByServerRelativeUrl(opts.aspxFileUrl);
				var wpManager = aspxFile.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
				var wpDefinition = wpManager.importWebPart(xmlToImport);
				var wp = wpDefinition.get_webPart();
				wpManager.addWebPart(wp, opts.zoneName, opts.zoneIndex);

				//act of adding a web part, creates a hidden view for the list
				var list = spWeb.get_lists().getByTitle(opts.listTitle);
				list.update();
				var listViews = list.get_views();

				ctx.load(wp);
				ctx.load(list);
				ctx.load(listViews);


				ctx.executeQueryAsync(
					Function.createDelegate(this, onWebpartAdded),
					Function.createDelegate(this, onQueryFailed)
				);

				return dfd.promise;

				function generateXmlDef(opts) {
					//required property:  <property name="ListUrl" type="string">Lists/WatchLog</property>\
					addParameterBindingsProperty(opts.webPartProperties);

					var baseWebPartXmlString =
						'<webParts>\
							<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
								<metaData>\
									<type name="Microsoft.SharePoint.WebPartPages.XsltListViewWebPart, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
									<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
								</metaData>\
								<data>\
									<properties>' +
						generateWebpartPropertyTags(opts.webPartProperties) +
						'</properties>\
								</data>\
							</webPart>\
						</webParts>';



					return baseWebPartXmlString;

					function addParameterBindingsProperty(webPartProperties) {
						//makes it possible to use {{orgQsParam}} in our CAML queries (maps to value for the 'org' querystring parameter)
						var innerText = '&lt;ParameterBinding Name="dvt_sortdir" Location="Postback;Connection"/&gt;' +
							'&lt;ParameterBinding Name="dvt_sortfield" Location="Postback;Connection"/&gt;' +
							'&lt;ParameterBinding Name="dvt_startposition" Location="Postback" DefaultValue=""/&gt;' +
							'&lt;ParameterBinding Name="dvt_firstrow" Location="Postback;Connection"/&gt;' +
							'&lt;ParameterBinding Name="OpenMenuKeyAccessible" Location="Resource(wss,OpenMenuKeyAccessible)" /&gt;' +
							'&lt;ParameterBinding Name="open_menu" Location="Resource(wss,open_menu)" /&gt;' +
							'&lt;ParameterBinding Name="select_deselect_all" Location="Resource(wss,select_deselect_all)" /&gt;' +
							'&lt;ParameterBinding Name="idPresEnabled" Location="Resource(wss,idPresEnabled)" /&gt;' +
							'&lt;ParameterBinding Name="NoAnnouncements" Location="Resource(wss,noXinviewofY_LIST)" /&gt;' +
							'&lt;ParameterBinding Name="NoAnnouncementsHowTo" Location="Resource(wss,noXinviewofY_DEFAULT)" /&gt;' +
							'&lt;ParameterBinding Name="orgQsParam" Location="QueryString(org)" /&gt;';
						webPartProperties.push({
							attributes: { name: 'ParameterBindings', type: 'string' },
							innerText: innerText
						});
					}


				}

				function onWebpartAdded() {
					var enumerator = listViews.getEnumerator();
					var webPartView;

					while (enumerator.moveNext()) {
						var view = enumerator.get_current();

						if (view.get_title() === '') {
							//found the hidden view that was specifically created when we added our web part
							webPartView = view;
							break;
						}
					}

					if (!webPartView) {
						//hidden view not found
						dfd.resolve();
					}

					webPartView.get_viewFields().removeAll();
					_.each(opts.viewFields, function (internalFieldName) {
						webPartView.get_viewFields().add(internalFieldName);
					});
					webPartView.set_title(opts.viewName);
					webPartView.set_viewQuery(opts.viewCAML);
					webPartView.set_hidden(false);
					webPartView.update();
					ctx.load(webPartView);
					ctx.executeQueryAsync(
						Function.createDelegate(this, onWebpartViewUpdated),
						Function.createDelegate(this, onQueryFailed)
					);
					function onWebpartViewUpdated() {
						logger.logSuccess('Web part added: (' + opts.viewName + ') on ' + opts.aspxFileUrl, null, 'sharepointUtilities service, addListViewWebpart()');
						dfd.resolve();
					}
				}

				function onQueryFailed(sender, args) {
					logger.logError('Request to create webpart (' + opts.listTitle + ') failed on ' + opts.aspxFileUrl + ': ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, addListViewWebpart()');
					dfd.reject();
				}
			}
		}

		function addScriptEditorWebPart(opts) {
			return addWebPartToPage(opts);

			function addWebPartToPage(opts) {
				var dfd = $q.defer();

				var xmlToImport = generateXmlDef(opts);

				var ctx = new SP.ClientContext(opts.webUrl);
				var spWeb = ctx.get_web();
				var aspxFile = spWeb.getFileByServerRelativeUrl(opts.aspxFileUrl);
				var wpManager = aspxFile.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
				var wpDefinition = wpManager.importWebPart(xmlToImport);
				var wp = wpDefinition.get_webPart();
				wpManager.addWebPart(wp, opts.zoneName, opts.zoneIndex);

				ctx.load(wp);

				ctx.executeQueryAsync(
					Function.createDelegate(this, onWebpartAdded),
					Function.createDelegate(this, onQueryFailed)
				);

				return dfd.promise;

				function generateXmlDef(opts) {
					//required property:  <property name="Content" type="string"></property>\

					var baseWebPartXmlString =
						'<webParts>\
							<webPart xmlns="http://schemas.microsoft.com/WebPart/v3">\
								<metaData>\
									<type name="Microsoft.SharePoint.WebPartPages.ScriptEditorWebPart, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" />\
									<importErrorMessage>Cannot import this Web Part.</importErrorMessage>\
								</metaData>\
								<data>\
									<properties>' +
						generateWebpartPropertyTags(opts.webPartProperties) +
						'</properties>\
								</data>\
							</webPart>\
						</webParts>';

					return baseWebPartXmlString;
				}

				function onWebpartAdded() {
					logger.logSuccess('Web part added: (' + opts.name + ') on ' + opts.aspxFileUrl, null, 'sharepointUtilities service, addScriptEditorWebpart()');
					dfd.resolve();
				}

				function onQueryFailed(sender, args) {
					logger.logError('Request to create webpart (' + opts.name + ') failed on ' + opts.aspxFileUrl + ': ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, addScriptEditorWebpart()');
					dfd.reject();
				}
			}
		}

		function copyFile(opts) {
			patchSpRequestExecutor();
			var sourceExecutor = new SP.RequestExecutor(opts.sourceWebUrl);
			var targetExecutor = new SP.RequestExecutor(opts.destinationWebUrl);
			return getFormDigestForTargetSite(opts)
				.then(getFile)
				.then(copyToDestination)
				.then(function () {
					logger.logSuccess('File copied: ' + opts.destinationFileUrl, null, 'sharepointUtilities service, copyFile()');
				})
				.catch(function (ex) {
					logger.logError('Request failed: ' + ex, null, 'sharepointUtilities service, copyFile()');
				});

			function copyToDestination(opts) {
				var dfd = $q.defer();

				var folderUrl = opts.destinationWebUrl + "/" + opts.destinationWebFolderUrl,
					fileUrl = opts.destinationWebUrl + "/" + opts.destinationWebFolderUrl + '/' + opts.destinationFileUrl;

				var copyFileAction = {
					url: opts.destinationWebUrl + "/_api/web/GetFolderByServerRelativeUrl('" + folderUrl + "')/Files/Add(url='" + fileUrl + "', overwrite=true)",
					method: "POST",
					headers: {
						"Accept": "application/json; odata=verbose",
						"X-RequestDigest": opts.formDigestForTargetWeb
					},
					contentType: "application/json;odata=verbose",
					binaryStringRequestBody: true,
					body: opts.fileBinary,
					success: function (copyFileData) {
						dfd.resolve();
					},
					error: function (ex) {
						dfd.reject("Error retrieving file to copy: " + ex);
					}
				};

				targetExecutor.executeAsync(copyFileAction);

				return dfd.promise;
			}

			function getFile(opts) {
				var dfd = $q.defer();

				var locationOfSourceFile = opts.sourceWebUrl + '/' + opts.sourceFileUrl;

				var getFileAction = {
					url: opts.sourceWebUrl + "/_api/web/GetFileByServerRelativeUrl('" + locationOfSourceFile + "')/$value",
					method: "GET",
					binaryStringResponseBody: true,
					success: function (data) {
						// Get the binary data.
						opts.fileBinary = data.body;
						dfd.resolve(opts);
					},
					error: function (ex) {
						dfd.reject("Error retrieving file to copy: " + ex);
					}
				};
				sourceExecutor.executeAsync(getFileAction);

				return dfd.promise;
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
		}

		function createList(opts) {
			return getDependencies()
				.then(_createList);

			function getDependencies() {
				var dependentLists = [];

				var containsLookupFields = _.some(opts.fieldsToCreate, function (fieldDef) { return _.contains(["Lookup", "LookupMulti"], fieldDef.Type); });

				if (containsLookupFields) {
					console.log('extra network call to get dependent lists');
					return getLists(opts.webUrl);
				} else {
					console.log('no dependencies');
					return $q.when(dependentLists);
				}
			}

			function _createList(dependentLists) {
				var dfd = $q.defer();
				var ctx = new SP.ClientContext(opts.webUrl);
				var spWeb = ctx.get_web();
				var createdList = null;
				var createdFields = [];

				//create list
				var listCreationInfo = new SP.ListCreationInformation();
				var uglyListName = S(opts.Title).camelize().toString()
				listCreationInfo.set_title(uglyListName);
				listCreationInfo.set_templateType(SP.ListTemplateType[opts.BaseTemplate]);
				createdList = spWeb.get_lists().add(listCreationInfo);

				//update list: make the name of list pretty, turn-on versioning if necessary
				createdList.set_title(opts.Title);
				if (opts.enableVersioning) {
					createdList.set_enableVersioning(true);
				}
				createdList.update();

				//delete fields
				_.each(opts.fieldsToModify, function (fieldDef) {
					var existingField = createdList.get_fields().getByInternalNameOrTitle(fieldDef.Name);
					existingField.set_schemaXml(fieldXmlGeneration.generate(fieldDef));
					existingField.update();
				});

				//add fields
				_.each(opts.fieldsToCreate, function (fieldDef) {
					if (fieldDef.Type === 'Lookup' || fieldDef.Type === 'LookupMulti') {
						//obtain list GUID
						var sourceList = _.findWhere(dependentLists, { name: fieldDef.List })
						if (sourceList) {
							fieldDef.List = sourceList.guid;
						}
					}

					var newField = createdList.get_fields().addFieldAsXml(fieldXmlGeneration.generate(fieldDef), true, SP.AddFieldOptions.addFieldInternalNameHint);
					createdFields.push(newField);
				});

				//update to Title field (if necessary)
				if (opts.shouldHideTitleField) {
					var titleField = createdList.get_fields().getByTitle("Title");
					titleField.setShowInDisplayForm(false);
					titleField.setShowInNewForm(false);
					titleField.setShowInEditForm(false);
					titleField.set_hidden(true);
					titleField.set_required(false);
					titleField.update();
				}

				//update to default view
				var defaultViews = {
					documentLibrary: 'All Documents',
					events: 'All Events'
				};
				var viewName = defaultViews[opts.BaseTemplate] || "All Items";
				var defaultView = createdList.get_views().getByTitle(viewName);
				if (opts.shouldHideTitleField) {
					defaultView.get_viewFields().remove("LinkTitle");
				}
				var internalFieldNamesForHiddenFields = _.pluck(_.where(opts.fieldsToCreate, { Hidden: 'TRUE' }), "Name");
				_.each(internalFieldNamesForHiddenFields, function (internalFieldName) {
					defaultView.get_viewFields().remove(internalFieldName);
				});
				defaultView.update();

				//batch, setup, and send the request
				ctx.load(createdList);
				_.each(createdFields, function (createdField) {
					ctx.load(createdField);
				});
				ctx.executeQueryAsync(
					Function.createDelegate(this, onQuerySucceeded),
					Function.createDelegate(this, onQueryFailed)
				);

				return dfd.promise;

				function onQuerySucceeded() {
					logger.logSuccess('Created list: (' + opts.Title + ')', null, 'sharepointUtilities service, createList()');
					dfd.resolve();
				}
				function onQueryFailed(sender, args) {
					logger.logError('Request to create list (' + opts.Title + ') failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, createList()');
					dfd.reject();
				}
			}
		}

		function createListItem(opts){
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.webUrl);
			var spWeb = ctx.get_web();
			var list = ctx.get_web().get_lists().getByTitle(opts.listName);
			var itemCreateInfo = new SP.ListItemCreationInformation();
            var listItem = list.addItem(itemCreateInfo);

			_.each(opts.props, function (prop) {
				listItem.set_item(prop.fieldName, prop.fieldValue);
			});			
			
            listItem.update();
            ctx.load(listItem);
			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			return dfd.promise;

			function onQuerySucceeded() {
				logger.logSuccess('List item created in : ' + opts.listName, null, 'sharepointUtilities service, createListItem()');
				dfd.resolve();
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, createListItem()');
				dfd.reject();
			}
		}

		function createSite(opts) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.parentWeb);
			var parentWeb = ctx.get_web();

			var webCreationInfo = new SP.WebCreationInformation();
			webCreationInfo.set_title(opts.name);
			webCreationInfo.set_description(opts.description);
			webCreationInfo.set_language(1033);
			webCreationInfo.set_url(opts.acronym);
			webCreationInfo.set_useSamePermissionsAsParentSite(true);
			webCreationInfo.set_webTemplate('STS');

			var childWeb = parentWeb.get_webs().add(webCreationInfo);
			parentWeb.update();

        	/*
			Ensure child navigation inherits from parent web
			inheritFromParentWeb: 3 */
			var webNavSettings = new SP.Publishing.Navigation.WebNavigationSettings(ctx, childWeb);
			var navigation = webNavSettings.get_globalNavigation();
			navigation.set_source(3);
			webNavSettings.update();

			/*
			Ensure child web has proper regional settings
			/_layouts/15/regionalsetng.aspx
			*/
			var regionalSettings = childWeb.get_regionalSettings();
			regionalSettings.set_time24(true); //24 hour clock
			//Full list here: https://msdn.microsoft.com/library/microsoft.sharepoint.spregionalsettings.timezones.aspx
			var timeZone = regionalSettings.get_timeZones().getById(93); 
			// 2 is (UTC) Dublin, Edinburgh, Lisbon, London (daylight bias of -60)
			// 93 is ((UTC) Coordinated Universal Time)
			regionalSettings.set_timeZone(timeZone);
			regionalSettings.update();

			/*
			Change Alternate CSS Url
			configured in /_layouts/15/ChangeSiteMasterPage.aspx (available only when publishing is activated)
			*/
			var serverRelativeURL = (opts.parentWeb + "/" + opts.acronym).replace(document.location.protocol + "//", "").replace(document.location.host, "");
			var alternateCssUrl = serverRelativeURL + "/SitePages/app.css";
			childWeb.set_alternateCssUrl(alternateCssUrl);
			childWeb.update();

			var userCustomActions = childWeb.get_userCustomActions();
			var action = userCustomActions.add();
			action.set_location("ScriptLink");
			action.set_title('jocInBoxConfig.js');
			action.set_scriptSrc('~site/SitePages/jocInBoxConfig.js');
			action.set_sequence(1000);
			action.update();
			var vendorFiles = [
				'jquery.min.js',
				'lodash.min.js',
				'sputility.min.js',
				'vis.min.js',
				'angular.min.js',
				'angular-resource.min.js',
				'angular-sanitize.min.js',
				'ngplus-overlay.js',
				'moment.min.js',
				'angular-ui-router.min.js',
				'notifications.min.js',
				'angular-animate.min.js',
				'ngOfficeUiFabric.min.js',
				'fullCalendar.min.js',
				'jstree.min.js'
			];
			var sequenceCounter = 0;
			_.each(vendorFiles, function (fileName) {
				var action = userCustomActions.add();
				action.set_location("ScriptLink");
				action.set_title(fileName);
				//action.set_scriptSrc(opts.cdn + '/' + fileName);	
				action.set_scriptSrc('~site/SitePages/' + fileName);
				sequenceCounter = sequenceCounter + 10;
				action.set_sequence(1000 + sequenceCounter);
				action.update();
			});

			var action = userCustomActions.add();
			action.set_location("ScriptLink");
			action.set_title('/displayTemplates.js');
			action.set_scriptSrc(opts.cdn + "/displayTemplates.js");
			action.set_sequence(1000 + sequenceCounter + 10);
			action.update();

			var action = userCustomActions.add();
			action.set_location("ScriptLink");
			action.set_title('app.js');
			action.set_scriptSrc(opts.cdn + "/app.js");
			action.set_sequence(1000 + sequenceCounter + 100);
			action.update();

			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			return dfd.promise;

			function onQuerySucceeded() {
				logger.logSuccess('Following site created: ' + opts.name, null, 'sharepointUtilities service, createSite()');
				dfd.resolve();
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, createSite()');
				dfd.reject();
			}
		}

		function createOrUpdateFile(opts) {
			var dfd = $q.defer();

			var folderUrl = opts.destinationWebUrl + "/" + opts.destinationWebFolderUrl;
			var fileUrl = opts.destinationWebUrl + "/" + opts.destinationWebFolderUrl + '/' + opts.destinationFileUrl;
			var restURI = opts.destinationWebUrl + "/_api/web/GetFolderByServerRelativeUrl('" + folderUrl + "')/Files/Add(url='" + fileUrl + "', overwrite=true)";

			var byteArray = new SP.Base64EncodedByteArray();
			for (var i = 0; i < opts.fileContent.length; i++) {
				byteArray.append(opts.fileContent.charCodeAt(i));
			}
			var binaryForRequestBody = byteArray.toBase64String();

			$.ajax({
				url: restURI,
				type: "POST",
				data: opts.fileContent,
				headers: {
					"X-RequestDigest": $("#__REQUESTDIGEST").val()
				}
			})
				.then(function () {
					logger.logSuccess('Updated file: (' + fileUrl + ')', null, 'sharepointUtilities service, createOrUpdateFile()');
					dfd.resolve();
				})
				.fail(function (args) {
					logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, createOrUpdateFile()');
					dfd.reject();
				})
			return dfd.promise;
		}

		function createTypeaheadDataSourceForSiteUsersList() {
			// constructs the suggestion engine
            var bhSource = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //REST endpoint: /_api/web/siteusers?$filter=substringof('Chan', Title)
					// tolower is in OData spec, but not SP2013 REST https://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx#bk_supported
                    url: _spPageContextInfo.webServerRelativeUrl + "/_api/web/siteusers?$filter=substringof('%QUERY', Title)",
                    wildcard: '%QUERY',
                    transform: function (response) {
                        return response.value;
                    }
                }
            });

			var emptyMsg = [
				'<div class="empty-message">',
				'unable to find any users in the SharePoint directory matching your search (Please ensure case-sensitivity e.g. Smith instead of smith)',
				'</div>'
			].join('\n');

			return {
				name: 'spuserlist',
				display: 'Title',
				source: bhSource,
				templates: {
					empty: emptyMsg,
					suggestion: function (data) {
						return '<div>' + data.Title + '<br/><small class="text-muted">' + data.Email + '</small></div>';
					}
				}
            };
		}

		function deleteFiles(opts) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.webUrl);
			var spWeb = ctx.get_web();

			_.each(opts.fileUrls, function (fileUrl) {
				var file = spWeb.getFileByServerRelativeUrl(fileUrl);
				file.deleteObject();
			});

			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			function onQuerySucceeded() {
				logger.logSuccess('Following file(s) deleted: ' + opts.fileUrls.join(', '), null, 'sharepointUtilities service, deleteFiles()');
				dfd.resolve();
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, deleteFiles()');
				dfd.reject();
			}
		}

		function deleteLists(opts) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.webUrl);
			var spWeb = ctx.get_web();

			_.each(opts.listTitles, function (listTitle) {
				var list = spWeb.get_lists().getByTitle(listTitle);
				list.deleteObject();
			});

			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			function onQuerySucceeded() {
				logger.logSuccess('Following list(s) deleted: ' + opts.listTitles.join(', '), null, 'sharepointUtilities service, deleteLists()');
				dfd.resolve();
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, deleteLists()');
				dfd.reject();
			}
		}

		function generateWebpartPropertyTags(webPartProperties) {
			var xml = '';
			_.each(webPartProperties, function (prop) {

				var attributes = '';
				_.each(prop.attributes, function (val, key) {
					attributes += key + '="' + val + '" ';
				});

				xml +=
					[
						"<property ",
						attributes,
						" >",
						(prop.innerText || ''),
						"</property>"
					].join('');

			});
			return xml;
		}

		function getFilesFromFolder(opts) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.webUrl);
			var spWeb = ctx.get_web();

			// do not need subfolders, so no need to use SP.CamlQuery.createAllItemsQuery
			var folder = spWeb.getFolderByServerRelativeUrl(opts.folderServerRelativeUrl);
			var spFiles = folder.get_files();
			ctx.load(spFiles);

			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			return dfd.promise;

			function onQuerySucceeded() {
				var files = [];
				var listItemEnumerator = spFiles.getEnumerator();
				while (listItemEnumerator.moveNext()) {
					var spFile = listItemEnumerator.get_current();
					files.push({
						name: spFile.get_name()
					})
				}
				dfd.resolve(files);
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, getFilesFromFolder()');
				dfd.reject();
			}
		}

		function getFormDigestForTargetSite(opts) {
			var dfd = $q.defer();
			$.ajax({
				url: opts.destinationWebUrl + "/_api/contextinfo",
				type: "POST",
				withCredentials: true,
				headers: {
					"Accept": "application/json;odata=verbose"
				}
			})
				.then(function (data) {
					opts.formDigestForTargetWeb = data.d.GetContextWebInformation.FormDigestValue;
					dfd.resolve(opts);
				})
				.fail(function (ex) {
					dfd.reject("Error retrieving form digest:" + ex);
				});
			return dfd.promise;
		}

		function getLists(webUrl) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(webUrl);
			var spWeb = ctx.get_web();
			var listCollection = spWeb.get_lists();


			var queryResult = ctx.loadQuery(listCollection, 'Include(Id,Title,BaseTemplate,Fields.Include(Title,InternalName,TypeDisplayName,Hidden,TypeAsString),Views.Include(Title,Hidden))');
			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			return dfd.promise;

			function onQuerySucceeded() {

				var lists = [];
				for (var i = 0; i < queryResult.length; i++) {
					var currList = queryResult[i];
					var list = { guid: currList.get_id().toString(), name: currList.get_title(), baseTemplateType: currList.get_baseTemplate(), fields: [], views: [] };

					//REST EQUIVALENT FOR NON-HIDDEN FIELDS: /_api/web/lists/getbytitle('Documents')/fields?$filter=Hidden eq false
					var fieldsForCurrentList = currList.get_fields();
					var fieldEnumerator = fieldsForCurrentList.getEnumerator();
					while (fieldEnumerator.moveNext()) {
						var currentField = fieldEnumerator.get_current();
						if (!currentField.get_hidden()) {
							list.fields.push({
								displayName: currentField.get_title(),
								internalName: currentField.get_internalName(),
								typeForSchemaDefinition: currentField.get_typeAsString(),
								type: currentField.get_typeDisplayName()
							});
						}
					}

					//REST EQUIVALENT FOR NON-HIDDEN VIEWS: /_api/web/lists/getbytitle('Documents')/views?$filter=Hidden eq false
					var viewsForCurrentList = currList.get_views();
					var viewsEnumerator = viewsForCurrentList.getEnumerator();
					while (viewsEnumerator.moveNext()) {
						var currentView = viewsEnumerator.get_current();
						if (!currentView.get_hidden()) {
							list.views.push({
								title: currentView.get_title()
							});
						}
					}


					lists.push(list);
				}

				dfd.resolve(lists);
			}
			function onQueryFailed(sender, args) {
				logger.logError('Request failed: ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, getLists()');
				dfd.reject();
			}
		}

		function provisionListViewWebparts(webpartPageDef) {
			var webpartDefs = _.map(webpartPageDef.listviewWebparts, function (def) {
				def.webUrl = webpartPageDef.webUrl;
				def.aspxFileUrl = webpartPageDef.webUrl + "/" + webpartPageDef.folderName + '/' + webpartPageDef.aspxFileName;
				return def;
			});

			var listviewWebpartsChain = webpartDefs.reduce(function (previousPromise, webPartDef) {
				return previousPromise.then(function () {
					return addListViewWebPart(webPartDef);
				});
			}, $q.when());

			//returning promise chain that caller can resolve...
			return listviewWebpartsChain;
		}

		function provisionScriptEditorWebparts(webpartPageDef) {
			var webpartDefs = _.map(webpartPageDef.scriptEditorWebparts, function (def) {
				def.webUrl = webpartPageDef.webUrl;
				def.aspxFileUrl = webpartPageDef.webUrl + "/" + webpartPageDef.folderName + '/' + webpartPageDef.aspxFileName;
				return def;
			});

			var scriptEditorWebpartsChain = webpartDefs.reduce(function (previousPromise, webPartDef) {
				return previousPromise.then(function () {
					return addScriptEditorWebPart(webPartDef);
				});
			}, $q.when());

			//returning promise chain that caller can resolve...
			return scriptEditorWebpartsChain;
		}

		function updateChoiceField(opts) {
			var dfd = $q.defer();
			var ctx = new SP.ClientContext(opts.webUrl);
			var spWeb = ctx.get_web();
			var list = spWeb.get_lists().getByTitle(opts.listName);

			_.each(opts.fieldsToUpdate, function (change) {
				var choiceField = list.get_fields().getByInternalNameOrTitle(change.fieldName);
				var spChoiceField = ctx.castTo(choiceField, SP.FieldChoice);
				spChoiceField.set_choices(change.options);
				spChoiceField.updateAndPushChanges();
			});

			ctx.executeQueryAsync(
				Function.createDelegate(this, onQuerySucceeded),
				Function.createDelegate(this, onQueryFailed)
			);

			return dfd.promise;

			function onQuerySucceeded() {
				logger.logSuccess('Choice fields (' + _.pluck(opts.fieldsToUpdate, 'fieldName') + ') updated in the lists ' + opts.listName, null, 'sharepointUtilities service, updateChoiceFields()');
				dfd.resolve();
			}

			function onQueryFailed(sender, args) {
				logger.logError('Request failed: Updating of choice field(s) failed for the list ' + opts.listName + ': ' + args.get_message(), args.get_stackTrace(), 'sharepointUtilities service, updateChoiceFields()');
				dfd.reject();
			}
		}

		function updateChoiceFields(defs) {
			var promiseChain = defs.reduce(function (previousPromise, def) {
				return previousPromise.then(function () {
					return updateChoiceField(def);
				});
			}, $q.when());

			return promiseChain.then(function () {
				console.log("All Choice fields updated")
			});
		}
	}

	fieldAttributeValuesValidation.$inject = ['logger'];
	function fieldAttributeValuesValidation(logger) {
		return {
			AppendOnly: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			Decimals: function (val) {
				return _.isNumber(val);
			},
			Description: function (val) {
				return _.isString(val);
			},
			DisplayName: function (val) {
				return _.isString(val);
			},
			FillInChoice: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			Format: function (val) {
				return _.isString(val) && _.contains(['Calculated', 'DateOnly', 'DateTime', 'Dropdown', 'Hyperlink', 'Image', 'RadioButtons'], val);
			},
			Hidden: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			List: function (val) {
				return _.isString(val);
			},
			Max: function (val) {
				return _.isNumber(val);
			},
			MaxLength: function (val) {
				return _.isNumber(val);
			},
			Min: function (val) {
				return _.isNumber(val);
			},
			Mult: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			Name: function (val) {
				return _.isString(val);
			},
			NumLines: function (val) {
				return _.isNumber(val);
			},
			ReadOnly: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			Required: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			ResultType: function (val) {
				return _.isString(val);
			},
			RichText: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			ShowField: function (val) {
				return _.isString(val);
			},
			ShowInEditForm: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			ShowInNewForm: function (val) {
				return _.isString(val) && _.contains(['TRUE', 'FALSE'], val.toUpperCase());
			},
			Type: function (val) {
				return _.isString(val) && _.contains(['Boolean', 'Calculated', 'Choice', 'DateTime', 'Lookup', 'LookupMulti', 'MultiChoice', 'Note', 'Number', 'Text', 'URL', 'User', 'UserMulti'], val);
			},
			UserSelectionMode: function (val) {
				return _.isString(val) && _.contains(['PeopleAndGroups', 'PeopleOnly'], val);
			}
		};
	}

	fieldXmlGeneration.$inject = ['fieldAttributeValuesValidation', 'logger'];
	function fieldXmlGeneration(fieldAttributeValuesValidation, logger) {
		var svc = {
			generate: generate
		};
		return svc;



		function generate(mapping) {
			if (!mapping.Type || !mapping.Name || !mapping.DisplayName) {
				logger.logWarning("Type, Name and Display Name are always required anytime you create a SharePoint field");
				return "";
			}

			var funcs = {
				"Boolean": generateCamlForBooleanField,
				"Calculated": generateCamlForCalculatedField,
				"Choice": generateCamlForChoiceField,
				"DateTime": generateCamlForDateTimeField,
				"Lookup": generateCamlForLookupField,
				"LookupMulti": generateCamlForLookupMultiField,
				"MultiChoice": generateCamlForMultiChoiceField,
				"Note": generateCamlForNoteField,
				"Number": generateCamlForNumberField,
				"Text": generateCamlForTextField,
				"URL": generateCamlForUrlField,
				"User": generateCamlForUserField,
				"UserMulti": generateCamlForUserMultiField
			};

			return funcs[mapping.Type](mapping);
		}



		function generateCaml(mapping, supportedAttrs) {
			var validSettings = {};
			var choicesCaml = "";
			var defaultCaml = "";
			var formulaCaml = "";
			var fieldRefsCaml = "";

			_.each(supportedAttrs, function (attr) {
				var attrVal = mapping[attr];

				if (attrVal === 0 || !!attrVal) {
					if (attr === "Default") {
						defaultCaml = "<Default>" + attrVal + '</Default>';
					} else if (attr === "Formula") {
						formulaCaml = "<Formula>" + attrVal + '</Formula>';
					} else if (attr === "Choices" && _.isArray(attrVal)) {
						choicesCaml = _.map(attrVal, function (option) {
							return "<CHOICE>" + option + "</CHOICE>";
						})
							.join('');
						choicesCaml = "<CHOICES>" + choicesCaml + "</CHOICES>";
					} else if (attr === "FieldRefs" && _.isArray(attrVal)) {
						fieldRefsCaml = _.map(attrVal, function (internalFieldName) {
							return "<FieldRef Name='" + internalFieldName + "' />";
						})
							.join('');
						fieldRefsCaml = "<FieldRefs>" + fieldRefsCaml + "</FieldRefs>";
					} else {
						if (fieldAttributeValuesValidation[attr] && fieldAttributeValuesValidation[attr](attrVal)) {
							validSettings[attr] = attrVal;
						}
					}
				}
			});

			if (!validSettings["StaticName"]) {
				validSettings["StaticName"] = validSettings["Name"]
			}

			var strAttrs = '';

			_.each(validSettings, function (val, attr) {
				strAttrs += ' ' + attr + "='" + val + "'";
			});

			return [
				'<Field',
				strAttrs,
				'>',
				defaultCaml,
				choicesCaml,
				formulaCaml,
				fieldRefsCaml,
				'</Field>'
			].join('');


		}

		function generateCamlForBooleanField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForCalculatedField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "ResultType", "ReadOnly", "Formula", "FieldRefs", "Description", "Format"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForDateTimeField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "Format", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForChoiceField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Format", "Required", "Choices", "FillInChoice", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForLookupField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "List", "ShowField", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForLookupMultiField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "List", "ShowField", "Mult", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForMultiChoiceField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Format", "Required", "Choices", "FillInChoice", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForNoteField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "NumLines", "RichText", "AppendOnly", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForNumberField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "Decimals", "Min", "Max", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);

		}

		function generateCamlForTextField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "MaxLength", "Default", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForUrlField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "Format", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForUserField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "UserSelectionMode", "ShowField", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

		function generateCamlForUserMultiField(mapping) {
			var supported = ["Name", "DisplayName", "Type", "Required", "UserSelectionMode", "ShowField", "Mult", "Description", "ShowInNewForm", "ShowInEditForm", "Hidden"];
			return generateCaml(mapping, supported);
		}

	}
})();




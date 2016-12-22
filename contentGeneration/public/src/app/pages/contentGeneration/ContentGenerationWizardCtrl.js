(function () {
	'use strict';

	angular.module('BlurAdmin.pages.contentGeneration')
		.controller('ContentGenerationWizardCtrl', WizardCtrl)
		.factory('countriesSvc', countriesSvc)
		.factory('menuSvc', menuSvc)
		.directive('capitalizeAll', capitalizeAllDirective)
		.directive('capitalizeFirst', capitalizeFirstDirective);

	/** @ngInject */
	function WizardCtrl($q, $scope, common, commonConfig, countriesSvc, menuSvc, sharepointUtilities) {
		var vm = this;

		function generateWizardStepError(msg){
			var dfd = $q.defer();
			setTimeout(function(){
				dfd.reject(msg);
				common.logger.logError(msg);
			}, 1000);
			return dfd.promise;
		}

		vm.onSiteInfoCollected = function () {

			if(!vm.siteInfo.name || !vm.siteInfo.userTypedUrl){
				return generateWizardStepError('"Site Name" and "URL" are both required fields');
			}
			
			parseUserTypedUrl();

			if(!vm.childWebUrl){
				var error = '"' + vm.siteInfo.userTypedUrl + '" is not a valid URL for a new site.  The URL for the new site should ';
				error += '(1) should begin with a slash and (2) contain at least two characters';
				return generateWizardStepError(error);
			}
			
			
			return sharepointUtilities.createSite(vm.siteInfo);

			function parseUserTypedUrl(){
				var url = vm.siteInfo.userTypedUrl;
				if(url.endsWith('/')){
					url = url.substr(0, url.length-1)
				}
				
				if(url.length >= 2 && vm.siteInfo.userTypedUrl.startsWith('/')){
					var lastSlash = url.lastIndexOf('/') || 1;
					vm.siteInfo.parentWeb = url.substr(0, lastSlash);
					vm.siteInfo.acronym = url.substr(url.lastIndexOf('/')+1);
					vm.childWebUrl = vm.siteInfo.parentWeb + "/" + vm.siteInfo.acronym;
				}
			}
		}

		vm.onOrganizationsIdentified = function () {
			return createCoreLists()
				.then(provisionComponentCommandPage)
				.then(provisionTaskGroupPage)
				.then(setWelcomePage);
		}

		vm.onAdditionalFeaturesCollected = function () {
			var provisionFilesToSiteAssets = createFunctionToProvisionFiles(_spPageContextInfo.webServerRelativeUrl, 
				'generator/spaArtifacts/assets', 
				vm.childWebUrl, 
				'SiteAssets');

			var provisionFilesToSitePages = createFunctionToProvisionFiles(_spPageContextInfo.webServerRelativeUrl, 
				'generator/spaArtifacts/pages', 
				vm.childWebUrl, 
				'SitePages');

			return createHelpDeskSystem() 
				.then(createSoacApp)
				.then(createExconApp)
				.then(modifyChoiceFields)
				.then(createCommsApp)  
				.then(generateJocInBoxConfigFile)
				.then(generateMenuItems)
				.then(seedRouteConfigurationListWithItems)
				.then(provisionFilesToSiteAssets)
				.then(provisionFilesToSitePages);
		}

		vm.addComponentCommand = function () {
			vm.componentCommands.push({
				name: "",
				country: null,
				staffSections: wizard.defaults["Staff Sections for Component Command"].slice()  //by value copy for primitives only
			});
		}

		vm.removeComponentCommand = function (item) {
			var index = vm.componentCommands.indexOf(item);
			vm.componentCommands.splice(index, 1);
		}

		vm.addTaskGroup = function () {
			vm.taskGroups.push({
				name: "",
				country: null,
				type: null
			});
		}

		vm.removeTaskGroup = function (item) {
			var index = vm.taskGroups.indexOf(item);
			vm.taskGroups.splice(index, 1);
		}

		init();

		function createCoreLists() {
			return createAARList()
						.then(createCalendarList)
						.then(createCcirList)
						.then(createConfigList)
						.then(createMissionList)
						.then(createMessageTrafficList)
						.then(createPhonebookList)
						.then(createWatchLogList)
						.then(createDocumentChopsList)
						.then(createRFIList)
						.then(createRouteConfigurationList)
						.then(createMissionDocumentsLibrary);

			function createAARList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["AAR"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createCalendarList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Calendar"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createConfigList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Config"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createCcirList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["CCIR"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createDocumentChopsList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["DocumentChops"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			} 

			function createMissionList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Mission Tracker"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createMessageTrafficList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Message Traffic"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createMissionDocumentsLibrary() {
				//DEPENDENCIES: Mission Tracker
				var listSchemaDef = crisisResponseSchema.listDefs["Mission Documents"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createPhonebookList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Phonebook"];
				listSchemaDef.webUrl = vm.childWebUrl;
				_.find(crisisResponseSchema.listDefs["Phonebook"].fieldsToCreate, {Name: "Nation"}).Choices = _.map(vm.countries, 'name');
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createRFIList() {
				//DEPENDENCIES: Mission Tracker
				var listSchemaDef = crisisResponseSchema.listDefs["RFI"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createRouteConfigurationList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Route Configuration"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createWatchLogList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Watch Log"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
		}

		function createHelpDeskSystem(){
			if(!vm.optionalFeatures["Help Desk Ticketing System"]){
				//SKIP this step
				return $q.when({});
			}
			var listSchemaDef = crisisResponseSchema.listDefs["Help Desk"];
			listSchemaDef.webUrl = vm.childWebUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}

		function createCommsApp(){
			if(!vm.optionalFeatures["Communications Component"]){
				//SKIP this step
				return $q.when({});
			}

			var listSchemaDef = crisisResponseSchema.listDefs["Communications Status"];
			listSchemaDef.webUrl = vm.childWebUrl;

			return sharepointUtilities.createList(listSchemaDef).then(provisionCommunicationsComponentPage);
		}

		function createSoacApp(){
			if(!vm.optionalFeatures["Air Component"]){
				//SKIP this step
				return $q.when({});
			}

			//no extra lists required at this time
			return provisionAirComponentPage();
		}

		function createExconApp(){
			if(!vm.optionalFeatures["Exercise Control Group"]){
				//SKIP this step
				return $q.when({});
			}

			function createDocumentLibrary(){
				var listSchemaDef = crisisResponseSchema.listDefs["EXCON Documents"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createInjectList(){
				var listSchemaDef = crisisResponseSchema.listDefs["Inject"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createWatchLogList(){
				var listSchemaDef = crisisResponseSchema.listDefs["EXCON Watch Log"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function provisionExconPage() {
				return provisionWebPartPage({
					webpartPageDefinitionName: 'Exercise Conductor Page'
				});
			}

			function customizePermissions(){
				var opts = {
					webUrl: vm.childWebUrl,
                	groupName: vm.siteInfo.name + " EXCON",
                	groupDescription: "Created by wizard to support site: " + vm.childWebUrl,
					permissionLevel: SP.RoleType.contributor,
					loginNames: _.map(vm.exerciseControlGroups[0].selectedUsers, function(user){ return user.LoginName; }),
					resources: [
						{
							type: "SP.List",
							listName: "EXCON Watch Log"
						},
						{
							type: "SP.List",
							listName: "Inject"
						},
						{
							type: "SP.List",
							listName: "EXCON Documents"
						},
						{
							type: "SP.File",
							serverRelativeUrl: vm.childWebUrl + "/SitePages/excon.aspx"
						}
					]
				};

				return sharepointUtilities.createSharepointGroup(opts);
			}

			return createWatchLogList()
						.then(createDocumentLibrary)
						.then(createInjectList)
						.then(provisionExconPage)
						.then(customizePermissions);
		}

		function resolveCountry(flagCode){
			if(!flagCode){
				return vm.countries[getRandom(vm.countries.length)];
			}
			return _.find(vm.countries, { code: flagCode });

			function getRandom(max) {
				return Math.floor(Math.random() * max);
			}
		}

		function generateDefaults() {
			
			vm.typeaheadDataSourceForSelectableUsers = sharepointUtilities.createTypeaheadDataSourceForSiteUsersList();
			vm.childWebUrl = "";
			vm.serverLocation = document.location.protocol + '//' + document.location.host;
			vm.siteInfo = {
				cdn: commonConfig.settings.cdn,
				name: wizard.defaults["Site Name"],
				description: wizard.defaults["Description"],
				userTypedUrl: wizard.defaults["URL"]
			};		

			vm.optionalFeatures = {
				"Air Component": wizard.defaults["Optional Features"]["Air Component"],
				"Communications Component": wizard.defaults["Optional Features"]["Communications Tracker"],
				"Exercise Control Group": wizard.defaults["Optional Features"]["Exercise Control Group"],
				"Help Desk Ticketing System": wizard.defaults["Optional Features"]["Help Desk Ticketing System"]
			};

			vm.componentCommands = _.map(wizard.defaults["Component Commands"], function(cmd){
				return { 
					name: cmd.name, 
					country: resolveCountry(cmd.flagCode), 
					staffSections: wizard.defaults["Staff Sections for Component Command"].slice() /* by value copy for primitives only */ 
				};
			});

			vm.taskGroups = _.map(wizard.defaults["Task Groups"], function(tg){
				return { 
					name: tg.name, 
					country: resolveCountry(tg.flagCode), 
					type: "Land"
				};
			});

			vm.airComponents = [
				{
					name: wizard.defaults["Air Component"].name,
					country: resolveCountry(wizard.defaults["Air Component"].flagCode),
					staffSections: wizard.defaults["Staff Sections for Air Component"].slice() /* by value copy for primitives only */
				}
			];

			vm.communicationsComponents = [
				{ name: wizard.defaults["Communications Tracker"].name }
			];

			vm.exerciseControlGroups = [
				{ 
					name: wizard.defaults["Exercise Control Group"].name, 
					notionals: wizard.defaults["Exercise Control Group"].notionals, 
					selectedUsers: [] 
				}
			];	
		}

		function init() {
			countriesSvc.getAll().then(function (data) {
				vm.countries = data;
				generateDefaults();
			});
		}

		function generateChoiceOptionsForStaffSection(prefix, sections) {
			return _.map(sections, function (section) {
				return prefix + " - " + section;
			});
		}

		function createFunctionToProvisionFiles(sourceWeb, sourceFolder, destinationWeb, destinationFolder){
			return function(){
				return getFilesFromFolder()
					.then(copyFilesToFolder);


				function getFilesFromFolder() {
					return sharepointUtilities.getFilesFromFolder({
						webUrl: sourceWeb,
						folderServerRelativeUrl: sourceWeb + '/' + sourceFolder
					});
				}

				function copyFilesToFolder(files) {
					var promises = [];
					_.each(files, function (file) {
						promises.push(sharepointUtilities.copyFile({
							sourceWebUrl: sourceWeb,
							sourceFileUrl: sourceFolder + '/' + file.name,
							destinationWebUrl: destinationWeb,
							destinationWebFolderUrl: destinationFolder,
							destinationFileUrl: file.name
						}));
					})
					return $q.all(promises);
				}
			}
		}

		function provisionAirComponentPage() {
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Air Component Page'
			});
		}

		function provisionCommunicationsComponentPage() {
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Communications Component Page'
			});
		}

		function provisionComponentCommandPage() {
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Component Command Page'
			});
		}

		function provisionTaskGroupPage() {
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Task Group Page'
			});
		}

		function provisionWebPartPage(opts) {
			var pageDef = crisisResponseSchema.webpartPageDefs[opts.webpartPageDefinitionName];
			pageDef.webUrl = vm.childWebUrl;
			return provisionAspx(pageDef).then(provisionWebpartsOnAspx);

			function provisionAspx(pageDef) {
				return sharepointUtilities.copyFile({
					sourceWebUrl: _spPageContextInfo.webServerRelativeUrl,
					sourceFileUrl: 'generator/spaArtifacts/fourWebpartZones.aspx',
					destinationWebUrl: vm.childWebUrl,
					destinationWebFolderUrl: pageDef.folderName,
					destinationFileUrl: pageDef.aspxFileName
				})
					.then(function () {
						return pageDef;
					});
			}

			function provisionWebpartsOnAspx(pageDef) {
				return $q.all([
					sharepointUtilities.provisionListViewWebparts(pageDef),
					sharepointUtilities.provisionScriptEditorWebparts(pageDef)
				])
					.then(function () {
						console.log("all web parts added on " + pageDef.aspxFileName);
					});
			}
		}

		function modifyChoiceFields() {
			var choiceFieldUpdates = _.chain(crisisResponseSchema.organizationalChoiceFields)
				.groupBy('listName')
				.map(function (defs, listName) {
					return {
						webUrl: vm.childWebUrl,
						listName: listName,
						fieldsToUpdate: _.map(defs, function (def) {
							return {
								fieldName: def.fieldName,
								options: buildArrayOfChoices(def, vm.componentCommands, vm.taskGroups, vm.airComponents, vm.communicationsComponents, vm.exerciseControlGroups)
							};
						})
					};
				})
				.value();

			return sharepointUtilities.updateChoiceFields(choiceFieldUpdates);

			function buildArrayOfChoices(fieldGenDef, componentCommands, taskGroups, airComponents, communicationsComponents, exerciseControlGroups) {
				var choices = [];
				if (fieldGenDef.generationFlags.includeComponentCommands) {
					_.each(componentCommands, function (org) {
						choices.push(org.name);

						if (fieldGenDef.generationFlags.includeStaffSections) {
							choices = choices.concat(generateChoiceOptionsForStaffSection(org.name, org.staffSections));
						}
					});
				}

				if (fieldGenDef.generationFlags.includeTaskGroups) {
					_.each(taskGroups, function (org) {
						choices.push(org.name);
					});
				}

				if (vm.optionalFeatures["Air Component"] && fieldGenDef.generationFlags.includeAirComponent) {
					_.each(airComponents, function (org) {
						choices.push(org.name);

						if (fieldGenDef.generationFlags.includeStaffSections) {
							choices = choices.concat(generateChoiceOptionsForStaffSection(org.name, org.staffSections));
						}
					});
				}

				if (vm.optionalFeatures["Communications Component"] && fieldGenDef.generationFlags.includeCommunicationsComponent) {
					_.each(communicationsComponents, function (org) {
						choices.push(org.name);
					});
				}

				if (vm.optionalFeatures["Exercise Control Group"] && fieldGenDef.generationFlags.includeExerciseControlGroup) {
					_.each(exerciseControlGroups, function (org) {
						choices.push(org.name);

						if (fieldGenDef.generationFlags.includeNotionals) {
							_.each(org.notionals, function (notional) {
								choices.push(notional);
							});
						}
					});
				}

				return _.sortBy(choices);


			}
		}

		function seedRouteConfigurationListWithItems(){
			var opts = {
				webUrl: vm.childWebUrl,
				listName: 'Route Configuration',
				itemsToCreate: []
			};

			var firstComponentCommand = _.first(vm.componentCommands);
			createItemsForOrg(firstComponentCommand.name, firstComponentCommand.name);

			var subsequentComponentCommands = vm.componentCommands.slice(1);
			_.each(subsequentComponentCommands, function(org){
				createItemsForOrg(org.name, org.name + ";" +firstComponentCommand.name);
			});

			_.each(vm.taskGroups, function(org){
				createItemsForOrg(org.name, org.name + ";" +firstComponentCommand.name);
			});

			return sharepointUtilities.seedWithListItems(opts);

			function createItemsForOrg(orgName, routeSequence){
				var levels = ['LVL-0', 'LVL-1', 'LVL-2', 'LVL-3'];
				_.each(levels, function(level){
					opts.itemsToCreate.push({
						Organization: orgName,
						Level: level,
						ApprovalChain: (level === 'LVL-0') ? orgName : routeSequence
					});
				});
			}
		}

		function setWelcomePage(){
			return sharepointUtilities.setWelcomePage(vm.childWebUrl, 'SitePages/socc.aspx?org='+ vm.componentCommands[0].name);
		}

		function generateJocInBoxConfigFile() {
			var dashboards = {};
			_.each(vm.componentCommands, function (org) {
				dashboards[org.name] = {
					orgType: 'Component Command',
					optionsForChoiceField: [org.name].concat(generateChoiceOptionsForStaffSection(org.name, org.staffSections)),
					flagCode: org.country.flag
				};
			});

			_.each(vm.taskGroups, function (org) {
				dashboards[org.name] = {
					orgType: 'Task Group',
					optionsForChoiceField: [org.name],
					flagCode: org.country.flag,
					type: org.type
				};
			});

			_.each(vm.communicationsComponents, function (org) {
				dashboards[org.name] = {
					orgType: 'Communications',
					optionsForChoiceField: [org.name]
				};
			});

			_.each(vm.airComponents, function (org) {
				dashboards[org.name] = {
					orgType: 'Air Component',
					optionsForChoiceField: [org.name].concat(generateChoiceOptionsForStaffSection(org.name, org.staffSections)),
					flagCode: org.country.flag
				};
			});

			_.each(vm.exerciseControlGroups, function (org) {
				dashboards[org.name] = {
					orgType: 'Exercise Control Group',
					optionsForChoiceField: [org.name].concat(org.notionals.slice())
				};
			});

			_.each(dashboards, function (config, orgName) {
				dashboards[orgName].routes = [];
			});

			var templateDirectoryStatement = (commonConfig.settings.type === "DEV") ? 
				'jocInBoxConfig.htmlTemplatesLocation = "http://localhost:3000/spaArtifacts/assets";' :
				'jocInBoxConfig.htmlTemplatesLocation = "' + vm.childWebUrl + '/SiteAssets";';

			var content = [
				'var jocInBoxConfig = jocInBoxConfig || {};',
				'jocInBoxConfig.noConflicts = { jQuery: $.noConflict(), lodash: _.noConflict() };',
				'jocInBoxConfig.webUrl = "' + vm.childWebUrl + '";',
				templateDirectoryStatement,
				'jocInBoxConfig.dashboards = ' + JSON.stringify(dashboards) + ";",
				'jocInBoxConfig.missionTypes = ' + JSON.stringify(crisisResponseSchema.missionTypesMappedToDefaultApprovalAuthority) + ";"
			].join('\n\n');

			return sharepointUtilities.createOrUpdateFile({
				destinationWebUrl: _spPageContextInfo.webServerRelativeUrl,
				destinationWebFolderUrl: 'generator/spaArtifacts/assets',
				destinationFileUrl: 'jocInBoxConfig.js',
				fileContent: content
			});

		}

		function generateMenuItems() {
			var menuItems = [];
			menuItems.push(menuSvc.generateBaseMenuNode(vm.siteInfo.name))

			_.each(vm.componentCommands, function (org) {
				var dashboardUrl = vm.childWebUrl + "/SitePages/socc.aspx?org=" + org.name;
				menuItems.push(menuSvc.generateChildMenuNode(org.name, org.name, "rootNode", {url: dashboardUrl}));
			});

			if(vm.optionalFeatures["Air Component"]){
				_.each(vm.airComponents, function (org) {
					var dashboardUrl = vm.childWebUrl + "/SitePages/soac.aspx?org=" + org.name;
					menuItems.push(menuSvc.generateChildMenuNode(org.name, org.name, "rootNode", {url: dashboardUrl}));
				});
			}

			_.each(vm.taskGroups, function (org) {
				var dashboardUrl = vm.childWebUrl + "/SitePages/sotg.aspx?org=" + org.name;
				menuItems.push(menuSvc.generateChildMenuNode(org.name, org.name, "rootNode", {url: dashboardUrl}));
			});			

			if(vm.optionalFeatures["Exercise Control Group"]){
				_.each(vm.exerciseControlGroups, function (org) {
					var dashboardUrl = vm.childWebUrl + "/SitePages/excon.aspx?org=" + org.name;
					menuItems.push(menuSvc.generateChildMenuNode(org.name, org.name, "rootNode", {url: dashboardUrl}));
				});
			}
			
			var battlespaceNodes = menuSvc.generateBattleSpaceNodes(vm.childWebUrl, vm.optionalFeatures, vm.componentCommands, vm.airComponents, vm.communicationsComponents);
			menuItems = menuItems.concat(battlespaceNodes);

			var infoSupportNodes = menuSvc.generateInformationSupportNodes(vm.childWebUrl, vm.optionalFeatures);
			menuItems = menuItems.concat(infoSupportNodes);

			var recyclebinURL = vm.childWebUrl + "/_layouts/15/RecycleBin.aspx";
			menuItems.push(menuSvc.generateChildMenuNode("recyclebin", "Recycle Bin", "rootNode", {url: recyclebinURL}));

			return sharepointUtilities.createListItem({
				webUrl: vm.childWebUrl,
				listName: 'Config',
				props: [
					{
						fieldName: "Title",
						fieldValue: "MENU_CONFIG",
						type: "Text"
					},
					{
						fieldName: "JSON",
						fieldValue: JSON.stringify(menuItems),
						type: "Text"
					}
				]
			});
		}
	}

	function menuSvc($q) {
		return {
			generateBaseMenuNode: generateBaseMenuNode,
			generateBattleSpaceNodes: generateBattleSpaceNodes,
			generateChildMenuNode: generateChildMenuNode,
			generateInformationSupportNodes: generateInformationSupportNodes
		};

		function generateBaseMenuNode(siteName){
			return {
				id: "rootNode",
				parent: "#",
				text: siteName + " Navigation",
				li_attr:{ id: "rootNode" },
				state: {
					opened: true,
					selected: true
				}
			}
		}

		function generateChildMenuNode(id, text, parent, attrs){
			var defaultAttrs = {
				id: id, 
				visibility: "Anonymous", 
				target: "_self" 
			};
			var settings = angular.extend({}, defaultAttrs, attrs || {});
			return {
				id: id,
				parent: parent,
				text: text,
				li_attr: settings
			}
		}

		function generateRandomId(){
			return Math.random().toString().split('.')[1];
		}

		function generateBattleSpaceNodes(childWebUrl, selectedOptions, componentCommands, airComponents, communicationsComponents){	
			var nodes = [];
			var nodeId_battlespace = generateRandomId();
			
			//battlespace root
			nodes.push(generateChildMenuNode(nodeId_battlespace, "Battlespace Applications", "rootNode", {}));

			//AAR
			var aarUrl = childWebUrl + "/Lists/AAR";
			nodes.push(generateChildMenuNode(generateRandomId(), "AAR", nodeId_battlespace, {url: aarUrl}));

			//comms
			if(selectedOptions["Communications Component"]){
				var commsUrl = childWebUrl + "/SitePages/comms.aspx?org=" + communicationsComponents[0].name;
				nodes.push(generateChildMenuNode(generateRandomId(), "Communications Tracker", nodeId_battlespace, {url: commsUrl}));
			}

			//ops summaries for component commands and air component
			var nodeId_currentOpsSummary = generateRandomId();
			var currentOpsSummaryBaseUrl = childWebUrl + "/SitePages/projectionScrollable.aspx/#/currentops";
			nodes.push(generateChildMenuNode(nodeId_currentOpsSummary, "Current Operations Summary", nodeId_battlespace, {url: currentOpsSummaryBaseUrl, target: "_blank"}));		
			_.each(componentCommands, function (org) {
				var url = currentOpsSummaryBaseUrl + "?org=" + org.name;
				nodes.push(generateChildMenuNode(generateRandomId(), org.name, nodeId_currentOpsSummary, {url: url, target: "_blank"}));
			});
			if(selectedOptions["Air Component"]){
				var currentOpsSummaryAirName = airComponents[0].name;
				var currentOpsSummaryAirUrl = currentOpsSummaryBaseUrl + "?org=" + currentOpsSummaryAirName;
				nodes.push(generateChildMenuNode(generateRandomId(), currentOpsSummaryAirName, nodeId_currentOpsSummary, {url: currentOpsSummaryAirUrl}));
			}

			//missiontracker
			var missionTrackerUrl = childWebUrl + "/SitePages/app.aspx/#/missiontracker/";
			nodes.push(generateChildMenuNode(generateRandomId(), "Mission Tracker/Product Chop", nodeId_battlespace, {url: missionTrackerUrl}));

			//RFI
			var rfiUrl = childWebUrl + "/SitePages/app.aspx/#/rfi/";
			nodes.push(generateChildMenuNode(generateRandomId(), "RFI", nodeId_battlespace, {url: rfiUrl}));

			//SITREP
			var sitrepUrl = childWebUrl + "/MissionDocuments/Forms/SITREP.aspx";
			nodes.push(generateChildMenuNode(generateRandomId(), "SITREP", nodeId_battlespace, {url: sitrepUrl}));

			//INTEL
			var intelUrl = childWebUrl + "/MissionDocuments/Forms/INTEL.aspx";
			nodes.push(generateChildMenuNode(generateRandomId(), "INTEL", nodeId_battlespace, {url: intelUrl}));


			return nodes;
		}

		function generateInformationSupportNodes(childWebUrl, selectedOptions){	
			var nodes = [];
			var nodeId_infoSupport = generateRandomId();
			
			//info support
			nodes.push(generateChildMenuNode(nodeId_infoSupport, "Information & Support", "rootNode", {}));

			//calendar
			var nodeId_calendar = generateRandomId();
			var calendarBaseUrl = childWebUrl + "/Lists/Calendar";
			nodes.push(generateChildMenuNode(nodeId_calendar, "Calendar", nodeId_infoSupport, {}));		
			nodes.push(generateChildMenuNode(generateRandomId(), "Academics", nodeId_calendar, {url: calendarBaseUrl+"/Academics.aspx" }));
			nodes.push(generateChildMenuNode(generateRandomId(), "VTC", nodeId_calendar, {url: calendarBaseUrl+"/VTC.aspx" }));

			//helpdesk
			if(selectedOptions["Help Desk Ticketing System"]){
				var helpUrl = childWebUrl + "/SitePages/app.aspx/#/helpdesk/"
				nodes.push(generateChildMenuNode(generateRandomId(), "Help Desk", nodeId_infoSupport, {url: helpUrl}));
			}

			//phonebook
			var phoneBookUrl = childWebUrl + "/Lists/Phonebook"
			nodes.push(generateChildMenuNode(generateRandomId(), "Phonebook", nodeId_infoSupport, {url: phoneBookUrl }));

			//templates
			var templatesUrl = childWebUrl + "/MissionDocuments/Forms/Template.aspx";
			nodes.push(generateChildMenuNode(generateRandomId(), "Templates", nodeId_infoSupport, {url: templatesUrl}));

			return nodes;
		}
	}

	function countriesSvc($q) {
		return {
			getAll: getAll
		}

		function getAll() {
			return $q.when(wizard.countriesDataSource);
		}
	}

	function capitalizeAllDirective($parse) {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, modelCtrl) {
				var capitalize = function(inputValue) {
					if (inputValue === undefined) { inputValue = ''; }
					var capitalized = inputValue.toUpperCase();
					if(capitalized !== inputValue) {
						modelCtrl.$setViewValue(capitalized);
						modelCtrl.$render();
					}         
					return capitalized;
				}
				modelCtrl.$parsers.push(capitalize);
				capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
			}
		};
	}

	function capitalizeFirstDirective($parse) {
		return {
			require: 'ngModel',
			link: function(scope, element, attrs, modelCtrl) {
				var capitalize = function(inputValue) {
					if (inputValue === undefined) { inputValue = ''; }
					var capitalized = inputValue.charAt(0).toUpperCase() + inputValue.substring(1);
					if(capitalized !== inputValue) {
						modelCtrl.$setViewValue(capitalized);
						modelCtrl.$render();
					}         
					return capitalized;
				}
				modelCtrl.$parsers.push(capitalize);
				capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
			}
		};
	}

})();


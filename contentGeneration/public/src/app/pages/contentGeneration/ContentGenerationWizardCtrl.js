(function () {
	'use strict';

	angular.module('BlurAdmin.pages.contentGeneration')
		.controller('ContentGenerationWizardCtrl', WizardCtrl);

	/** @ngInject */
	function WizardCtrl($q, common, commonConfig, sharepointUtilities) {
		var vm = this;
		vm.childWebUrl = "";
		vm.serverLocation = document.location.protocol + '//' + document.location.host;
		vm.siteInfo = {
			cdn: commonConfig.settings.baseUrl + '/spa',
			//cdn: '~site/SitePages',
			name: "Trojan Footprint 16",
			acronym: 'TF16',
			parentWeb: _spPageContextInfo.webServerRelativeUrl,
			description: "This is boilerplate text so I can just click Next, Next, Next..."
		};

		vm.onSiteInfoCollected = function(){
			vm.childWebUrl = vm.siteInfo.parentWeb + "/" + vm.siteInfo.acronym;
			return sharepointUtilities.createSite(vm.siteInfo);
		}

		vm.onOrganizationsIdentified = function(){
			return createCoreLists()
				.then(provisionComponentCommandPage)
				.then(provisionTaskGroupPage);
		}

		vm.deleteLists = function () {
			sharepointUtilities.deleteLists({
				webUrl: vm.childWebUrl,
				listTitles: ['Calendar', 'CCIR', "Mission Documents", 'Mission Tracker', 'Message Traffic', 'RFI', 'Watch Log']
			});

			var serverRelativeFileUrls = _.map(['socc.aspx', 'sotg.aspx'], function (sitepageFile) {
				return vm.childWebUrl + "/SitePages/" + sitepageFile;
			})

			sharepointUtilities.deleteFiles({
				webUrl: vm.childWebUrl,
				fileUrls: serverRelativeFileUrls
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
					sourceFileUrl: 'generator/artifacts/fourWebpartZones.aspx',
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

		function createCoreLists() {
			return createStandaloneLists().then(createChildLists);

			function createStandaloneLists() {
				return $q.all([
					createCalendarList(),
					createCcirList(),
					createMissionList(),
					createMessageTrafficList(),
					createWatchLogList()
				]);
			}

			function createChildLists() {
				return $q.all([
					createRFIList(),
					createMissionDocumentsLibrary(),
				]);
			}

			function createCalendarList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Calendar"];
				listSchemaDef.webUrl = vm.childWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createCcirList() {
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["CCIR"];
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

			function createRFIList() {
				//DEPENDENCIES: Mission Tracker
				var listSchemaDef = crisisResponseSchema.listDefs["RFI"];
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

	}

})();


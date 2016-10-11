(function () {
	'use strict';

	angular.module('BlurAdmin.pages.contentGeneration')
		.controller('ContentGenerationWizardCtrl', WizardCtrl)
		.factory('countriesSvc', countriesSvc);

	/** @ngInject */
	function WizardCtrl($q, common, commonConfig, countriesSvc, sharepointUtilities) {
		var vm = this;

		var defaults = {
			staffSectionsForCombatantCommand: ["J1", "J2", "J33", "J35", "J39", "J4", "J6", "Legal", "Medical", "Public Affairs"],
			staffSectionsForAirComponent: ["A1", "A2", "A3 Director of Operations", "A33 Current Operations", "A35 Plans", "A4", "A5", "A6", "A7", "Airspace", "Command Group", "FAD", "FIRES", "PRCC", "Special Staff"]
		};

		vm.childWebUrl = "";
		vm.serverLocation = document.location.protocol + '//' + document.location.host;
		vm.siteInfo = {
			cdn: commonConfig.settings.baseUrl + '/spaArtifacts/assets',
			//cdn: '~site/SitePages',
			name: "Trojan Footprint 16",
			acronym: 'TF16',
			parentWeb: _spPageContextInfo.webServerRelativeUrl,
			description: "This is boilerplate text so I can just click Next, Next, Next..."
		};

		vm.optionalFeatures = {
			"Air Component": true,
			"Communications Component": true,
			"Exercise Control Group": true,
			"Help Desk Ticketing System": true
		}

		/* BEGIN TEMP STUFF for reference*/
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
		/* END TEMP STUFF for reference */

		vm.typeaheadDataSourceForSelectableUsers = sharepointUtilities.createTypeaheadDataSourceForSiteUsersList();

		vm.onSiteInfoCollected = function () {
			vm.childWebUrl = vm.siteInfo.parentWeb + "/" + vm.siteInfo.acronym;
			return sharepointUtilities.createSite(vm.siteInfo).then(provisionAssetsToSitePagesLibrary);
		}

		vm.onOrganizationsIdentified = function () {
			return createCoreLists()
				.then(provisionComponentCommandPage)
				.then(provisionTaskGroupPage);
		}

		vm.onAdditionalFeaturesCollected = function(){
			return modifyChoiceFields();
		}

		vm.addComponentCommand = function () {
			vm.componentCommands.push({
				name: "",
				country: null,
				staffSections: defaults.staffSectionsForCombatantCommand.slice()  //by value copy for primitives only
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

		function generateDefaults() {
			vm.componentCommands = [
				{ name: "SOCC", country: _.find(vm.countries, { code: "US" }), staffSections: defaults.staffSectionsForCombatantCommand.slice() /* by value copy for primitives only */  }
			];

			vm.taskGroups = [
				{ name: "SOTG 10", country: vm.countries[getRandom(vm.countries.length)], type: "Land" },
				{ name: "SOMTG 20", country: vm.countries[getRandom(vm.countries.length)], type: "Maritime" },
				{ name: "SOLTG 30", country: vm.countries[getRandom(vm.countries.length)], type: "Land" }
			];

			vm.airComponents = [
				{ name: "SOAC", country: _.find(vm.countries, { code: "US" }), staffSections: defaults.staffSectionsForAirComponent.slice() /* by value copy for primitives only */ }
			];

			vm.communicationsComponents = [
				{ name: "SIGCEN" }
			];

			vm.exerciseControlGroups = [
				{ name: "EUCOM", notionals: ['EMBASSY', 'JFC Brunssum'], selectedUsers: [] }
			];

			function getRandom(max) {
				return Math.floor(Math.random() * max);
			}
		}

		function init() {
			countriesSvc.getAll().then(function (data) {
				vm.countries = data;
				generateDefaults();
			});
		}

		function provisionAssetsToSitePagesLibrary() {
			return getAssetsFromArtifactsFolder()
				.then(copyToSitePagesInChildWeb);


			function getAssetsFromArtifactsFolder() {
				return sharepointUtilities.getFilesFromFolder({
					webUrl: _spPageContextInfo.webServerRelativeUrl,
					folderServerRelativeUrl: _spPageContextInfo.webServerRelativeUrl + '/generator/spaArtifacts/assets'
				});
			}

			function copyToSitePagesInChildWeb(files) {
				var promises = [];
				_.each(files, function (file) {
					promises.push(sharepointUtilities.copyFile({
						sourceWebUrl: _spPageContextInfo.webServerRelativeUrl,
						sourceFileUrl: 'generator/spaArtifacts/assets/' + file.name,
						destinationWebUrl: vm.childWebUrl,
						destinationWebFolderUrl: 'SitePages',
						destinationFileUrl: file.name
					}));
				})
				return $q.all(promises);
			}
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
				.map(function(defs, listName){
					return {
						webUrl: vm.childWebUrl || '/ngspa/tf16',
						listName: listName,
						fieldsToUpdate: _.map(defs, function(def){
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

				if (fieldGenDef.generationFlags.includeAirComponent) {
					_.each(airComponents, function (org) {
						choices.push(org.name);

						if (fieldGenDef.generationFlags.includeStaffSections) {
							choices = choices.concat(generateChoiceOptionsForStaffSection(org.name, org.staffSections));
						}
					});
				}

				if (fieldGenDef.generationFlags.includeCommunicationsComponent) {
					_.each(communicationsComponents, function (org) {
						choices.push(org.name);
					});
				}

				if (fieldGenDef.generationFlags.includeExerciseControlGroup) {
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

				function generateChoiceOptionsForStaffSection(prefix, sections) {
					return _.map(sections, function (section) {
						return prefix + " - " + section;
					});
				}
			}
		}
	}

	function countriesSvc($q) {
		return {
			getAll: getAll
		}

		function getAll() {
			return $q.when([
				{ code: "NATO", flag: "_NATO", name: "NATO" },
				{ code: "US", flag: "us", name: "USA" },
				{ code: "AL", flag: "al", name: "Albania" },
				{ code: "AD", flag: "ad", name: "Andorra" },
				{ code: "AM", flag: "am", name: "Armenia" },
				{ code: "AT", flag: "at", name: "Austria" },
				{ code: "AZ", flag: "az", name: "Azerbaijan" },
				{ code: "BY", flag: "by", name: "Belarus" },
				{ code: "BE", flag: "be", name: "Belgium" },
				{ code: "BA", flag: "ba", name: "Bosnia and Herzegovina" },
				{ code: "BG", flag: "bg", name: "Bulgaria" },
				{ code: "HR", flag: "hr", name: "Croatia" },
				{ code: "CY", flag: "cy", name: "Cyprus" },
				{ code: "CZ", flag: "cz", name: "Czech Republic" },
				{ code: "DK", flag: "dk", name: "Denmark" },
				{ code: "EE", flag: "ee", name: "Estonia" },
				{ code: "FI", flag: "fi", name: "Finland" },
				{ code: "FR", flag: "fr", name: "France" },
				{ code: "GE", flag: "ge", name: "Georgia" },
				{ code: "DE", flag: "de", name: "Germany" },
				{ code: "GR", flag: "gr", name: "Greece" },
				{ code: "VA", flag: "va", name: "Holy See (Vatican City)" },
				{ code: "HU", flag: "hu", name: "Hungary" },
				{ code: "IS", flag: "is", name: "Iceland" },
				{ code: "IE", flag: "ie", name: "Ireland" },
				{ code: "IL", flag: "il", name: "Israel" },
				{ code: "IT", flag: "it", name: "Italy" },
				{ code: "XK", flag: "_Kosovo", name: "Kosovo" },
				{ code: "LV", flag: "lv", name: "Latvia" },
				{ code: "LI", flag: "li", name: "Liechtenstein" },
				{ code: "LT", flag: "lt", name: "Lithuania" },
				{ code: "LU", flag: "lu", name: "Luxembourg" },
				{ code: "MT", flag: "mt", name: "Malta" },
				{ code: "MD", flag: "md", name: "Moldova" },
				{ code: "MC", flag: "mc", name: "Monaco" },
				{ code: "ME", flag: "me", name: "Montenegro" },
				{ code: "NL", flag: "nl", name: "Netherlands" },
				{ code: "NO", flag: "no", name: "Norway" },
				{ code: "PL", flag: "pl", name: "Poland" },
				{ code: "PT", flag: "pt", name: "Portugal" },
				{ code: "MK", flag: "mk", name: "Republic of Macedonia" },
				{ code: "RO", flag: "ro", name: "Romania" },
				{ code: "RU", flag: "ru", name: "Russia" },
				{ code: "SM", flag: "sm", name: "San Marino" },
				{ code: "RS", flag: "rs", name: "Serbia" },
				{ code: "SK", flag: "sk", name: "Slovakia" },
				{ code: "SI", flag: "si", name: "Slovenia" },
				{ code: "ES", flag: "es", name: "Spain" },
				{ code: "SE", flag: "se", name: "Sweden" },
				{ code: "CH", flag: "ch", name: "Switzerland" },
				{ code: "TR", flag: "tr", name: "Turkey" },
				{ code: "UA", flag: "ua", name: "Ukraine" },
				{ code: "GB", flag: "gb", name: "United Kingdom" }
			]);
		}
	}
})();


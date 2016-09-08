/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
	'use strict';

  	angular.module('BlurAdmin.pages.contentGeneration')
    	.controller('CreateListsWizardCtrl', CtrlDefinition);

  	/** @ngInject */
	function CtrlDefinition($q, $scope, common, sharepointUtilities) {
		$scope.selectedWebUrl = '/ngspa/instance';
	  	
	  	/*		
		sharepointUtilities.getLists('/ngspa/')
			.then(function(data){
				console.log(data);
			})
			.catch(function(){
			});
		*/
			
		//Pump Script Editor Webpart into NewForm.aspx and EditForm.aspx <WebPartPages:WebPartZone runat="server" FrameType="None" ID="Main" Title="loc:Main"><ZoneTemplate>
		//CAN we bootstrap ng-app from top of the page? (don't want to add two script editors to each page, i.e. one under the ListFormWebPart and one above it)

		$scope.onStepOneClicked = function(){
			createCoreLists()
				.then(provisionComponentCommandPage)
				.then(provisionTaskGroupPage);
		}

		$scope.onStepOneUndoClicked = function(){
			sharepointUtilities.deleteLists({
				webUrl: $scope.selectedWebUrl,
				listTitles: ['Calendar', 'CCIR', "Mission Documents", 'Mission Tracker', 'Message Traffic', 'RFI', 'Watch Log']
			});

			var serverRelativeFileUrls = _.map(['socc.aspx', 'sotg.aspx'], function(sitepageFile){
				return $scope.selectedWebUrl + "/SitePages/" + sitepageFile;
			})

			sharepointUtilities.deleteFiles({
				webUrl: $scope.selectedWebUrl,
				fileUrls: serverRelativeFileUrls
			});
		
		}

		function provisionComponentCommandPage(){
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Component Command Page'
			});
		}

		function provisionTaskGroupPage(){
			return provisionWebPartPage({
				webpartPageDefinitionName: 'Task Group Page'
			});
		}

		function provisionWebPartPage(opts){
			var pageDef = crisisResponseSchema.webpartPageDefs[opts.webpartPageDefinitionName];
			pageDef.webUrl = $scope.selectedWebUrl;
			return provisionAspx(pageDef).then(provisionWebpartsOnAspx);

			function provisionAspx(pageDef){
				return sharepointUtilities.copyFile({
					sourceWebUrl: _spPageContextInfo.webServerRelativeUrl,
					sourceFileUrl:'generator/artifacts/fourWebpartZones.aspx',
					destinationWebUrl: $scope.selectedWebUrl,
					destinationWebFolderUrl: pageDef.folderName,
					destinationFileUrl: pageDef.aspxFileName
				})
				.then(function(){
					return pageDef;
				});
			}

			function provisionWebpartsOnAspx(pageDef){
				return $q.all([
					sharepointUtilities.provisionListViewWebparts(pageDef),
					sharepointUtilities.provisionScriptEditorWebparts(pageDef)
				])
				.then(function(){
					console.log("all web parts added on " + pageDef.aspxFileName);
				});
			}
		}
		
		function createCoreLists(){
			return createStandaloneLists().then(createChildLists);

			function createStandaloneLists(){
				return $q.all([
					createCalendarList(),
					createCcirList(),
					createMissionList(),
					createMessageTrafficList(),
					createWatchLogList()
				]);
			}

			function createChildLists(){
				return $q.all([
					createRFIList(),
					createMissionDocumentsLibrary(),
				]);
			}

			function createCalendarList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Calendar"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}

			function createCcirList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["CCIR"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
			
			function createMissionList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Mission Tracker"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
			
			function createMessageTrafficList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Message Traffic"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
			
			function createMissionDocumentsLibrary(){
				//DEPENDENCIES: Mission Tracker
				var listSchemaDef = crisisResponseSchema.listDefs["Mission Documents"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
			
			function createRFIList(){
				//DEPENDENCIES: Mission Tracker
				var listSchemaDef = crisisResponseSchema.listDefs["RFI"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
			
			function createWatchLogList(){
				//DEPENDENCIES: None
				var listSchemaDef = crisisResponseSchema.listDefs["Watch Log"];
				listSchemaDef.webUrl = $scope.selectedWebUrl;
				return sharepointUtilities.createList(listSchemaDef);
			}
		}
		
		


  	}
  	
  	
})();



var lists = [];




/*

RECIPE: generation

Create Lists
- Add Fields
- Create Views

Copy .ASPX to SitePages doclib
- Add Webparts to various zones

Set the 'Homepage' for SPWeb

Create SharePoint Group

*/


//COPY AND PASTE THESE AS STARTING POINT

var siteDefinitionExample = [
	{
		Title: 'Mike Chan',
		SiteLogoUrl: '/SiteCollectionImages/airbor_35px.gif',	//provide textbox so they can type URL
		ServerRelativeUrl: '/openapps/KM/mc/deleteme',			//TODO (medium priority): should create a tree-view so user can pick the parent web (/openapps/KM/mc), and a textbox to type 'deleteme'								
		WebTemplate: 'STS'										//Team Site (should not let the user customize)
																//TODO (high priority) set to 24 hours /openapps/KM/mc/_api/web/RegionalSettings/Time24 (can it be set at same time as sitecreation HTTP POST?)
	}
];

var fieldDefinitionForCalculatedField = {
	Name: 'StatusSort',
	DisplayName: 'StatusSort',
	Type: "Calculated",
	Required: 'TRUE',
	ResultType: 'Text',
	ReadOnly: 'TRUE',
	Formula: "=FirstName&amp; \" \" &amp;LastName&amp; \" (id: \" &amp;EmployeeID&amp; \" \"",
	FieldRefs: ['Status'],
	Description: "First stab at calculated field..."
}

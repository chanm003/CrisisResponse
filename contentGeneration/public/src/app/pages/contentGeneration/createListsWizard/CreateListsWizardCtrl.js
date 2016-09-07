/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
	'use strict';

  	angular.module('BlurAdmin.pages.contentGeneration')
    	.controller('CreateListsWizardCtrl', CtrlDefinition);

  	/** @ngInject */
	function CtrlDefinition($q, common, sharepointUtilities) {
		var webUrl = '/ngspa/instance';
	  	
	  	/*		
		sharepointUtilities.getLists('/ngspa/')
			.then(function(data){
				console.log(data);
			})
			.catch(function(){
			});
		
		*/

		/*
		sharepointUtilities.copyFile({
			sourceWebUrl: '/ngspa',
			sourceFileUrl:'artifacts/organization.aspx',
			destinationWebUrl: '/ngspa/instance',
			destinationWebFolderUrl: 'SitePages',
			destinationFileUrl: 'socc.aspx'
		});
		*/
		
		var taskGroupPageDef = crisisResponseSchema.webpartPageDefs['Task Group Page'];
		taskGroupPageDef.webUrl = webUrl;
		sharepointUtilities.provisionListViewWebparts(taskGroupPageDef).then(function(){
			console.log("all web parts done...")
		});
		
		 

		 /*
		$q.all([
			createCalendarList(),
			createCcirList(),
			createMissionList(),
			createMessageTrafficList(),
			createWatchLogList()
		])
		.then(function(){
			createRFIList();
			createMissionDocumentsLibrary();
		})
		*/
		
		function createCalendarList(){
			//DEPENDENCIES: None
			var listSchemaDef = crisisResponseSchema.listDefs["Calendar"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}

		function createCcirList(){
			//DEPENDENCIES: None
			var listSchemaDef = crisisResponseSchema.listDefs["CCIR"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}
		
		function createMissionList(){
			//DEPENDENCIES: None
			var listSchemaDef = crisisResponseSchema.listDefs["Mission Tracker"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}
		
		function createMessageTrafficList(){
			//DEPENDENCIES: None
			var listSchemaDef = crisisResponseSchema.listDefs["Message Traffic"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}
		
		function createMissionDocumentsLibrary(){
			//DEPENDENCIES: Mission Tracker
			var listSchemaDef = crisisResponseSchema.listDefs["Mission Documents"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}
		
		function createRFIList(){
			//DEPENDENCIES: Mission Tracker
			var listSchemaDef = crisisResponseSchema.listDefs["RFI"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
		}
		
		function createWatchLogList(){
			//DEPENDENCIES: None
			var listSchemaDef = crisisResponseSchema.listDefs["Watch Log"];
			listSchemaDef.webUrl = webUrl;
			return sharepointUtilities.createList(listSchemaDef);
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

﻿var crisisResponseSchema = crisisResponseSchema || {};
crisisResponseSchema.listDefs = {};
crisisResponseSchema.webpartPageDefs = {};
crisisResponseSchema.docTypes = ['Administrative', 'Annex', 'ASR Air Support Request', 'Base Orders', 'Battle Drills', 'Battle Rhythm', 'Brief', 'Campaign Plan', 'CivMil Civil Military Operations', 'COA Course of Action', 'Collection Management', 'COMMSTAT Communications Status', 'Concept of Support', 'CONOP Concept of Operations', 'CUB Commanders Update Brief', 'Daily Tasking Order', 'Distribution List', 'DISUM Daily Intelligence Summary', 'DOWNREP', 'EBO Evidence Based Operations', 'Execution Checklist', 'EXORD Executive Order', 'FRAGO Fragmentary Order', 'Geopspatial', 'GRINTSUM Graphical Intelligence Summary', 'HUMINT Human Intelligence', 'Images', 'Information Operations', 'INTREP Intelligence Report', 'INTSUM Intelligence Summary', 'IO Input Output', 'LOGSITREP Logistics Situational', 'Meteorology and Oceanography', 'MISREP Mission Report', 'Mission Analysis', 'MSEL Master Scenario Events List', 'OPORD Operation Order', 'OPSUM Operations Summary', 'Orders', 'PED Portable Electronic Device', 'PERSTAT Personnel Status', 'Planning', 'Post Mitigation', 'PRCC Personnel Recovery Coordination Center', 'PIR Priority Intelligence Requirements', 'Reference', 'ROE Rules of Engagement', 'RTB Return to Base', 'SIGACTS Significant Activities', 'SITREP Situational Report', 'Storyboard', 'Strategic Communications', 'Survey', 'Targeting', 'Target Intel Packets', 'Targets Submission', 'Targets References', 'Template', 'WARNORD Warning Order', 'Working Paper'];

crisisResponseSchema.missionTypesMappedToDefaultApprovalAuthority = {
	"AO: Airfield Operation": "", 
	"CR: Cache Recovery": "", 
	"CS: Cordon and Search": "", 
	"DA: Direct Action": "", 
	"HRO: Hostage Rescue Operation": "", 
	"KLE: Key Leader Engagement": "", 
	"KS: Kinetic Strike": "", 
	"MA: Military Assistance": "", 
	"PR: Personnel Recovery": "", 
	"SR: Special Reconnaissance": "", 
	"SUP: Support Patrol (log, etc)": ""
}

crisisResponseSchema.listDefs["AAR"] = {
	Title: "AAR",
	BaseTemplate: 'genericList',
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: DateTime
			Name: "Date",
			DisplayName: "Date",
			Type: "DateTime",
			Required: "TRUE",
			Format: "DateOnly", 			//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Observation",
			DisplayName: "Observation",
			Type: "Note",
			Required: "TRUE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"			
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Insight",
			DisplayName: "Insight",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Lesson",
			DisplayName: "Lesson",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
		},
		{
			//EXAMPLE: Dropdown
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Description: 'Identify the organization you are associated with',
			Choices: [],						//will be generated
			Default: ''							//(optional)
		}						
	]
};

crisisResponseSchema.listDefs["Config"] = {
	Title: "Config",
	BaseTemplate: 'genericList',
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "JSON",
			DisplayName: "JSON",
			Type: "Note",
			Required: "TRUE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			
		}		
	]
};

crisisResponseSchema.commStatuses = ['FMC', 'Degraded', 'NMC', 'Planned', 'Standby', 'N/A'];
crisisResponseSchema.listDefs["Communications Status"] = {
	Title: "Communications Status",
	BaseTemplate: 'genericList',
	shouldHideTitleField: true,
	fieldsToCreate:[
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Package",
			DisplayName: "Package",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 15,
			Default: "",							//(optional)
			Description: ""
		},
		{
			//EXAMPLE: Number
			Name: "SortOrder",
			DisplayName: "Sort Order",
			Type: "Number",
			Required: "TRUE"	
		},
		{
			//EXAMPLE: Dropdown
			Name: "UnclassData",
			DisplayName: "UNCLASS Data",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "BicesData",
			DisplayName: "BICES Data",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "SecretData",
			DisplayName: "SECRET Data",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "TacsatData",
			DisplayName: "TACSAT Data",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},	
		{
			//EXAMPLE: Dropdown
			Name: "HfData",
			DisplayName: "HF Data",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "UnclassPhone",
			DisplayName: "UNCLASS Phone",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "BicesPhone",
			DisplayName: "BICES Phone",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "SecretPhone",
			DisplayName: "SECRET Phone",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "TacsatRadio",
			DisplayName: "TACSAT Radio",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "HfRadio",
			DisplayName: "HF Radio",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "BicesVtc",
			DisplayName: "BICES VTC",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "SecretVtc",
			DisplayName: "SECRET VTC",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "TsVtc",
			DisplayName: "TS VTC",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "TRUE",
			Description: '',
			Choices: crisisResponseSchema.commStatuses,
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Comments",
			DisplayName: "Comments",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
		}					
	],
	viewsToCreate:[
		{
			title: 'EditableGrid',
			viewFields: ['Package', 'SortOrder', 'UnclassData', 'BicesData', 'SecretData', 'TacsatData', 'HfData', 'UnclassPhone', 'BicesPhone', 'SecretPhone', 'TacsatRadio', 'HfRadio', 'BicesVtc', 'SecretVtc', 'TsVtc', 'Comments'],
			viewTypeKind: 2048 
		}
	]
};

crisisResponseSchema.listDefs["DocumentChops"] = {
	Title: "DocumentChops",
	BaseTemplate: 'genericList',
	shouldHideTitleField: true,
	fieldsToCreate:[
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "DocumentId",
			DisplayName: "DocumentId",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 10,
			Default: "",							//(optional)
			Description: "Non-relational lookup to Mission Documents"
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 20,
			Default: "",							//(optional)
			Description: ""
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "OrganizationalRole",
			DisplayName: "OrganizationalRole",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 20,
			Default: "",							//(optional)
			Description: "Should be CDR or one of the staff sections"
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Verdict",
			DisplayName: "Verdict",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 20,
			Default: "",							//(optional)
			Description: "Concur, Nonconcur or Pending"
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Comments",
			DisplayName: "Comments",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			
		}		
	]
};

crisisResponseSchema.listDefs["Mission Tracker"] = {
	Title: "Mission Tracker",
		BaseTemplate: 'genericList',
		shouldHideTitleField: true,
		fieldsToCreate:[
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				//This field should be hidden one new form and read only on edit.  
				//Generated on save using following format: Organization_XXX_MissionType, ex. SOTG10_003_KS
				Name: "Identifier",
				DisplayName: "Identifier",
				Type: "Text",
				Required: "False",
				MaxLength: 255,
				Default: "",							//(optional)
				ShowInNewForm: 'FALSE',
				ShowInEditForm: 'TRUE'
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				//This field should be hidden one new form and read only on edit
				//Generated on save using following format: Organization_XXX_MissionType (ObjectiveName, OperationName), ex. SOTG10_003_KS (OBJ_HAN, OBJ, SOLO)
				Name: "FullName",
				DisplayName: "Full Name",
				Type: "Text",
				Required: "False",
				MaxLength: 255,
				Default: "",							//(optional)
				ShowInNewForm: 'FALSE',
				ShowInEditForm: 'TRUE'
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "ObjectiveName",
				DisplayName: "Objective Name",
				Type: "Text",
				Required: "TRUE",
				MaxLength: 255,
				Description: "Name of Objective/Target. One word, all CAPs, prefix name with OBJ.",
				Default: "OBJ_"							//(optional)
				
			},
			{
				//EXAMPLE: Dropdown
				Name: "Organization",
				DisplayName: "Organization",
				Type: "Choice",
				Format:"Dropdown",
				Required: "TRUE",
				FillInChoice: "FALSE",
				Description: 'The task group commanding the mission',
				Choices: [],						//will be generated
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "MissionType",
				DisplayName: "Mission Type",
				Type: "Choice",
				Format:"Dropdown",
				Required: "TRUE",
				FillInChoice: "FALSE",
				Choices: _.keys(crisisResponseSchema.missionTypesMappedToDefaultApprovalAuthority),
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "ApprovalAuthority",
				DisplayName: "Approval Authority",
				Type: "Choice",
				Format:"Dropdown",
				Required: "TRUE",
				FillInChoice: "FALSE",
				Choices: [], 
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "OperationName",
				DisplayName: "Operation Name",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Description: "Name of Objective/Target. One word, all CAPs, prefix name with OP.",
				Default: "OP_"							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "Status",
				DisplayName: "Status",
				Type: "Choice",
				Format:"Dropdown",
				Required: "TRUE",
				FillInChoice: "FALSE",
				Description: 'Use this drop-down menu to identify what stage the Mission or CONOP is currently in. This field should be updated as the CONOP moves through the stages from planning to execution to completion',
				Choices: ['Initial Targeting', 'JPG Assigned', 'COA Approved', 'CONOP Received - In Chop', 'CONOP Approved', 'CONOP Disapproved', 'FRAGO In-Chop', 'FRAGO Released', 'EXORD Released', 'Mission In Progress', 'Return to Base', 'QuickLook', 'StoryBoard', 'OPSUM', 'Mission Closed'], 
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: DateTime
				Name: "MissionApproved",
				DisplayName: "Mission Approved",
				Type: "DateTime",
				Required: "FALSE",
				Format: "DateTime", 			//please use either 'DateOnly' or 'DateTime'
				Default: ''						//(optional)	
			},
			{
				//EXAMPLE: DateTime
				Name: "ExpectedExecution",
				DisplayName: "Expected Execution",
				Type: "DateTime",
				Required: "TRUE",
				Format: "DateTime", 			//please use either 'DateOnly' or 'DateTime'
				Default: ''						//(optional)	
			},
			{
				//EXAMPLE: DateTime
				Name: "ExpectedTermination",
				DisplayName: "Expected Termination",
				Type: "DateTime",
				Required: "FALSE",
				Format: "DateTime", 			//please use either 'DateOnly' or 'DateTime'
				Default: ''						//(optional)	
			},
			{
				//EXAMPLE: Checkboxes
				Name: "ParticipatingOrganizations",
				DisplayName: "Participating Organizations",
				Type: "MultiChoice",
				Required: "TRUE",
				FillInChoice: "FALSE",
				Description: 'The task group participating in the mission',
				Choices: [],						//will be generated
				Default: ''						//(optional)
			},
			{
				//EXAMPLE: MULTIPLE LINE OF TEXT
				Name: "Comments",
				DisplayName: "Comments",
				Type: "Note",
				Required: "FALSE",
				NumLines: 6,
				RichText: "FALSE",						//RECOMMENDED
				AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
				
			}		
		]
};

crisisResponseSchema.listDefs["Help Desk"] = {
	Title: "Help Desk",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Details",
			DisplayName: "Details",
			Type: "Note",
			Required: "FALSE",
			NumLines: 12,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"	
		},
		{
			//EXAMPLE: Person or Group 
			Name: "Customer",
			DisplayName: "Customer",
			Type: "User",
			Required: "TRUE",
			Description: "",
			UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName'				//Name with presence	
		},
		{
			//EXAMPLE: Dropdown
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Location",
			DisplayName: "Location",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "TelephoneNumber",
			DisplayName: "Telephone #",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 30,
			Description: "Please supply your telephone number",
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: Dropdown
			Name: "Priority",
			DisplayName: "Priority",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Description: "Please prioritize the issue/request",
			Choices: ["(1) High", "(2) Normal", "(3) Low"],						
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "RequestType",
			DisplayName: "Request Type",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Description: "Please categorize the request",
			Choices: ["Access Request", "Portal Development/KM", "Support", "Security", "Maintenance"],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Person or Group 
			Name: "AssignedTo",
			DisplayName: "Assigned To",
			Type: "User",
			Required: "FALSE",
			Description: "",
			UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName',				//Name with presence	
			ShowInNewForm: "FALSE"
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Comments",
			DisplayName: "Comments",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE",					//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"	
			ShowInNewForm: "FALSE"
		},
		{
			//EXAMPLE: Dropdown
			Name: "Status",
			DisplayName: "Status",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Description: "",
			Choices: ["Initiated", "Engaged", "Hold", "Resolved"],
			Default: 'Initiated',							//(optional)
			ShowInNewForm: "FALSE"
		},
		{
			//EXAMPLE: Dropdown
			Name: "ResolutionType",
			DisplayName: "Resolution Type",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Description: "",
			Choices: ["Positive", "Neutral", "Negative"],
			Default: '',							//(optional)
			ShowInNewForm: "FALSE"
		},
		{
			//EXAMPLE: DateTime
			Name: "ResolutionDate",
			DisplayName: "Resolution Date",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateOnly", 					//please use either 'DateOnly' or 'DateTime'
			Default: '',						//(optional)	
			ShowInNewForm: "FALSE"
		},
		{
			//EXAMPLE: Number
			Name: "PriorityNumber",
			DisplayName: "Priority #",
			Type: "Number",
			Required: "FALSE",
			Decimals: 0,
			ShowInNewForm: "FALSE"		
		}
	]
};

crisisResponseSchema.listDefs["Phonebook"] = {
	Title: "Phonebook",
		BaseTemplate: 'genericList',
		shouldHideTitleField: true,
		fieldsToCreate:[
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "TitleRole",
				DisplayName: "Title/Role",
				Type: "Text",
				Required: "TRUE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "LastName",
				DisplayName: "Last Name",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "FirstName",
				DisplayName: "First Name",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "Nation",
				DisplayName: "Nation",
				Type: "Choice",
				Format:"Dropdown",
				Required: "FALSE",
				FillInChoice: "FALSE",
				Choices: [],						//will be generated 
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "Rank",
				DisplayName: "Rank",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "ShiftWatch",
				DisplayName: "Shift/Watch",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Description: "Day&#xD;&#xA;Night&#xD;&#xA;Midshift",
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "Location",
				DisplayName: "Location",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "BuildingNumber",
				DisplayName: "Building Number",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "BicesEmail",
				DisplayName: "BICES Email",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "SiprEmail",
				DisplayName: "SIPR Email",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "UnclassEmail",
				DisplayName: "Unclass Email",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "BicesPhone",
				DisplayName: "BICES Phone",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "BicesVtc",
				DisplayName: "BICES VTC",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "CellPhone",
				DisplayName: "Cell Phone",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: SINGLE LINE OF TEXT
				Name: "OtherPhone",
				DisplayName: "Other Phone",
				Type: "Text",
				Required: "FALSE",
				MaxLength: 255,
				Default: ""							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "Organization",
				DisplayName: "Organization",
				Type: "Choice",
				Format:"Dropdown",
				Required: "FALSE",
				FillInChoice: "TRUE",
				Choices: [],						//will be generated 
				Default: ''							//(optional)
			},
			{
				//EXAMPLE: Dropdown
				Name: "KeyLeader",
				DisplayName: "Key Leader",
				Type: "Choice",
				Format:"Dropdown",
				Required: "FALSE",
				FillInChoice: "FALSE",
				Choices: ['No', 'Yes'],						//will be generated 
				Default: 'No'							//(optional)
			},
			{
				//EXAMPLE: MULTIPLE LINE OF TEXT
				Name: "Comments",
				DisplayName: "Comments",
				Type: "Note",
				Required: "FALSE",
				NumLines: 6,
				RichText: "FALSE",						//RECOMMENDED
				AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
				
			}		
		]
};
	
crisisResponseSchema.listDefs["Mission Documents"] = {
	Title: "Mission Documents",
	BaseTemplate: 'documentLibrary',
	enableVersioning: true,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "TypeOfDocument",
			DisplayName: "Type of Document",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: crisisResponseSchema.docTypes, 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Lookup field
			Name: "Mission",
			DisplayName: "Mission",
			Type: "Lookup",
			Required: "FALSE",
			List: "Mission Tracker",
			ShowField: 'FullName',
			Description: 'Select here to associate the document to a mission. NOTE - do not tie *draft* CONOPs to missions.'								
		},
		{
			//EXAMPLE: Dropdown
			Name: "FlaggedForSoacDailyUpdate",
			DisplayName: "Flag as SOAC Daily Product",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: ['Yes', 'No'], 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Calculated
			Name: 'DailyProductDate',
			DisplayName: 'Daily Product Date',
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateOnly", 
			Description: ''		
		},
		{
			//EXAMPLE: DateTime
			Name: "ChopProcess",
			DisplayName: "Chop Process",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Description: "Time when user initiated the chop",
			Default: '',						//(optional)
			ShowInNewForm: 'FALSE',
			ShowInEditForm: 'FALSE'	
		},
		{
			//EXAMPLE: DateTime
			Name: "VersionBeingChopped",
			DisplayName: "Version Being Chopped",
			Type: "Number",
			Required: "FALSE",
			Description: "User would have initiated the chop on a specific version of the document",
			Decimals: 0,						
			ShowInNewForm: 'FALSE',
			ShowInEditForm: 'FALSE'	
		},
		{
			//EXAMPLE: Yes/No 
			Name: "SendAsMessage",
			DisplayName: "Send As Message",
			Type: "Boolean",
			Default: 0,								//(optional) Use 0 if you want default to be 'No', 1 if for 'Yes'
			Description: "Check here to send the document via a Message"
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "MessageTitle",
			DisplayName: "Message Title",
			Description: "Provide a title for the message",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: ""							//(optional)
		
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "MessageDetails",
			DisplayName: "Message Details",
			Description: "If necessary provide additional message details",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			
		},
		{
			//EXAMPLE: DateTime
			Name: "MessageDTG",
			DisplayName: "Message DTG",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Description: "ZULU.  The Date and Time to be applied to the message",
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "MessageOriginatorSender",
			DisplayName: "Message Originator/Sender",
			Description: "Identify the message &quot;sender&quot;",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Checkboxes
			Name: "MessageRecipients",
			DisplayName: "Message Recipients",
			Description: "Identify the message recipients",
			Type: "MultiChoice",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: [],
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "SignificantMessage",
			DisplayName: "Significant Message",
			Description: "Select &quot;Yes&quot; to include the message in the Current Operations Summary",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: ['No', 'Yes'],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "ChopRouteSequence",
			DisplayName: "Selected Route Sequence",
			Description: "Set when user initiates chop process",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: "",							//(optional)
			Hidden: "TRUE"
		}
	],
	viewsToCreate:[
		{
			title: 'INTEL',
			viewFields: ['DocIcon', 'Organization', 'LinkFilename', 'Mission', 'Modified', 'Editor'],
			query: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="Organization"/></GroupBy><OrderBy><FieldRef Name="ID" Ascending="FALSE"/></OrderBy><Where><Or><Or><Contains><FieldRef Name="TypeOfDocument"/><Value Type="Text">INTSUM</Value></Contains><Contains><FieldRef Name="TypeOfDocument"/><Value Type="Text">INTREP</Value></Contains></Or><Contains><FieldRef Name="TypeOfDocument"/><Value Type="Text">HUMINT</Value></Contains></Or></Where>',
			viewTypeKind: 0 
		},
		{
			title: 'SITREP',
			viewFields: ['DocIcon', 'Organization', 'LinkFilename', 'Mission', 'Modified', 'Editor'],
			query: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="Organization"/></GroupBy><OrderBy><FieldRef Name="ID" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="TypeOfDocument"/><Value Type="Text">SITREP</Value></Contains></Where>',
			viewTypeKind: 0 
		},
		{
			title: 'Template',
			viewFields: ['DocIcon', 'Organization', 'LinkFilename', 'Modified', 'Editor'],
			query: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="Organization"/></GroupBy><OrderBy><FieldRef Name="LinkFilename"/></OrderBy><Where><Contains><FieldRef Name="TypeOfDocument"/><Value Type="Text">Template</Value></Contains></Where>',
			viewTypeKind: 0 
		}
	]
}; 

crisisResponseSchema.listDefs["RFI"] = {
	Title: "RFI",
	BaseTemplate: 'genericList',
	enableVersioning: true,
	shouldHideTitleField: false,	
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "Status",
			DisplayName: "Status",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: ['Open', 'Closed'], 
			Default: 'Open'							//(optional)
		},
		{
			//EXAMPLE: Number
			Name: "RfiTrackingNumber",
			DisplayName: "RFI Tracking",
			Type: "Number",
			Required: "FALSE",
			Decimals: 0		
		},
		{
			//EXAMPLE: Lookup field
			Name: "Mission",
			DisplayName: "Mission",
			Type: "Lookup",
			Required: "FALSE",
			List: "Mission Tracker",
			ShowField: 'FullName'								
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Details",
			DisplayName: "Details",
			Type: "Note",
			Required: "FALSE",
			NumLines: 10,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "TRUE",						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			Description: "Give further details and background on the question asked in the &quot;Title&quot;"	
		},
		{
			//EXAMPLE: Dropdown
			Name: "Priority",
			DisplayName: "Priority",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: ['Routine (48-96 hrs)', 'Priority (24-48 hrs)', 'Immediate (&lt; 24 hrs)'], 
			Default: '',							//(optional)
			Description: "Requested priority of this RFI"
		},
		{
			//EXAMPLE: DateTime
			Name: "LTIOV",
			DisplayName: "LTIOV",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Description: "Last Time Information of Value",
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: Person or Group 
			Name: "PocName",
			DisplayName: "POC Name",
			Type: "User",
			Required: "TRUE",
			Description: "Person who will be notified when someone responds to the request",
			UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName'				//Name with presence	
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "PocPhone",
			DisplayName: "POC Phone",
			Type: "Text",
			Required: "TRUE",
			Description: "Enter the POC&apos;s phone number",
			MaxLength: 255,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: Dropdown
			Name: "PocOrganization",
			DisplayName: "POC Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Select the organization associated with the POC",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "RecommendedOPR",
			DisplayName: "Recommended OPR",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Recommended (Office of Primary Responsibility) The team responsible for responding to the request. The Recommended OPR may be reassigned.",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Person or Group (allow multiple)
			Name: "ManageRFI",
			DisplayName: "Manage RFI",
			Type: "UserMulti",
			Required: "FALSE",
			Description: "Add yourself here to track this RFI via the RFI Application&apos;s &quot;Manage RFIs&quot; tab. If you no longer want to track this RFI, please remove ONLY your name (not others).",
			UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName',				//Name with presence	
			Mult: "TRUE"
		},
		{
			//EXAMPLE: Person or Group 
			Name: "RespondentName",
			DisplayName: "Respondent Name",
			Type: "User",
			Required: "FALSE",
			UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName'				//Name with presence	
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "RespondentPhone",
			DisplayName: "Respondent Phone",
			Type: "Text",
			Required: "FALSE",
			Description: "Respondent&apos;s telephone number",
			MaxLength: 50,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "ResponseToRequest",
			DisplayName: "Response to Request",
			Type: "Note",
			Required: "FALSE",
			NumLines: 20,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "TRUE",						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			Description: "Enter your response to the request"	
		},
		{
			//EXAMPLE: DateTime
			Name: "DateClosed",
			DisplayName: "Date Closed",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: Dropdown
			Name: "ResponseSufficient",
			DisplayName: "Response Sufficient",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: ['Yes', 'No'],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "InsufficientExplanation",
			DisplayName: "Insufficient Explanation",
			Type: "Note",
			Required: "FALSE",
			NumLines: 20,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "TRUE",						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			Description: ""	
		},
		{
			//EXAMPLE: Calculated
			Name: 'ActionsHtml',
			DisplayName: 'Actions',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=""',
			FieldRefs: [],
			Description: 'This is just a placeholder read-only column.   Below formula serves no actual purpose.  JSLink will rerender as a button or some other control-depending on list title.'		
		},
		{
			//EXAMPLE: Calculated
			Name: 'PrioritySort',
			DisplayName: 'PrioritySort',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Number',
			ReadOnly: 'TRUE',
			Formula: '=IF(ISNUMBER(SEARCH("Immediate",Priority)),1,IF(ISNUMBER(SEARCH("Priority",Priority)),2,3))',
			FieldRefs: ['Priority']		
		}
	]
};

crisisResponseSchema.listDefs["Watch Log"] = {
	Title: "Watch Log",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: DateTime
			Name: "DateTimeGroup",
			DisplayName: "Date Time Group",
			Type: "DateTime",
			Required: "TRUE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "EventDetails",
			DisplayName: "Event Details",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"	
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "ActionTaken",
			DisplayName: "Action Taken",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Initials",
			DisplayName: "Initials",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 5,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: Dropdown
			Name: "Significant",
			DisplayName: "Significant",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: ['Yes', 'No'],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Calculated
			Name: 'DTG',
			DisplayName: 'DTG',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=UPPER(TEXT([Date Time Group],"ddHHmm")&amp;"Z"&amp;(TEXT([Date Time Group],"MMMyy")))',
			FieldRefs: ['DateTimeGroup']		
		}
	]
};

crisisResponseSchema.listDefs["Message Traffic"] = {
	Title: "Message Traffic",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "OriginatorSender",
			DisplayName: "Originator/Sender",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Description: 'The organization that sent the message',
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Checkboxes
			Name: "Receiver",
			DisplayName: "Receiver",
			Type: "MultiChoice",
			Required: "TRUE",
			Description: "The message recipient(s)",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: DateTime
			Name: "DateTimeGroup",
			DisplayName: "Date Time Group",
			Type: "DateTime",
			Required: "TRUE",
			Description: "(DTG) Date and Time that message was received/sent",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "TaskInfo",
			DisplayName: "Task/Info",
			Type: "Note",
			Required: "TRUE",
			Description: "Message details",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Initials",
			DisplayName: "Initials",
			Type: "Text",
			Required: "FALSE",
			Description: "Initials of the individual that received/sent the message",
			MaxLength: 5,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: Dropdown
			Name: "Significant",
			DisplayName: "Significant",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Select &quot;Yes&quot; to include the message in the Current Operations Summary",
			FillInChoice: "FALSE",
			Choices: ['Yes', 'No'],
			Default: 'No'							//(optional)
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "Comments",
			DisplayName: "Comments",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE",						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
			Description: ""	
		},
		{
			//EXAMPLE: URL field
			Name: "LinkToMissionDocument",
			DisplayName: "Document Link",
			Type: "URL",
			Required: "FALSE",
			Format: "Hyperlink",
			ShowInNewForm: 'FALSE',
			ShowInEditForm: 'FALSE'					
		},
		{
			//EXAMPLE: Calculated
			Name: 'DTG',
			DisplayName: 'DTG',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=UPPER(TEXT([Date Time Group],"ddHHmm")&amp;"Z"&amp;(TEXT([Date Time Group],"MMMyy")))',
			FieldRefs: ['DateTimeGroup']		
		}
	]
};

crisisResponseSchema.listDefs["CCIR"] = {
	Title: "CCIR",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,	
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "Category",
			DisplayName: "Category",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Information requirement subcomponent",
			FillInChoice: "FALSE",
			Choices: ['Essential Elements of Friendly Information (EEFI)', 'Friendly Force Information Requirements (FFIR)', 'Priority Intelligence Requirements (PIR)'],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "Number",
			DisplayName: "Number",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Sequence number associated with the requirement.",
			FillInChoice: "FALSE",
			Choices: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "Status",
			DisplayName: "Status",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			Description: "Status of the requirement",
			FillInChoice: "FALSE",
			Choices: ['Red', 'Yellow', 'Green'],
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Description",
			DisplayName: "Description",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: ""							//(optional)
			
		}
	]
};

crisisResponseSchema.listDefs["Calendar"] = {
	Title: 'Calendar',
	BaseTemplate: 'events',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToModify: [
		{
			Name: "Category",
			DisplayName: "Category",
			Type: "MultiChoice",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Description: "Select all that apply",
			Choices: ['Battle Rhythm', 'Working Group', 'Briefing', 'SOCEUR Internal', 'Reporting Requirement', 'Academics', 'VTC'],
			Default: ''						//(optional)
		}
	],	
	fieldsToCreate:[
		// Attendees, WebEx Link
		{
			Name: "Organization",
			DisplayName: "Organization",
			Type: "Choice",
			Format: "Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: Person or Group (allow multiple)
			Name: "Attendees",
			DisplayName: "Attendees",
			Type: "UserMulti",
			Required: "FALSE",
			UserSelectionMode: "PeopleAndGroups",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
			ShowField: 'ImnName',				//Name with presence	
			Mult: "TRUE"
		},
		{
			//EXAMPLE: URL field
			Name: "WebexLink",
			DisplayName: "WebEx Link",
			Type: "URL",
			Required: "FALSE",
			Format: "Hyperlink"								
		}
	],
	viewsToCreate:[
		{
			title: 'Academics',
			query: '<Where><Eq><FieldRef Name="Category"/><Value Type="Text">Academics</Value></Eq></Where>',
			viewTypeKind:524288
		},
		{
			title: 'VTC',
			query: '<Where><Eq><FieldRef Name="Category"/><Value Type="Text">VTC</Value></Eq></Where>',
			viewTypeKind:524288
		}
	]
};

crisisResponseSchema.listDefs["EXCON Documents"] = {
	Title: "EXCON Documents",
	BaseTemplate: 'documentLibrary',
	enableVersioning: true,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "TypeOfDocument",
			DisplayName: "Type of Document",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: crisisResponseSchema.docTypes, 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "Subject",
			DisplayName: "Subject",
			Type: "Choice",
			Format:"Dropdown",
			Required: "FALSE",
			FillInChoice: "FALSE",
			Choices: ['Operations', 'Intelligence', 'Communications', 'Logistics'], 
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Dropdown
			Name: "DraftFinal",
			DisplayName: "Draft/Final",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: ['Draft', 'Final'], 
			Default: ''							//(optional)
		}
	]
}

crisisResponseSchema.listDefs["EXCON Watch Log"] = {
	Title: "EXCON Watch Log",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: DateTime
			Name: "DateTimeGroup",
			DisplayName: "Date Time Group",
			Type: "DateTime",
			Required: "TRUE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "EventDetails",
			DisplayName: "Event Details",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"	
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "ActionTaken",
			DisplayName: "Action Taken",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "Initials",
			DisplayName: "Initials",
			Type: "Text",
			Required: "TRUE",
			MaxLength: 5,
			Default: ""							//(optional)		
		},
		{
			//EXAMPLE: Calculated
			Name: 'DTG',
			DisplayName: 'DTG',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=UPPER(TEXT([Date Time Group],"ddHHmm")&amp;"Z"&amp;(TEXT([Date Time Group],"MMMyy")))',
			FieldRefs: ['DateTimeGroup']		
		}
	]
};

crisisResponseSchema.listDefs["Inject"] = {
	Title: "Inject",
	BaseTemplate: 'genericList',
	enableVersioning: false,
	shouldHideTitleField: false,
	fieldsToCreate:[
		{
			//EXAMPLE: Dropdown
			Name: "Status",
			DisplayName: "Status",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: ['Pending', 'Completed'],						//will be generated
			Description: '',
			Default: 'Pending',							//(optional)
			ShowInNewForm: "FALSE",
			ShowInEditForm: "FALSE"
		},
		{
			//EXAMPLE: DateTime
			Name: "DateTimeGroup",
			DisplayName: "Date Time Group",
			Type: "DateTime",
			Required: "TRUE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: MULTIPLE LINE OF TEXT
			Name: "TaskInfo",
			DisplayName: "Task/Info",
			Type: "Note",
			Required: "FALSE",
			NumLines: 6,
			RichText: "FALSE",						//RECOMMENDED
			AppendOnly: "FALSE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"	
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "DeskResponsible",
			DisplayName: "Desk Responsible",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: "",							//(optional)		
			Description: "Belly Button for coordination"
		},
		{
			//EXAMPLE: Dropdown
			Name: "OriginatorSender",
			DisplayName: "Originator/Sender",
			Type: "Choice",
			Format:"Dropdown",
			Required: "TRUE",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Description: 'Inject Originator',
			Default: ''							//(optional)
		},
		{
			//EXAMPLE: Checkboxes
			Name: "Receiver",
			DisplayName: "Receiver",
			Type: "MultiChoice",
			Required: "TRUE",
			Description: "First command message is released to",
			FillInChoice: "FALSE",
			Choices: [],						//will be generated
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "IIRNumber",
			DisplayName: "IIR No.",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: "",							//(optional)		
			Description: ""
		},
		{
			//EXAMPLE: Checkboxes
			Name: "ReviewedForRelease",
			DisplayName: "Reviewed for Release",
			Type: "MultiChoice",
			Required: "TRUE",
			Description: "",
			FillInChoice: "FALSE",
			Choices: ['MSEL Manager'],						//will be generated
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: SINGLE LINE OF TEXT
			Name: "TgtEvt",
			DisplayName: "Tgt/Evt",
			Type: "Text",
			Required: "FALSE",
			MaxLength: 255,
			Default: "",							//(optional)		
			Description: ""
		},
		{
			//EXAMPLE: DateTime
			Name: "TgtEvtDate",
			DisplayName: "Tgt/Evt Date",
			Type: "DateTime",
			Required: "FALSE",
			Format: "DateTime", 					//please use either 'DateOnly' or 'DateTime'
			Default: ''						//(optional)	
		},
		{
			//EXAMPLE: Checkboxes
			Name: "ReportType",
			DisplayName: "Report Type",
			Type: "MultiChoice",
			Required: "FALSE",
			Description: "",
			FillInChoice: "FALSE",
			Choices: ['INTSUM', 'INTREP', 'IIR', 'SITREP', 'OPREP', 'Operation'],						//will be generated
			Default: ''						//(optional)
		},
		{
			//EXAMPLE: Calculated
			Name: 'ActionsHtml',
			DisplayName: 'Actions',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=""',
			FieldRefs: [],
			Description: 'This is just a placeholder read-only column.   Below formula serves no actual purpose.  JSLink will rerender as a button or some other control-depending on list title.'		
		},
		{
			//EXAMPLE: Calculated
			Name: 'DTG',
			DisplayName: 'DTG',
			Type: "Calculated",
			Required: 'TRUE',
			ResultType: 'Text',
			ReadOnly: 'TRUE',
			Formula: '=UPPER(TEXT([Date Time Group],"ddHHmm")&amp;"Z"&amp;(TEXT([Date Time Group],"MMMyy")))',
			FieldRefs: ['DateTimeGroup']		
		}		
	]
}

crisisResponseSchema.webpartPageDefs['Component Command Page'] = {
	folderName: 'SitePages',
	aspxFileName: 'socc.aspx',
	listviewWebparts: [
		{
			listTitle: 'Watch Log',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/WatchLog'
				}
			],
			viewName: 'SOCC Watch Log',
			viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Top',
			zoneIndex: 0
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Inbound Messages'
				}
			],
			viewName: 'SOCC Inbound Messages',
			viewFields: ['Attachments', 'DTG', 'OriginatorSender', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Receiver"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 0
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Outbound Messages'
				}
			],
			viewName: 'SOCC Outbound Messages',
			viewFields: ['DTG', 'Receiver', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="OriginatorSender"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 10
		},
		{
			listTitle: 'RFI',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/RFI'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Request for Information'
				}
			],
			viewName: 'SOCC RFI',
			viewFields: ['ActionsHtml', 'LinkTitle', 'Priority', 'LTIOV'],
			viewCAML: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="RecommendedOPR"/></GroupBy><OrderBy><FieldRef Name="LTIOV"/><FieldRef Name="PrioritySort"/></OrderBy><Where><And><Contains><FieldRef Name="RecommendedOPR"/><Value Type="Text">{orgQsParam}</Value></Contains><Eq><FieldRef Name="Status"/><Value Type="Text">Open</Value></Eq></And></Where>',
			zoneName: 'Left',
			zoneIndex: 20
		},
		{
			listTitle: 'Mission Documents',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'MissionDocuments'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Documents'
				}
			],
			viewName: 'SOCC Documents',
			viewFields: ['DocIcon', 'LinkFilename', 'Modified', 'Editor', 'ChopProcess'],
			viewCAML: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="TypeOfDocument"/><FieldRef Name="Organization"/></GroupBy><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Right',
			zoneIndex: 10
		},
		{
			listTitle: 'CCIR',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/CCIR'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'CCIR'
				}
			],
			viewName: 'SOCC CCIR',
			viewFields: ['Number', 'LinkTitle', 'Status', 'Description'],
			viewCAML: '<GroupBy Collapse="TRUE" GroupLimit="30"><FieldRef Name="Category"/></GroupBy><OrderBy><FieldRef Name="Number"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Bottom',
			zoneIndex: 0
		}
	],
	scriptEditorWebparts: [
		{
			name: 'Gantt Mission Tracker',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;mission-timeline missions="vm.missions" selected-org="vm.selectedOrg" show-new-item-link="true"&gt;&lt;/mission-timeline&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Mission Tracker'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'ongoing missions (click checkbox to show completed missions)'
				}
			],
			zoneName: 'Right',
			zoneIndex: 0
		},
		{
			name: 'Full Calendar',
			webPartProperties: [
				{ 
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;exercise-calendar&gt;&lt;/exercise-calendar&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Calendar'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'Battle Rhythm, Academics, VTC&apos;s, Briefings'
				}
			],
			zoneName: 'Bottom',
			zoneIndex: 10
		}
	]
}

crisisResponseSchema.webpartPageDefs['Task Group Page'] = {
	folderName: 'SitePages',
	aspxFileName: 'sotg.aspx',
	listviewWebparts: [
		{
			listTitle: 'Watch Log',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/WatchLog'
				}
			],
			viewName: 'SOTG Watch Log',
			viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Top',
			zoneIndex: 0
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Inbound Messages'
				}
			],
			viewName: 'SOTG Inbound Messages',
			viewFields: ['Attachments', 'DTG', 'OriginatorSender', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Receiver"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 10
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Outbound Messages'
				}
			],
			viewName: 'SOTG Outbound Messages',
			viewFields: ['DTG', 'Receiver', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="OriginatorSender"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 20
		},
		{
			listTitle: 'RFI',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/RFI'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Request for Information'
				}
			],
			viewName: 'SOTG RFI',
			viewFields: ['ActionsHtml', 'LinkTitle', 'Priority', 'LTIOV'],
			viewCAML: '<OrderBy><FieldRef Name="LTIOV"/></OrderBy><Where><And><Contains><FieldRef Name="RecommendedOPR"/><Value Type="Text">{orgQsParam}</Value></Contains><Eq><FieldRef Name="Status"/><Value Type="Text">Open</Value></Eq></And></Where>',
			zoneName: 'Left',
			zoneIndex: 30
		},
		{
			listTitle: 'Mission Documents',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'MissionDocuments'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Documents'
				}
			],
			viewName: 'SOTG Documents',
			viewFields: ['DocIcon', 'LinkFilename', 'Modified', 'Editor', 'ChopProcess'],
			viewCAML: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="TypeOfDocument"/></GroupBy><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Right',
			zoneIndex: 10
		}
	],
	scriptEditorWebparts: [
		{
			name: 'Gantt Mission Tracker',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;mission-timeline missions="vm.missions" selected-org="vm.selectedOrg" show-new-item-link="true"&gt;&lt;/mission-timeline&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Mission Tracker'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'ongoing missions (click checkbox to show closed missions)'
				}
			],
			zoneName: 'Right',
			zoneIndex: 0
		},
		{
			name: 'Full Calendar',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;exercise-calendar&gt;&lt;/exercise-calendar&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Calendar'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'Battle Rhythm, Academics, VTC&apos;s, Briefings'
				}
			],
			zoneName: 'Bottom',
			zoneIndex: 0
		}
	]
}

crisisResponseSchema.webpartPageDefs['Communications Component Page'] = {
	folderName: 'SitePages',
	aspxFileName: 'comms.aspx',
	listviewWebparts: [
		{
			listTitle: 'Watch Log',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/WatchLog'
				}
			],
			viewName: 'Comms Watch Log',
			viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Bottom',
			zoneIndex: 0
		}
	],
	scriptEditorWebparts: [
		{
			name: 'Comm Status Tracker',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;comm-status-tracker&gt;&lt;/comm-status-tracker&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Overall Communications Status'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'Track status of communication packages'
				}
			],
			zoneName: 'Top',
			zoneIndex: 0
		}
	]
}

crisisResponseSchema.webpartPageDefs['Air Component Page'] = {
	folderName: 'SitePages',
	aspxFileName: 'soac.aspx',
	listviewWebparts: [
		{
			listTitle: 'Watch Log',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/WatchLog'
				}
			],
			viewName: 'SOAC Watch Log',
			viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 0
		},
		{
			listTitle: 'RFI',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/RFI'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Request for Information'
				}
			],
			viewName: 'SOAC RFI',
			viewFields: ['ActionsHtml', 'LinkTitle', 'Priority', 'LTIOV'],
			viewCAML: '<OrderBy><FieldRef Name="LTIOV"/></OrderBy><Where><And><Contains><FieldRef Name="RecommendedOPR"/><Value Type="Text">{orgQsParam}</Value></Contains><Eq><FieldRef Name="Status"/><Value Type="Text">Open</Value></Eq></And></Where>',
			zoneName: 'Left',
			zoneIndex: 10
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Inbound Messages'
				}
			],
			viewName: 'SOAC Inbound Messages',
			viewFields: ['Attachments', 'DTG', 'OriginatorSender', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Receiver"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 20
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Outbound Messages'
				}
			],
			viewName: 'SOAC Outbound Messages',
			viewFields: ['DTG', 'Receiver', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="OriginatorSender"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 30
		},
		{
			listTitle: 'Mission Documents',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'MissionDocuments'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Daily Products'
				}
			],
			viewName: 'SOAC Daily Products',
			viewFields: ['DocIcon', 'LinkFilename', 'TypeOfDocument', 'Organization', 'ChopProcess'],
			viewCAML: '<OrderBy><FieldRef Name="ID" Ascending="FALSE"/></OrderBy><Where><And><And><Eq><FieldRef Name="FlaggedForSoacDailyUpdate" /><Value Type="Text">Yes</Value></Eq><Eq><FieldRef Name="DailyProductDate" /><Value Type="DateTime"><Today /></Value></Eq></And><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></And></Where>',
			zoneName: 'Right',
			zoneIndex: 0
		},
		{
			listTitle: 'Mission Documents',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'MissionDocuments'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Documents'
				}
			],
			viewName: 'SOAC Documents',
			viewFields: ['DocIcon', 'LinkFilename', 'Modified', 'Editor', 'ChopProcess'],
			viewCAML: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="Organization"/><FieldRef Name="TypeOfDocument"/></GroupBy><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Right',
			zoneIndex: 1
		}
	],
	scriptEditorWebparts: [
		{
			name: 'Gantt Mission Tracker',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;mission-timeline missions="vm.missions" selected-org="vm.selectedOrg" show-new-item-link="true"&gt;&lt;/mission-timeline&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Mission Tracker'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'ongoing missions (click checkbox to show closed missions)'
				}
			],
			zoneName: 'Right',
			zoneIndex: 2
		},
		{
			name: 'Full Calendar',
			webPartProperties: [
				{
					attributes: {name: 'Content', type: 'string'},
					innerText: '&lt;exercise-calendar&gt;&lt;/exercise-calendar&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Calendar'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'Battle Rhythm, Academics, VTC&apos;s, Briefings'
				}
			],
			zoneName: 'Bottom',
			zoneIndex: 0
		}
	]
}

crisisResponseSchema.webpartPageDefs['Exercise Conductor Page'] = {
	folderName: 'SitePages',
	aspxFileName: 'excon.aspx',
	listviewWebparts: [
		{
			listTitle: 'EXCON Watch Log',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/EXCONWatchLog'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Watch Log'
				}
			],
			viewName: 'EXCON Watch Log',
			viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy>',
			zoneName: 'Left',
			zoneIndex: 0
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Inbound Messages'
				}
			],
			viewName: 'EXCON Inbound Messages',
			viewFields: ['Attachments', 'DTG', 'OriginatorSender', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Receiver"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 10
		},
		{
			listTitle: 'Message Traffic',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/MessageTraffic'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Outbound Messages'
				}
			],
			viewName: 'EXCON Outbound Messages',
			viewFields: ['DTG', 'Receiver', 'LinkTitle', 'LinkToMissionDocument', 'Initials', 'Significant'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="OriginatorSender"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
			zoneName: 'Left',
			zoneIndex: 20
		},
		{
			listTitle: 'RFI',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/RFI'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Request for Information'
				}
			],
			viewName: 'EXCON RFI',
			viewFields: ['ActionsHtml', 'LinkTitle', 'Priority', 'LTIOV'],
			viewCAML: '<OrderBy><FieldRef Name="LTIOV"/></OrderBy><Where><And><Contains><FieldRef Name="RecommendedOPR"/><Value Type="Text">{orgQsParam}</Value></Contains><Eq><FieldRef Name="Status"/><Value Type="Text">Open</Value></Eq></And></Where>',
			zoneName: 'Left',
			zoneIndex: 30
		},
		{
			listTitle: 'EXCON Documents',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'ExconDocuments'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Documents'
				}
			],
			viewName: 'EXCON Documents',
			viewFields: ['DocIcon', 'LinkFilename', 'Modified', 'Editor'],
			viewCAML: '<GroupBy Collapse="FALSE" GroupLimit="30"><FieldRef Name="TypeOfDocument"/></GroupBy><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy>',
			zoneName: 'Right',
			zoneIndex: 1
		},
		{
			listTitle: 'Inject',
			webPartProperties: [
				{
					attributes: {name: 'ListUrl', type: 'string'},
					innerText: 'Lists/Inject'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Inject'
				}
			],
			viewName: 'EXCON Inject',
			viewFields: ['Attachments', 'ActionsHtml', 'DTG','LinkTitle', 'OriginatorSender', 'Receiver', 'DeskResponsible', 'TaskInfo', 'ReviewedForRelease', 'IIRNumber', 'TgtEvt', 'TgtEvtDate'],
			viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup"/></OrderBy><Where><Eq><FieldRef Name="Status"/><Value Type="Text">Pending</Value></Eq></Where>',
			zoneName: 'Bottom',
			zoneIndex: 0
		}
	]
}

crisisResponseSchema.organizationalChoiceFields = [
	{
		listName: "AAR",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: false,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Calendar",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "CCIR",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: false,
			includeStaffSections: false,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: false,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Help Desk",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: false,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Inject",
		fieldName: "OriginatorSender",
		generationFlags: {
			includeComponentCommands: false,
			includeTaskGroups: false,
			includeStaffSections: false,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: false,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Inject",
		fieldName: "Receiver",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Message Traffic",
		fieldName: "OriginatorSender",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Message Traffic",
		fieldName: "Receiver",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Mission Documents",
		fieldName: "MessageOriginatorSender",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Mission Documents",
		fieldName: "MessageRecipients",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Mission Documents",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Mission Tracker",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Mission Tracker",
		fieldName: "ParticipatingOrganizations",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Phonebook",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: false,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: true
		}
	},
	{
		listName: "RFI",
		fieldName: "PocOrganization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "RFI",
		fieldName: "RecommendedOPR",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: true,
			includeNotionals: true,
			includeExerciseControlGroup: true,
			includeAirComponent: true,
			includeCommunicationsComponent: false
		}
	},
	{
		listName: "Watch Log",
		fieldName: "Organization",
		generationFlags: {
			includeComponentCommands: true,
			includeTaskGroups: true,
			includeStaffSections: false,
			includeNotionals: false,
			includeExerciseControlGroup: false,
			includeAirComponent: true,
			includeCommunicationsComponent: true
		}
	}
];


/*
var listDefinitionExample = [
	{
		Title: 'Missions',						
		BaseTemplate: 'genericList'				//events,genericList
	}
];

var fieldDefinitionExamples = [
	{
		//EXAMPLE: SINGLE LINE OF TEXT
		Name: "ForceTrackingNumber",
		DisplayName: "Force Tracking Number",
		Type: "Text",
		Required: "TRUE",
		MaxLength: 3,
		Default: "XXX"							//(optional)
		
	},
	{
		//EXAMPLE: MULTIPLE LINE OF TEXT
		Name: "NonconcurReason",
		DisplayName: "Nonconcur Reason",
		Type: "Note",
		Required: "FALSE",
		NumLines: 6,
		RichText: "FALSE",						//RECOMMENDED
		AppendOnly: "TRUE"						//VERSIONING MUST BE TURNED ON, otherwise specifie "FALSE"
		
	},
	{
		//EXAMPLE: Yes/No 
		Name: "Married",
		DisplayName: "Married (Y/N)",
		Type: "Boolean",
		Default: 0								//(optional) Use 0 if you want default to be 'No', 1 if for 'Yes'
	},
	{
		//EXAMPLE: DateTime
		Name: "BirthDate",
		DisplayName: "Birth Date",
		Type: "DateTime",
		Required: "FALSE",
		Format: "DateOnly", 					//please use either 'DateOnly' or 'DateTime'
		Default: '[today]'						//(optional)	
	},
	{
		//EXAMPLE: Number
		Name: "EmployeeID",
		DisplayName: "Employee ID",
		Type: "Number",
		Required: "FALSE",
		Decimals: 0, 							//please use number between 0 and 5 only
		Min: -1,								//(optional)	
		Max: -1,								//(optional)	
		Default: -1								//(optional)	
	},
	{
		//EXAMPLE: Dropdown
		Name: "MenuChoice",
		DisplayName: "Menu Choice",
		Type: "Choice",
		Format:"Dropdown",
		Required: "FALSE",
		FillInChoice: "FALSE",
		Choices: ['Meat', 'Seafood', 'Vegetarian'],
		Default: 'Meat'							//(optional)
	},
	{
		//EXAMPLE: Radio Buttons
		Name: "Dessert",
		DisplayName: "Dessert",
		Type: "Choice",
		Format:"RadioButtons",
		Required: "FALSE",
		FillInChoice: "FALSE",
		Choices: ['Ice Cream', 'Pie'],
		Default: 'Pie'							//(optional)
	},
	{
		//EXAMPLE: Checkboxes
		Name: "SideDishes",
		DisplayName: "Side Dishes",
		Type: "MultiChoice",
		Required: "FALSE",
		FillInChoice: "FALSE",
		Choices: ['Beans', 'Rice', 'Fries'],
		Default: 'Beans'						//(optional)
	},
	{
		//EXAMPLE: Picture Field
		Name: "EmployeePhoto",
		DisplayName: "Employee Photo",
		Type: "URL",
		Required: "FALSE",
		Format: "Image"								
	},
	{
		//EXAMPLE: URL field
		Name: "BlogURL",
		DisplayName: "Blog URL",
		Type: "URL",
		Required: "FALSE",
		Format: "Hyperlink"								
	},
	{
		//EXAMPLE: Lookup field
		Name: "ResidenceCountry",
		DisplayName: "Country of Residence",
		Type: "Lookup",
		Required: "FALSE",
		List: "Fake List",
		ShowField: 'Title'								
	},
	{
		//EXAMPLE: Lookup field (allow multiple)
		Name: "CitizenshipsHeld",
		DisplayName: "Citizenships Held",
		Type: "LookupMulti",
		Required: "FALSE",
		List: "Fake List",
		ShowField: 'Title',
		Mult: "TRUE"								
	},
	{
		//EXAMPLE: Person or Group 
		Name: "Supervisor",
		DisplayName: "Supervisor",
		Type: "User",
		Required: "FALSE",
		UserSelectionMode: "PeopleOnly",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
		ShowField: 'ImnName'				//Name with presence	
	},
	{
		//EXAMPLE: Person or Group (allow multiple)
		Name: "Colleagues",
		DisplayName: "Colleagues",
		Type: "UserMulti",
		Required: "FALSE",
		UserSelectionMode: "PeopleAndGroups",	//please specify either 'PeopleOnly' or 'PeopleAndGroups'
		ShowField: 'ImnName',				//Name with presence	
		Mult: "TRUE"
	}
];

var listViewWebpartDefinitionExample = {
		listTitle: 'Watch Log',
		webUrl: '/ngspa/instance',
		webPartProperties: [
			{
				attributes: {name: 'ListUrl', type: 'string'},
				innerText: 'Lists/WatchLog'
			}
		],
		viewName: 'SOCC.aspx Watch Log',
		viewFields: ['Attachments', 'DTG', 'LinkTitle', 'EventDetails', 'ActionTaken', 'Initials', 'Significant'],
		viewCAML: '<OrderBy><FieldRef Name="DateTimeGroup" Ascending="FALSE"/></OrderBy><Where><Contains><FieldRef Name="Organization"/><Value Type="Text">{orgQsParam}</Value></Contains></Where>',
		zoneName: 'Left',
		zoneIndex: 1
	}
*/
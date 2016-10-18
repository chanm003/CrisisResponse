var crisisResponseSchema = crisisResponseSchema || {};
crisisResponseSchema.listDefs = {};
crisisResponseSchema.webpartPageDefs = {};

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
			Choices: ['Administrative', 'Annex', 'ASR Air Support Request', 'Base Orders', 'Battle Drills', 'Battle Rhythm', 'Brief', 'Campaign Plan', 'CivMil Civil Military Operations', 'COA Course of Action', 'Collection Management', 'COMMSTAT Communications Status', 'Concept of Support', 'CONOP Concept of Operations', 'CUB Commanders Update Brief', 'Daily Tasking Order', 'Distribution List', 'DISUM Daily Intelligence Summary', 'DOWNREP', 'EBO Evidence Based Operations', 'Execution Checklist', 'EXORD Executive Order', 'FRAGO Fragmentary Order', 'Geopspatial', 'GRINTSUM Graphical Intelligence Summary', 'HUMINT Human Intelligence', 'Images', 'Information Operations', 'INTREP Intelligence Report', 'INTSUM Intelligence Summary', 'IO Input Output', 'LOGSITREP Logistics Situational', 'Meteorology and Oceanography', 'MISREP Mission Report', 'Mission Analysis', 'MSEL Master Scenario Events List', 'OPORD Operation Order', 'OPSUM Operations Summary', 'Orders', 'PED Portable Electronic Device', 'PERSTAT Personnel Status', 'Planning', 'Post Mitigation', 'PRCC Personnel Recovery Coordination Center', 'PIR Priority Intelligence Requirements', 'Reference', 'ROE Rules of Engagement', 'RTB Return to Base', 'SIGACTS Significant Activities', 'SITREP Situational Report', 'Storyboard', 'Strategic Communications', 'Survey', 'Targeting', 'Target Intel Packets', 'Targets Submission', 'Targets References', 'Template', 'WARNORD Warning Order', 'Working Paper'], 
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
			DisplayName: 'DailyProductDate',
			Type: "Calculated",
			Required: 'TRUE',
			Format: 'DateTime',
			ResultType: 'DateTime',
			ReadOnly: 'TRUE',
			Formula: '=VALUE(TEXT(DATE(MID(Title,1,4),MID(Title,5,2),MID(Title,7,2)),"mm/dd/yyyy"))',
			FieldRefs: ['Title'],
			Description: 'Only applicable to Air Component.   Formula returns &quot;error;#256&quot; unless Title field starts with YYYYMMDD e.g. 20160915 AIR DOCTRINE'		
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
			Description: "Check here to send the document via a Message",
			Type: "Boolean",
			Default: 0								//(optional) Use 0 if you want default to be 'No', 1 if for 'Yes'
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
	]
};

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
			viewName: 'LVWP SOCC.aspx Watch Log',
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
			viewName: 'LVWP SOCC.aspx Inbound Messages',
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
			viewName: 'LVWP SOCC.aspx Outbound Messages',
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
			viewName: 'LVWP SOCC.aspx RFI',
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
			viewName: 'LVWP SOCC.aspx Documents',
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
			viewName: 'LVWP SOCC.aspx CCIR',
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
					innerText: '&lt;mission-timeline show-new-item-link="true"&gt;&lt;/mission-timeline&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Mission Tracker'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'ongoing missions (click checkbox to show past missions)'
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
			viewName: 'LVWP SOTG.aspx Watch Log',
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
			viewName: 'LVWP SOTG.aspx Inbound Messages',
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
			viewName: 'LVWP SOTG.aspx Outbound Messages',
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
			viewName: 'LVWP SOTG.aspx RFI',
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
			viewName: 'LVWP SOTG.aspx Documents',
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
					innerText: '&lt;mission-timeline show-new-item-link="true"&gt;&lt;/mission-timeline&gt;'
				},
				{
					attributes: {name: 'Title', type: 'string'},
					innerText: 'Mission Tracker'
				},
				{
					attributes: {name: 'Description', type: 'string'},
					innerText: 'ongoing missions (click checkbox to show past missions)'
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

crisisResponseSchema.organizationalChoiceFields = [
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
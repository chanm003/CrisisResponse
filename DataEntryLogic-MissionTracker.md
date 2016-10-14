# Fields
* ObjectiveName textbox
    * on save, value gets truncated into single word by removing spaces between each word, then each letter is capitalized
        * ex. from "Big Bear" to BIGBEAR"
        * ex. from "Obj\_Big Bear" to "OBJ\_BIGBEAR" (if user types underscore that is not considered a space and will not be truncated)

* Organization dropdown
    * on NewForm.aspx options are trimmed based on query string and jocInBoxConfig.js 
    * on EditForm.aspx rendered as read-only-label
    * this dropdown has an onchange event (although many times this dropdown gets trimmed to only one option)
        * uses same event handling logic as the *ApprovalAuthority* dropdown

* MissionType dropdown
    * on EditForm.aspx rendered as read-only-label  
    * on NewForm.aspx this dropdown has an onchange event, that will set the *ApprovalAuthority* dropdown
        * ex. if user selects "KS: Kinetic Strike" as the mission, the config may specify that this type of mission should at least be Approval Authority of "2A or higher"

* ApprovalAuthority dropdown
    * options are built based on config file, each organization has an array of "named" routes
    * this dropdown has an onchange event, that will render a visualization of the organizations in the routing sequence
        * ex. if user select "SOTG 10" as Organization and "2A" as the ApprovalAuthority, then visualization might display "SOTG 10 --> CJSOTF-L --> SOCC"

* OperationName textbox
    * on save, value gets truncated into single word by removing spaces between each word, then each letter is capitalized
        * ex. from "Big Bear" to BIGBEAR"
        * ex. from "Op\_Big Bear" to "OP\_BIGBEAR" (if user types underscore that is not considered a space and will not be truncated)

* Identifier hidden textbox populated via script
    * should be always hidden and generated when user clicks Save on NewForm.aspx
    * uses formula OrganizationAsOneWord\_ThreeDigitNumber\_MissionTypeAbbreviation
        * ex. if user selects "SOTG 10" as the Organization, and "KS: Kinetic Strike" as the MissionType, and SOTG 10 has already commanded two missions already...
            * then the Identifier will be "SOTG10\_003\_KS"
        * ASSUMPTION: all mission types should contain a colon e.g. "DA: Direct Action"

* FullName hidden textbox populated via script
    * should be always hidden and generated when user clicks Save on NewForm.aspx and EditForm.aspx
        * uses formula Identifier (ObjectiveName, OperationName)
            * ex. format might be "SOTG10\_003\_KS (OBJ\_HAN, OP\_SOLO)"

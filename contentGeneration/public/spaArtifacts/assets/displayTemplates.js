/**
 * TODO: read before overriding fields for EditForm:
 * http://sharepoint.stackexchange.com/questions/112506/sharepoint-2013-js-link-return-default-field-rendering
 * 
 * POSSIBLE ISSUES with Minimal Download Strategy, should we be register templates differently....
 * https://blogs.msdn.microsoft.com/sridhara/2013/02/08/register-csr-override-on-mds-enabled-sharepoint-2013-site/
 */
(function () {
    RegisterModuleInit("SitePages/displayTemplates.js", registerCustomizations); // CSR-override for MDS enabled site
    registerCustomizations(); //CSR-override for MDS disabled site (because we need to call the entry point function in this case whereas it is not needed for anonymous functions)

    function registerCustomizations() {
        SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
            customizeFieldRendering();
            registerPostRenderEvent();
            $(document).ready(customizeCalloutsForDocumentLibrary);
        });

        function customizeCalloutsForDocumentLibrary() {
            SP.SOD.executeFunc("callout.js", "Callout", function () {
                var customization = {};
                customization.Templates = {};
                customization.BaseViewID = 'Callout';
                // Define the list template type
                customization.ListTemplateType = 101;
                customization.Templates.Footer = function (customization) {
                    // context, custom action function, show the ECB menu (boolean)
                    return CalloutRenderFooterTemplate(customization, AddCustomAction, true);
                };
                SPClientTemplates.TemplateManager.RegisterTemplateOverrides(customization);
            });

            function AddCustomAction(ctx, calloutActionMenu) {
                var editPropertiesUrl = ctx.editFormUrl + '&ID=' + ctx.CurrentItem.ID + "&Source=" + encodeURIComponent(document.location.href);
                // Add your custom action
                calloutActionMenu.addAction(new CalloutAction({
                    text: "Properties",
                    tooltip: 'Modify metadata for this document',
                    onClickCallback: function () {
                        document.location.href = editPropertiesUrl;
                    }
                }));

                // Show the default document library actions
                CalloutOnPostRenderTemplate(ctx, calloutActionMenu);
            }
        }

        function customizeFieldRendering() {
            var fieldCustomizations = {};

            /* ActionsHtml COLUMN*/
            fieldCustomizations["ActionsHtml"] = {};
            fieldCustomizations["ActionsHtml"]["View"] = function (ctx) {
                try {
                    var html;
                    if (ctx.ListTitle === "RFI") {
                        var buttonText = (ctx.CurrentItem.Status === "Open") ? "Respond" : "Reopen";
                        html = "<a class='custombtn' rfibutton data-id='" + ctx.CurrentItem.ID + "'>" + buttonText + "</a>";
                    }
                    return STSHtmlDecode(html);
                }
                catch (err) {
                    return 'Error parsing calculated column "ActionsHtml"';
                }
            };

            /* ApprovalAuthority COLUMN*/
            fieldCustomizations["ApprovalAuthority"] = {};
            fieldCustomizations["ApprovalAuthority"]["NewForm"] = fieldCustomizations["ApprovalAuthority"]["EditForm"] = function (ctx) {
                try {
                    ctx.CurrentFieldSchema.Choices = getApprovalAuthorityOptionsBasedOnQueryString();
                    setDropdownOnNewFormWhenOnlyOneOption(ctx);
                    return SPFieldChoice_Edit(ctx) + '<uif-message-bar ng-show="routeMessage"> <uif-content><strong>Documents associated to this mission will be routed as follows: </strong><div>{{routeMessage}}</div></uif-content> </uif-message-bar>';

                    function getApprovalAuthorityOptionsBasedOnQueryString() {
                        var org = extractOrgFromQueryString();
                        if (org) {
                            return _.map(jocInBoxConfig.dashboards[org].routes, 'name');
                        } else {
                            return [];
                        }
                    }
                }
                catch (err) {
                    return 'Error parsing column "ApprovalAuthority"';
                }
            };

            /* ChopProcess COLUMN*/
            fieldCustomizations["ChopProcess"] = {};
            fieldCustomizations["ChopProcess"]["View"] = function (ctx) {
                try {
                    var html;
                    if (ctx.ListTitle === "Mission Documents") {
                        if (!ctx.CurrentItem.ChopProcess) {
                            html = "<a class='custombtn' initiatechopbutton chop-dialog-ctx='vm.chopDialogCtx' data-id='" + ctx.CurrentItem.ID + "'>Chop</a>";
                        } else {
                            html = "<a class='disabled-custombtn' initiatechopbutton chop-dialog-ctx='vm.chopDialogCtx' data-chop-process='" + ctx.CurrentItem.ChopProcess + "' data-id='" + ctx.CurrentItem.ID + "'>Chop</a>";
                        }
                    }
                    return STSHtmlDecode(html);
                }
                catch (err) {
                    return 'Error parsing column "ChopProcess"';
                }
            };

            /* Identifier COLUMN*/
            fieldCustomizations["Identifier"] = {};
            fieldCustomizations["Identifier"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "MissionTracker", "EditForm")) {
                        //render as read-only
                        return SPField_FormDisplay_Default(ctx) + "<br/>";
                    }

                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "Identifier"';
                }
            };

            /* FullName COLUMN*/
            fieldCustomizations["FullName"] = {};
            fieldCustomizations["FullName"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "MissionTracker", "EditForm")) {
                        //render as read-only
                        return SPField_FormDisplay_Default(ctx) + "<br/>";
                    }

                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "FullName"';
                }
            };

            /* MissionType COLUMN*/
            fieldCustomizations["MissionType"] = {};
            fieldCustomizations["MissionType"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "MissionTracker", "EditForm")) {
                        //render as read-only
                        return SPField_FormDisplay_Default(ctx);
                    }

                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "MissionType"';
                }
            };

            /* Organization COLUMN*/
            fieldCustomizations["Organization"] = {};
            fieldCustomizations["Organization"]["NewForm"] = fieldCustomizations["Organization"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "MissionTracker", "EditForm")) {
                        //render as read-only
                        return SPField_FormDisplay_Default(ctx);
                    }

                    ctx.CurrentFieldSchema.Choices = trimOrganizationChoicesBasedOnQueryString(ctx.CurrentFieldSchema.Choices);
                    setDropdownOnNewFormWhenOnlyOneOption(ctx);
                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "Organization"';
                }
            };

             /* PocName COLUMN*/
            fieldCustomizations["PocName"] = {};
            fieldCustomizations["PocName"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "RFI", "EditForm") && _.includes(['respond', 'reopen'], getStateForRfiForm(ctx))) {
                        //render as read-only
                        prepareUserFieldValue(ctx);
                        return SPFieldUser_Display(ctx);
                    }

                    return SPClientPeoplePickerCSRTemplate(ctx);
                }
                catch (err) {
                    return 'Error parsing column "PocName"';
                }
            };

            /* OriginatorSender COLUMN*/
            fieldCustomizations["OriginatorSender"] = {};
            fieldCustomizations["OriginatorSender"]["NewForm"] = fieldCustomizations["OriginatorSender"]["EditForm"] = function (ctx) {
                try {
                    ctx.CurrentFieldSchema.Choices = trimOrganizationChoicesBasedOnQueryString(ctx.CurrentFieldSchema.Choices);
                    setDropdownOnNewFormWhenOnlyOneOption(ctx);
                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "OriginatorSender"';
                }
            };

             /* RespondentName COLUMN*/
            fieldCustomizations["RespondentName"] = {};
            fieldCustomizations["RespondentName"]["EditForm"] = function (ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "RFI", "EditForm") && _.includes(['reopen'], getStateForRfiForm(ctx))) {
                        //render as read-only
                        prepareUserFieldValue(ctx);
                        return SPFieldUser_Display(ctx);
                    }

                    return SPClientPeoplePickerCSRTemplate(ctx);
                }
                catch (err) {
                    return 'Error parsing column "RespondentName"';
                }
            };

            // Register the rendering template
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                    Fields: {
                        'ActionsHtml': { 'View': fieldCustomizations["ActionsHtml"]["View"] },
                        'ApprovalAuthority': { 'EditForm': fieldCustomizations["ApprovalAuthority"]["EditForm"], 'NewForm': fieldCustomizations["ApprovalAuthority"]["NewForm"] },
                        'ChopProcess': { 'View': fieldCustomizations["ChopProcess"]["View"] },
                        'Identifier': { 'EditForm': fieldCustomizations["Identifier"]["EditForm"] },
                        'FullName': { 'EditForm': fieldCustomizations["FullName"]["EditForm"] },
                        'MissionType': { 'EditForm': fieldCustomizations["MissionType"]["EditForm"] },
                        'Organization': { 'EditForm': fieldCustomizations["Organization"]["EditForm"], 'NewForm': fieldCustomizations["Organization"]["NewForm"] },
                        'OriginatorSender': { 'EditForm': fieldCustomizations["OriginatorSender"]["EditForm"], 'NewForm': fieldCustomizations["OriginatorSender"]["NewForm"] },
                        'PocName': { 'EditForm': fieldCustomizations["PocName"]["EditForm"] },
                        'RespondentName': { 'EditForm': fieldCustomizations["RespondentName"]["EditForm"] }
                    }

                }
            });

            function getDefaultHtmlOutput(ctx, field, listItem, listSchema) {
                /**
                 * USAGE:
                 * var output = getDefaultFieldHtml (ctx, ctx.CurrentFieldSchema, ctx.CurrentItem, ctx.ListSchema);
                 */
                var fieldCopy = jQuery.extend(true, {}, field);
                var ctxCopy = jQuery.extend(true, {}, ctx);
                delete fieldCopy.fieldRenderer;
                ctxCopy.Templates.Fields[field.Name] = null;
                var spmgr = new SPMgr();
                var output = spmgr.RenderField(ctxCopy, fieldCopy, listItem, listSchema);
                // do whatever you need to do here
                return output;
            }

            function getDefaultHtmlOutput_v1(ctx, field, listItem, listSchema) {
                //https://threewill.com/client-side-rendering-sharepoint-2013/
                var renderingTemplateToUse = null;

                var fieldRenderMap = {
                    Computed: new ComputedFieldRenderer(field.Name),
                    Attachments: new AttachmentFieldRenderer(field.Name),
                    User: new UserFieldRenderer(field.Name),
                    UserMulti: new UserFieldRenderer(field.Name),
                    URL: new UrlFieldRenderer(field.Name),
                    Note: new NoteFieldRenderer(field.Name),
                    Recurrence: new RecurrenceFieldRenderer(field.Name),
                    CrossProjectLink: new ProjectLinkFieldRenderer(field.Name),
                    AllDayEvent: new AllDayEventFieldRenderer(field.Name),
                    Number: new NumberFieldRenderer(field.Name),
                    BusinessData: new BusinessDataFieldRenderer(field.Name),
                    Currency: new NumberFieldRenderer(field.Name),
                    DateTime: new DateTimeFieldRenderer(field.Name),
                    Text: new TextFieldRenderer(field.Name),
                    Lookup: new LookupFieldRenderer(field.Name),
                    LookupMulti: new LookupFieldRenderer(field.Name),
                    WorkflowStatus: new RawFieldRenderer(field.Name)
                };

                if (field.XSLRender == '1') {
                    renderingTemplateToUse = new RawFieldRenderer(field.Name);
                }
                else {

                    renderingTemplateToUse = fieldRenderMap[field.FieldType];
                    if (renderingTemplateToUse == null) {
                        renderingTemplateToUse = fieldRenderMap[field.Type];
                    }
                }

                if (renderingTemplateToUse == null) {
                    renderingTemplateToUse = new FieldRenderer(field.Name);
                }

                return renderingTemplateToUse.RenderField(ctx, field, listItem, listSchema);
            }

            function isDataEntryFormFor(ctx, listName, formType) {
                return _.includes(document.location.pathname, "/Lists/" + listName + "/") && ctx.BaseViewID === formType;
            }

            function setDropdownOnNewFormWhenOnlyOneOption(ctx) {
                if (ctx.BaseViewID === "NewForm" && ctx.CurrentFieldSchema.Choices.length === 1) {
                    //only one choice so preset for the user
                    ctx.CurrentFieldValue = ctx.CurrentFieldSchema.Choices[0];
                }
            }

            function trimOrganizationChoicesBasedOnQueryString(existingOptions) {
                var org = extractOrgFromQueryString();
                if (org) {
                    return _.intersection(existingOptions, jocInBoxConfig.dashboards[org].optionsForChoiceField);
                } else {
                    return existingOptions;
                }
            }
        }

        function modifyListViewWebpartsPostRender(ctx) {
            var webPartDiv = getWebPartDiv(ctx);

            if(webPartDiv){
                addExpandCollapseButtons(ctx, webPartDiv);
                disableNavigationToSharepointLists(ctx, webPartDiv);
                hideToolbarForInboundMessages(ctx, webPartDiv);
            }
            function addExpandCollapseButtons(ctx, webPartDiv) {
                /**
                 * ISSUES with LVWP that Group By Collapsed=TRUE are well documented:
                 * https://social.technet.microsoft.com/Forums/en-US/cf86ffbc-14e9-4310-8925-76bea6d9e314/sharepoint-list-when-grouped-and-default-view-is-collapsed-will-not-expand?forum=sharepointgeneralprevious
                 * https://prasadpathak.wordpress.com/2014/07/10/sharepoint-2013-item-template-not-called-in-jslink-with-group-rendering/
                 * https://ybbest.wordpress.com/2011/07/05/fix-the-ajax-javascript-issues-with-group-by-for-listview-and-listviewbyquery/
                 */
                var isGroupByView = !!ctx.ListSchema.group1;
                if (isGroupByView) {
                    addButton('Expand All');
                    addButton('Collapse All');
                }

                function addButton(text) {
                    var chromeTitle = webPartDiv.find(".ms-webpart-titleText");
                    var faClass, clickFunc;
                    if (text === "Expand All") {
                        faClass = 'fa-plus-square-o';
                        clickFunc = expandAll;
                    } else if (text === "Collapse All") {
                        faClass = 'fa-minus-square-o';
                        clickFunc = collapseAll;
                    }
                    if (chromeTitle.find("a[title='" + text + "']").size() === 0) {
                        var button = $('<a style="cursor:pointer;margin-left:3px;" title="' + text + '"><i class="fa ' + faClass + '" aria-hidden="true"></i></a>');
                        chromeTitle.append(button);
                        button.on('click', clickFunc);
                    }
                }

                function collapseAll() {
                    webPartDiv.find("img.ms-commentcollapse-icon").click();
                }

                function expandAll() {
                    webPartDiv.find("img.ms-commentexpand-icon").click();
                }
            }

            function disableNavigationToSharepointLists(ctx, webPartDiv) {
                var wpPages = [
                    '/sitepages/comms.aspx',
                    '/sitepages/excon.aspx',
                    '/sitepages/soatg.aspx',
                    '/sitepages/socc.aspx',
                    '/sitepages/sotg.aspx'
                ];
                var shouldDisableLinks = _.some(wpPages, function (item) {
                    return _.includes(document.location.pathname.toLowerCase(), item);
                });

                if (shouldDisableLinks) {
                    //prevents users from navigating to backend lists
                    webPartDiv.find(".ms-webpart-titleText>a").removeAttr("href");
                }
            }

            function hideToolbarForInboundMessages(ctx, webPartDiv) {
                //ASSUMPTION: List Views for web part looks like "LVWP SOCC.aspx Inbound Messages"
                if (_.includes(ctx.viewTitle, 'Inbound Messages')) {
                    webPartDiv.find("table[id^='Hero-']").remove();
                }
            }

            function getWebPartDiv(ctx) {
                /**
                 * Webparts are automatically assigned id attributes, so if eight webparts on the screen:
                 * <div id="MSOZoneCell_WebPartWPQ8"></div>
                 */
                return $("div[id='MSOZoneCell_WebPart" + ctx.wpq + "']");
            }
        }

        function modifyListFormsPostRender(ctx){
            customizeRfiForm(ctx);
            customizeMissionTrackerForm(ctx);

            function customizeMissionTrackerForm(ctx){
                if(!_.includes(document.location.pathname.toUpperCase(), "/LISTS/MISSIONTRACKER/") ){ return ""; }
                var fieldName = ctx.ListSchema.Field[0].Name;
                removeHelpTextWhenReadOnlyField(fieldName);
            }
            function customizeRfiForm(ctx){
                var formState = getStateForRfiForm(ctx);

                if(formState){
                    var fieldName = ctx.ListSchema.Field[0].Name;
                    hideRow(fieldName, formState);
                    makeFieldReadOnly(fieldName, formState);
                    setFieldThenMakeReadOnly(fieldName, formState);
                    removeHelpTextWhenReadOnlyField(fieldName);
                }

                function hideRow(fieldName, formState){
                    var fieldsToHide = {
                        "Status": ['new'],
                        "ManageRFI": ['respond', 'reopen'],
                        "RespondentName": ['new', 'edit'],
                        "RespondentPhone": ['new', 'edit'],
                        "ResponseToRequest": ['new', 'edit'],
                        "DateClosed": ['new', 'edit'],
                        "ResponseSufficient": ['new', 'edit', 'respond'],
                        "InsufficientExplanation": ['new', 'edit', 'respond']
                    };
                    
                    var fieldCustomization = fieldsToHide[fieldName];
                    if(_.includes(fieldCustomization, formState)){
                        SPUtility.GetSPFieldByInternalName(fieldName).Hide();
                    }
                }

                function makeFieldReadOnly(fieldName, formState){
                    var readOnlyFields = {
                        "Title": ['respond', 'reopen'],
                        "Status": ['edit', 'respond', 'reopen'],
                        "RfiTrackingNumber": ['respond', 'reopen'],
                        "Details": ['respond', 'reopen'],
                        "Priority": ['respond', 'reopen'],
                        "LTIOV": ['respond', 'reopen'],
                        "PocPhone": ['respond', 'reopen'],
                        "PocOrganization": ['respond', 'reopen'],
                        "RecommendedOPR": ['reopen'],
                        "RespondentPhone": ['reopen'],
                        "ResponseToRequest": ['reopen'],
                        "DateClosed": ['reopen']
                    };
                    
                    var fieldCustomization = readOnlyFields[fieldName];
                    if(_.includes(fieldCustomization, formState)){
                        SPUtility.GetSPFieldByInternalName(fieldName).MakeReadOnly();
                    }
                }

                function setFieldThenMakeReadOnly(fieldName, formState){
                    if(fieldName === "ResponseSufficient" && formState === "reopen"){
                        SPUtility.GetSPFieldByInternalName(fieldName).SetValue('No').MakeReadOnly();
                    }
                }
            }
        }

        function registerPostRenderEvent() {
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                    OnPostRender: function (ctx) {
                        modifyListViewWebpartsPostRender(ctx);
                        modifyListFormsPostRender(ctx);
                    }
                }
            });

        }   
    }

    function extractOrgFromQueryString() {
        // /TF16/Lists/MissionTracker/NewForm.aspx?Source=/TF16/SitePages/socc.aspx?org=SOCC
        var isChildWindow = window.parent.location.href !== window.location.href;
        var selectedOrg = (isChildWindow) ? _.getQueryStringParam("org", window.parent.location.href) : _.getQueryStringParam("org", window.location.href);
        return selectedOrg;
    }

    function getStateForRfiForm(ctx){
        if(!_.includes(document.location.pathname.toUpperCase(), "/LISTS/RFI/") ){ return ""; }
        var qsParamAction = _.getQueryStringParam("action");
        if(ctx.BaseViewID === "NewForm"){
            return "new";
        } else if(ctx.BaseViewID === "EditForm" && !qsParamAction){
            return "edit";
        } else if(ctx.BaseViewID === "EditForm" && qsParamAction === "Respond"){
            return "respond";
        } else if(ctx.BaseViewID === "EditForm" && qsParamAction === "Reopen"){
            return "reopen";
        }
    }

    function prepareUserFieldValue(ctx) { 
        var item = ctx['CurrentItem']; 
        var userField = item[ctx.CurrentFieldSchema.Name]; 
        var fieldValue = ""; 

        for (var i = 0; i < userField.length; i++) { 
            fieldValue += userField[i].EntityData.SPUserID + SPClientTemplates.Utility.UserLookupDelimitString + userField[i].DisplayText; 

            if ((i + 1) != userField.length) { 
                fieldValue += SPClientTemplates.Utility.UserLookupDelimitString 
            } 
        } 

        ctx["CurrentFieldValue"] = fieldValue; 
    }

    function removeHelpTextWhenReadOnlyField(fieldName){
        /**
         * <td class="ms-formbody">
         *      user input control here
         *      <span class="ms-metadata">Some contextual help for end user </span>
         * </td>
         */
        var spUtilityField = SPUtility.GetSPFieldByInternalName(fieldName);
        var formbodyCell = $(spUtilityField.ControlsRow.cells[1]);  
        var hiddenUsingSpUtility = (formbodyCell.children("span.ms-metadata").length === 1 && formbodyCell.children(".sputility-readonly").length !==0);
        var isHelpTextOnlyChildElement = (formbodyCell.children().not("br").length === 1 && formbodyCell.children("span.ms-metadata").length === 1);
        if(hiddenUsingSpUtility || isHelpTextOnlyChildElement){
            //if only one child, and that child is help text then hide the help text
            formbodyCell.children("span.ms-metadata").hide();
        }
    }
})();


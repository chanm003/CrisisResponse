/**
 * TODO: read before overriding fields for EditForm:
 * http://sharepoint.stackexchange.com/questions/112506/sharepoint-2013-js-link-return-default-field-rendering
 * 
 * POSSIBLE ISSUES with Minimal Download Strategy, should we be register templates differently....
 * https://blogs.msdn.microsoft.com/sridhara/2013/02/08/register-csr-override-on-mds-enabled-sharepoint-2013-site/
 */
(function ($,_) {
    $(document).ready(overrideCalendarListForm);
    RegisterModuleInit("SiteAssets/displayTemplates.js", registerCustomizations); // CSR-override for MDS enabled site
    registerCustomizations(); //CSR-override for MDS disabled site (because we need to call the entry point function in this case whereas it is not needed for anonymous functions)

    function disableDragAndDrop(){
        //should be invoked after DragDrop.js: ExecuteOrDelayUntilScriptLoaded(disableDragAndDrop, "DragDrop.js");
        g_uploadType = DragDropMode.NOTSUPPORTED;
        SPDragDropManager.DragDropMode = DragDropMode.NOTSUPPORTED;
    }

    function registerCustomizations() {
        SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {
            customizeFieldRendering();
            registerPreRenderEvent();
            registerPostRenderEvent();
            registerOverrideHeader();
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

            // Register the rendering template
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                    Fields: {
                        //LIST(s): Inject, RFI 
                        'ActionsHtml': { 'View': renderActionButton },
                        //LIST(s): Mission Tracker
                        'ApprovalAuthority': { 'EditForm': renderApprovalAuthorityDropdown, 'NewForm': renderApprovalAuthorityDropdown },
                        //LIST(s): Mission Documents
                        'ChopProcessInitiationDate': { 'View': renderActionButton },
                        //LIST(s): Mission Tracker
                        'Identifier': { 'EditForm': renderAsReadOnly },
                        //LIST(s): Mission Tracker
                        'FullName': { 'EditForm': renderAsReadOnly },
                        //LIST(s): Mission Documents
                        'MessageOriginatorSender': { 'EditForm': trimDropdownWithOrganizations },
                        //LIST(s): Mission Documents
                        'MessageRecipients': { 'EditForm': removeMultiChoiceOptionBasedOnQueryString },
                        //LIST(s): Mission Tracker
                        'MissionType': { 'EditForm': renderAsReadOnly },
                        //LIST(s): AAR, Calendar, CCIR, Help Desk, Mission Documents, Mission Tracker, Phonebook, Watch Log
                        'Organization': { 'EditForm': renderOrganizationDropdown, 'NewForm': renderOrganizationDropdown },
                        //LIST(s): Inject, Message Traffic 
                        'OriginatorSender': { 'NewForm': renderOrganizationDropdown, 'EditForm': renderOrganizationDropdown },
                        //LIST(s): Participating Organizations
                        'ParticipatingOrganizations': { 'NewForm': preselectCheckboxForOrganization },
                        //LIST(s): RFI 
                        'PocName': { 'EditForm': renderPeoplePicker },
                        //LIST(s): RFI 
                        'PocOrganization': { 'EditForm': renderOrganizationDropdown, 'NewForm': renderOrganizationDropdown },
                        //LIST(s): Inject, Message Traffic 
                        'Receiver': { 'NewForm': removeMultiChoiceOptionBasedOnQueryString, 'EditForm': removeMultiChoiceOptionBasedOnQueryString  },
                        //LIST(s): RFI 
                        'RespondentName': { 'EditForm': renderPeoplePicker }
                    }
                }
            });

            function getDefaultHtmlOutput(ctx){
                // get the default templates for each field type
                var templatesByType = SPClientTemplates._defaultTemplates.Fields.default.all.all;
                // get the default templates for the current field type
                var currentTemplates = templatesByType[ctx.CurrentFieldSchema.Type];
                // get the render function by view id (i.e. NewForm, View, etc.)
                var currentRenderFunc = currentTemplates[ctx.BaseViewID];
                return currentRenderFunc(ctx);
            }

            function getDefaultHtmlOutput_v2(ctx, field, listItem, listSchema) {
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

            function preselectCheckboxForOrganization(ctx){
                var org = _.extractOrgFromQueryString();
                if(_.includes(ctx.CurrentFieldSchema.MultiChoices, org)){
                    ctx.CurrentFieldValue = ';#'+org+';#';
                }
                return SPFieldMultiChoice_Edit(ctx);
            }

            function removeMultiChoiceOptionBasedOnQueryString(ctx){
                if(isUserEditingInboundMessage(ctx)){
                    return renderAsReadOnly(ctx);
                } 

                try {
                    ctx.CurrentFieldSchema.MultiChoices = trimSingleChoiceBasedOnQueryString(ctx.CurrentFieldSchema.MultiChoices);
                    return SPFieldMultiChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }
            };

            function renderActionButton(ctx) {
                try {
                    var html;
                    if (ctx.ListTitle === "RFI") {
                        var buttonText = (ctx.CurrentItem.Status === "Open") ? "Respond" : "Review";
                        html = "<a class='custombtn' rfibutton data-id='" + ctx.CurrentItem.ID + "'>" + buttonText + "</a>";
                    } else if (ctx.ListTitle === "Inject") {
                        var injectButtonClass = (ctx.CurrentItem.Status === 'Completed') ? 'disabled-custombtn' : 'custombtn';
                        html = "<a class='"+injectButtonClass+"' injectbutton data-id='" + ctx.CurrentItem.ID + "' data-status='" + ctx.CurrentItem.Status + 
                            "' data-receivers='" + ctx.CurrentItem.Receiver.join(';') + "' title='Publish this scenario to " + ctx.CurrentItem.Receiver.join(', ') + "'>Inject</a>";
                    } else if (ctx.ListTitle === "Mission Documents") {
                        if (!ctx.CurrentItem.ChopProcessInitiationDate) {
                            html = "<a class='custombtn' initiatechopbutton data-id='" + ctx.CurrentItem.ID + "'>Chop</a>";
                        } else {
                            html = "<a class='disabled-custombtn' initiatechopbutton data-chop-process='" + ctx.CurrentItem.ChopProcessInitiationDate + "' data-id='" + ctx.CurrentItem.ID + "'>Chop</a>";
                        }
                    }
                    return STSHtmlDecode(html);
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }
            };

            function renderAsReadOnly(ctx){
                if(_.includes(['Choice', 'Text'], ctx.CurrentFieldSchema.Type)){
                    return SPField_FormDisplay_Default(ctx) + "<br/>";
                } else if(ctx.CurrentFieldSchema.Type === "MultiChoice"){
                    return _.filter(ctx.CurrentFieldValue.split(';#')).join('; ') + "<br/>";
                }
            }

            function renderApprovalAuthorityDropdown(ctx) {
                if(ctx.BaseViewID === "EditForm" && _.extractOrgFromQueryString() !== ctx.CurrentItem.Organization){
                    return '<span class="readOnlyLabel">' + SPField_FormDisplay_Default(ctx) + '</span>';
                }

                try {
                    var infoMessage_explicitSequence = '<span style="display:none;"><uif-message-bar ng-show="routeMessage"> <uif-content><strong>Documents associated to this mission will be routed as follows: </strong><div>{{routeMessage}}</div></uif-content> </uif-message-bar></span>'; 
                    
                    var approvalAuthorities = getApprovalAuthorityOptionsBasedOnQueryString();
                    ctx.CurrentFieldSchema.Choices = _.map(approvalAuthorities, 'name');
                    setDropdownOnNewFormWhenOnlyOneOption(ctx);
                    return buildHtmlForControl(ctx, approvalAuthorities)
                    
                    function getApprovalAuthorityOptionsBasedOnQueryString() {
                        var org = _.extractOrgFromQueryString();
                        if (org) {
                            return jocInBoxConfig.dashboards[org].routes;
                        } else {
                            return [];
                        }
                    }

                    function buildHtmlForControl(ctx, approvalAuthorities){
                        var infoMessage_customDescriptions = '<br />';
                        infoMessage_customDescriptions = ' <span id="ms-pageDescriptionImage" style="cursor:pointer;" ng-click="showApprovalLevels()">&nbsp;</span>';
                        return SPFieldChoice_Edit(ctx).replace('<br />', infoMessage_customDescriptions);
                    }
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }
            };

            function renderOrganizationDropdown(ctx) {
                try {
                    if (isDataEntryFormFor(ctx, "MissionTracker", "EditForm")) {
                        return renderAsReadOnly(ctx);
                    }

                    if(isUserEditingInboundMessage(ctx)){
                        return renderAsReadOnly(ctx);
                    }

                    if(ctx.CurrentFieldSchema.FieldType !== "Choice"){
                        return getDefaultHtmlOutput(ctx);
                    }

                    return trimDropdownWithOrganizations(ctx);
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }
            };

            function renderPeoplePicker(ctx){
                var isReadOnly;

                if(ctx.CurrentFieldSchema.Name === "PocName"){
                    isReadOnly = isDataEntryFormFor(ctx, "RFI", "EditForm") && _.includes(['respond', 'reopen'], getStateForRfiForm(ctx));
                } else if(ctx.CurrentFieldSchema.Name === "RespondentName"){
                    isReadOnly = isDataEntryFormFor(ctx, "RFI", "EditForm") && _.includes(['reopen'], getStateForRfiForm(ctx));
                }

                try {
                    if (isReadOnly) {
                        //render as read-only
                        prepareUserFieldValue(ctx);
                        return SPFieldUser_Display(ctx);
                    } else{
                        return SPClientPeoplePickerCSRTemplate(ctx);
                    }
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }    
            }

            function setDropdownOnNewFormWhenOnlyOneOption(ctx) {
                if(ctx.CurrentFieldSchema.Choices.length === 1 && !ctx.CurrentFieldValue) {
                    //only one choice so preset for the user
                    ctx.CurrentFieldValue = ctx.CurrentFieldSchema.Choices[0];
                }
            }

            function trimDropdownWithOrganizations(ctx){
                try {
                    ctx.CurrentFieldSchema.Choices = trimOrganizationChoicesBasedOnQueryString(ctx.CurrentFieldSchema.Choices);
                    setDropdownOnNewFormWhenOnlyOneOption(ctx);
                    return SPFieldChoice_Edit(ctx);
                }
                catch (err) {
                    return 'Error parsing column "'+ctx.CurrentFieldSchema.Name+'"';
                }
            };

            function trimOrganizationChoicesBasedOnQueryString(existingOptions) {
                var org = _.extractOrgFromQueryString();
                if (org) {
                    return _.intersection(existingOptions, jocInBoxConfig.dashboards[org].optionsForChoiceField);
                } else {
                    return existingOptions;
                }
            }

            function trimSingleChoiceBasedOnQueryString(existingOptions) {
                var org = _.extractOrgFromQueryString();
                if (org) {
                    return _.reject(existingOptions, function(option){ return option === org; });
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
                hideToolbarForSpecificWebparts(ctx, webPartDiv);
                ensureUploadFormIsNotDialog(ctx, webPartDiv);
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
                var anchorTag = webPartDiv.find(".ms-webpart-titleText>a");
                var redirectUrl = anchorTag.attr("href");
                var shouldDisableLinks = (redirectUrl === '%23' || redirectUrl === '#');

                if (shouldDisableLinks) {
                    //prevents users from navigating to backend lists
                    anchorTag.removeAttr("href");
                }
            }

            function ensureUploadFormIsNotDialog(ctx, webPartDiv){
                if(ctx.ListTitle === "Mission Documents"){
                    var uploadBtn = webPartDiv.find(".js-listview-qcbUploadButton");
                    uploadBtn.removeAttr("onclick");
                    uploadBtn.on("click", function(){
                        window.location.href =  _spPageContextInfo.webServerRelativeUrl + 
                            '/_layouts/15/Upload.aspx?List='+ctx.listName +
                            '&Source='+document.location.href;
                    });
                }
            }

            function hideListViewWebPartColumn(ctx, webPartDiv, columnName){
                var column = _.filter(ctx.ListSchema.Field, {Name: columnName});
                if(column){
                    var cell = $("div [name='" + columnName + "']").closest('th');
                    var cellIndex = cell[0].cellIndex + 1;
                    webPartDiv.find('td:nth-child(' + cellIndex + ')').hide(); 
                    webPartDiv.find('th:nth-child(' + cellIndex + ')').hide(); 
                }
            }

            function hideToolbarForSpecificWebparts(ctx, webPartDiv) {
                //ASSUMPTION: List Views for web part looks has title with the string "Inbound Messages"
                if (_.includes(ctx.viewTitle, 'Inbound Messages') || _.includes(ctx.viewTitle, 'Daily Products')) {
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

        function modifyListViewWebpartsFooter(ctx) {
            if(ctx.ListTemplate === "101"){
                ctx.ListSchema.NoListItem = "There are no files to show in this view";
            }
        }

        function modifyListFormsPostRender(ctx){
            customizeRfiForm(ctx);
            customizeMissionTrackerForm(ctx);
            customizeMissionDocumentsForm(ctx);
            customizeMessageTrafficForm(ctx);

            function customizeMessageTrafficForm(ctx){
               
                if(!isUserEditingInboundMessage(ctx)){ return ""; }
                var fieldName = ctx.ListSchema.Field[0].Name;
                makeFieldReadOnly(fieldName);
                removeHelpTextWhenReadOnlyField(fieldName);

                function makeFieldReadOnly(fieldName){
                    var readOnlyFields = ['Title', 'DateTimeGroup', 'TaskInfo', 'Initials', 'Significant', 'Comments'];
                    if(_.includes(readOnlyFields, fieldName)){
                        SPUtility.GetSPFieldByInternalName(fieldName).MakeReadOnly();
                    }
                }
            }

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
                        "RfiTrackingNumber": ['new'],
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
                        "RfiTrackingNumber": ['reopen'],
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
                        //SPUtility.GetSPFieldByInternalName(fieldName).SetValue('No').MakeReadOnly();
                    }
                }
            }

            function customizeMissionDocumentsForm(ctx){
                if(!_.includes(document.location.pathname.toUpperCase(), "/MISSIONDOCUMENTS/FORMS/EDITFORM.ASPX") ){ return ""; }
                var field = ctx.ListSchema.Field[0];
                hideRow(field.Name);

                function hideRow(fieldName){
                    var fieldsToHide = ['MessageTitle', 'MessageDetails', 'MessageDateTimeGroup', 'MessageOriginatorSender', 'MessageRecipients', 'SignificantMessage']

                    if(_.includes(fieldsToHide, fieldName)){
                        SPUtility.GetSPFieldByInternalName(fieldName).Hide();
                    }
                    hideSoacRelatedRows(fieldName);

                    function hideSoacRelatedRows(fieldName){
                        if(!_.includes(["FlaggedForSoacDailyUpdate", "DailyProductDate"], fieldName)){ return; }
                        //logic for hiding  is based on querystring
                        var hideColumnsPertinentToSOAC = true
                        var org = _.extractOrgFromQueryString();
                        if(org){
                            var orgConfig = jocInBoxConfig.dashboards[org];
                            if(orgConfig){
                                if(orgConfig.orgType === "Air Component"){
                                    hideColumnsPertinentToSOAC = false;
                                }
                            }
                        }
                        if(hideColumnsPertinentToSOAC){
                            SPUtility.GetSPFieldByInternalName(fieldName).Hide();
                        }
                    }
                }
            }
        }

        function registerOverrideHeader() {
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                     Header: showViewSelectorMenu
                }
            });

            function showViewSelectorMenu(renderCtx, columnNames){
                if(_.includes(ctx.listUrlDir, '/Lists/Inject')){
                    ClientPivotControl.prototype.SurfacedPivotCount = 4;
                    renderCtx.ListSchema.RenderViewSelectorPivotMenuAsync = "True";
                }
                return RenderHeaderTemplate(renderCtx, columnNames);   
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

        function registerPreRenderEvent() {
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                    OnPreRender: function (ctx) {
                        modifyListViewWebpartsFooter(ctx);
                    }
                }
            });

        }   
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

    function isDataEntryFormFor(ctx, listName, formType) {
        return _.includes(document.location.pathname, "/Lists/" + listName + "/") && ctx.BaseViewID === formType;
    }

    function isUserEditingInboundMessage(ctx){
        if (isDataEntryFormFor(ctx, "MessageTraffic", "EditForm")){
            var org = _.extractOrgFromQueryString();
            if(org){
                if(ctx.CurrentItem){
                    return ctx.CurrentItem.OriginatorSender !== org;
                } else {
                    return ctx.ListData.Items[0].OriginatorSender !== org;
                }
            }
        }
        
        return false;
    }

    function overrideCalendarListForm(){
        var url = document.location.pathname.toUpperCase();
        if(!_.includes(url, "/LISTS/CALENDAR/NEWFORM.ASPX") && !_.includes(url, "/LISTS/CALENDAR/EDITFORM.ASPX")){
            //Client-side-rendering display templates do not work for Calendar or Survey lists
            return;
        }
        var org = _.extractOrgFromQueryString();
        var orgDropdown = $(SPUtility.GetSPFieldByInternalName("Organization").Dropdown);

        if(org && orgDropdown){
            var existingOrganizations = _.map(orgDropdown.find("option"), function(option){
                return $(option).val();
            });
            var orgConfig = jocInBoxConfig.dashboards[org];
            if(orgConfig){
                var organizations = _.intersection(existingOrganizations, orgConfig.optionsForChoiceField);
                var selectedOptionOnLoad = orgDropdown.find("option:selected").val();
                orgDropdown.find("option").remove();
                _.each(organizations, function(org){
                    $("<option>").val(org).text(org).appendTo(orgDropdown);
                });

                if(selectedOptionOnLoad){
                    orgDropdown.val(selectedOptionOnLoad);
                }
            }
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
})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);


//http://sharepoint.stackexchange.com/questions/112506/sharepoint-2013-js-link-return-default-field-rendering
(function () {
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

    /* ChopProcess COLUMN*/
    fieldCustomizations["ChopProcess"] = {};
    fieldCustomizations["ChopProcess"]["View"] = function (ctx) {
        try {
            var html;
            if (ctx.ListTitle === "Mission Documents") {
                if(!ctx.CurrentItem.ChopProcess){
                    html = "<a class='custombtn' initiatechopbutton data-id='" + ctx.CurrentItem.ID + "'>Chop</a>";
                } else {
                    var onHoverText = "Process was initiated on " + ctx.CurrentItem.ChopProcess;
                    html = "<a class='disabled-custombtn' title='"+onHoverText+"'>Chop</a>";
                }
            }
            return STSHtmlDecode(html);
        }
        catch (err) {
            return 'Error parsing column "ChopProcess"';
        }
    };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
        Templates: {
            Fields: {
                'ActionsHtml': { 'View': fieldCustomizations["ActionsHtml"]["View"] },
                'ChopProcess': { 'View': fieldCustomizations["ChopProcess"]["View"] }
            }
        }
    });

    /*
    WRAP in document ready:
    Needs to run AFTER all the RegisterSod() invocations that SP2013 master puts near the closing </head> tag*/
    $(document).ready(registerCustomCalloutCustomizationsForDocumentLibrary);

    function getDefaultHtmlOutput(ctx, field, listItem, listSchema) {
        //Alternative approach is documented here: https://threewill.com/client-side-rendering-sharepoint-2013/
        var fieldCopy = jQuery.extend(true, {}, field);
        var ctxCopy = jQuery.extend(true, {}, ctx);
        delete fieldCopy.fieldRenderer;
        ctxCopy.Templates.Fields[field.Name] = null;
        var spmgr = new SPMgr();
        var output = spmgr.RenderField(ctxCopy, fieldCopy, listItem, listSchema);
        // do whatever you need to do here
        return output;
    }

    function registerCustomCalloutCustomizationsForDocumentLibrary() {
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
                onClickCallback: function() { 
                    document.location.href = editPropertiesUrl;
                }
            }));

            // Show the default document library actions
            CalloutOnPostRenderTemplate(ctx, calloutActionMenu);
        }
    }

})();


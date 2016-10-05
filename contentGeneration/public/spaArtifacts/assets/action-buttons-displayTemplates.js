/* ActionsHtml COLUMN*/
(function () {

    var fieldJsLinkOverride = {};
    fieldJsLinkOverride.Templates = {};

    fieldJsLinkOverride.Templates.Fields =
    {
        'ActionsHtml': { 'View': renderAsHTML }
    };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(fieldJsLinkOverride);
    


    function renderAsHTML(ctx) {
        try{
            var parts = ctx.CurrentItem.ActionsHtml.toString().split('-');

            var className = parts[0];
            var btnText = parts[1];
                        
			var btnHtml = "<a class='custombtn' " + className + " data-id='" + ctx.CurrentItem.ID + "'>" + btnText + "</a>";

            return STSHtmlDecode(btnHtml);
        }
        catch(err){
            return 'Error parsing calculated column "ActionsHtml"';
        }
    };
    
    

})();

(function () {

    var fieldJsLinkOverride = {};
    fieldJsLinkOverride.Templates = {};

    fieldJsLinkOverride.Templates.Fields =
    {
        'LinkFilename': { 'View': overrideFileNameLink }  //Internal column name for 'Name'
    };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(fieldJsLinkOverride);

	function overrideFileNameLink(ctx){
		var fileName = ctx.CurrentItem.FileLeafRef;
		var editPropertiesUrl = ctx.editFormUrl+'&ID='+ctx.CurrentItem.ID + "&Source="+encodeURIComponent(document.location.href);
		var viewDocHtml = "<a href='" + ctx.CurrentItem.FileRef +"'>"+fileName+"</a>";
		
		var btnHtml = "<div style='white-space:nowrap;'><a title='Modify the properties for this document' class='custombtn' href='" + editPropertiesUrl +"'>Edit Properties</a> "+ viewDocHtml+ "</div>";

        return STSHtmlDecode(btnHtml);
	}

    
})();
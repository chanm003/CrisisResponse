(function () {
    var fieldOverrides = {};
    
    /* ActionsHtml COLUMN*/
    fieldOverrides["ActionsHtml"] = {};
    fieldOverrides["ActionsHtml"]["View"] = function(ctx) {
        try{
        	var html
			if(ctx.ListTitle === "RFI"){
				var buttonText = (ctx.CurrentItem.Status === "Open") ? "Respond" : "Reopen";                        
				html = "<a class='custombtn' rfibutton data-id='" + ctx.CurrentItem.ID + "'>" + buttonText + "</a>";
			}
            return STSHtmlDecode(html);
        }
        catch(err){
            return 'Error parsing calculated column "ActionsHtml"';
        }
    }; 
    
    /* LinkFilename COLUMN aka "Name" column in a document library*/
    fieldOverrides["LinkFilename"] = {};
    fieldOverrides["LinkFilename"]["View"] = function(ctx){
		var fileName = ctx.CurrentItem.FileLeafRef;
		var editPropertiesUrl = ctx.editFormUrl+'&ID='+ctx.CurrentItem.ID + "&Source="+encodeURIComponent(document.location.href);
		var viewDocHtml = "<a href='" + ctx.CurrentItem.FileRef +"'>"+fileName+"</a>";
		
		var btnHtml = "<div style='white-space:nowrap;'><a title='Modify the properties for this document' class='custombtn' href='" + editPropertiesUrl +"'>Edit Properties</a> "+ viewDocHtml+ "</div>";

        return STSHtmlDecode(btnHtml);
	}
    
    
     // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
    	Templates: {
    		Fields: {
    			'ActionsHtml': { 'View': fieldOverrides["ActionsHtml"]["View"] },
    			'LinkFilename': { 'View': fieldOverrides["LinkFilename"]["View"]}
    		}
    	}
    });
    

})();

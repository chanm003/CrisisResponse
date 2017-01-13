(function ($,_) {

	var routeConfigItems = getRouteConfigItems();
	associateRoutesToDashboard(routeConfigItems);
	
	function associateRoutesToDashboard(items){
		_.each(jocInBoxConfig.dashboards, function(orgData, orgName){
			orgData.routes = _.chain(items)
				.filter({Organization: orgName})
				.map(function(item){
					return {
						name: item.Level,
						sequence: item.ApprovalChain.split(';'),
						description: item.Description
					};
				})
				.value();	
		});
	}
	
	function getRouteConfigItems(){
		var items = null;
		jocInBoxConfig.noConflicts.jQuery.ajax({
		    url: jocInBoxConfig.webUrl + "/_api/web/lists/getByTitle('Route Configuration')/items?$orderby=Level",
		    headers: { "Accept": "application/json; odata=verbose" },
		    success: function(response, status, xhr){
		        items = response.d.results;
		    },
		    error: function(response){
		        alert(response.responseJSON.error.message.value);
		    },
		    //SYNCHRONOUS!!
		    async: false
		}); 
		return items; 
	}

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

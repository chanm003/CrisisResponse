'use strict';

angular.module('BlurAdmin', [
	'ngAnimate',
	'ui.bootstrap',
	'ui.sortable',
	'ui.router',
	'toastr',
	'smart-table',
	'ngJsTree',
	'angular-progress-button-styles',
	
	'SharePoint.common',
	'BlurAdmin.common',
	'BlurAdmin.theme',
	'BlurAdmin.pages'
])
.config(['$sceDelegateProvider', 'commonConfigProvider', function ($sce, cfg) {
	// setup events
  	cfg.settings.showDebugNotiSetting = true;

	//override security because our HTML templates violate CORS
	$sce.resourceUrlWhitelist(['**']);
}]);



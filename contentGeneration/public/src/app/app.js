'use strict';

angular.module('BlurAdmin', [
	'ngAnimate',
	'ui.bootstrap',
	'ui.sortable',
	'ui.router',
	'toastr',
	'smart-table',
	'ngJsTree',
    'nya.bootstrap.select',
	'angular-progress-button-styles',
	
	'SharePoint.common',
	'BlurAdmin.common',
	'BlurAdmin.theme',
	'BlurAdmin.pages'
])
.config(['$httpProvider', '$sceDelegateProvider', 'commonConfigProvider', function ($httpProvider, $sce, cfg) {
	// setup events
  	cfg.settings.showDebugNotiSetting = true;

	//override security because our HTML templates violate CORS
	$sce.resourceUrlWhitelist(['**']);

	// enable CORS
	$httpProvider.defaults.useXDomain = true;
  	delete $httpProvider.defaults.headers.common['X-Requested-With'];

}]);



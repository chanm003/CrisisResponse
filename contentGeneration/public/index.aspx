<!DOCTYPE html>
<%@ Page language="C#" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<html lang="en" ng-app="BlurAdmin">
	<head>
<meta name="WebPartPageExpansion" content="full" />
<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Site Creation Wizard</title>


		<link rel="shortcut icon" href="/_layouts/15/images/favicon.ico?rev=23" type="image/vnd.microsoft.com" />
		<!-- build:css({.tmp/serve,src}) styles/vendor.css -->
		<!-- bower:css -->
		<link rel="stylesheet" href="vendor/Ionicons/css/ionicons.css" />
		<link rel="stylesheet" href="vendor/angular-toastr/dist/angular-toastr.css" />
		<link rel="stylesheet" href="vendor/animate.css/animate.css" />
		<link rel="stylesheet" href="vendor/bootstrap/dist/css/bootstrap.css" />
		<link rel="stylesheet" href="vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.css" />
		<link rel="stylesheet" href="vendor/nya-bootstrap-select/dist/css/nya-bs-select.min.css" />
		<link rel="stylesheet" href="vendor/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css" />
		<link rel="stylesheet" href="vendor/font-awesome/css/font-awesome.css" />
		<link rel="stylesheet" href="vendor/govicons/css/govicons.min.css" />
		<link rel="stylesheet" href="vendor/fullcalendar/dist/fullcalendar.css" />
		<link rel="stylesheet" href="vendor/angular-progress-button-styles/dist/angular-progress-button-styles.min.css" />
		<link rel="stylesheet" href="vendor/jstree/dist/themes/default/style.css" />
		<link rel="stylesheet" href="vendor/world-flags-sprite/stylesheets/flags16.css" />
		<link rel="stylesheet" href="vendor/world-flags-sprite/stylesheets/flags32.css" />
		<!-- endbower -->
		<!-- endbuild -->

		<!-- build:css({.tmp/serve,src}) styles/app.css -->
		<!-- inject:css -->
		<link rel="stylesheet" href="src/app/main.css">
		<!-- endinject -->
		<!-- endbuild -->
		<SharePoint:ScriptLink name="MicrosoftAjax.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
		<SharePoint:ScriptLink name="sp.core.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
  		<SharePoint:ScriptLink name="sp.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
  		<SharePoint:ScriptLink name="sp.requestexecutor.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
  		<SharePoint:ScriptLink Name="sp.publishing.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
  		<SharePoint:FormDigest ID="FormDigest1" runat="server"></SharePoint:FormDigest>
</head>
<body>
	<form runat="server" id="aspNetForm">
		<div class="body-bg"></div>
	
		<main ng-if="$pageFinishedLoading" ng-class="{ 'menu-collapsed': $baSidebarService.isMenuCollapsed() }">
			<ba-sidebar></ba-sidebar>
			<page-top></page-top>
		
			<div class="al-main">
				<div class="al-content">
			  		<content-top></content-top>
			  		<div ui-view></div>
				</div>
			</div>
		
			<footer class="al-footer clearfix">
				<div class="al-footer-right"></div>
				<div class="al-footer-main clearfix">
			  		<div class="al-copy"></div>
				  	<ul class="al-share clearfix">
				  	</ul>
				</div>
			</footer>
		
			<back-top></back-top>
		</main>
		
		<div id="preloader" ng-show="!$pageFinishedLoading">
			<div></div>
		</div>	
	</form>
	
	

	<script src="vendor/jquery/dist/jquery.js"></script>
	<script src="vendor/underscore/underscore-min.js" type="text/javascript"></script>
	<script src="vendor/string/dist/string.min.js" type="text/javascript"></script>
		
	<script src="vendor/angular/angular.js"></script>
	<script src="vendor/angular-route/angular-route.js"></script>
	

	
	<script src="vendor/angular-toastr/dist/angular-toastr.tpls.js"></script>

	<script src="vendor/angular-ui-router/release/angular-ui-router.js"></script>
	
	<script src="vendor/angular-bootstrap/ui-bootstrap-tpls.js"></script>
	<script src="vendor/nya-bootstrap-select/dist/js/nya-bs-select.js"></script>
	<script src="vendor/angular-animate/angular-animate.js"></script>
	
	<script src="vendor/moment/moment.js"></script>
	<script src="vendor/fullcalendar/dist/fullcalendar.js"></script>
	
	<script src="vendor/angular-ui-sortable/sortable.js"></script>
	<script src="vendor/angular-smart-table/dist/smart-table.js"></script>
	<script src="vendor/jstree/dist/jstree.js"></script>
	<script src="vendor/ng-js-tree/dist/ngJsTree.js"></script>
	<script src="vendor/angular-progress-button-styles/dist/angular-progress-button-styles.min.js"></script>
	<script src="vendor/bootstrap-switch/dist/js/bootstrap-switch.min.js"></script>
	<script src="vendor/typeahead.js/dist/typeahead.bundle.min.js"></script>


	
	<script src="src/app/schema/schema.js"></script>
	
	<script src="src/app/theme/theme.module.js"></script>
	<script src="src/app/pages/pages.module.js"></script>
	<script src="src/app/theme/components/components.module.js"></script>
	<script src="src/app/pages/tables/tables.module.js"></script>
	<script src="src/app/common/common.js"></script>
	<script src="src/app/common/sharePointUtilities.js"></script>
	
	<script src="src/app/pages/dashboard/dashboard.module.js"></script>
		<script src="src/app/pages/dashboard/dashboardCalendar/DashboardCalendarCtrl.js"></script>
		<script src="src/app/pages/dashboard/dashboardCalendar/dashboardCalendar.directive.js"></script>
		
	<script src="src/app/pages/contentGeneration/contentGeneration.module.js"></script>
		<script src="src/app/pages/contentGeneration/ContentGenerationWizardCtrl.js"></script>


	<script src="src/app/pages/tagsinput.directive.js"></script>
	<script src="src/app/pages/switchOnOff.directive.js"></script>

	<script src="src/app/pages/tables/TablesPageCtrl.js"></script>
	<script src="src/app/app.js"></script>
	
	<script src="src/app/theme/theme.config.js"></script>
	<script src="src/app/theme/theme.configProvider.js"></script>
	<script src="src/app/theme/theme.constants.js"></script>
	<script src="src/app/theme/theme.run.js"></script>
	<script src="src/app/theme/theme.service.js"></script>
	<script src="src/app/theme/components/toastrLibConfig.js"></script>
	<script src="src/app/theme/directives/includeWithScope.js"></script>
	<script src="src/app/theme/directives/scrollPosition.js"></script>
	<script src="src/app/theme/directives/zoomIn.js"></script>
	<script src="src/app/theme/services/baUtil.js"></script>
	<script src="src/app/theme/services/fileReader.js"></script>
	<script src="src/app/theme/services/preloader.js"></script>
	<script src="src/app/theme/services/stopableInterval.js"></script>
	<script src="src/app/theme/components/baPanel/baPanel.directive.js"></script>
	<script src="src/app/theme/components/baPanel/baPanel.service.js"></script>
	<script src="src/app/theme/components/baPanel/baPanelBlur.directive.js"></script>
	<script src="src/app/theme/components/baPanel/baPanelBlurHelper.service.js"></script>
	<script src="src/app/theme/components/baPanel/baPanelSelf.directive.js"></script>
	<script src="src/app/theme/components/baSidebar/BaSidebarCtrl.js"></script>
	<script src="src/app/theme/components/baSidebar/baSidebar.directive.js"></script>
	<script src="src/app/theme/components/baSidebar/baSidebar.service.js"></script>
	<script src="src/app/theme/components/baSidebar/baSidebarHelpers.directive.js"></script>
	<script src="src/app/theme/components/backTop/backTop.directive.js"></script>
	<script src="src/app/theme/components/baWizard/baWizard.directive.js"></script>
	<script src="src/app/theme/components/baWizard/baWizardCtrl.js"></script>
	<script src="src/app/theme/components/baWizard/baWizardStep.directive.js"></script>
	<script src="src/app/theme/components/contentTop/contentTop.directive.js"></script>
	<script src="src/app/theme/components/msgCenter/MsgCenterCtrl.js"></script>
	<script src="src/app/theme/components/msgCenter/msgCenter.directive.js"></script>
	<script src="src/app/theme/components/pageTop/pageTop.directive.js"></script>
	<script src="src/app/theme/components/widgets/widgets.directive.js"></script>
	<script src="src/app/theme/filters/text/removeHtml.js"></script>
	<script src="src/app/theme/filters/image/appImage.js"></script>
	<script src="src/app/theme/filters/image/kameleonImg.js"></script>
	<script src="src/app/theme/filters/image/profilePicture.js"></script>
	<script src="src/app/theme/components/backTop/lib/jquery.backTop.min.js"></script>
</body>
</html>
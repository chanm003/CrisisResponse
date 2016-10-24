<!DOCTYPE html>
<%@ Page language="C#" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<html lang="en" ng-app="BlurAdmin">
	<head>
<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Blur Admin</title>


		<link rel="shortcut icon" href="/_layouts/15/images/favicon.ico?rev=23" type="image/vnd.microsoft.com" />
		<!-- build:css({.tmp/serve,src}) styles/vendor.css -->
		<!-- bower:css -->
		<link rel="stylesheet" href="../bower-components/Ionicons/css/ionicons.css" />
		<link rel="stylesheet" href="../bower-components/angular-toastr/dist/angular-toastr.css" />
		<link rel="stylesheet" href="../bower-components/animate.css/animate.css" />
		<link rel="stylesheet" href="../bower-components/bootstrap/dist/css/bootstrap.css" />
		<link rel="stylesheet" href="../bower-components/bootstrap-tagsinput/dist/bootstrap-tagsinput.css" />
		<link rel="stylesheet" href="../bower-components/font-awesome/css/font-awesome.css" />
		<link rel="stylesheet" href="../bower-components/fullcalendar/dist/fullcalendar.css" />
		<link rel="stylesheet" href="../bower-components/angular-progress-button-styles/dist/angular-progress-button-styles.min.css" />
		<link rel="stylesheet" href="../bower-components/jstree/dist/themes/default/style.css" />
		<!-- endbower -->
		<!-- endbuild -->

		<!-- build:css({.tmp/serve,src}) styles/app.css -->
		<!-- inject:css -->
		<link rel="stylesheet" href="app/main.css">
		<!-- endinject -->
		<!-- endbuild -->
		<SharePoint:ScriptLink name="MicrosoftAjax.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
		<SharePoint:ScriptLink name="sp.core.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
  		<SharePoint:ScriptLink name="sp.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
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
	
	

	<script src="../bower-components/jquery/dist/jquery.js"></script>
	<script src="../bower-components/underscore/underscore-min.js" type="text/javascript"></script>
	<script src="../bower-components/sugar/dist/sugar.min.js" type="text/javascript"></script>
		
	<script src="../bower-components/angular/angular.js"></script>
	<script src="../bower-components/angular-route/angular-route.js"></script>
	

	
	<script src="../bower-components/angular-toastr/dist/angular-toastr.tpls.js"></script>

	<script src="../bower-components/angular-ui-router/release/angular-ui-router.js"></script>
	
	<script src="../bower-components/angular-bootstrap/ui-bootstrap-tpls.js"></script>
	<script src="../bower-components/angular-animate/angular-animate.js"></script>
	
	<script src="../bower-components/moment/moment.js"></script>
	<script src="../bower-components/fullcalendar/dist/fullcalendar.js"></script>
	
	<script src="../bower-components/angular-ui-sortable/sortable.js"></script>
	<script src="../bower-components/angular-smart-table/dist/smart-table.js"></script>
	<script src="../bower-components/jstree/dist/jstree.js"></script>
	<script src="../bower-components/ng-js-tree/dist/ngJsTree.js"></script>
	<script src="../bower-components/angular-progress-button-styles/dist/angular-progress-button-styles.min.js"></script>
	
	<script src="app/schema/schema.js"></script>
	
	<script src="app/theme/theme.module.js"></script>
	<script src="app/pages/pages.module.js"></script>
	<script src="app/theme/components/components.module.js"></script>
	<script src="app/pages/tables/tables.module.js"></script>
	<script src="app/common/common.js"></script>
	<script src="app/common/sharePointUtilities.js"></script>
	
	<script src="app/pages/dashboard/dashboard.module.js"></script>
		<script src="app/pages/dashboard/dashboardCalendar/DashboardCalendarCtrl.js"></script>
		<script src="app/pages/dashboard/dashboardCalendar/dashboardCalendar.directive.js"></script>
		
	<script src="app/pages/contentGeneration/contentGeneration.module.js"></script>
		<script src="app/pages/contentGeneration/createListsWizard/CreateListsWizardCtrl.js"></script>
		<script src="app/pages/contentGeneration/createListsWizard/createListsWizard.directive.js"></script>


		
	
	<script src="app/pages/tables/TablesPageCtrl.js"></script>
	<script src="app/app.js"></script>
	
	<script src="app/theme/theme.config.js"></script>
	<script src="app/theme/theme.configProvider.js"></script>
	<script src="app/theme/theme.constants.js"></script>
	<script src="app/theme/theme.run.js"></script>
	<script src="app/theme/theme.service.js"></script>
	<script src="app/theme/components/toastrLibConfig.js"></script>
	<script src="app/theme/directives/animatedChange.js"></script>
	<script src="app/theme/directives/autoExpand.js"></script>
	<script src="app/theme/directives/autoFocus.js"></script>
	<script src="app/theme/directives/includeWithScope.js"></script>
	<script src="app/theme/directives/ionSlider.js"></script>
	<script src="app/theme/directives/ngFileSelect.js"></script>
	<script src="app/theme/directives/scrollPosition.js"></script>
	<script src="app/theme/directives/trackWidth.js"></script>
	<script src="app/theme/directives/zoomIn.js"></script>
	<script src="app/theme/services/baUtil.js"></script>
	<script src="app/theme/services/fileReader.js"></script>
	<script src="app/theme/services/preloader.js"></script>
	<script src="app/theme/services/stopableInterval.js"></script>
	<script src="app/theme/components/baPanel/baPanel.directive.js"></script>
	<script src="app/theme/components/baPanel/baPanel.service.js"></script>
	<script src="app/theme/components/baPanel/baPanelBlur.directive.js"></script>
	<script src="app/theme/components/baPanel/baPanelBlurHelper.service.js"></script>
	<script src="app/theme/components/baPanel/baPanelSelf.directive.js"></script>
	<script src="app/theme/components/baSidebar/BaSidebarCtrl.js"></script>
	<script src="app/theme/components/baSidebar/baSidebar.directive.js"></script>
	<script src="app/theme/components/baSidebar/baSidebar.service.js"></script>
	<script src="app/theme/components/baSidebar/baSidebarHelpers.directive.js"></script>
	<script src="app/theme/components/backTop/backTop.directive.js"></script>
	<script src="app/theme/components/baWizard/baWizard.directive.js"></script>
	<script src="app/theme/components/baWizard/baWizardCtrl.js"></script>
	<script src="app/theme/components/baWizard/baWizardStep.directive.js"></script>
	<script src="app/theme/components/contentTop/contentTop.directive.js"></script>
	<script src="app/theme/components/msgCenter/MsgCenterCtrl.js"></script>
	<script src="app/theme/components/msgCenter/msgCenter.directive.js"></script>
	<script src="app/theme/components/pageTop/pageTop.directive.js"></script>
	<script src="app/theme/components/widgets/widgets.directive.js"></script>
	<script src="app/theme/filters/text/removeHtml.js"></script>
	<script src="app/theme/filters/image/appImage.js"></script>
	<script src="app/theme/filters/image/kameleonImg.js"></script>
	<script src="app/theme/filters/image/profilePicture.js"></script>
	<script src="app/theme/components/backTop/lib/jquery.backTop.min.js"></script>
</body>
</html>
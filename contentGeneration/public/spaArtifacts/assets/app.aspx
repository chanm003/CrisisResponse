<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" meta:webpartpageexpansion="full"  %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Import Namespace="Microsoft.SharePoint" %> 
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 	
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<style type="text/css">
		.ng-hide {
      		display: none!important;
    	}    
    </style>
    
    <SharePoint:ScriptLink name="MicrosoftAjax.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
	<SharePoint:ScriptLink name="sp.core.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
	<SharePoint:ScriptLink name="sp.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
	<SharePoint:ScriptLink name="sp.requestexecutor.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>

</asp:Content>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
	<div>
		<div ng-controller="ShellController as vm">
  			<section id="content" class="content">
    			<div ui-view class="shuffle-animation"></div>

			    <div ngplus-overlay ngplus-overlay-delay-in="50" ngplus-overlay-delay-out="700" ngplus-overlay-animation="dissolve-animation">			    
			    	<img src="data:image/gif;base64,R0lGODlhGAAYAJECAP///5mZmf///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgACACwAAAAAGAAYAAACQJQvAGgRDI1SyLnI5jr2YUQx10eW5hmeB6Wpkja5SZy6tYzn+g5uMhuzwW6lFtF05CkhxGQm+HKuoDPplOlDFAAAIfkEBQoAAgAsFAAGAAQABAAAAgVUYqeXUgAh+QQFCgACACwUAA4ABAAEAAACBVRip5dSACH5BAUKAAIALA4AFAAEAAQAAAIFVGKnl1IAIfkEBQoAAgAsBgAUAAQABAAAAgVUYqeXUgAh+QQFCgACACwAAA4ABAAEAAACBVRip5dSACH5BAUKAAIALAAABgAEAAQAAAIFVGKnl1IAIfkECQoAAgAsBgAAAAQABAAAAgVUYqeXUgAh+QQJCgACACwAAAAAGAAYAAACJZQvEWgADI1SyLnI5jr2YUQx10eW5omm6sq27gvH8kzX9o3ndAEAIfkECQoAAgAsAAAAABgAGAAAAkCULxFoAAyNUsi5yOY69mFEMddHluYZntyjqY3Vul2yucJo5/rOQ6lLiak0QtSEpvv1lh8l0lQsYqJHaO3gFBQAACH5BAkKAAIALAAAAAAYABgAAAJAlC8RaAAMjVLIucjmOvZhRDHXR5bmGZ7co6mN1bpdsrnCaOf6zkOpzJrYOjHV7Gf09JYlJA0lPBQ/0ym1JsUeCgAh+QQJCgACACwAAAAAGAAYAAACQJQvEWgADI1SyLnI5jr2YUQx10eW5hme3KOpjdW6XbK5wmjn+s5Dqcya2Dox1exn9PSWJeRNSSo+cR/pzOSkHgoAIfkECQoAAgAsAAAAABgAGAAAAkCULxFoAAyNUsi5yOY69mFEMddHluYZntyjqY3Vul2yucJo5/rOQ6nMmtg6MdXsZ/T0liXc6jRbOTHR15SqfEIKACH5BAkKAAIALAAAAAAYABgAAAJAlC8RaAAMjVLIucjmOvZhRDHXR5bmGZ7co6mN1bpdsrnCaOf6zkO4/JgBOz/TrHhC9pYRpNJnqURLwtdT5JFGCgAh+QQJCgACACwAAAAAGAAYAAACPpQvEWgADI1SyLnI5jr2YUQx10eW5jme3NOpTWe5Qpu6tYzn+l558tWywW4lmk/IS6KOr2UtSILOYiYiUVAAADs=">
			      	<div class="page-spinner-message overlay-message">
						{{vm.busyMessage}}</div>
			    </div>
  			</section>
		</div>
		<div id="splash-page" ng-show="showSplash">
  			<div class="page-splash">
    			<div class="page-splash-message">
      				SOCEUR
    			</div>
    			<div class="progress progress-striped active page-progress-bar">
      				<div class="bar"></div>
    			</div>
			</div>
		</div>
	</div>
</asp:Content>
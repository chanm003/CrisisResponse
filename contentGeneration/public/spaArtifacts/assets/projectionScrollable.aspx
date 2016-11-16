<!DOCTYPE html>
<%@ Page language="C#" inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html>
	<head>
		<meta name="GENERATOR" content="Microsoft SharePoint" />
		<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=10"/>
		<meta http-equiv="Expires" content="0" />
		<SharePoint:RobotsMetaTag runat="server"></SharePoint:RobotsMetaTag>
		<SharePoint:StartScript runat="server" />
		<SharePoint:CssLink runat="server" Version="15"/>	
		<SharePoint:CacheManifestLink runat="server"/>
		<SharePoint:ScriptLink language="javascript" name="core.js" OnDemand="true" runat="server" Localizable="false" />
		<SharePoint:ScriptLink language="javascript" name="menu.js" OnDemand="true" runat="server" Localizable="false" />
		<SharePoint:ScriptLink language="javascript" name="callout.js" OnDemand="true" runat="server" Localizable="false" />
		<SharePoint:ScriptLink language="javascript" name="sharing.js" OnDemand="true" runat="server" Localizable="false" />
		<SharePoint:ScriptLink language="javascript" name="suitelinks.js" OnDemand="true" runat="server" Localizable="false" />
		<SharePoint:CustomJSUrl runat="server" />
		<SharePoint:SoapDiscoveryLink runat="server" />
		<SharePoint:CssRegistration Name="/_layouts/15/1033/styles/Themable/corev15.css" runat="server" />
		<style type="text/css">
			.ng-hide {
	      		display: none!important;
	    	}    
    	</style>
	    <SharePoint:ScriptLink name="MicrosoftAjax.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
		<SharePoint:ScriptLink name="sp.core.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
		<SharePoint:ScriptLink name="sp.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>
		<SharePoint:ScriptLink name="sp.requestexecutor.js" OnDemand="true" runat="server" Localizable="false" LoadAfterUI="false"/>	
	</head>
	<body style="overflow: scroll !important">
		<SharePoint:SharePointForm runat="server">
			<asp:ScriptManager id="ScriptManager" runat="server" EnablePageMethods="false" EnablePartialRendering="true" EnableScriptGlobalization="false" EnableScriptLocalization="true" />
			<div ng-view></div>     
		</SharePoint:SharePointForm>
	</body>
</html>

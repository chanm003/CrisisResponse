<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document"  %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Import Namespace="Microsoft.SharePoint" %> 
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SPSWC" Namespace="Microsoft.SharePoint.Portal.WebControls" Assembly="Microsoft.Office.Server.FilterControls, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 	
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<SharePoint:ScriptLink name="MicrosoftAjax.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
    <SharePoint:ScriptLink name="sp.core.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
    <SharePoint:ScriptLink name="sp.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
    <SharePoint:ScriptLink name="sp.requestexecutor.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
    <SharePoint:ScriptLink Name="sp.publishing.js" OnDemand="false" runat="server" Localizable="false" LoadAfterUI="true"/>
</asp:Content>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <!--WebPart Connections-->
	<div id="SPProxyWebPartManagerReplace"></div>

	<table width="100%" border="0" cellpadding="0" cellspacing="0" style="padding:0px 10px 10px 10px;">
        <tr>
            <td colspan="2" valign="top">
                <WebPartPages:WebPartZone AllowCustomization="False" runat="server" FrameType="TitleBarOnly" ID="Top" Title="loc:Top"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
        </tr>
        <tr>
            <td valign="top" width="70%" style="padding-right:5px">
                <WebPartPages:WebPartZone AllowCustomization="False" runat="server" FrameType="TitleBarOnly" ID="Left" Title="loc:Left"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
            <td valign="top" width="30%" style="padding-left:5px">
                <WebPartPages:WebPartZone AllowCustomization="False" runat="server" FrameType="TitleBarOnly" ID="Right" Title="loc:Right"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
        </tr>
        <tr>
            <td colspan="2" valign="top">
                <WebPartPages:WebPartZone AllowCustomization="False" runat="server" FrameType="TitleBarOnly" ID="Bottom" Title="loc:Bottom"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
        </tr>
    </table>

    <!--QueryString Filter WebPart (Must register TagPrefix for Microsoft.Office.Server.FilterControls)-->
    <div id="qsFilterWebpartContainer">
    	<WebPartPages:WebPartZone AllowCustomization="False" AllowLayoutChange="False" runat="server" FrameType="TitleBarOnly" ID="QsFilter" Title="loc:QsFilter"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
	</div>
</asp:Content>
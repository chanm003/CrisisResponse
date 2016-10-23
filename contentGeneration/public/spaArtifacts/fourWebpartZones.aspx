<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document"  %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Import Namespace="Microsoft.SharePoint" %> 
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> 
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderPageTitleInTitleArea" runat="server">
	<SharePoint:ProjectProperty Property="Title" runat="server"/> 	
</asp:Content>
<asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
	<style type="text/css">
    </style>	
</asp:Content>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
	<table width="100%" border="0" cellpadding="0" cellspacing="0" style="padding:5px 10px 10px 10px;">
        <tr>
            <td colspan="3" valign="top">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="Top" Title="loc:Top"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td valign="top" width="70%">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="Left" Title="loc:Left"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
            <td>&nbsp;</td>
            <td valign="top" width="30%">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="Right" Title="loc:Right"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td colspan="3" valign="top">
                <WebPartPages:WebPartZone runat="server" FrameType="TitleBarOnly" ID="Bottom" Title="loc:Bottom"><ZoneTemplate></ZoneTemplate></WebPartPages:WebPartZone>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>
</asp:Content>
<!DOCTYPE html>
<%@ Page language="C#" inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<html>
	<head>
<meta name="WebPartPageExpansion" content="full" />
		<title>Current Operations Summary</title>
		<link rel="stylesheet" type="text/css" href="/_layouts/15/1033/styles/Themable/corev15.css"/>

		<style type="text/css">
			#hdWrap {
			position:fixed;
			top:0;
			left:0;
			width:100%;
			height:40px;
			z-index:10;
			background-color:#fff;
		}
		#hd {
			padding:10px;
		}
		</style>
	</head>
	<body style="overflow: scroll !important">

			<div id="hdWrap">
				<div id="hd">
					<table style="width:100%;margin:0;padding:0" cellpadding="0" cellspacing="0">
						<tr>
							<td colspan="2">
							    <table cellspacing="4" cellpadding="0" style="width:100%">
									<tr>
										<td style="width:99%">&nbsp;</td>
										<td nowrap><a id="orgDropDown">&nbsp;</a></td>	
										<td>|</td>				
										<td><a id="autoscroll" style="text-decoration:underline" href="#">Scroll</a></td>
										<td>|</td>
										<td><a id="autostop" style="text-decoration:underline" href="#">Stop</a></td>
									</tr>
								</table>			
							</td>
						</tr>
					</table>
				</div>
			</div>
    		<div class="appContainer" style="margin-top:40px;">
				<h2>Under Construction...</h2>
			</div>
                                    

	</body>
</html>

(function ($,_) {
    //ATTACH TO GLOBAL
    jocInBoxConfig.postConfigurationUtilities = jocInBoxConfig.postConfigurationUtilities || {};

    /*USAGE:
        performJavascriptShuffle({
            existingUrl: '/siteassets/app.js'
        });
    */
    jocInBoxConfig.postConfigurationUtilities.performJavascriptShuffle = performJavascriptShuffle;
    jocInBoxConfig.postConfigurationUtilities.generateXmlForWebpartConnections = generateXmlForWebpartConnections;

    function performJavascriptShuffle(opts) {
        var pattern = new RegExp('[\.]{1}([0-9]+)[\.]{1}js');

        var replaceText = '.' + moment().format("YYYYMMDDHHmmss") + '.js';
        if(opts.existingUrl.match(pattern)){
            opts.newUrl = opts.existingUrl.replace(pattern, replaceText);
        } else {
            opts.newUrl = opts.existingUrl.replace('.js', replaceText);
        }
        renameFile(opts)
            .then(modifyScriptSrc);

        function modifyScriptSrc(opts) {
            var ctx = SP.ClientContext.get_current();
            var web = ctx.get_web();
            var customActions = web.get_userCustomActions();

            ctx.load(web, 'UserCustomActions');

            ctx.executeQueryAsync(Function.createDelegate(this, setScriptSrc), Function.createDelegate(this, function (sender, args) { }));

            function setScriptSrc() {
                var existingScriptSrc = "~site" + opts.existingUrl;
                var newScriptSrc = "~site" + opts.newUrl;
                var enumerator = customActions.getEnumerator();

                while (enumerator.moveNext()) {
                    var action = enumerator.get_current();

                    var scriptSrc = action.get_scriptSrc() || "";
                    if (scriptSrc.toUpperCase() == existingScriptSrc.toUpperCase()) {
                        action.set_scriptSrc(newScriptSrc);
                        action.update();
                        ctx.executeQueryAsync(Function.createDelegate(this, function () { }), Function.createDelegate(this, function (sender, args) { }));
                    }
                }
            }
        }

        function renameFile(opts) {
            var endpointUrl = _spPageContextInfo.webServerRelativeUrl + "/_api/web/getfilebyserverrelativeurl('" + _spPageContextInfo.webServerRelativeUrl + opts.existingUrl + "')/moveto(newurl='" + _spPageContextInfo.webServerRelativeUrl + opts.newUrl + "',flags=1)";
            return executeJson(endpointUrl, "POST").then(function () { return opts; });
        }
    }

    function generateXmlForWebpartConnections(){
        var opts = { 
            webUrl: _spPageContextInfo.webServerRelativeUrl, 
            fileServerRelativeUrl: document.location.pathname,
                listsToConnect: {
                'Lists/CCIR': { getConsumerField: function(webpartTitle){ return "Organization"; } },
                'Lists/Links': { getConsumerField: function(webpartTitle){ return "Organization"; } },
                'Lists/MessageTraffic': { getConsumerField: function(webpartTitle){ return (webpartTitle === 'Inbound Messages') ? 'Receiver': 'OriginatorSender'; } },
                'Lists/RFI': { getConsumerField: function(webpartTitle){ return "OrgFilter"; } },
                'Lists/WatchLog': { getConsumerField: function(webpartTitle){ return "Organization"; } },
                'MissionDocuments': { getConsumerField: function(webpartTitle){ return "OrgFilter"; } }
            } 
        };

        var _ = jocInBoxConfig.noConflicts.lodash;
        var url = opts.webUrl + "/_api/web/getFileByServerRelativeUrl('"+opts.fileServerRelativeUrl+"')/getlimitedWebpartManager(0)/webparts?$expand=WebPart/Properties";
                
        return executeJson(url)
        .then(function(response){                       
            var webParts = response.d.results;
            var qsFilterWebPart = _.find(webParts, function(item){ return !!item.WebPart.Properties.QueryStringParameterName;} );
            var listViewWebParts = _.filter(webParts, function(item){ 
                return opts.listsToConnect.hasOwnProperty(item.WebPart.Properties.ListUrl);
            }); 

            var connections = null;

            if(qsFilterWebPart && listViewWebParts.length){
                connections = generateWebpartConnections(qsFilterWebPart, listViewWebParts, opts.listsToConnect);
            }

            print(connections);
            
            return connections;             
        });

        function print(connections){
            var container = $('<div style="padding: 20px 50px;" />');
            var ul;

            $("body").html('').append(container);
            
            //STEP 1
            $("<h1 style='margin-bottom:15px;' />")
                .html("Copy the below code to your clipboard:")
                .appendTo(container);

            $('<textarea style="width:80%;margin-left:30px;" rows="20" />')
                .val(connections.xml)
                .appendTo(container);

            //STEP 2
            var currentPage = [document.location.protocol, "//", document.location.hostname, document.location.pathname].join('');
            $("<h1 style='margin-bottom:15px;' />")
                .html("Then open up this ASPX page using SharePoint Designer 2013:")
                .appendTo(container);
            
            ul = $("<ul />").appendTo(container);
            $("<li/>")
                .text(currentPage)
                .appendTo(ul);
            
            //STEP 3
            var base64_pasteBelowThisLine = 'data:image/png;base64,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';

            $("<h1 style='margin-bottom:15px;' />")
                .html("Modify this ASPX page in SharePoint Designer 2013:")
                .appendTo(container);
            
            ul = $("<ul />").appendTo(container);
            $("<li/>")
                .html("Paste below this line: <br/> <img src='"+base64_pasteBelowThisLine+"' />")
                .appendTo(ul);
            $("<li/>")
                .html("Hit Ctrl+S to save the changes you've made using SharePoint Designer 2013.")
                .appendTo(ul);

            //STEP 4
            $("<h1 style='margin-bottom:15px;' />")
                .html("Then come back to the browser and refresh this page.   The following connections should take effect:")
                .appendTo(container);

            ul = $("<ul />").appendTo(container);
            
            _.each(connections.items, function(connection){
                $("<li/>")
                    .html("<strong>" +connection.WebPartTitle + "</strong> on "+ connection.ConsumerFieldNames +" field")
                    .appendTo(ul);
            });

        }

        function generateWebpartConnections(qsFilterWebPart, listViewWebParts, listsToConnect){
            var patternForDash = new RegExp('-', 'g');
            var qsFilterWebPartID = 'g_' + qsFilterWebPart.Id.replace(patternForDash, '_');
            var objects = _.map(listViewWebParts, function(lvwp){

                var lvwpID = lvwp.Id.replace(patternForDash, '_');
                return {
                    WebPartTitle: lvwp.WebPart.Properties.Title,
                    ConsumerConnectionPointID: 'DFWP Filter Consumer ID',
                    ConsumerID: 'g_' + lvwpID,
                    ID: 'x_' + lvwpID,
                    ProviderConnectionPointID: 'ITransformableFilterValues',
                    ProviderID: qsFilterWebPartID,
                    ConsumerFieldNames: listsToConnect[lvwp.WebPart.Properties.ListUrl].getConsumerField(lvwp.WebPart.Properties.Title),
                    ProviderFieldNames: qsFilterWebPart.WebPart.Properties.FilterName
                }	
            });

            var str = '<WebPartPages:SPProxyWebPartManager runat="server" ID="__ProxyWebPartManagerForConnections__"><SPWebPartConnections>';

            _.each(objects, function(object){
                str += '<WebPartPages:SPWebPartConnection ';
                str += 'ConsumerConnectionPointID="DFWP Filter Consumer ID" ';
                str += 'ConsumerID="' + object.ConsumerID + '" ';
                str += 'ID="' + object.ID + '" ';
                str += 'ProviderConnectionPointID="ITransformableFilterValues" ';
                str += 'ProviderID="' + object.ProviderID + '">';
                str += '<WebPartPages:TransformableFilterValuesToParametersTransformer ConsumerFieldNames="'+object.ConsumerFieldNames+'" ProviderFieldNames="'+object.ProviderFieldNames+'"></WebPartPages:TransformableFilterValuesToParametersTransformer>';
                str += '</WebPartPages:SPWebPartConnection>'
            });

            str += '</SPWebPartConnections></WebPartPages:SPProxyWebPartManager>';
            return {
                items: objects,
                xml:str
            };
        }
    }

    function executeJson(url, method, headers, payload) {
        headers = headers || {};
        method = method || 'GET';
        headers["Accept"] = "application/json;odata=verbose";
        if (method == "POST") {
            headers["X-RequestDigest"] = jQuery("#__REQUESTDIGEST").val();
        }

        var ajaxOptions = {
            url: url,
            type: method,
            contentType: "application/json;odata=verbose",
            headers: headers
        };
        if (method == "POST") {
            ajaxOptions.data = JSON.stringify(payload);
        }
        return jQuery.ajax(ajaxOptions);
    }

})(jocInBoxConfig.noConflicts.jQuery, jocInBoxConfig.noConflicts.lodash);

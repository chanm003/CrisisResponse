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

            var proxyManagerXml = "";

            if(qsFilterWebPart && listViewWebParts.length){
                proxyManagerXml = generateWebpartConnections(qsFilterWebPart, listViewWebParts, opts.listsToConnect);
            }

            console.log(proxyManagerXml);
            return proxyManagerXml;             
        });

        function generateWebpartConnections(qsFilterWebPart, listViewWebParts, listsToConnect){
            var patternForDash = new RegExp('-', 'g');
            var qsFilterWebPartID = 'g_' + qsFilterWebPart.Id.replace(patternForDash, '_');
            var objects = _.map(listViewWebParts, function(lvwp){

                var lvwpID = lvwp.Id.replace(patternForDash, '_');
                return {
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
            return str;
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

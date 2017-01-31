//USAGE
performJavascriptShuffle({
    existingUrl: '/siteassets/app.js'
});

function performJavascriptShuffle(opts) {
    var pattern = new RegExp('[\.]{1}([0-9]+)[\.]{1}js');
    opts.newUrl = opts.existingUrl.replace(pattern, '.' + moment().format("YYYYMMDDHHmmss") + '.js')
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


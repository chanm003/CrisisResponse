# Fields
* ActionsHtml (calculated field)
    * does not actually have a formula in the Column Settings, just a placeholder
    * when included as a column in any web part
        * blue "Respond" button gets rendered in Status field is "Open"
        * blue "Reopen" button gets rendered in Status field is "Closed"
        * when the blue button is clicked
            * user gets redirected to EditForm.aspx with an extra querystring parameter (action=Respond or action=Reopen)


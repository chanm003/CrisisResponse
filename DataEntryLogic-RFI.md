# Fields
* Title (Text)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* RFI Tracking (Number)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* Mission (Text)
    * always be editable
* Details (MultiText)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8   
* Priority (Dropdown)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* LTIOV (Datetime)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* PocName (Person)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8  
* PocPhone (Text)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* PocOrganization (Dropdown)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* Recommended OPR (Dropdown)
    * should be editable when NewForm.aspx, EditForm.aspx?ID=8, EditForm.aspx?ID=8action=Respond
* ManageRfi (MultiPerson)
    * should only be editable when NewForm.aspx or EditForm.aspx?ID=8
* Respondent Name (Person)
    * should only be editable when EditForm.aspx?ID=8&action=Respond
* Respondent Phone (Text)
    * should only be editable when EditForm.aspx?ID=8&action=Respond 
* Respone to Request (MultiText)
    * should only be editable when EditForm.aspx?ID=8&action=Respond
* DateClosed (datetime)
    * should only be editable when EditForm.aspx?ID=8&action=Respond
        * if blank on page load, but populated by user on save then
            * set Status of RFI to "Closed"
            * set ResponseSufficient to "Yes"
* ResponseSufficient (Choice)
    * should only be visible when EditForm.aspx?ID=8&action=Reopen (cannot be directly edited by user)
        * set to "No" on page load and read-only
        * on Save  
            * ensure ResponseSufficient=No
            * set DateClosed to blank
            * set Status to "Open"
* InsufficientExplanation (MultiText)
    * should only be visible when EditForm.aspx?ID=8&action=Reopen    
* ActionsHtml (calculated field)
    * does not actually have a formula in the Column Settings, just a placeholder
    * when included as a column in any web part
        * blue "Respond" button gets rendered in Status field is "Open"
        * blue "Reopen" button gets rendered in Status field is "Closed"
        * when the blue button is clicked
            * user gets redirected to EditForm.aspx with an extra querystring parameter (action=Respond or action=Reopen)


        




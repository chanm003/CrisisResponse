# Fields
* ChopProcess (hidden DateTime populated via script)
    * hidden from NewForm.aspx and EditForm.aspx
    * when included as a column in a web part
        * blue "Chop" button gets rendered if ChopProcess is null
        * gray "Chop" disabled button gets rendered if ChopProcess has valid datetime as a value
        * when user clicks blue button, a modal is presented to the user
            * modal contains a Mission dropdown, user selects a Mission, then clicks Save
                * on save sets the value for four fields (including three hidden ones)
                    * Mission
                        * all Mission documents that undergo the "Chop Process" must have a valid value for the Mission field (lookup)
                    * ChopProcess
                        * set to current datetime
                    * VersionBeingChopped
                        * set to the current major version of the document+1 (initiating a chop process on a document modifies metadata so version is incremented)



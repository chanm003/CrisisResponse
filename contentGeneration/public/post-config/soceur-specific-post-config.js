/**
 * Navigate to the generated site's Site Contents page
 * Hit F12, then go to Console Tab
 * Copy+paste any below snippets.  Change variables accordingly
 * 
*/

/****************************************************************************************
 * TO Make Classification and Special Releasability not required for a single list
 ****************************************************************************************/
var listName = "Mission Tracker";
var ctx = new SP.ClientContext();
var spWeb = ctx.get_web();
var list = spWeb.get_lists().getByTitle(listName);

_.each(['Classification', 'Special Releasability'], function(fieldName){
    var choiceField = list.get_fields().getByInternalNameOrTitle(fieldName);
    choiceField.set_required(false);
    choiceField.update();
});

ctx.executeQueryAsync(
    Function.createDelegate(this, function(){ console.log("Sucess....."); }),
    Function.createDelegate(this, function(sender, args){ console.log("Error: " + args.get_message()); })
);

/****************************************************************************************
 * Remove the four classification-related fields in a single list
 ****************************************************************************************/
var listName = "Mission Tracker";
var ctx = new SP.ClientContext();
var spWeb = ctx.get_web();
var list = spWeb.get_lists().getByTitle(listName);

_.each(['Classification', 'Special Releasability', 'Classification Caveats', 'Special Releasability Notes'], function(fieldName){
    var choiceField = list.get_fields().getByInternalNameOrTitle(fieldName);
    choiceField.deleteObject();
});

ctx.executeQueryAsync(
    Function.createDelegate(this, function(){ console.log("Sucess....."); }),
    Function.createDelegate(this, function(sender, args){ console.log("Error: " + args.get_message()); })
);
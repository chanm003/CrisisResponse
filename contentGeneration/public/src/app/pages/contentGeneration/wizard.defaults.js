var wizard = wizard || {};
wizard.defaults = {};

wizard.defaults["Site Name"] = "Trojan Footprint 08";
wizard.defaults["Description"] = "This is boilerplate text...";

/** 
 * this URL SHOULD be within same site collection
 */
wizard.defaults["URL"] = "/ngspa/TF08";

/** 
 * staff sections within component command provide feedback during document chop process
 */
wizard.defaults["Staff Sections for Component Command"] = ["J1", "J2", "J33", "J35", "J39", "J4", "J6", "Legal", "Medical", "Public Affairs"];
wizard.defaults["Staff Sections for Air Component"] = ["A1", "A2", "A3 Director of Operations", "A33 Current Operations", "A35 Plans", "A4", "A5", "A6", "A7", "Airspace", "Command Group", "FAD", "FIRES", "PRCC", "Special Staff"];

/**
 * Names should be of limited length since they will be included in the menu for sidebar
 * flag code optional..if blank flag gets generated randomly
 */
wizard.defaults["Component Commands"] = [
    {name: "SOCEUR", flagCode: "US"}
];

wizard.defaults["Task Groups"] = [
    {name: "Deutsches Heer", flagCode: "DE"},
    {name: "SOTG 20"},
    {name: "SOTG 30", flagCode: "FR"}
];

wizard.defaults["Air Component"] = {name: "Luftwaffe", flagCode: "DE"};

wizard.defaults["Communications Tracker"] = {name: "SOCEUR SSD"};

wizard.defaults["Exercise Control Group"] = {
    name: "Response Cell",
    notionals: ['Embassy']
};

wizard.defaults["Optional Features"] = {
    "Air Component": true,
    "Communications Tracker": true,
    "Exercise Control Group": true,
    "Help Desk Ticketing System": true
};

/**
 * Subset of flags defined below (about 53 flags).  
 * Full 248 flags are authored by lafeber and can be found here: 
 * https://github.com/lafeber/world-flags-sprite/blob/master/stylesheets/flags32.css
 * 
 * In most cases, the flag is simply the country's ISCO code lower-cased.
 * Notable exceptions are NATO (which is not a country) and Kosovo as seen below
 */
wizard.countriesDataSource = [
				{ code: null, flag: "_NATO", name: "NATO" },
				{ code: "US", flag: "us", name: "USA" },
				{ code: "AL", flag: "al", name: "Albania" },
				{ code: "AD", flag: "ad", name: "Andorra" },
				{ code: "AM", flag: "am", name: "Armenia" },
				{ code: "AT", flag: "at", name: "Austria" },
				{ code: "AZ", flag: "az", name: "Azerbaijan" },
				{ code: "BY", flag: "by", name: "Belarus" },
				{ code: "BE", flag: "be", name: "Belgium" },
				{ code: "BA", flag: "ba", name: "Bosnia and Herzegovina" },
				{ code: "BG", flag: "bg", name: "Bulgaria" },
				{ code: "HR", flag: "hr", name: "Croatia" },
				{ code: "CY", flag: "cy", name: "Cyprus" },
				{ code: "CZ", flag: "cz", name: "Czech Republic" },
				{ code: "DK", flag: "dk", name: "Denmark" },
				{ code: "EE", flag: "ee", name: "Estonia" },
				{ code: "FI", flag: "fi", name: "Finland" },
				{ code: "FR", flag: "fr", name: "France" },
				{ code: "GE", flag: "ge", name: "Georgia" },
				{ code: "DE", flag: "de", name: "Germany" },
				{ code: "GR", flag: "gr", name: "Greece" },
				{ code: "VA", flag: "va", name: "Holy See (Vatican City)" },
				{ code: "HU", flag: "hu", name: "Hungary" },
				{ code: "IS", flag: "is", name: "Iceland" },
				{ code: "IE", flag: "ie", name: "Ireland" },
				{ code: "IL", flag: "il", name: "Israel" },
				{ code: "IT", flag: "it", name: "Italy" },
				{ code: "XK", flag: "_Kosovo", name: "Kosovo" },
				{ code: "LV", flag: "lv", name: "Latvia" },
				{ code: "LI", flag: "li", name: "Liechtenstein" },
				{ code: "LT", flag: "lt", name: "Lithuania" },
				{ code: "LU", flag: "lu", name: "Luxembourg" },
				{ code: "MT", flag: "mt", name: "Malta" },
				{ code: "MD", flag: "md", name: "Moldova" },
				{ code: "MC", flag: "mc", name: "Monaco" },
				{ code: "ME", flag: "me", name: "Montenegro" },
				{ code: "NL", flag: "nl", name: "Netherlands" },
				{ code: "NO", flag: "no", name: "Norway" },
				{ code: "PL", flag: "pl", name: "Poland" },
				{ code: "PT", flag: "pt", name: "Portugal" },
				{ code: "MK", flag: "mk", name: "Republic of Macedonia" },
				{ code: "RO", flag: "ro", name: "Romania" },
				{ code: "RU", flag: "ru", name: "Russia" },
				{ code: "SM", flag: "sm", name: "San Marino" },
				{ code: "RS", flag: "rs", name: "Serbia" },
				{ code: "SK", flag: "sk", name: "Slovakia" },
				{ code: "SI", flag: "si", name: "Slovenia" },
				{ code: "ES", flag: "es", name: "Spain" },
				{ code: "SE", flag: "se", name: "Sweden" },
				{ code: "CH", flag: "ch", name: "Switzerland" },
				{ code: "TR", flag: "tr", name: "Turkey" },
				{ code: "UA", flag: "ua", name: "Ukraine" },
				{ code: "GB", flag: "gb", name: "United Kingdom" }
			];
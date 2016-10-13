var jocInBoxConfig = jocInBoxConfig || {};

jocInBoxConfig.dashboards = { 
    "SOCC": { "optionsForChoiceField": ["SOCC", "SOCC - J1", "SOCC - J2", "SOCC - J33", "SOCC - J35", "SOCC - J39", "SOCC - J4", "SOCC - J6", "SOCC - Legal", "SOCC - Medical", "SOCC - Public Affairs"], "country": { "code": "US", "flag": "us", "name": "USA", "$$hashKey": 2 }, "routes": [] }, "CJSOTF-RO": { "optionsForChoiceField": ["CJSOTF-RO", "CJSOTF-RO - J1", "CJSOTF-RO - J2", "CJSOTF-RO - J33", "CJSOTF-RO - J35", "CJSOTF-RO - J39", "CJSOTF-RO - J4", "CJSOTF-RO - J6", "CJSOTF-RO - Legal", "CJSOTF-RO - Medical", "CJSOTF-RO - Public Affairs"], "country": { "code": "RO", "flag": "ro", "name": "Romania", "$$hashKey": 42 }, 
    "routes": [
		{name: "1: Joint Task Force", sequence: ['SOTG 10', 'CJSOTF-RO']},
		{name: "2: Combatant Command", sequence: ['SOTG 10', 'CJSOTF-RO', 'SOCC']}  
] }, "SOTG 10": { "optionsForChoiceField": ["SOTG 10"], "country": { "code": "BE", "flag": "be", "name": "Belgium", "$$hashKey": 9 }, "type": "Land", "routes": [
    {name: "0: Task Group", sequence: ['SOTG 10']},
		{name: "1: Joint Task Force", sequence: ['SOTG 10', 'CJSOTF-RO']},
		{name: "2: Combatant Command", sequence: ['SOTG 10', 'CJSOTF-RO', 'SOCC']}  
] }, "SOTG 20": { "optionsForChoiceField": ["SOTG 20"], "country": { "code": "NL", "flag": "nl", "name": "Netherlands", "$$hashKey": 37 }, "type": "Maritime", "routes": [] }, "SOTG 30": { "optionsForChoiceField": ["SOTG 30"], "country": { "code": "LU", "flag": "lu", "name": "Luxembourg", "$$hashKey": 32 }, "type": "Land", "routes": [] }, "SIGCEN": { "optionsForChoiceField": ["SIGCEN"], "routes": [] }, "SOAC": { "optionsForChoiceField": ["SOAC", "SOAC - A1", "SOAC - A2", "SOAC - A3 Director of Operations", "SOAC - A33 Current Operations", "SOAC - A35 Plans", "SOAC - A4", "SOAC - A5", "SOAC - A6", "SOAC - A7", "SOAC - Airspace", "SOAC - Command Group", "SOAC - FAD", "SOAC - FIRES", "SOAC - PRCC", "SOAC - Special Staff"], "country": { "code": "GB", "flag": "gb", "name": "United Kingdom", "$$hashKey": 53 }, "routes": [] }, "EUCOM": { "optionsForChoiceField": ["EUCOM", "EMBASSY", "JFC Brunssum"], "routes": [] } };

jocInBoxConfig.missionTypes = { "AO: Airfield Operation": "", "CR: Cache Recovery": "", "CS: Cordon and Search": "", "DA: Direct Action": "", "HRO: Hostage Rescue Operation": "", "KLE: Key Leader Engagement": "", "KS: Kinetic Strike": "", "MA: Military Assistance": "", "PR: Personnel Recovery": "", "SR: Special Reconnaissance": "", "SUP: Support Patrol (log, etc)": "" };


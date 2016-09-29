# CrisisResponse

# Setup: 
1. Git Clone the repository
  * This should create a CrisisReponse folder
2. Scaffold out an Express app running on localhost:3000
  * npm install express-generator -g
  * mkdir someApp 
  * cd someApp
  * express
  * npm install
  * Copy files from someApp into CrisisResponse folder (bin, node_modules, routes, views, package.json, app.js)
3. Make modifications to app.js to enable CORS
```javascript
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'example.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));
```
4. Type 'npm start' on the terminal to serves these files 
  * Office 365 SharePoint .ASPX page will reference files inside CrisisResponse/contentGeneration/public
5. Click on the Shield icon in the Google Chrome address bar to disable security

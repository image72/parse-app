// Example express application adding the parse-server module to expose Parse
// compatible API routes.
require('dotenv').config();
var path = require('path');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var allowInSecureHTTP = process.env.insecureHTTP || false;

if (!databaseUri) {
  console.log('DATABASE_URI not specified');
}

var api = new ParseServer({
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY,
  serverURL: process.env.SERVER_URL || 'http://127.0.0.1:3000',
  javascriptKey: process.env.JAVASCRIPT_KEY,
  restAPIKey: process.env.REST_API_KEY,
  dotNetKey: process.env.DOT_NET_KEY,
  clientKey: process.env.CLIENT_KEY,
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
    oauth: {
        janraincapture: {
            janrain_capture_host: process.env.JANRAIN_CAPTURE_HOST
        }
    }
});

var dashboard = new ParseDashboard({
  "apps": [
      {
        "serverURL": process.env.SERVER_URL || "http://localhost:1337/parse",
        "appId": process.env.APP_ID,
        "masterKey": process.env.MASTER_KEY,
        "appName": process.env.APP_NAME || 'MyApp'
      }
    ]
}, allowInSecureHTTP);

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use(mountPath+'/1', api); // handle old SDK calls too

app.use('/dashboard', dashboard);
// redirect all not found to 'public/index.html' for SPA redirect;
// if you dont need, just comment that;
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

var port = process.env.PORT || 3000;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port);
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);

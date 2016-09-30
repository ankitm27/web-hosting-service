var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var authenticationController = require('./server/controllers/authentication-controller.js')
mongoose.connect('mongodb://localhost:27017/project');

app.use(bodyParser.json());
app.use('/app',express.static(path.join(__dirname,'app')));
app.use('/static',express.static(path.join(__dirname,'static')));
app.use('/node_modules',express.static(path.join(__dirname,'node_modules')));
app.get('/',function(req,res){
  res.sendFile(path.join( __dirname, 'index.html'));
});
app.post('/api/user/signup',authenticationController.signup);
app.post('/api/user/login',authenticationController.login);
app.post('/api/user/logout',authenticationController.logout);
app.post('/api/user/ftp',authenticationController.ftp);
app.post('/api/user/showoption',authenticationController.showoption);
app.post('/api/user/docker',authenticationController.docker);
app.listen('8080', function(){
  console.log("The http://127.0.0.1:8080/ is listening");
});

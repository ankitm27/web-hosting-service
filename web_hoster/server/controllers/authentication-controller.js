var mongoose = require('mongoose');
var jsftp = require('jsftp');
var User = require('../dataset/users');
var path = require('path');
var exec = require('child_process').exec;
var createFtp = function(ip, callback){
  var ftp = new jsftp({
    host: ip,
    port: 21,
    user: "ankit",
    pass: "ankit"
  });
    callback(ftp);
}
var cmd = function(cmd, callback){
  var child = exec(cmd, function(error, stdout, stderr){
    if(stdout !== null){
      data = {'stdout': stdout, 'stderr': null};
    }else if(stderr != 0){
      console.log('Error: '+stderr);
      data = {'stdout': null, 'stderr': stderr};
    }
  });
  child.on('close',function(){
    callback(data);
  })
}
module.exports.docker = function(req, res){
  // cmd("docker inspect --format '{{ .NetworkSettings.IPAddress }}' " + container_name );
  res.json({});
}
module.exports.signup = function(req,res){
  User.find({email: req.body.email}, function(err,results){
    if(err){
      console.log("Error Out");
    }
    if(results && results.length > 0){
      res.json({error: "This email address already exists."});
    }else{
      var userset = req.body;
      userset.current = "/";
      var user = new User(userset);
      var container_name = req.body.email.replace('@','');
      cmd("docker run -i --name "+ container_name +" ankit864/nginx", function(data){
        if(data.stderr === null){
          user.save();
          console.log(data);
          res.json(req.body);
        }
      });
    }
  });
}
module.exports.login = function(req,res){
  console.log(req.body);
  User.find(req.body, function(err,results){
    if(err){
      console.log("Error Out");
    }
    if(results && results.length === 1){
      var userdata = results[0];
      var container_name = req.body.email.replace('@','');
      cmd("docker start "+container_name, function(data){
        if(data.stderr === null){
          cmd("docker exec "+container_name+" service proftpd start && docker exec "+container_name+" service nginx restart", function(data_next){
            if(data_next.stderr === null){
              res.json({email: req.body.email, _id: userdata._id});
            }
          });
        }
      });
    }else{
      res.json({error: "Either username or password is wrong."});
    }
  });
}
module.exports.logout = function(req,res){
  var string = req.body.essen;
  var obj = JSON.parse(string);
  var container_name = obj.email.replace('@','');
  cmd("docker stop "+container_name, function(data){
    if(data.stderr === null){
      res.json({msg: "Successfully done!"});
    }
  });
}
module.exports.ftp = function(req,res){
  var string = req.body.essen;
  var obj = JSON.parse(string);
  var container_name = obj.email.replace('@','');
  cmd("docker inspect --format '{{ .NetworkSettings.IPAddress }}' "+container_name, function(data){
    if(data.stderr === null){
      var ip = data.stdout.trim("");
    }else{
      var err = data.stderr;
    }
    User.find(obj, function(err,results){
      if(err){
        console.log("Error Out");
      }
      if(results && results.length > 0){
        dir = results[0].current;
        createFtp(ip, function(local_ftp){
          var ftp = local_ftp;
          ftp.list(dir, function(err, response){
            var files = response.split('\r\n');
            files.pop();
            res.json({files: files, dir: dir, ip: ip});
          });
        });
      }
    });
  });
}
module.exports.showoption = function(req,res){
  var action = req.body.action;
  var mode = action.mode;
  var path = action.path;
  var file = path + action.file;
  console.log(file);
  var ip = action.ip;
  console.log(ip);
  createFtp(ip, function(local_ftp){
    var ftp = local_ftp;
    if(mode == "delete" || mode == "rename"){
      var moved_path = "";
      if(mode == "delete")
        moved_path = "tmp/"+action.file;
      else if(mode == "rename")
        moved_path = path+action.renamefile;
      ftp.rename(file, moved_path, function(err, response) {
        if (!err){
          console.log("Renaming successful!");
          res.json({msg: "Successfully rename"});
        }
      });
    }else if(mode == "upload" || mode == "save"){
      var data = action.content;
      var buffer = new Buffer(data.length);
      console.log(buffer.write(data,"utf-8"));
      ftp.put(buffer, file, function(err){
        if(!err){
          console.log("Uploaded file");
          res.json({msg: "Successfully uploaded"});
        }
      });
    }else if (mode == "download"){
      copied_path = "/home/shubham/tmp/"+action.file;
      console.log(file, copied_path);
      ftp.get(file, copied_path, function(err) {
        if (!err){
          console.log('File copied successfully!');
          res.json({msg: "File copied successfully!"});
        }
        else
          console.log(err);
      });
    }else if (mode == "open"){
      folder = action.folder;
      console.log(folder);
      var string = action.essen;
      var obj = JSON.parse(string);
      dir = path;
      current = dir+folder+"/";
      User.findOneAndUpdate(obj, { $set: { current: current}},function(err,results){
        if (!err){
          console.log("Updated");
          res.json({msg: "Successfully updated!"});
        }else{
          console.log(err);
        }
      });
    }else if (mode == "back"){
      var string = action.essen;
      var obj = JSON.parse(string);
      dir = path;
      var array = dir.trim().split('/');
      array.pop()
      if(array.length != 1){
        array.pop();
      }
      current = array.join('/')+"/";
      User.findOneAndUpdate(obj, { $set: { current: current}},function(err,results){
        if (!err){
          console.log("Updated");
          res.json({msg: "Successfully updated!"});
        }else{
          console.log(err);
        }
      });
    }else if (mode == "create"){
      var folder = action.folder;
      ftp.raw.mkd(folder, function(err, data) {
        if (err){
          console.error(err);
        }
        console.log(data.text);
        res.json({msg: "Folder created"});
      });
    }else if(mode == "view"){
      var str = "";
      ftp.get(file, function(err, socket) {
        if (err){
          console.log(err);
        }
        socket.on("data", function(d) { str += d.toString(); })
        socket.on("close", function(hadErr) {
          if (!hadErr){
            res.json({msg: "Successfully done!", content: str})
          }
        });
        socket.resume();
      });
    }
  });
}

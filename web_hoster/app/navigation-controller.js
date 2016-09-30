(function(){
  angular.module('Project')
    .controller('NavigationController',['$scope','$state','$http','$window',function($scope, $state, $http, $window){
      $scope.isLoader = false;
      $scope.isLoggedIn = false;
      if(localStorage.getItem('User-Data')){
        $scope.isLoggedIn = true;
        $scope.isViewFile = false;
      }
      if($scope.isLoggedIn){
        $scope.renamedelete = function(mode,file){
          array = file.split('  ').pop().trim().split(' ');
          // var filename = "";
          // for(var i = 4;i < array.length;i++ ){
          //   filename = filename + " " +array[i];
          // }
          var filename = array.pop();
          filename = filename.trim();
          var data = {
            mode: mode,
            ip: $scope.ip,
            file: filename,
            path: $scope.current_folder
          }
          if(mode == "delete"){
            var verify = confirm("Do you want to delete!");
          }else if(mode == "rename"){
            verify = true;
            var newname = prompt("Please enter new name without any spaces", filename);
            if(newname.indexOf(' ') > -1){
              alert("Enter the name withot any spaces");
              verify = false;
            }
            data.renamefile = newname;
          }
          if(verify == true){
            $http.post('/api/user/showoption',{action: data}).success(function(response){
              console.log(response.msg);
              var url = window.location.origin;
              $window.location.href = url;
            })
          }
        }
        $scope.upload = function(mode){
          var verify = false;
          var data = {
            mode: mode,
            ip: $scope.ip,
            path: $scope.current_folder
          }
          if(mode == "upload"){
            var file = document.getElementById('file').files[0];
            var read = new FileReader();
            read.onloadend = function(event){
              verify = true;
              var filename = file.name;
              uploaded_data = event.target.result;
              if(filename.indexOf(' ') > -1){
                verify = confirm("Convert the spaces in filename by undersore!");
                if(verify == true){
                  var filename = filename.split(' ').join('_');
                }else{
                  alert("Upload file without any spaces in its name!");
                }
              }
              data.file = filename;
              data.content = uploaded_data;
              if(verify == true){
                $http.post('/api/user/showoption',{action: data}).success(function(response){
                  console.log(response.msg);
                  var url = window.location.origin;
                  $window.location.href = url;
                })
              }
            }
          }
          read.readAsBinaryString(file);
        }
        $scope.download = function(mode, file){
          array = file.split('  ').pop().split(' ');
          // var filename = "";
          // for(var i = 4;i < array.length;i++ ){
          //   filename = filename + " " +array[i];
          // }
          var filename = array.pop();
          filename = filename.trim();
          var data = {
            mode: mode,
            ip: $scope.ip,
            file: filename,
            path: $scope.current_folder
          }
          $http.post('/api/user/showoption',{action: data}).success(function(response){
            console.log(response.msg);
          });
        }
        $scope.open = function(mode, folder){
          array = folder.split('  ').pop().trim().split(' ');
          // var foldername = "";
          // for(var i = 4;i < array.length;i++ ){
          //   foldername = foldername + " " +array[i];
          // }
          var foldername = array.pop();
          foldername = foldername.trim();
          var data = {
            mode: mode,
            ip: $scope.ip,
            folder: foldername,
            path: $scope.current_folder
          }
          data.essen = localStorage.getItem('User-Data');
          $http.post('/api/user/showoption',{action: data}).success(function(response){
            console.log(response.msg);
            var url = window.location.origin;
            $window.location.href = url;
          });
        }
        $scope.back = function(mode){
          var data = {
            mode: mode,
            ip: $scope.ip,
            path: $scope.current_folder
          }
          data.essen = localStorage.getItem('User-Data');
          $http.post('/api/user/showoption',{action: data}).success(function(response){
            console.log(response.msg);
            var url = window.location.origin;
            $window.location.href = url;
          });
        }
        $scope.create = function(mode,folder){
          var new_folder = prompt("Please Enter the name of the folder without any spaces", "New_Folder");
          verify = true;
          if(newname.indexOf(' ') > -1){
            alert("Enter the name of folder withot any spaces");
            verify = false;
          }
          var data = {
            mode: mode,
            ip: $scope.ip,
            folder: $scope.current_folder + new_folder,
          }
          if(verify == true){
            $http.post('/api/user/showoption',{action: data}).success(function(response){
              console.log(response.msg);
              var url = window.location.origin;
              $window.location.href = url;
            });
          }
        }
        $scope.view = function(mode,file){
          $scope.isViewFile = true;
          array = file.split('  ').pop().trim().split(' ');
          // var filename = "";
          // for(var i = 4;i < array.length;i++ ){
          //   filename = filename + " " +array[i];
          // }
          var filename = array.pop();
          filename = filename.trim();
          $scope.filename = filename;
          $scope.current_file = $scope.current_folder + filename;
          var data = {
            mode: mode,
            ip: $scope.ip,
            file: filename,
            path: $scope.current_folder
          }
          $http.post('/api/user/showoption',{action: data}).success(function(response){
            $scope.text = "// write here";
            if(response.content != ""){$scope.text = response.content;}
            console.log(response.msg);
          });
        }
        $scope.save = function(mode,file){
          $scope.isViewFile = true;
          var data = {
            mode: mode,
            ip: $scope.ip,
            file: $scope.filename,
            content: $scope.text,
            path: $scope.current_folder
          }
          $http.post('/api/user/showoption',{action: data}).success(function(response){
            console.log(response.msg);
          });
        }
        $scope.reload = function(){
          var url = window.location.origin;
          $window.location.href = url;
        }
        if(!$scope.isViewFile){
          $http.post('/api/user/ftp',{essen: localStorage.getItem('User-Data')}).success(function(response){
            var array = response.files;
            array.sort().reverse();
            $scope.current_folder = response.dir;
            $scope.ip = response.ip
            var list = new Array();
            var len = array.length;
            for(var i=0; i<len;i++){
              var val = false;
              if(array[i].charAt(0) == 'd')
                val = true;
              list[i] = {name: array[i], isDir: val}
            }
            $scope.files = list;
          });
        }
        $scope.docker = function(){
          $http.post('/api/user/docker',{}).success(function(response){
            console.log("it works");
          });
        }
      }
    }]);
}());

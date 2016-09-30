(function(){
  angular.module('Project')
    .controller('SignUpController',['$scope','$state','$http','$window',function($scope, $state, $http, $window){
      $scope.isError = false;
      $scope.createUser = function(){
        $http.post('/api/user/signup', $scope.newUser).success(function(response){
          if(response.error){
            $scope.isError = true;
            $scope.error = response.error;
          }else{
            var url = window.location.origin;
            $window.location.href = url;
          }
        }).error(function(error){
            console.log(error);
        });
      }
    }]);
}());

  (function(){
  angular.module('Project')
    .controller('LogInController',['$scope','$state','$http','$window',function($scope, $state, $http, $window){
      $scope.isLoader = false;
      $scope.isError = false;
      $scope.loginUser = function(){
        $scope.isLoader = true;
        $http.post('api/user/login', $scope.newUser).success(function(response){
          if(response.error){
            $scope.isError = true;
            $scope.error = response.error;
          }else{
            localStorage.setItem('User-Data', JSON.stringify(response));
            var url = window.location.origin;
            $window.location.href = url;
          }
        }).error(function(error){
          console.log(error);
        });
      }
    }]);
}());

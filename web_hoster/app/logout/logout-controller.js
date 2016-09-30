(function(){
  angular.module('Project')
    .controller('LogOutController',['$scope','$state','$http','$window',function($scope, $state ,$http, $window){
      $scope.isLoader = true;
      $http.post('api/user/logout',{essen: localStorage.getItem('User-Data')}).success(function(response){
        console.log(response.msg);
        localStorage.clear();
        var url = window.location.origin;
        $window.location.href = url;
      }).error(function(error){
        console.log(error);
      });
    }]);
}());

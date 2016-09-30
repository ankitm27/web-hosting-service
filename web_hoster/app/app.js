(function(){
  angular.module('Project',['ui.router'])
    .config(function($stateProvider){
      $stateProvider
        .state('signUp',{
          url: "/signup",
          templateUrl: "app/signup/signup.html",
          controller: "SignUpController"
        })
        .state('logIn',{
          url: "/login",
          templateUrl: "app/login/login.html",
          controller: "LogInController"
        })
        .state('logOut',{
          url: "/logout",
          controller: "LogOutController"
        });
    });
}());

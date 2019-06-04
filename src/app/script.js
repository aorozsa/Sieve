// Code goes here

var app = angular.module('ngDemo', []);

app.controller("homeCtrl",function($window){
  var vm = this;
  vm.title = "Open new window";
  vm.openWindow = function(){
    
    $window.open('https://sso.bbcworldwide.com/as/authorization.oauth2?client_id=UAT-Watson&response_type=code&scope=openid profile&state=1234567890', 
    'C-Sharpcorner', 
    'toolbar=no,scrollbars=no,resizable=no,top=100,left=500,width=600,height=400');
  }
});
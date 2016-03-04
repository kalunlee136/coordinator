var app = angular.module('flapperNews', ['ui.router']);

app.controller('MainCtrl', ['$scope','clubs', '$state', 'auth', function($scope,clubs,$state,auth){
    $scope.locations = clubs.locations;
    $scope.attendances = clubs.attendances;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
    
    $scope.incrementUpvotes = function(post) {
      clubs.upvote(post);
    };
    
    $scope.submit_location = function(){
      clubs.get_all_locations($scope.location);
    };
   
   $scope.submit_attendance = function(location, id){
     if(auth.isLoggedIn()){
       clubs.submit_attendance(location,id);
     }else{
       alert('Please log-in or register');
     }  
   }
   

}]);

app.controller('AuthCtrl', ['$scope','$state','auth', function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
  
}]);

app.controller('NavCtrl', ['$scope','auth',function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

app.factory('clubs', ['$http','$state', 'auth', function($http,$state, auth){
  var factory = {
    locations:[],
  };
  
  factory.get_all_locations = function(loc){
    var obj = {location:loc};
    return $http.post('/locations', obj).then(function(data){
       angular.copy(data.data, factory.locations);
       $state.transitionTo('home.locations');
    });
  };
  
  factory.submit_attendance = function(location,id){
    return $http.put('/attendance', {location}, {headers: {Authorization: 'Bearer '+auth.getToken()}}).then(function(data){
      factory.locations[id].upvotes = data.data.upvotes;
    })
  }
  
  factory.getAll = function() {
    return $http.get('/attendance').then(function(res){
      angular.copy(res, factory.locations);
    })
  };
  
  return factory;
}]);



app.factory('auth', ['$http', '$window', '$state', function($http, $window, $state){
   var auth = {};
   
   auth.saveToken = function (token){
     $window.localStorage['flapper-news-token'] = token;
   };
  
   auth.getToken = function (){
     return $window.localStorage['flapper-news-token'];
   }
   
   auth.isLoggedIn = function(){
     var token = auth.getToken();
     
     if(token){
       var payload = JSON.parse($window.atob(token.split('.')[1]));
       return payload.exp > Date.now() / 1000;
     } else {
       return false;
     }
   };
   
   auth.currentUser = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
    
        return payload.username;
      }
    };
   
   auth.userID = function(){
      if(auth.isLoggedIn()){
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));
    
        return payload._ID;
      }
   };
    
   auth.register = function(user){
      return $http.post('/register', user).success(function(data){
        auth.saveToken(data.token);
        $state.go('home.locations');
      });
    };
   
   auth.logIn = function(user){
      return $http.post('/login', user).success(function(data){
        auth.saveToken(data.token);
        $state.go('home.locations');
      });
    };
   
   auth.logOut = function(){
      $window.localStorage.removeItem('flapper-news-token');
    };

   return auth;
}])
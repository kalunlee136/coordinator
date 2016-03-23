var app = angular.module('nightcoord', ['ui.router']);

app.controller('MainCtrl', ['$scope','clubs', '$state', 'auth', '$http', function($scope,clubs,$state,auth, $http){
    $scope.location = clubs.location;
    $scope.locations = clubs.locations;
    
    $scope.attendances = clubs.attendances;
    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.currentUser = auth.currentUser;
    $scope.logOut = auth.logOut;
    
    if($scope.locations.length > 0 && $state.$current.name === "home")
      $state.transitionTo('home.locations');
    
    $scope.incrementUpvotes = function(post) {
      clubs.upvote(post);
    };
    
    $scope.submit_location = function(){
      clubs.save_place($scope.location);
      clubs.get_all_locations($scope.location);
    };
   
   $scope.submit_attendance = function(location, id){
     if(auth.isLoggedIn()){
       clubs.submit_attendance(location,id);
     }else{
       alert('Please log-in or register');
     }  
   }
  
  console.log('loc',clubs.location)
  
  if(clubs.location.length > 1){
  
    $http.get('https://nominatim.openstreetmap.org/search?q='+clubs.location.toString()+'&format=json').then(function(coord){
      var loc_coords = coord.data[0];

      var locations = clubs.locations;
      
      var mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(loc_coords.lat, loc_coords.lon),
          mapTypeId: google.maps.MapTypeId.TERRAIN
      }
  
      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  
      $scope.markers = [];
      
      var infoWindow = new google.maps.InfoWindow();
      
      var createMarker = function (info){
          
          var marker = new google.maps.Marker({
              map: $scope.map,
              position: new google.maps.LatLng(info.location.coordinate.latitude, info.location.coordinate.longitude),
              title: info.name
          });
          marker.content = '<div class="infoWindowContent">' +  info.location.display_address[0] + '<br>' + info.upvotes + ' people attending' + '</div>';
          
          google.maps.event.addListener(marker, 'click', function(){
              infoWindow.setContent('<h3>' + marker.title + '</h3>' + marker.content);
              infoWindow.open($scope.map, marker);
          });
          
          $scope.markers.push(marker);
          
      }  
      
      for (var i = 0; i < locations.length; i++){
          createMarker(locations[i]);
      }
  
      $scope.openInfoWindow = function(e, selectedMarker){
          e.preventDefault();
          google.maps.event.trigger(selectedMarker, 'click');
      }
      
      console.log('club loc', locations, loc_coords)
      
    })
    
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
  
  factory.location = '';
  
  factory.save_place = function(loc){
    factory.location = loc;
  }
  
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
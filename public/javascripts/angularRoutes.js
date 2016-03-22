app.config(['$stateProvider','$urlRouterProvider','$locationProvider',function($stateProvider, $urlRouterProvider,$locationProvider) {
    $stateProvider
       .state('home.locations',{
          templateUrl: 'partials/home.locations.html'
       })
      
      .state('home', {
        url: '/',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/home.html', controller: 'MainCtrl'}
        }
      })
      
      .state('register', {
        url: '/register',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/register.html', controller: 'AuthCtrl'}
        },
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      
      .state('login', {
        url: '/login',
        views:{
          'header':{templateUrl:'/partials/header.html'},
          'body':{templateUrl: 'partials/login.html', controller: 'AuthCtrl'}
        },
        onEnter: ['$state', 'auth', function($state, auth){
          if(auth.isLoggedIn()){
            $state.go('home');
          }
        }]
      })
      
      .state('profile',{
        url:'/profile',
        views:{'body':{templateUrl: 'partials/login.html', controller:'MainCtrl'}
          
        }
      })
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('');
}]);


var myApp = angular.module("myApp", ["ngRoute", "firebase"]);
myApp.config(['$routeProvider', '$sceDelegateProvider', function($routeProvider, $sceDelegateProvider, $mdThemingProvider) {

    $routeProvider
        .when('/home', {
            templateUrl: '/views/partials/home.html',
            controller: 'HomeController'
        })
        .when('/admin', {
            templateUrl: '/views/partials/admin.html',
            controller: 'AdminController'
        })
        .when('/mission', {
            templateUrl: '/views/partials/mission.html',
            controller: 'MissionController'
        })
        .when('/services', {
            templateUrl: '/views/partials/services/serviceOverview.html',
            controller: 'ServiceOverviewController'
        })
        .when('/media_buyer', { //page going over the process of buying media space;
            templateUrl: '/views/partials/services/mediaBuyers.html',
            controller: 'MBController'
        })
        .when('/media_seller', { //page going over the process of putting media space up for sale
            templateUrl: '/views/partials/services/mediaSellers.html',
            controller: 'MSController'
        })
        .when('/design', { //page going over our design services
            templateUrl: '/views/partials/services/design.html',
            controller: 'DesignController'
        })
        .when('/media_buyer/buy', { //page with the functionality to purchase space

        })
        .when('/media_seller/sell', { //page with the functionality to put space up for sale

        })
        .when('/contactUs', { //page going over our design services
            templateUrl: '/views/partials/contactUs.html',
            controller: 'ContactUsController'
        })
        .when('/dashboard', { //page going over our design services
            templateUrl: '/views/partials/dashboard.html',
            controller: 'DashboardController'
        })
        .when('/meetTheTeam', {
          templateUrl: '/views/partials/meetTheTeam.html',
          controller: 'MeetTheTeamController'
        })
        .when('/news', {
          templateUrl: '/views/partials/news.html',
          controller: 'NewsController'
        })
        .when('/TOS', {
          templateUrl: '/views/partials/TOS.html',
          controller: 'TOSController'
        })
        .when('/privacy', {
          templateUrl: '/views/partials/privacy.html',
          controller: 'PrivacyController'
        })

        .otherwise({
            redirectTo: 'home'
        });

}]);

myApp.run(['$rootScope', '$location', 'AuthFactory', redirectHome]);
 //  In combination with the route configuration, this redirects to
 //  the home view if user is not authenticated
 function redirectHome($rootScope, $location, AuthFactory) {
     $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
         if (error === 'AUTH_REQUIRED') {
             $location.path('/login');
         }
     });
}

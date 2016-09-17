var app = angular.module('app', ['app.home','app.episodes','ngMaterial','ngMdIcons']).constant('_', window._)
.config(['$stateProvider','$urlRouterProvider','$mdThemingProvider', function( $stateProvider, $urlRouterProvider, $mdThemingProvider ) {
  $urlRouterProvider.otherwise( '/home' );
  // $mdThemingProvider.theme('default')
  //   .primaryPalette(‘cyan’, {
  //     'default': '400',
  //     'hue-1': '100',
  //     'hue-2': '600',
  //     'hue-3': 'A100'
  //   })
  //   .accentPalette('amber')
  //   .warnPalette('red')
  //   .backgroundPalette('grey');
}]);
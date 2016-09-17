app.service('seriesService', function($q,_) {
    this.getSeries=function(){
    	var deferred = $q.defer();
			chrome.storage.sync.get(null, function (data) {
				var seriesArray=_.mapValues(data, function(o){
					return o[o.length-1].date;
				});
				var seriesArraySorted = Object.keys(seriesArray).sort(function(a,b){return seriesArray[b]-seriesArray[a]})
				deferred.resolve(seriesArraySorted);	
			});
		return deferred.promise;
    }

    this.getEpisodes=function(series){
    	var deferred = $q.defer();
			chrome.storage.sync.get(series, function (data) {
				var episodes=data[series];
				var sortedEpisodes= _.sortBy(episodes, function(o){
					return -o;
				});
				deferred.resolve(sortedEpisodes);
			});
		return deferred.promise;
    }
});

angular.module('app.home',['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('home', {
    url: '/home',
    views : {
      'main@' : {
        templateUrl : '../home.html',
        controller : 'HomeController',
        resolve:{
          seriesInstance :['seriesService', function(seriesService){
            return seriesService.getSeries();
          }]
        }
      }
    }
  });
}])
.controller('HomeController',['$scope','seriesInstance',
  function($scope,seriesInstance){
  	$scope.seriesList=seriesInstance;
}]);


angular.module('app.episodes',['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('episodes', {
    url: '/episodes/:series',
    views : {
      'episodes@' : {
        templateUrl : '../episodes.html',
        controller : 'EpisodesController',
        resolve:{
          episodesInstance :['seriesService','$stateParams', function(seriesService,$stateParams){
            return seriesService.getEpisodes($stateParams.series);
          }]
        }
      }
    }
  });
}])
.controller('EpisodesController',['$scope','episodesInstance','$stateParams',
  function($scope,episodesInstance,$stateParams){
  	$scope.episodesList=episodesInstance;
  	$scope.series=$stateParams.series;
}]);
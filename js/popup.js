app.service('seriesService', function($q,_) {
	this.getSeries=function(){
		var deferred = $q.defer();
		chrome.storage.sync.get(null, function (data) {
			var seriesArray=_.mapValues(data, function(o,key){
				return {date:o.episodes[o.episodes.length-1].date,img:o.seriesImage,series:key};
			});
			seriesArray = _.values(seriesArray);
			seriesArray=seriesArray.sort(function(a,b){ return b.date-a.date});
			deferred.resolve(seriesArray);	
		});
		return deferred.promise;
	}

	this.getEpisodes=function(series){
		var deferred = $q.defer();
		chrome.storage.sync.get(series, function (data) {
			var episodes=data[series].episodes;
			deferred.resolve(episodes);
		});
		return deferred.promise;
	}

	this.deleteSeries=function(series){
		var deferred = $q.defer();
		chrome.storage.sync.remove(series, function(result) {
			if (!chrome.runtime.error) {
				deferred.resolve('success');
			}
			else{
				deferred.resolve('error');
			}
		});
		return deferred.promise;
	}

	this.deleteEpisode=function(series,episodeIndex){
		var deferred = $q.defer();
		chrome.storage.sync.get(series,(data) => {
			var episodes=data[series].episodes;
			if(episodes.length > 1){
				episodes.splice(episodeIndex, 1);
				var obj={};
				obj[series]={
					seriesImage:data[series].seriesImage,
					episodes:episodes
				};
				chrome.storage.sync.set(obj, (result) =>{
					if (!chrome.runtime.error) {
						deferred.resolve('success');
					}
					else{
						deferred.resolve('error');
					}
				});
			}
			else{
				chrome.storage.sync.remove(series, function(result) {
					if (!chrome.runtime.error) {
						deferred.resolve('success-series');
					}
					else{
						deferred.resolve('error');
					}
				});
			}
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
		$scope.redirectGeekTV=function(){
			chrome.tabs.create({url: "http://geektv.ma"});
    		window.close();
		}
		$scope.listFilter={
			season:""
		}

	}]);


angular.module('app.episodes',['ui.router'])

.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
	$stateProvider.state('episodes', {
		url: '/episodes/:series/:img',
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
.controller('EpisodesController',['$scope','episodesInstance','seriesService','$stateParams','$mdDialog','$location','$mdToast',
	function($scope,episodesInstance,seriesService,$stateParams,$mdDialog,$location,$mdToast){
		$scope.episodesList=episodesInstance;
		$scope.series=$stateParams.series;
		$scope.seriesImage=$stateParams.img;
		$scope.loading=false;
		
		$scope.redirect=function(url){
			chrome.tabs.update({url: url});
    		window.close();
		}

		$scope.showDeleteAllConfirm = function(ev) {
			var confirm = $mdDialog.confirm()
			.title('Would you like to delete this series from your history?')
			.targetEvent(ev)
			.ok('Yes')
			.cancel('Cancel');

			$mdDialog.show(confirm).then(function() {
				$scope.loading=true;
				seriesService.deleteSeries($scope.series).then(function(result){
					$scope.loading=false;
					if(result=='success'){
						$location.path('home');
						$mdToast.show(
							$mdToast.simple()
							.textContent($scope.series + " deleted")
							.hideDelay(2000)
							);
					}
					else{
						$mdToast.show(
							$mdToast.simple()
							.textContent("An error occured, could not remove "+$scope.series)
							.hideDelay(3000)
							);
					}
				});
			});
		};
		$scope.showDeleteEpisodeConfirm = function(ev,episode) {
			var episodeIndex=$scope.episodesList.indexOf(episode);
			var confirm = $mdDialog.confirm()
			.title('Would you like to delete this episode from your history?')
			.targetEvent(ev)
			.ok('Yes')
			.cancel('Cancel');

			$mdDialog.show(confirm).then(function() {
				$scope.loading=true;
				seriesService.deleteEpisode($scope.series,episodeIndex).then(function(result){
					$scope.loading=false;
					if(result=='success'){
						$scope.episodesList.splice(episodeIndex, 1);
						$mdToast.show(
							$mdToast.simple()
							.textContent($scope.series+" Season "+ episode.season +" Episode "+ episode.episode+ " deleted")
							.hideDelay(2000)
							);
					}
					else if(result=='success-series'){
						$location.path('home');
						$mdToast.show(
							$mdToast.simple()
							.textContent($scope.series + " deleted")
							.hideDelay(2000)
						);
					}
					else{
						$mdToast.show(
							$mdToast.simple()
							.textContent("An error occured, could not remove episode")
							.hideDelay(3000)
							);
					}
				});
			});
		};
	}]);
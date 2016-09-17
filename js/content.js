if ((document.documentElement.textContent || document.documentElement.innerText).indexOf('Episode not aired yet. Come back again') == -1){
	var h2s = document.getElementsByTagName("h2");
	var h4s = document.getElementsByTagName("h4");
	var imgNode = document.querySelector('.thumbnail');
	var nextEpisodeNode=document.querySelector('.btn.btn-info.btn-block');
	
	if(h2s.length > 0){
		if(h2s[0].innerText.indexOf("-")!==-1){
			var h2Text= h2s[0].innerText.split("-");
			var series_name= h2Text[0].trim();
			var season_episode=h2Text[1].trim();
			var season=season_episode.substring(season_episode.indexOf('S')+1,season_episode.indexOf('E'));
			var episode=season_episode.substring(season_episode.indexOf('E')+1,season_episode.indexOf(' '));
			var episode_name = h4s[0].innerText.substring(h4s[0].innerText.indexOf(':')+1).trim();
			var seriesImage="http://placehold.it/110x150?text=No+Image";
			var nextEpisode=false;

			if(imgNode){
				let imgSrc=imgNode.getAttribute('src');
				if(imgSrc.indexOf('/cover/')!==-1){
					seriesImage=imgSrc;
				}
			}

			if(nextEpisodeNode){
				let text=nextEpisodeNode.innerText;
				if(text.indexOf('NEXT') >-1){
					nextEpisode=nextEpisodeNode.getAttribute('href');
				}
			}

			var episode_object={	
				season:season,
				episode:episode,
				episodeName:episode_name,
				date:Date.now(),
				episodeURL:window.location.href,
				nextEpisode:nextEpisode
			}

			chrome.storage.sync.get(series_name, function (data) { 
				if (data.hasOwnProperty(series_name)) {
					var episodes_array=data[series_name];
					var exists=false;
					for(var i=0;i < episodes_array.length;i++){
						if(episodes_array[i].episode==episode_object.episode && episodes_array[i].season==episode_object.season ){
							exists=true;
						}
					}
					if(!exists){
						var obj={};
						episodes_array.push(episode_object);
						obj[series_name]=episodes_array;
						chrome.storage.sync.set(obj, function(result) {
						});
					}
				}
				else{
					var obj={};
					obj[series_name]=[episode_object];
					chrome.storage.sync.set(obj, function(result) {
					});
				}
			});


		}
	}
}
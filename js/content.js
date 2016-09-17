var h2s = document.getElementsByTagName("h2");
var h4s = document.getElementsByTagName("h4");

if(h2s.length > 0){
	if(h2s[0].innerText.indexOf("-")!==-1){
		var h2Text= h2s[0].innerText.split("-");
		var series_name= h2Text[0].trim();
		var season_episode=h2Text[1].trim();
		var season=season_episode.substring(season_episode.indexOf('S')+1,season_episode.indexOf('E'));
		var episode=season_episode.substring(season_episode.indexOf('E')+1,season_episode.indexOf(' '));
		var episode_name = h4s[0].innerText.substring(h4s[0].innerText.indexOf(':')+1).trim();

		
		var episode_object={	
			season:season,
			episode:episode,
			episode_name:episode_name,
			date:Date.now()
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
				        console.log("saved");
				    });
				}
			}
			else{
				var obj={};
				obj[series_name]=[episode_object];
				chrome.storage.sync.set(obj, function(result) {
			        console.log("saved");
			    });
			}
		});


	}
}
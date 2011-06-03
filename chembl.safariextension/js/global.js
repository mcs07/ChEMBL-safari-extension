function performCommand(event) {
	if (event.command !== 'chemblSearch')
		return;
	var searchUrl = 'https://www.ebi.ac.uk/chembldb/index.php/compound/keyword',
		query = event.userInfo;
	$.post(searchUrl, {keyword: query }, function(data) {
		$(data).find('results').each(function(){  
 			var $results = $(this);
 			var url = $results.find('url').text();  
 			url = url.replace(/:/g,"/");
 			url = 'https://www.ebi.ac.uk/chembldb/index.php'+url;
 			parseResults(url);
 		});
	},'xml');
}

function parseResults(url) {
	$.get(url, function(data) {
		var idsArray = new Array();
		var images = $(data).find('img[src*="/chembldb/index.php/compound/displayimage/"]');
		$(images).each(function() {
    		var src = $(this).attr('src').split('/'),
    			imgId = src[src.length-1],
    			chemblId = $(this).nextAll('a').eq(0).html().substr(6);
				idsArray.push({imgId:imgId, chemblId:chemblId});
		});
		console.log(idsArray);
		app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', idsArray);
	});
}

function validateCommand(event) {
	var contextText = event.userInfo;
	if (event.command !== 'chemblSearch' || contextText===undefined) {
		return;
	}
	if (contextText.length == 0 || !contextText) {
		event.target.disabled = true;
	}
	if (contextText.length > 25) {
		contextText = contextText.substr(0,25);
		contextText = contextText.replace(/^\s+|\s+$/g,'');
		contextText = contextText + '...'
	}
	event.target.title = 'Search for "'+contextText+'" on ChEMBL'; 
}

const app = safari.application;
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
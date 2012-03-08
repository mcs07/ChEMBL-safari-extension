var locX, locY;

function contextMessage(e) {
	locX = e.clientX + 10;
    locY = e.clientY + 10;
	var sel = '';
	sel = window.parent.getSelection()+'';
	sel = sel.replace(/^\s+|\s+$/g,'');
	safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
	if (msg.name === 'searchResults') {
		openWindow(msg.message);
	}
}

function openWindow(msg) {
	var imgString = '';
	if (window !== window.top) 
		return;
	if ($('link[href^="safari-extension://com.macosxtips.chembl"][href$="css/chembl.css"]').length == 0) {
		$('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/chembl.css">').appendTo('head');
	}
	var $popupDiv = $('<div/>').appendTo('body');
	if (msg.length < 1) {
		$('<div>No Results Found</div>').appendTo($popupDiv);
		$popupDiv.dialog({
			position: [locX,locY],
			minWidth: 128,
			minHeight: 176,
			width: 136,
			title: 'Error',
			buttons: [
				{text: 'Close', 'class':'__chembl-dialog-button-view', click: function() {
					$(this).dialog("close"); 
				}},
			]
		});
	} else {
		$.each(msg, function(i, idObj) {
			imgString += '<img src="https://www.ebi.ac.uk/chembldb/index.php/compound/displayimage/'+idObj.imgId+'">'
		});
		$(imgString).appendTo($popupDiv);
		$popupDiv.dialog({
			position: [locX,locY],
			minWidth: 128,
			minHeight: 176,
			width: 136,
			title: 'CHEMBL'+msg[0].chemblId,
			buttons: [
				{text: 'Prev', 'class':'__chembl-dialog-button-prev', click: function() { 
					$(this).scrollTo({top:0, left:'-=134'}, 400, {onAfter:function(){
						$(this).dialog('option', 'title', 'CHEMBL'+msg[$(this).scrollLeft()/134].chemblId);
					}});
				}},
				{text: 'View', 'class':'__chembl-dialog-button-view', click: function() {
					safari.self.tab.dispatchMessage('openPage', $(this).prev().children().eq(0).text());
				}},
				{text: 'Next', 'class':'__chembl-dialog-button-next', click: function() {
					$(this).scrollTo({top:0, left:'+=134'}, 400, {onAfter:function(){
						$(this).dialog('option', 'title', 'CHEMBL'+msg[$(this).scrollLeft()/134].chemblId);
					}});
				}},
			]
		});
	}
}

document.addEventListener('contextmenu', contextMessage, false);
safari.self.addEventListener('message', handleMessage, false);

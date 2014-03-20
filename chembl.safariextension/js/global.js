function performCommand(event) {
	if (event.command !== 'chembl') return;
	var id = 'chembl-safari-extension-' + Date.now();
	app.activeBrowserWindow.activeTab.page.dispatchMessage('showLoading', id);
	$.post(kurl, {keyword: event.userInfo}, function() {
		$.get(durl, dparams, function(data) {
			msg = {'id': id, 'results': data};
			app.activeBrowserWindow.activeTab.page.dispatchMessage('searchResults', msg);
		}, 'json');
	});
}

function validateCommand(e) {
	var selection = e.userInfo;
	if (e.command !== 'chembl' || selection === undefined) {
		return;
	}
	// Only show ChEMBL context menu item if there is some selected text
	if (selection.length == 0 || !selection) {
		e.target.disabled = true;
	}
	// Truncate the menu item text if the selection is over 25 characters
	if (selection.length > 25) {
		selection = selection.substr(0, 25).replace(/^\s+|\s+$/g,'') + '...';
	}
	e.target.title = 'Search for "'+selection+'" on ChEMBL';
}

function handleMessage(msg) {
	if (msg.name === 'viewCompound') {
		var url = 'https://www.ebi.ac.uk/chembl/compound/inspect/'+msg.message;
		switch (ext.settings.resultsType) {
		case 'foreground':
			app.activeBrowserWindow.openTab('foreground').url = url;
			break;
		case 'background':
			app.activeBrowserWindow.openTab('background').url = url;
			break;
		case 'new':
			app.openBrowserWindow();
			app.activeBrowserWindow.activeTab.url = url;
			break;
		case 'current':
			app.activeBrowserWindow.activeTab.url = url;
			break;
		}
	}
}

const app = safari.application,
	  ext  = safari.extension;
var kurl = 'https://www.ebi.ac.uk/chembldb/index.php/compound/keyword',
	durl = 'https://www.ebi.ac.uk/chembl/compound/data',
	dparams = {
		sEcho: 1, iColumns: 22, iDisplayStart: 0, iDisplayLength: 10, mDataProp_0: 0, mDataProp_1: 1, mDataProp_2: 2,
		mDataProp_3: 3, mDataProp_4: 4, mDataProp_5: 5, mDataProp_6: 6, mDataProp_7: 7, mDataProp_8: 8, mDataProp_9: 9,
		mDataProp_10: 10, mDataProp_11: 11, mDataProp_12: 12, mDataProp_13: 13, mDataProp_14: 14, mDataProp_15: 15,
		mDataProp_16: 16, mDataProp_17: 17, mDataProp_18: 18, mDataProp_19: 19, mDataProp_20: 20, mDataProp_21: 21,
		iSortCol_0: 0, sSortDir_0: 'asc', iSortingCols: 1, bSortable_0: true, bSortable_1: true, bSortable_2: true,
		bSortable_3: true, bSortable_4: true, bSortable_5: true, bSortable_6: true, bSortable_7: true,
		bSortable_8: true, bSortable_9: true, bSortable_10: true, bSortable_11: true, bSortable_12: true,
		bSortable_13: true, bSortable_14: true, bSortable_15: true, bSortable_16: true, bSortable_17: true,
		bSortable_18: true, bSortable_19: true, bSortable_20: true, bSortable_21: false
};
app.addEventListener('command', performCommand, false);
app.addEventListener('validate', validateCommand, false);
app.addEventListener('message', handleMessage, false);

var locX, locY, locZ = 0;

function handleContextMenu(e) {
    // Get mouse position, but limit to page size constraints
    locX = Math.min(e.pageX + 10, $(document).width() - 200);
    locY = Math.min(e.pageY + 10, $(document).height() - 300);
    // Get selection and set as userInfo for global page
    var sel = '';
    sel = window.parent.getSelection()+'';
    sel = sel.replace(/^\s+|\s+$/g,'');
    safari.self.tab.setContextMenuEventUserInfo(e, sel);
}

function handleMessage(msg) {
	if (window !== window.top) return;
	if (msg.name === 'showLoading') {
        showLoading(msg.message);
    } else if (msg.name === 'searchResults') {
        displayResult(msg.message);
    }
}

function showLoading(id) {
    if ($('link[href^="safari-extension://com.matt-swain.chembl"][href$="css/chembl.css"]').length == 0) {
        $('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/chembl.css">').appendTo('head');
	}
    var dialog = $('<div class="chembl-safari-extension" />').attr('id', id),
        title = $('<div class="cssse-title">ChEMBL</div>')
        spinner = $('<div class="cssse-spinner" />'),
        close = $('<button type="button" class="cssse-close">×</button>')
    close.click(function() { $(this).parent().fadeOut(); });
    title.css({backgroundImage: 'url('+safari.extension.baseURI+'img/icon-small.png)'});
    dialog.append(close).append(title).append(spinner);
    dialog.css({top: locY, left: locX, display: 'none'});
    dialog.drags({handle: '.cssse-title'})
    dialog.appendTo('body').fadeIn();
}

function displayResult(msg) {
	console.log('displayResult');

	// Save: https://www.ebi.ac.uk/chembl/download_helper/getmol/<regno>
	// View: https://www.ebi.ac.uk/chembl/compound/inspect/<chemblid>
	// Img: https://www.ebi.ac.uk/chembl/compound/displayimage/<regno>

    var dialog = $('#'+msg.id);
    $('div.cssse-spinner', dialog).fadeOut(function() {
    	console.log(msg.results);
        if (msg.results.aaData.length < 1) {
            $('<div class="cssse-noresults">No Results Found</div>').appendTo(dialog);
        } else {
            if (msg.results.aaData.length > 1) {
		        $('<button type="button" class="cssse-prev cssse-arrow">⟨</button>').click(function() {
		            $('.cssse-slider', $(this).parent()).scrollTo({top:0, left:'-=175'}, 400);
		        }).appendTo(dialog);
		    }
            //$('.title', dialog).eq(0).html('CID <span class="cid">'+msg.results[0].cid+'</span>');
            var slider = $('<div class="cssse-slider" />');
            $.each(msg.results.aaData, function(i, result) {
            	var title = result[1];
            	if (result[2] !== null) {
        			names = result[2].split(' | ').filter(function(t) { return t.indexOf('SID') !== 0 && t })
        			if (names.length > 0) {
        				title += ': '+ names[0];
        			}
            	}


                var img = $('<img src="https://www.ebi.ac.uk/chembl/compound/displayimage/'+result[0]+'" title="'+title+'">'),
                    save = $('<button type="button" title="Save MOL file for '+result[1]+'" class="cssse-save">Save</button>'),
                    view = $('<button type="button" title="View record page for '+result[1]+'" class="cssse-view">View</button>'),
                    cap = $('<div class="cssse-caption">CHEMBL<span class="cssse-cid">'+result[1].substring(6)+'</span></div>');
                save.click(function() {
                    location.href = 'https://www.ebi.ac.uk/chembl/download_helper/getmol/'+result[0];
                });
                view.click(function() {
                    safari.self.tab.dispatchMessage('viewCompound', result[1]);
                });
			    $('<div class="cssse-mol" />').append(img).append(save).append(view).append(cap).appendTo(slider);
		    });
		    slider.hide().appendTo(dialog);
		    dialog.animate({height: slider.height()+36}, 300, function () {
		        slider.fadeIn(300);
            });
		    if (msg.results.aaData.length > 1) {
		        $('<button type="button" class="cssse-next cssse-arrow">⟩</button>').click(function() {
		            $('.cssse-slider', $(this).parent()).scrollTo({top:0, left:'+=175'}, 400);
		        }).appendTo(dialog);
		    }

        }
    });
}

// function openWindow(msg) {
// 	var imgString = '';
// 	if (window !== window.top)
// 		return;
// 	if ($('link[href^="safari-extension://com.macosxtips.chembl"][href$="css/chembl.css"]').length == 0) {
// 		$('<link rel="stylesheet" href="'+safari.extension.baseURI+'css/chembl.css">').appendTo('head');
// 	}
// 	var $popupDiv = $('<div/>').appendTo('body');
// 	if (msg.length < 1) {
// 		$('<div>No Results Found</div>').appendTo($popupDiv);
// 		$popupDiv.dialog({
// 			position: [locX,locY],
// 			minWidth: 128,
// 			minHeight: 176,
// 			width: 136,
// 			title: 'Error',
// 			buttons: [
// 				{text: 'Close', 'class':'__chembl-dialog-button-view', click: function() {
// 					$(this).dialog("close");
// 				}},
// 			]
// 		});
// 	} else {
// 		$.each(msg, function(i, idObj) {
// 			imgString += '<img src="https://www.ebi.ac.uk/chembldb/index.php/compound/displayimage/'+idObj.imgId+'">'
// 		});
// 		$(imgString).appendTo($popupDiv);
// 		$popupDiv.dialog({
// 			position: [locX,locY],
// 			minWidth: 128,
// 			minHeight: 176,
// 			width: 136,
// 			title: 'CHEMBL'+msg[0].chemblId,
// 			buttons: [
// 				{text: 'Prev', 'class':'__chembl-dialog-button-prev', click: function() {
// 					$(this).scrollTo({top:0, left:'-=134'}, 400, {onAfter:function(){
// 						$(this).dialog('option', 'title', 'CHEMBL'+msg[$(this).scrollLeft()/134].chemblId);
// 					}});
// 				}},
// 				{text: 'View', 'class':'__chembl-dialog-button-view', click: function() {
// 					safari.self.tab.dispatchMessage('openPage', $(this).prev().children().eq(0).text());
// 				}},
// 				{text: 'Next', 'class':'__chembl-dialog-button-next', click: function() {
// 					$(this).scrollTo({top:0, left:'+=134'}, 400, {onAfter:function(){
// 						$(this).dialog('option', 'title', 'CHEMBL'+msg[$(this).scrollLeft()/134].chemblId);
// 					}});
// 				}},
// 			]
// 		});
// 	}
// }


// Draggable code
(function($) {
    $.fn.drags = function(opt) {
        opt = $.extend({cursor:'move'}, opt);
        var $el = this.find(opt.handle);
        return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
            var $drag = $(this).addClass('cssse-active-handle').parent().addClass('cssse-draggable');
            locZ = Math.max(5001, locZ+1);
            var drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', locZ).parents().on('mousemove', function(e) {
                $('.cssse-draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on('mouseup', function() {
                    $(this).removeClass('cssse-draggable');
                });
            });
            e.preventDefault(); // disable selection
        }).on('mouseup', function() {
            $(this).removeClass('cssse-active-handle').parent().removeClass('cssse-draggable');
        });
    }
})(jQuery);

document.addEventListener('contextmenu', handleContextMenu, false);
safari.self.addEventListener('message', handleMessage, false);

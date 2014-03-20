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
        title = $('<div class="chsse-title">ChEMBL</div>')
        spinner = $('<div class="chsse-spinner" />'),
        close = $('<button type="button" class="chsse-close">×</button>')
    close.click(function() { $(this).parent().fadeOut(); });
    title.css({backgroundImage: 'url('+safari.extension.baseURI+'img/icon-small.png)'});
    dialog.append(close).append(title).append(spinner);
    dialog.css({top: locY, left: locX, display: 'none'});
    dialog.drags({handle: '.chsse-title'})
    dialog.appendTo('body').fadeIn();
}

function displayResult(msg) {
    var dialog = $('#'+msg.id);
    $('div.chsse-spinner', dialog).fadeOut(function() {
        if (msg.results.aaData.length < 1) {
            $('<div class="chsse-noresults">No Results Found</div>').appendTo(dialog);
        } else {
            if (msg.results.aaData.length > 1) {
		        $('<button type="button" class="chsse-prev chsse-arrow">⟨</button>').click(function() {
		            $('.chsse-slider', $(this).parent()).scrollTo({top:0, left:'-=175'}, 400);
		        }).appendTo(dialog);
		    }
            var slider = $('<div class="chsse-slider" />');
            $.each(msg.results.aaData, function(i, result) {
            	var title = result[1];
            	if (result[2] !== null) {
        			names = result[2].split(' | ').filter(function(t) { return t.indexOf('SID') !== 0 && t })
        			if (names.length > 0) {
        				title += ': '+ names[0];
        			}
            	}
                var img = $('<img src="https://www.ebi.ac.uk/chembl/compound/displayimage/'+result[0]+'" title="'+title+'">'),
                    save = $('<button type="button" title="Save MOL file for '+result[1]+'" class="chsse-save">Save</button>'),
                    view = $('<button type="button" title="View record page for '+result[1]+'" class="chsse-view">View</button>'),
                    cap = $('<div class="chsse-caption">CHEMBL<span class="chsse-cid">'+result[1].substring(6)+'</span></div>');
                save.click(function() {
                    location.href = 'https://www.ebi.ac.uk/chembl/download_helper/getmol/'+result[0];
                });
                view.click(function() {
                    safari.self.tab.dispatchMessage('viewCompound', result[1]);
                });
			    $('<div class="chsse-mol" />').append(img).append(save).append(view).append(cap).appendTo(slider);
		    });
		    slider.hide().appendTo(dialog);
		    dialog.animate({height: slider.height()+36}, 300, function () {
		        slider.fadeIn(300);
            });
		    if (msg.results.aaData.length > 1) {
		        $('<button type="button" class="chsse-next chsse-arrow">⟩</button>').click(function() {
		            $('.chsse-slider', $(this).parent()).scrollTo({top:0, left:'+=175'}, 400);
		        }).appendTo(dialog);
		    }

        }
    });
}

// Draggable code
(function($) {
    $.fn.drags = function(opt) {
        opt = $.extend({cursor:'move'}, opt);
        var $el = this.find(opt.handle);
        return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
            var $drag = $(this).addClass('chsse-active-handle').parent().addClass('chsse-draggable');
            locZ = Math.max(5001, locZ+1);
            var drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', locZ).parents().on('mousemove', function(e) {
                $('.chsse-draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on('mouseup', function() {
                    $(this).removeClass('chsse-draggable');
                });
            });
            e.preventDefault(); // disable selection
        }).on('mouseup', function() {
            $(this).removeClass('chsse-active-handle').parent().removeClass('chsse-draggable');
        });
    }
})(jQuery);

document.addEventListener('contextmenu', handleContextMenu, false);
safari.self.addEventListener('message', handleMessage, false);

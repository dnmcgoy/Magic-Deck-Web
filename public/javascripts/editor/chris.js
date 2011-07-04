var basepath = "";
var deckNameEditable = false;
var activePile = null;
var pileTemplate = null;
var runTemplate = null;

$(document).ready(
    function() {

	pileTemplate = $('#templates .pile').first();
	runTemplate = $('#templates .run').first();

	var pathname = document.location.pathname;
	basepath = pathname.substring(0, pathname.lastIndexOf('/')+1);
	debug.info(basepath + " is base of path " + pathname);

	switchPile( maindeck() );
	debug.info("Initial pile maindeck, id: " + activePile);

	focusEntry();

	$( ".column" ).sortable({
	    connectWith: ".column",
	    receive: onRunReceive,
            items: ".run"
	});

	$( ".portlet" ).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" );
        $( ".portlet" ).hoverIntent(function() {
          $(this).children(".oracle_text").show();
          $(this).animate({
            height: '100px'
          },400);
        },function() {
          $(this).children(".oracle_text").hide();
          $(this).animate({
            height: '20px'
          }, 400);
        });
        $(".oracle_text").hide();

        $( ".column" ).disableSelection();

	$( "#new_pile_form" ).dialog({
	    autoOpen: false,
	    height: 300,
	    width: 350,
	    modal: true,
	    buttons: {
		"Create new pile": function() {
		    var pileName = $('#name').val();
		    debug.info("Creating new pile " + pileName);
		    addPile(pileName);
		    $( this ).dialog( "close" );
		},
		Cancel: function() {
		    $( this ).dialog( "close" );
		}
	    },
	    close: function() {
	    }
	});

	$(".delete_pile").live(
	    "click",
	    function(e){
		var pileId = $(e.target).text();
                debug.info("deleting pile " + pileId);
        	var path = basepath + "piles/" + pileId;
		$.ajax({
		    type: "DELETE",
		    url: path,
		    success: function(msg){
			debug.info("pile " + pileId + " was deleted");
			$("#" + pileId).remove();
			if (pileId == activePile) {
			    switchPile( maindeck() );
			}
		    }
		});
		focusEntry();
		e.stopImmediatePropagation();
	    });

	$("span.delete_run").live(
	    "click",
	    function(e){
		var runId = $(e.target).parent().parent().attr("id");
		debug.info("deleting run " + runId);
		var path = basepath + "runs/" + runId;
		$.ajax({
		    type: "DELETE",
		    url: path,
		    success: function(msg){
			debug.info("run " + runId + " was deleted");
			$("#" + runId).remove();
			onCardsChanged();
		    }
		});
		focusEntry();
		e.stopImmediatePropagation();
	    });

	$('#pile_select').change(
	    function(a, b, c) {
		var pileName = $('#pile_select').val();
		debug.info("Pile selected: " + pileName);
		if (pileName == 'newpile') {
		    $( "#new_pile_form" ).dialog( "open" );
		} else if(pileName == 'mergepile') {
		    // prompt and then have them click?
		} else {
		    changePile(pileName);
		}
	    }
	);

	$('#edit_deck_name').click(
	    function() {
		updateDeckName();
	    }
	);
	$("#deck_name_field").keypress(
	    function(e) {
		if (e.which == 13) {
		    updateDeckName();
		}
	    });

	//tab - 0
	//enter = 13
	$("#card_entry").keypress(
	    function(e) {
		if (e.which == 13) {
		    $("#card_entry").autocomplete("close");
		    addCard();
		}
	    });

	$("#add_card_button").click(
	    function() {
		addCard();
	    });

	$( "#card_entry" ).autocomplete({
	    source: "/cards/autocomplete",
	    minLength: 2,
	    select: function( event, ui ) {
		addCard(ui.item.value);
		return false;
	    },
	    focus: function( event, ui ) {
		var match = $("#card_entry").val().match(/^(-?[0-9]*).*/);
		if (match) {
		    var prefixNumber = match[1];
		    $("card_entry").val(prefixNumber + " " + ui.label);
		}
		$("#preview_image").attr("src", "http://www.logic-by-design.com/magic_images/hi_res/" + ui.item.mtgid + ".jpg");
		return false;
	    }
	});

        $(".pile_title").live("click", function(e){
            switchPile($(e.target).parent().attr("id"));
        });

	onCardsChanged();
    }
);

// Handle a run being dragged from one pile to another
function onRunReceive(event, ui) {
    debug.info("onRunReceive");
    var newPile = event.target.id;
    var oldPile = ui.sender.context.id;
    var name = $(ui.item.context).find(".card_name").text();
    var count = $(ui.item.context).find(".run_count").text();

    var noop = function(data) {};
    sendCreateRun(count, name, newPile, noop);
    sendCreateRun('-'+count, name, oldPile, noop);
}

function focusEntry() {
    $("#card_entry").focus();
}

function onCardsChanged() {
    var visibility = ($(".unknown").size() > 0 ) ? "visible" : "hidden";
    debug.info("setting unknown header to " + visibility);
    $("#unknown_header").css("visibility", visibility);
}

function maindeck() {
    return $("#pile_title_maindeck").parent().attr("id");
}

function changePile(pileName) {
    debug.info("changing to pile " + pileName);
    if ($("#pile_title_" + pileName).length == 0) {
	addPile(pileName);
    } else {
	switchPile($("#pile_title_" + pileName).parent().attr("id"));
    };
}

function addPile(pileName) {
    debug.info("adding pile " + pileName);
    var url = basepath + "piles";
    $.post(
	url,
	{name: pileName},
	createPile,
	'json'
    );
}

function createPile(pile_response) {
    var pile = pile_response[0];
    // some stuff
    var newPile = pileTemplate.clone().insertBefore('#templates');
    debug.info(newPile);

    newPile.attr('id', pile.id);
    var title = newPile.children('.pile_title').first();
    title.attr('id', title.attr('id') + pile.name.toLowerCase());
    title.prepend(pile.name);
    title.find('span').text(pile.id);

    newPile.sortable({ connectWith: ".column" });

    debug.info("In create pile");
    debug.info(pile);
    switchPile(pile.id);
}

function switchPile(pileId) {
    debug.info("switching to pile " + pileId);
    $(".pile").removeClass("active_pile");
    $("#" + pileId).addClass("active_pile");
    activePile = pileId;
}

function updateDeckName() {
    deckNameEditable = !deckNameEditable;
    if (deckNameEditable) {
	makeNameEditable();
    } else {
	sendNameUpdate();
	makeNameUneditable();
    }
}

function sendNameUpdate() {
    var url = basepath + "rename";
    $.post(
	url,
	{name: $("#deck_name_field").val()},
	onNameUpdated,
	'json'
    );
}

function onNameUpdated(data) {
    debug.info("name updated result " + data);
}

function makeNameEditable() {
    $("#deck_name_show").css("visibility", "hidden");
    $("#deck_name_show").css("display", "none");

    $("#deck_name_field").val($("#deck_name_show").text());

    $("#deck_name_field").css("visibility", "visible");
    $("#deck_name_field").css("display", "inline");

    $("#deck_name_field").focus();
}
function makeNameUneditable() {
    $("#deck_name_field").css("visibility", "hidden");
    $("#deck_name_field").css("display", "none");

    $("#deck_name_show").text($("#deck_name_field").val());

    $("#deck_name_show").css("visibility", "visible");
    $("#deck_name_show").css("display", "inline");

    focusEntry();
}

function addCard(autocomplete) {
    var entryText = $("#card_entry")[0].value;
    if (entryText == "") {
	return;
    }

    var parsed = parseInput(entryText);
    var count = parsed.count;
    var name = parsed.name;
    if (autocomplete != null) name = autocomplete;

    sendCreateRun(count, name, activePile, onCardAdded);
}

function sendCreateRun(count, name, pile, callback) {
    debug.info("Sending addition of " + count + " " + name + " to pile " + pile);

    var url = basepath + "runs";
    $.post(
	url,
	{count: count, card_name: name, pile_id: pile},
	function(data) {
	    callback(data);
	},
	'json'
    );
    $("#card_entry").value = "";
    $("#card_entry")[0].value = "";
    $("#card_entry").focus();
}

function onCardAdded(run) {
    debug.info("in onCardAdded with");
    debug.info(run);

    if ($("#"+run.id).length == 0) {
	createRun(run);
    } else {
	updateRun(run);
    }
}

function createRun(run) {
    debug.info("In craete run");
    var newRun = runTemplate.clone();
    newRun.attr('id', run.id);
    newRun.find(".run_count").text(run.count);
    newRun.find(".card_name").text(run.name);
    newRun.find(".cc").text(run.cc);
    newRun.find(".cmc").text(run.cmc);
    $("#"+activePile).append(newRun);
}

function updateRun(run) {
    if (run.count == 0) {
	$('#'+run.id).remove();
    } else {
	$('#'+run.id).find(".run_count").text(run.count);
    }
}

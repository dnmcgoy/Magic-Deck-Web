var basepath = "";
var deckNameEditable = false;
var activePile = null;
var pileTemplate = null;
var runTemplate = null;
var resultTemplate = null;
var tooltipTemplate = null;

$(document).ready(function() {

    setupDropTargets();

    $( ".run" ).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" );

    pileTemplate = $('#templates .pile').first();
    runTemplate = $('#templates .run').first();
    resultTemplate = $('#templates .card_search_result').first();
    tooltipTemplate = $('#templates .tooltip').first();

    var pathname = document.location.pathname;
    basepath = pathname.substring(0, pathname.lastIndexOf('/')+1);
    debug.info(basepath + " is base of path " + pathname);

    switchPile( maindeck() );
    debug.info("Initial pile maindeck, id: " + activePile);

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
	function(e) {
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
	}
    );

    $("span.delete_run").live(
	"click",
	function(e){
	    var run = $(e.target).closest(".run");
	    var runId = run.attr("id");
	    var pileId = run.closest(".pile").attr("id");
	    debug.info("deleting run " + runId);
	    var path = basepath + "runs/" + runId;
	    $.ajax({
		type: "DELETE",
		url: path,
		success: function(msg){
		    debug.info("run " + runId + " was deleted");
                    //FIXME HACK Removing the tooltip.
                    $('#'+ runId).next().remove();
		    $("#" + runId).remove();
		    updateCounts(pileId);
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
	autoFocus: true,
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
	    $("#preview_image").attr("src", "http://www.logic-by-design.com/magic_images/low_res/900.jpg");
	    return false;
	}
    });

    $(".pile_title").live("click", function(e){
        switchPile($(e.target).parent().attr("id"));
    });

    $(".run").tooltip(
        {
            relative:true,
            predelay:250,
            position:"center right",
            offset: [0, 10],
            events: {def: "mouseenter, mouseleave mousedown"},
            onBeforeShow: function() {
                this.getTip().find('img').attr('src', 'http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=' +
                                               this.getTrigger().attr("mtg_id") + '&type=card');
            }
        }).dynamic();

    $( ".column" ).disableSelection();

    focusEntry();

});

function setupDropTargets() {
    setupDropTargetByType(".lands", ".land_search_result");
    setupDropTargetByType(".creatures", "creature_search_result");
    setupDropTargetByType(".spells", "spell_search_result");
}

function setupDropTargetByType(className, resultName) {
    $(className).droppable({
        accept: resultName,
	drop: function(event, ui) {
            var pileId = $(event.target).closest('.pile')[0].id;
	    var name = $(ui.draggable.context).find('.result_name').text();
	    debug.info("Adding " + name + " to pile " + pileId);
            sendCreateRun("1",
                          name,
                          pileId,
                          onCardAdded);
        }
    });
    $(className).sortable({
	connectWith: className,
	receive: onRunReceive,
        start:onRunSortStart,
        items: ".run",
        helper: function( event ) {
            var mtg_id = $(event.target).closest('.run').attr('mtg_id');
            return  "<div class='draggable-card'><img src='http://www.logic-by-design.com/magic_images/low_res/" +
                mtg_id + ".jpg'></img></div>";
	}
    });
}

//Update the advanced search results list
function updateSearchResults(data) {
    $(".results_list").empty();
    debug.info(data);
    var names = "";
    for (var i in data) {
        var result = resultTemplate.clone();

	result.addClass(data[i].category + "_search_result");
        result.find(".result_name").text(data[i].name);
        result.find(".result_detail").text(data[i].rules);
        result.attr("mtg_id", data[i].mtg_id);


        result.dblclick(function(){
            sendCreateRun('1',
			  $(this).find(".result_name").text(),
			  activePile,
			  onCardAdded);
        });

        result.draggable({
            cursor: "move",
            scroll: false,
            containment: 'body',
            appendTo:'body',
	    cursorAt: { top: 10, left: 10 },
	    helper: function( event ) {
	        return  "<div class='draggable-card'><img src='http://www.logic-by-design.com/magic_images/low_res/" +
                    $(this).attr('mtg_id') + ".jpg'></img></div>";
	    }
        });

        $(".results_list").append(result);
    }
}

// Handle a run being dragged from one pile to another
function onRunReceive(event, ui) {
    debug.info("onRunReceive");

    var toPile = $(event.target).closest(".pile").attr('id');
    var fromPile = $(ui.sender.context).closest(".pile").attr('id');
    var runId = $(ui.item.context).attr("id");
    var noop = function(data) {};
    var mtg_id = $(ui.item.context).attr("mtg_id");

    //FIXME more hacks with tooltips. Remove the placed item and move it after the tooltip.
    var nextTooltip = $(ui.item).next('.tooltip');
    $(ui.item).insertAfter(nextTooltip);
    var theTooltip = $(ui.sender.context).find('.tooltip[mtg_id="' + mtg_id + '"]');
    theTooltip.insertAfter(ui.item);

    moveRun(runId, fromPile, toPile, noop);
}

function onResultDrop(event, ui) {
    sendCreateRun("1", $(ui.draggable.context).find('.result_name').text(), $('this'), onCardAdded);
}

// Handle a run being dragged from one pile to another
function onRunSortStart(event, ui) {
    debug.info("onRunSortStart");
}

function focusEntry() {
    $("#card_entry").focus();
}

function maindeck() {
    return $("#pile_title_maindeck").closest(".pile").attr("id");
}

function changePile(pileName) {
    debug.info("changing to pile " + pileName);
    if ($("#pile_title_" + pileName).length == 0) {
	addPile(pileName);
    } else {
	switchPile($("#pile_title_" + pileName).closest(".pile").attr("id"));
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
    var newPile = pileTemplate.clone();
    $(".deckWorkspace").append(newPile);
    debug.info(newPile);

    newPile.attr('id', pile.id);
    var title = newPile.children('.pile_title').first();
    title.attr('id', title.attr('id') + pile.name.toLowerCase());
    title.prepend(pile.name);
    title.find('span').text(pile.id);

    newPile.sortable({
	connectWith: ".column",
	receive: onRunReceive,
        items: ".run"
    });
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

function moveRun(runId, fromPile, toPile, callback) {
    debug.info("Sending " + name + "from pile" + fromPile + " to pile " + toPile);

    var url = basepath + "move_run";
    $.post(
	url,
        {run_id: runId, from_pile_id: fromPile, to_pile_id: toPile},
	function(data) {
	    callback(data);
	},
	'json'
    );

    updateCounts(fromPile);
    updateCounts(toPile);

    $("#card_entry").value = "";
    $("#card_entry")[0].value = "";
    $("#card_entry").focus();
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
    debug.info("In create run");
    var newRun = runTemplate.clone();
    newRun.attr('id', run.id);
    newRun.find(".run_count").text(run.count);
    newRun.find(".card_name").text(run.name);
    newRun.find(".cc").text(run.cc);
    newRun.find(".cmc").text(run.cmc);
    newRun.attr("mtg_id", run.mtg_id);

    // Uhg, I hate string concatenation
    $("#"+activePile + " ." + run.category + "s").append(newRun);

    var newTooltip = tooltipTemplate.clone();
    newTooltip.attr("mtg_id", run.mtg_id);
    newTooltip.find('img').attr('src','http://www.logic-by-design.com/magic_images/low_res/900.jpg');
    $("#"+activePile).append(newTooltip);

    updateCounts(activePile);
}

function updateRun(run) {
    if (run.count == 0) {
        $('#'+run.id).next().remove();
	$('#'+run.id).remove();
    } else {
	$('#'+run.id).find(".run_count").text(run.count);
    }
    updateCounts(activePile);
}

function updateCounts(pile) {
    var url = basepath + "piles/" + pile + "/counts";

    $.get(
	url,
	function(data) {
	    updatePileCounts(pile, data);
	},
	'json'
    );
}

function updatePileCounts(pileId, data) {
    debug.info(data);
    var pile = $("#"+pileId);

    pile.find(".pile_count").first().text(data.total);
    pile.find(".land_count").first().text(data.lands);
    pile.find(".creature_count").first().text(data.creatures);
    pile.find(".spell_count").first().text(data.spells);
}

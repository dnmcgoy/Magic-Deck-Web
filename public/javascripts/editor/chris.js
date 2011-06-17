var basepath = "";
var pendingTracker = 0;
var deckNameEditable = false;
var activePile = null;

$(document).ready(
    function() {

	var pathname = document.location.pathname;
	basepath = pathname.substring(0, pathname.lastIndexOf('/')+1);
	debug.info(basepath + " is base of path " + pathname);

	switchPile( maindeck() );
	debug.info("Initial pile maindeck, id: " + activePile);

	focusEntry();

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
			$("#pile_" + pileId).remove();
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
		var rowId = $(e.target).parent().parent().attr("id");
		var runId = rowId.substring(3);
		debug.info("deleting run " + runId);
		var path = basepath + "runs/" + runId;
		$.ajax({
		    type: "DELETE",
		    url: path,
		    success: function(msg){
			debug.info("run " + runId + " was deleted");
			$("#" + rowId).remove();
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


	onCardsChanged();
    }
);



function focusEntry() {
    $("#card_entry").focus();
}

function onCardsChanged() {
    var visibility = ($(".unknown").size() > 0 ) ? "visible" : "hidden";
    debug.info("setting unknown header to " + visibility);
    $("#unknown_header").css("visibility", visibility);
}

function maindeck() {
    return $("#pile_title_maindeck").parent().attr("id").substr(5);
}

function changePile(pileName) {
    debug.info("changing to pile " + pileName);
    if ($("#pile_title_" + pileName).length == 0) {
	addPile(pileName);
    } else {
	debug.info($("#pile_title_" + pileName));
	debug.info($("#pile_title_" + pileName).parent());
	debug.info($("#pile_title_" + pileName).parent().attr("id"));
	switchPile($("#pile_title_" + pileName).parent().attr("id").substr(5));
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
    debug.info("In create pile");
    debug.info(pile);
    switchPile(pile.id);
}

function switchPile(pileId) {
    debug.info("switching to pile " + pileId);
    $(".pile").removeClass("active_pile");
    $("#pile_" + pileId).addClass("active_pile");
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

var pendingTracker = 0;

function addCard(autocomplete) {
    var entryText = $("#card_entry")[0].value;
    if (entryText == "") {
	return;
    }

    var parsed = parseInput(entryText);
    var count = parsed.count;
    var name = parsed.name;
    if (autocomplete != null) name = autocomplete;

    debug.info("Sending addition of " + count + " " + name + " to pile " + activePile);

    pendingTracker += 1;
    var pendingId = "pending" + pendingTracker;

    createPendingRow("#blank_pending_row", pendingId, count, name);

    var url = basepath + "runs";
    $.post(
	url,
	{count: count, card_name: name, pile_id: activePile},
	function(data) {
	    onCardAdded(data, pendingId);
	},
	'json'
    );
    $("#card_entry").value = "";
    $("#card_entry")[0].value = "";
    $("#card_entry").focus();
}

function createPendingRow(slotSelector, rowId, count, name) {
    $(slotSelector).after(
	"<tr id=\"" + rowId + "\"><td>" +
	    "</td><td>"+ count +
	    "</td><td>"+ name +
	    "<td></td></tr>"
    );
}

function onCardAdded(run, pendingId) {
    debug.info("in onCardAdded with " + run);
    $("#" + pendingId).remove();
    var runId = "run" + run.id;
    if (rowExists(runId)) {
	appendRow(runId, run);
    } else {
	addNewRow(run);
    }
    onCardsChanged();
}

function rowExists(rowId) {
    debug.info("checking existance of row " + rowId);
    if ($("tr#" + rowId).size() > 0) {
	return true;
    } else if ($(".dynamic").filter(function() { return ($(this)[0].id == rowId); }).size() > 0) {
	return true;
    } else {
	return false;
    }
}

function appendRow(runId, card) {
    if (card.count == 0) {
	$("tr#" + runId).remove();
    } else {
	$("tr#" + runId + " td.run_count").html( card.count );
    }
}

function addNewRow(run) {
    var cardtype = run.category;
    if (cardtype == null) cardtype = "unknown";
    debug.info("Card type: " + cardtype);

    var blankRowId = "#blank_" + cardtype + "_row";
    createRow(blankRowId, "run" + run.id, run.count, cardtype, run);
}

function createRow(slotSelector, rowId, count, cardtype, run) {
    if (cardtype == "unknown") createUnknownRow(slotSelector, rowId, count, run);
    else createMaindeckRow(slotSelector, rowId, count, run);
}

function createMaindeckRow(slotSelector, rowId, count, card) {
    var nameDisplay = "<a href=\"http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" +
	card.mtg_id +
	"\" target=\"_blank\" >" +
	card.name +
	"</a>";

    $(slotSelector).after(
	"<tr id=\"" + rowId + "\" class=\"dynamic\"><td>" +
	    "</td><td class=\"run_count\">"+ count +
	    "</td><td>"+ nameDisplay +
	    "</td><td>"+ card.cc +
	    "</td><td>"+ card.cmc +
	    "<td><span class='delete_run' href=''>X</span></td></tr>"
    );
}

function createUnknownRow(slotSelector, rowId, count, card) {
    $(slotSelector).after(
	"<tr id=\"" + rowId + "\" class=\"unknown dynamic\">" +
	    "<td class=\"run_count\">"+ count + "</td><td>"+ card.name +
	    "</td><td><span class='delete_run' href=''>X</span></td></tr>"
    );
}

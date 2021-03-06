$(document).ready(
  function() {

    debug.info(document.location.pathname);
    basepath = document.location.pathname.substring(0, document.location.pathname.length-4);

    focusEntry();

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

var basepath = "";
var pendingTracker = 0;
var deckNameEditable = false;

function focusEntry() {
  $("#card_entry").focus();
}

function onCardsChanged() {
  loadManaCurveChart();
  requestDeckCount();
  var visibility = ($(".unknown").size() > 0 ) ? "visible" : "hidden";
  debug.info("setting unknown header to " + visibility);
  $("#unknown_header").css("visibility", visibility);
}

function loadManaCurveChart() {
  $.getJSON(basepath + "mana_curve_chart", displayManaCurveChart);
}
function displayManaCurveChart(chartData) {
  $("#mana_curve").attr("src", chartData.src);
}

function requestDeckCount() {
  $.getJSON(basepath + "count", updateDeckCount);
}
function updateDeckCount(deckCount) {
  debug.info("Deck count response is " + deckCount);
  $("#maindeck_count").text(deckCount);
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
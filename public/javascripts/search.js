$(document).ready(function() {
    $(function() {
        $( "#accordion" ).accordion({
            fillSpace:"true",
	    collapsible:"true"
        });
    });

    $( "#card_entry" ).autocomplete({
	source: "/cards/autocomplete",
	minLength: 2,
	
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

    $(".segmented_control button").click(function(){
        $(this).toggleClass("down");
    });

    $(".set_selector").click(function () {
        $(this).toggleClass("down");
    });

    $("#accordion").bind("accordionchangestart", function(event, ui) {
        if (ui.newHeader.text() == "Search Results") {
            debug.info("performing query");
            var url = "/cards/simple_search";
            $.post(
		url,
		{
                    name: $("#card_name_field")[0].value,
                    rules: $("#card_rules_field")[0].value,
                    type: $("#basictype_dropdown")[0].value,
                    subtype: $("#subtype_entry")[0].value,
                    artist: $("#artist_entry")[0].value,

                    color: $("#color_select button.down").map(function(){
                        return $(this).attr("search_color");
                    }).get(),
                    cmc:  $("#cmc_select button.down").map(function(){
                        return $(this).text()
                    }).get(),
                    power:  $("#power_select button.down").map(function(){
                        return $(this).text()
                    }).get(),
                    toughness:  $("#power_select button.down").map(function(){
                        return $(this).text()
                    }).get(),
                    sets:  $(".set_selector.down").map(function(){
                        return $(this).attr("short_name")
                    }).get(),
                    rarity:  $("#rarity_select button.down").map(function(){
                        return $(this).text()
                    }).get()
		},
		updateSearchResults,
		'json'
            );
        }
    });
    
    // setup ul.tabs to work as tabs for each div directly under div.panes
    $(".tabs").tabs(".panes > div.pane");
});

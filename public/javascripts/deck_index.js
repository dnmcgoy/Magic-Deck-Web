$(function() 
{
    $("#accordion").accordion(
    {
	autoHeight: false,
	collapsible: true,
	active: false
    });
});


$(document).ready(function() {

    $("tr:nth-child(odd)").addClass("odd");
    $("tr:nth-child(even)").addClass("even");

    var triggers = $(".newDeckButton").overlay({

	// some mask tweaks suitable for modal dialogs
	mask: {
	    color: '#333333',
	    loadSpeed: 200,
	    opacity: 0.9
	},

	top:'5%',
	closeOnClick: false
    });
    
    
    $("#newDeck form").submit(function(e) {
	
	// close the overlay
	triggers.eq(1).overlay().close();
	
	// get user input
	var input = $("input", this).val();
	
	// do something with the answer
	triggers.eq(1).html(input);
	
	// do not submit the form
	return e.preventDefault();
    });
    
});

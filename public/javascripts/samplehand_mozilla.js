	var httpRequest = false;
	var MAXCARDNAMES = 100;  // maximum number of different card names in a deck
	var MAXDECKSIZE = 1000;  // maximum number of different cards in a deck
	var hand_size = 7;
	var iTotal = 0;
	var explodedDeck = new Array(MAXDECKSIZE);
	var explodedDeckUsed = new Array(MAXDECKSIZE);
	var iExtraCards = 0;
	var iCardHeight = 171, iCardWidth = 120;
    var sBorderImage = 'url(/magic/images/samplehand_cardborder_med.jpg)'; iMarginWidth = 7;
   
    function GetDeckXML (sDeckURL) {
    	httpRequest = false;
    	if (window.XMLHttpRequest) { // for Mozilla, Safari, Opera etc.
        	httpRequest = new XMLHttpRequest();
        	if (httpRequest.overrideMimeType) {
            	httpRequest.overrideMimeType('text/xml');
        	}
      	} else if (window.ActiveXObject) { // for IE
         	try {
            	httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
         	} catch (e) {
            	try {
               		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            	} catch (e) {}
         	}
      	}
      	if (!httpRequest) {
      		alert('XMLHttp instance failed - Your browser does not support this feature.');
      		return false;
      	}
      	httpRequest.onreadystatechange = PrintDeck;
      	httpRequest.open('GET', sDeckURL, true);
      	httpRequest.send(null);
    }
   
	function PrintDeck () {
		if (httpRequest.readyState == 4) {
			
        	if (httpRequest.status == 200) {
			
	       		var xmldoc;
				
				xmldoc = httpRequest.responseXML;
				
				// display the deck header info
				document.getElementById('deckheading').innerHTML = "<img src='/magic/images/samplehand_title.jpg' alt='Sample Hand Generator'/><br/>" +  xmldoc.getElementsByTagName("heading").item(0).firstChild.nodeValue;
				if (xmldoc.getElementsByTagName("subhead").length > 0) {
					if (xmldoc.getElementsByTagName("subhead").item(0).length > 0) {
						document.getElementById('decksubheading').innerHTML = xmldoc.getElementsByTagName("subhead").item(0).firstChild.nodeValue;
					}
				}

				document.title = xmldoc.getElementsByTagName("heading").item(0).firstChild.nodeValue + " - Magicthegathering.com Sample Hand Generator";
				document.getElementById('previouslink').href = "/default.asp?x=" + getQueryVariable("x");

				// build the decklist
				
				var oNode, i;
				var sDecklist = "";
				var sCardName = "", sImageCardName = "", sAutoCardName = "";
				var collectland = xmldoc.getElementsByTagName("land").item(0).childNodes;
				var collectcreatures = xmldoc.getElementsByTagName("creatures").item(0).childNodes;
				var collectspells = xmldoc.getElementsByTagName("spells").item(0).childNodes;
				var collectsideboard = null;
				if (xmldoc.getElementsByTagName("sideboard").length > 0) {
					collectsideboard = xmldoc.getElementsByTagName("sideboard").item(0).childNodes;
				}
				var numcollectland = 0, numcollectcreatures = 0, numcollectspells = 0, numcollectsideboard = 0;
				
				for (i=0; i<collectland.length; i++) {
					oNode = collectland.item(i);
					
					if (typeof(oNode.nodeValue) == 'object') {

						numcollectland += parseInt(oNode.getAttribute("quantity"));
						sCardName = oNode.getAttribute("cardname");
					
						sImageCardName = sCardName.toLowerCase();
						sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
						sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');

						sAutoCardName = "" + sCardName;
						sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
						sAutoCardName = sAutoCardName.replace(/[\']/g, "[");  // '
						
						sDecklist += oNode.getAttribute("quantity") + " <a class=\"nodec\" href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\">" + sCardName + "</a><" + "br/>";
					}
				}
				sDecklist += "<div class=\"decklistheader\">" + numcollectland + " land</div>";

				for (i=0; i<collectcreatures.length; i++) {
					oNode = collectcreatures.item(i);
					
					if (typeof(oNode.nodeValue) == 'object') {
						numcollectcreatures += parseInt(oNode.getAttribute("quantity"));
						sCardName = oNode.getAttribute("cardname");

						sImageCardName = sCardName.toLowerCase();
						sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
						sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');

						sAutoCardName = sCardName;
						sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
						sAutoCardName = sAutoCardName.replace(/[\']/g, "[");  // '
						sDecklist += oNode.getAttribute("quantity") + " <a class=\"nodec\" href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\">" + sCardName + "</a><" + "br/>";
					}
				}
				sDecklist += "<div class=\"decklistheader\">" + numcollectcreatures + " creatures</div>";

				for (i=0; i<collectspells.length; i++) {
					oNode = collectspells.item(i);

					if (typeof(oNode.nodeValue) == 'object') {
						numcollectspells += parseInt(oNode.getAttribute("quantity"));
						sCardName = oNode.getAttribute("cardname");

						sImageCardName = sCardName.toLowerCase();
						sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
						sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');

						sAutoCardName = sCardName;
						sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
						sAutoCardName = sAutoCardName.replace(/[\']/g, "[");  // '

						sDecklist += oNode.getAttribute("quantity") + " <a class=\"nodec\" href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\">" + sCardName + "</a><" + "br/>";
					}
				}
				sDecklist += "<div class=\"decklistheader\">" + numcollectspells + " other spells</div>";
			
				if (xmldoc.getElementsByTagName("sideboard").length > 0) {
					for (i=0; i<collectsideboard.length; i++) {
						oNode = collectsideboard.item(i);
						
						if (typeof(oNode.nodeValue) == 'object') {

							numcollectsideboard += parseInt(oNode.getAttribute("quantity"));
							sCardName = oNode.getAttribute("cardname");

							sImageCardName = sCardName.toLowerCase();
							sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
							sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');

							sAutoCardName = sCardName;
							sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
							sAutoCardName = sAutoCardName.replace(/[\']/g, "[");  // '
							
							sDecklist += oNode.getAttribute("quantity") + " <a class=\"nodec\" href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\">" + sCardName + "</a><" + "br/>";
						}
					}
					sDecklist += "<div class=\"decklistheader\">" + numcollectsideboard + " sideboard</div>";
				}			
				
				// decklist build - display it
				document.getElementById('decklist').innerHTML = sDecklist;
			} else {
     	       alert('There was a problem with the decklist request.');
			}
		}
	}

    function GenerateHand (iHandSize) {
      	if (httpRequest.readyState == 4) {
        	if (httpRequest.status == 200) {

	        var xmldoc;

			xmldoc = httpRequest.responseXML;

			// reset preview pic for new hand
			document.getElementById('bigcard').src = "/global/images/magic/general/magic_the_gathering.jpg"
			
			// reset draw-a-card button
			document.getElementById("button_draw").src = "/magic/images/samplehand_drawcard.jpg";
			
			// set up exploded deck for random sample hand
			var i, j;
			
			var collection;
			var oNode;
			
			iTotal = 0;
			
			collection = xmldoc.getElementsByTagName("land")[0].childNodes;
			for (i=0; i<collection.length; i++) {
				oNode = collection.item(i);
				
				if (typeof(oNode.nodeValue) == 'object') {
				
					for (j=0; j<oNode.getAttribute("quantity"); j++) {
						iTotal++;
						explodedDeck[iTotal] = oNode.getAttribute("cardname");
						explodedDeckUsed[iTotal] = 0;
					}
				}
			}
			collection = xmldoc.getElementsByTagName("creatures")[0].childNodes;
			for (i=0; i<collection.length; i++) {
				oNode = collection.item(i);
				
				if (typeof(oNode.nodeValue) == 'object') {
				
					for (j=0; j<oNode.getAttribute("quantity"); j++) {
						iTotal++;
						explodedDeck[iTotal] = oNode.getAttribute("cardname");
						explodedDeckUsed[iTotal] = 0;
					}
				}
			}
			collection = xmldoc.getElementsByTagName("spells")[0].childNodes;
			for (i=0; i<collection.length; i++) {
				oNode = collection.item(i);
				
				if (typeof(oNode.nodeValue) == 'object') {
				
					for (j=0; j<oNode.getAttribute("quantity"); j++) {
						iTotal++;
						explodedDeck[iTotal] = oNode.getAttribute("cardname");
						explodedDeckUsed[iTotal] = 0;
					}
				}
			}
			
			// now we have the deck; let's build a hand
		
			if (iTotal > 0) {
		
				// reset extra cards
				var iWhichDiv = 0;
				for (i=8; i<=10; i++) {
					iWhichDiv = i + "";
					document.getElementById("carddiv" + iWhichDiv).innerHTML = "";
				}
				iExtraCards = 0;
				
				// build new hand
				var whichcard = 0;

				for (i=1; i<=iHandSize; i++) {
					whichcard = RandomInteger(iTotal);
					while (explodedDeckUsed[whichcard] == 1 || typeof(explodedDeckUsed[whichcard])=="undefined") {
						whichcard = RandomInteger(iTotal);
					}
					explodedDeckUsed[whichcard] = 1;
					sCardName = explodedDeck[whichcard];
					
					sImageCardName = sCardName.toLowerCase();
					sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
					sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');

					sAutoCardName = sCardName;
					sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
					sAutoCardName = sAutoCardName.replace(/[\']/g, "[");
			
					document.getElementById("carddiv" + i).innerHTML = "<a href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\" id=\"link" + i + "\"><img src=\"/global/images/magic/general/" + sImageCardName + ".jpg\" width=\"" + iCardWidth + "\" height=\"" + iCardHeight + "\" class=\"cardimage\" id=\"image" + i + "\"/></a>";

				  	 document.getElementById("carddiv" + i).style.backgroundImage = sBorderImage;
				  	 document.getElementById("image" + i).style.margin = iMarginWidth;

					//document.getElementById("image" + i).alt = explodedDeck[whichcard];
					//document.getElementById("image" + i).src = "/global/images/magic/general/" + sImageCardName + ".jpg";
					//document.getElementById("link" + i).href = "javascript:autoCardWindow('" + sAutoCardName + "');";
					//document.getElementById("link" + i).mouseover = preview_cardpic(sImageCardName);
					//document.getElementById("image" + i).mouseover = preview_cardpic(sImageCardName);
				}
				
				// show card-backs for mulligans
				for (i=iHandSize+1; i<=7; i++) {
					document.getElementById("image" + i).src = "/global/images/magic/general/magic_the_gathering.jpg";
					document.getElementById("image" + i).alt = "";

					if (document.getElementById("link" + i)) {
						document.getElementById("link" + i).href = "javascript:void(0);";
						document.getElementById("link" + i).onmouseover = function() { 
							preview_cardpic("magic_the_gathering");
						};
					}
				}
				
			} else {
				alert("Decklist loading error.");
			}
         } else {
            alert('There was a problem with the decklist request.');
         }
      }
   }
   
   function DrawACard (iWhichSlot) {
		if (iTotal > 0) {

			var whichcard = 0;
			var sCardName = "", sImageCardName = "", sAutoCardName = "";
			
			whichcard = RandomInteger(iTotal);
			while (explodedDeckUsed[whichcard] == 1 || typeof(explodedDeckUsed[whichcard])=="undefined") {
				whichcard = RandomInteger(iTotal);
			}
			explodedDeckUsed[whichcard] = 1;
			sCardName = explodedDeck[whichcard];
			
			sImageCardName = sCardName.toLowerCase();
			sImageCardName = sImageCardName.replace(/[ \-]/g, '_');
			sImageCardName = sImageCardName.replace(/[\'\,\:\/]/g, '');  // '
			
			sAutoCardName = sCardName;
			sAutoCardName = sAutoCardName.replace(/[ ]/g, "_");
			sAutoCardName = sAutoCardName.replace(/[\']/g, "[");  // '
		
			var iWhichDiv = iWhichSlot + 7;
			
			document.getElementById("carddiv" + iWhichDiv).innerHTML = "<a href=\"javascript:autoCardWindow('" + sAutoCardName + "');\" onmouseover=\"javascript:preview_cardpic('" + sImageCardName + "');\" id=\"link" + iWhichDiv + "\"><img src=\"/global/images/magic/general/" + sImageCardName + ".jpg\" width=\"" + iCardWidth + "\" height=\"" + iCardHeight + "\" style=\"margin:" + iMarginWidth + "px; border-width:0px;\" class=\"cardimage\" id=\"image" + iWhichDiv + "\"/></a>";
			document.getElementById("carddiv" + iWhichDiv).style.backgroundImage = sBorderImage;

			if (iWhichSlot >= 3) {
				// "gray out" the draw-a-card button
				document.getElementById("button_draw").src = "/magic/images/samplehand_drawcard_off.jpg";
			}
		}   
   }
   
   function page_setup() {
   	  var sDeckArticle = getQueryVariable("x");
	  var sDeckNum = getQueryVariable("decknum");
	  
      GetDeckXML("deckxml.asp?x=" + sDeckArticle + "&decknum=" + sDeckNum);
   }
   
   function new_hand() {
	  hand_size = 7;
      GenerateHand(hand_size);
   }

   function draw_card() {
	  iExtraCards++;
	  if (iExtraCards <= 3) {
           DrawACard(iExtraCards);
	  }
   }
   
   function mulligan() {
   	  hand_size--;
	  if (hand_size >= 0) {
           GenerateHand(hand_size);
	  }
   }

   function card_size(iWidth, iHeight) {
   	  var i, iBorderWidth;
	  
	  iCardWidth = iWidth;
	  iCardHeight = iHeight;
	  iBorderWidth = 3;
	  sBorderImage = 'url(/magic/images/samplehand_cardborder_';
	  iMarginWidth = 7;
	  
	  if (iWidth == 200) {
	  	  // for largest size, hide preview card
		  document.getElementById("previewcard").style.display = "none";
		  document.getElementById("rightcolumn").style.width = "230";
	  } else {
		  document.getElementById("previewcard").style.display = "block";
		  document.getElementById("rightcolumn").style.width = "500";
	  }
	  
	  if (iWidth == 60) {
	  	document.getElementById("button_size60").src = "/magic/images/cardback_sm.jpg";
		iBorderWidth = 2;
		sBorderImage += 'sm.jpg)';
		iMarginWidth = 4;
	  } else {
	  	document.getElementById("button_size60").src = "/magic/images/cardback_sm_off.jpg";
	  }
	  if (iWidth == 120) {
	  	document.getElementById("button_size120").src = "/magic/images/cardback_med.jpg";
		iBorderWidth = 3;
		sBorderImage += 'med.jpg)';
		iMarginWidth = 7;
	  } else {
	  	document.getElementById("button_size120").src = "/magic/images/cardback_med_off.jpg";
	  }
	  if (iWidth == 200) {
	  	document.getElementById("button_size200").src = "/magic/images/cardback_lg.jpg";
		iBorderWidth = 7;
		sBorderImage += 'lg.jpg)';
		iMarginWidth = 12;
	  } else {
	  	document.getElementById("button_size200").src = "/magic/images/cardback_lg_off.jpg";
	  }
	  
      for (i=1; i<=7 + 3; i++) {
	  	 if (document.getElementById("image" + i)) {
		  	 document.getElementById("image" + i).width = iCardWidth;
		  	 document.getElementById("carddiv" + i).width = iCardWidth;
		  	 document.getElementById("image" + i).height = iCardHeight;
		  	 document.getElementById("carddiv" + i).height = iCardHeight;
//		  	 document.getElementById("image" + i).style.borderWidth = iBorderWidth;
		  	 document.getElementById("carddiv" + i).style.backgroundImage = sBorderImage;
		  	 document.getElementById("image" + i).style.margin = iMarginWidth;
		 }
	  }
   }
   
   function RandomInteger (iMax) {
   		var num;
		num = Math.round(Math.random() * iMax);
   		return num;
   }
   
   function getQueryVariable(variable) {
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
    	if (pair[0] == variable) {
     		return pair[1];
  	    }
  	  } 
	  alert("Query string variable " + variable + " not found.");
   }
   
   function preview_cardpic (sCard) {
		var sCardString, sSet;
		sSet = "general";
		sCardString = new String (sCard);
		sCardString = sCardString.toLowerCase();
		sCardString = sCardString.replace (/[\,\:\'\’\/]/gi, ""); 
		sCardString = sCardString.replace (/[ \-]/gi, "_");
		sCardString = sCardString.replace (/[Æ]/gi, "e");

		document.getElementById('bigcard').src = "/global/images/magic/" + sSet + "/" + sCardString + ".jpg";
	
	}
  

   

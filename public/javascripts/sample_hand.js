$(document).ready(
  function() {
    var deckPath = document.location.pathname.substring(0, document.location.pathname.length-7);
    $.get(deckPath, loadDeck, "xml");
  }
);

function loadDeck(xmldoc) {
  debug.info("generating a new hand");

  // reset preview card
  document.getElementById('preview_card').src = "/global/images/magic/general/magic_the_gathering.jpg";

  debug.info("doc is " + xmldoc.toString());
}

function randomInt(max) {
  return Math.round(Math.random() * max);
}

function preview_cardpic (sCard) {
  var sCardString, sSet;
  sSet = "general";
  sCardString = new String (sCard);
  sCardString = sCardString.toLowerCase();
  sCardString = sCardString.replace (/[\,\:\'\\/]/gi, "");
  sCardString = sCardString.replace (/[ \-]/gi, "_");
  sCardString = sCardString.replace (/[Æ]/gi, "e");

  document.getElementById('bigcard').src = "/global/images/magic/" + sSet + "/" + sCardString + ".jpg";

}



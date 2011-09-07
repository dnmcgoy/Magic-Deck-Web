function parseInput(entryText) {
  var countOut = 1;
  var nameOut = entryText;
  var match = null;

  for (var method in matchers) {
    match = matchers[method](entryText);
    if (match) break;
  }

  if (match) {
    countOut = match.count;
    nameOut = match.name;
  }

  return {count:countOut, name:nameOut};
}

var matchers = function() {
  return {
    basic : function(input) {
      var match = input.match(/^(\d+)\s+(\w+.*)/);
      if (match) {
	var count = match[1];
	var name = match[2];
	return {count: count, name: name};
      } else {
	return null;
      }
    },

    plus : function(input) {
      var match = input.match(/^\+(\d+)\s+(\w+.*)/);
      if (match) {
	var count = match[1];
	var name = match[2];
	return {count: count, name: name};
      } else {
	return null;
      }
    },

    minus : function(input) {
      var match = input.match(/^-(\d+)\s+(\w+.*)/);
      if (match) {
	var count = match[1];
	var name = match[2];
	return {count: -1 * count, name: name};
      } else {
	return null;
      }
    }
  };
}();

/*
    plus : function(input) {
      var match = input.match(/+(\d+)\s+(\w+.*)/);
      if (match) {
	var count = match[1];
	var name = match[2];
	return {count: count, name: name};
      } else {
	return null;
      }
    },

    minus : function(input) {
      var match = input.match(/-(\d+)\s+(\w+.*)/);
      if (match) {
	var count = match[1];
	var name = match[2];
	return {count: -1 * count, name: name};
      } else {
	return null;
      }
    }
 */
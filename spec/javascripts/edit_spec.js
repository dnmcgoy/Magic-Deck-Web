describe("edit", function() {

    beforeEach(function() {
    });

    it("should strip leading pound symbol", function() {
	var result = hexFromCSS('#999999');
	expect(result).toEqual('999999');
    });

    it("should convert rgb to hex", function() {
	var result = hexFromCSS("rgb(255, 255, 255)");
	expect(result).toEqual('ffffff');
    });

});
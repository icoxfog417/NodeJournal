///<reference path='typings/cheerio/cheerio.d.ts'/>
var AbstractElement = (function () {
    function AbstractElement() {
    }
    return AbstractElement;
})();
exports.AbstractElement = AbstractElement;

var Scanner = (function () {
    function Scanner() {
    }
    Scanner.prototype.select = function () {
        return document.documentElement.innerHTML;
    };

    Scanner.prototype.evaluate = function (domString) {
        throw "evaluate function is not overrided";
    };

    Scanner.prototype.getSelector = function () {
        return this.select;
    };

    Scanner.prototype.getEvaluator = function () {
        return this.evaluate;
    };
    return Scanner;
})();
exports.Scanner = Scanner;

var InBrowserScanner = (function () {
    function InBrowserScanner() {
    }
    InBrowserScanner.prototype.evaluate = function (domString) {
        throw "evaluate function is not overrided";
    };

    InBrowserScanner.prototype.objectToElement = function (objects) {
        throw "objectToElement function is not overrided";
    };

    InBrowserScanner.prototype.getSelector = function () {
        return this.evaluate;
    };

    InBrowserScanner.prototype.getEvaluator = function () {
        return this.objectToElement;
    };
    return InBrowserScanner;
})();
exports.InBrowserScanner = InBrowserScanner;
//# sourceMappingURL=Scanner.js.map

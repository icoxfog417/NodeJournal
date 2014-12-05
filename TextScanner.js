var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='typings/cheerio/cheerio.d.ts'/>
///<reference path='typings/jquery/jquery.d.ts'/>
///<reference path='Scanner.ts'/>
var cheerio = require("cheerio");
var scanner = require("./Scanner");

var TextElement = (function (_super) {
    __extends(TextElement, _super);
    function TextElement(element, pageInfo) {
        _super.call(this);
        this.tagName = "";
        this.wrappers = [];
        this.companions = [];
        this.position = { top: -1, left: -1 };
        this.relativeIndex = -1;
        this.parents = "";
        this.color = "";
        this.size = 0;
        this.text = "";
        this.tagName = element.tagName;
        this.wrappers = element.wrappers;
        this.companions = element.companions;
        this.position = element.position;
        this.relativeIndex = element.relativeIndex;
        this.color = element.color;
        this.size = this.getFontSize(element.size, pageInfo);
        this.text = element.text.trim();
    }
    TextElement.prototype.getFontSize = function (value, pageInfo) {
        if (value.indexOf("px") > -1) {
            return parseFloat(value.replace("px", ""));
        } else if (value.indexOf("em") > -1) {
            var em = parseFloat(value.replace("em", "")) * pageInfo.baseSize;
            return em;
            //TODO consider about rem.
        } else {
            return pageInfo.baseSize;
        }
    };

    TextElement.prototype.serialize = function () {
        var self = this;
        var hasTag = function (infos, tagNames, includeSelf) {
            if (typeof includeSelf === "undefined") { includeSelf = true; }
            var result = false;
            infos.forEach(function (i) {
                if (tagNames.indexOf(i.tagName) > -1) {
                    result = true;
                }
            });
            if (!result && includeSelf) {
                result = tagNames.indexOf(self.tagName) > -1;
            }
            return result ? 1 : 0;
        };
        var getAttrs = function (infos, attrName) {
            if (typeof attrName === "undefined") { attrName = "className"; }
            var attrs = [];
            infos.forEach(function (i) {
                var attr = i[attrName].trim();
                if (attr && attr != "") {
                    attrs.push(attr);
                }
            });
            return attrs;
        };
        var text = self.text.replace(/\n/g, "").replace(/\t/g, "").replace(/　/g, "");
        var colorStrs = self.color.replace(/rgb\(|\s|\)|/g, "").split(",");
        var colors = [];
        for (var i = 0; i < 3; i++) {
            if (colorStrs.length > i) {
                colors.push(parseFloat(colorStrs[i]));
            } else {
                colors.push(0.0);
            }
        }

        return [
            text.length,
            self.size,
            colors[0],
            colors[1],
            colors[2],
            getAttrs(self.wrappers).length,
            hasTag(self.wrappers, ["H1", "H2", "H3", "H4", "H5"]),
            hasTag(self.wrappers, ["A"]),
            hasTag(self.wrappers, ["P"]),
            self.position.top,
            self.position.left,
            self.relativeIndex,
            self.tagName,
            getAttrs(self.wrappers, "tagName").join(","),
            getAttrs(self.wrappers).join(","),
            text
        ];
    };
    return TextElement;
})(scanner.AbstractElement);
exports.TextElement = TextElement;

var TextScanner = (function (_super) {
    __extends(TextScanner, _super);
    function TextScanner() {
        _super.apply(this, arguments);
    }
    TextScanner.prototype.evaluate = function (domString) {
        if (typeof domString === "undefined") { domString = ""; }
        var debugCondole = function (msg) {
            console.log("ByCrawler:" + msg);
        };

        var texts = [];

        //hope basic body size is setting by px.
        var pageInfo = {
            baseSize: parseFloat(getComputedStyle(document.body)["font-size"].replace("px", ""))
        };

        var describeHier = function ($el) {
            var wrappers = [];
            var companions = [];
            var hasNext = true;
            var relativeIndex = -1;
            var getNodeInfo = function (n) {
                return {
                    "tagName": n.tagName,
                    "className": n.className
                };
            };
            var $p = $el;
            while (hasNext) {
                $p = $p.parent();
                if ($p.size() == 0 || $p[0].tagName == "BODY") {
                    hasNext = false;
                } else {
                    var node = $p[0];
                    if ($p.children().size() == 1) {
                        wrappers.push(getNodeInfo(node));
                    } else {
                        var children = $p.children();
                        children.each(function () {
                            companions.push(getNodeInfo(this));
                        });
                        relativeIndex = $(children).index($el[0]);
                        hasNext = false;
                    }
                }
            }
            return { wrappers: wrappers, relativeIndex: relativeIndex, companions: companions };
        };

        var toDict = function (node) {
            var $el = $(node.parentNode);
            var hier = describeHier($el);
            return {
                tagName: $el.prop("tagName"),
                wrappers: hier.wrappers,
                relativeIndex: hier.relativeIndex,
                companions: hier.companions,
                position: $el.offset(),
                color: $el.css("color"),
                size: $el.css("font-size"),
                text: $el.text().trim()
            };
        };

        $("body").find("*").addBack().contents().filter(function () {
            if (this.nodeType === 3 && ["SCRIPT", "NOSCRIPT", "STYLE", "IFRAME"].indexOf(this.parentNode.tagName) < 0) {
                if ($(this).text().trim() != "") {
                    texts.push(toDict(this));
                }
            }
        });
        return [texts, pageInfo];
    };

    TextScanner.prototype.objectToElement = function (objects) {
        if (objects && objects.length > 1) {
            var elements = [];
            objects[0].forEach(function (o) {
                elements.push(new TextElement(o, objects[1]));
            });
            return elements;
        } else {
            return [];
        }
    };
    return TextScanner;
})(scanner.InBrowserScanner);
exports.TextScanner = TextScanner;
//# sourceMappingURL=TextScanner.js.map

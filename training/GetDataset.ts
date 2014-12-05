///<reference path='../typings/node/node.d.ts'/>
///<reference path='../typings/cheerio/cheerio.d.ts'/>
///<reference path='../Crawler.ts'/>
///<reference path='../TextScanner.ts'/>
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");
import crawler = require("../Crawler");
import scanner = require("../TextScanner");

var PROXY = "--proxy=192.168.166.1:8080"
var PROXY_AUTH = "--proxy-auth=tie301837:brokenY+1"
var DEFAULT_SITE = "http://www.jalan.net/kankou/"
var DEFAULT_FILE = "dataset.txt"

var c = new crawler.Crawler(PROXY, PROXY_AUTH);
var s = new scanner.TextScanner();
c.includeJs.push("//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js");

var url = DEFAULT_SITE;
var file = DEFAULT_FILE;
if (process.argv.length > 2) {
    url = process.argv[2];
    if (process.argv.length > 3) {
        file = process.argv[3];
    }
}
file = path.resolve(__dirname, file);

c.crawle(url, s).done(function (values) {
    var content = "";
    values[0].forEach(function (v) {
        content += v.serialize().join("\t") + "\n";
    })
    //todo create tab separated file from values
    fs.writeFile(file, content, function (err) {
        if (err) throw err;
        console.log("saved " + url + " datasets to " + file);
    });
});

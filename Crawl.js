///<reference path='typings/node/node.d.ts'/>
///<reference path='typings/cheerio/cheerio.d.ts'/>
///<reference path='Crawler.ts'/>
///<reference path='TextScanner.ts'/>
///<reference path='./training/FStatistics.ts'/>
var Promise = require("bluebird");
var cheerio = require("cheerio");
var NeuralN = require('neuraln');
var crawler = require("./Crawler");
var scanner = require("./TextScanner");
var fst = require("./training/FStatistics");

var PROXY = "--proxy=192.168.166.1:8080";
var PROXY_AUTH = "--proxy-auth=tie301837:brokenY+1";
var SITE_URL = "http://www.jalan.net/kankou/";
var MODEL_PARAM = "training/modelMemory.txt";
var RESULT_FILE = "crawled.txt";

var fs = Promise.promisifyAll(require("fs"));
var c = new crawler.Crawler(PROXY, PROXY_AUTH);
var s = new scanner.TextScanner();

var url = SITE_URL;
if (process.argv.length > 2) {
    url = process.argv[2];
}

c.includeJs.push("//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js");
c.crawle(url, s).done(function (values) {
    var judged = [];

    //load machine learning model
    fs.readFileAsync(MODEL_PARAM).then(function (data) {
        console.log("re-construct the model from file...");
        var mParam = JSON.parse(data);
        var model = new NeuralN(mParam.model);
        var modelSts = mParam.statistics;
        var modelDef = model.to_json();

        var x_count = modelDef.layers[0];
        var msts = fst.FStatistics.load(modelSts, x_count);

        values[0].forEach(function (v) {
            //judge topic & body by model
            var vector = v.serialize();
            var r_x = fst.FStatistics.regularizeAll(msts, vector);
            var result = model.run(r_x);
            judged.push(result.concat(vector).join("\t"));
        });

        fs.writeFile(RESULT_FILE, judged.join("\n"), function (err) {
            if (err)
                throw err;
            console.log("saved result to " + RESULT_FILE);
        });
    });
});
//# sourceMappingURL=Crawl.js.map

///<reference path='../typings/node/node.d.ts'/>
///<reference path='../typings/cheerio/cheerio.d.ts'/>
///<reference path='../typings/bluebird/bluebird.d.ts'/>
///<reference path='./FStatistics.ts'/>

import http = require("http");
var Promise = require("bluebird");
var NeuralN = require('neuraln');
var path = require("path");
import fst = require("./FStatistics");

var DEFAULT_FILE = "training.txt"
var DEFAULT_MODEL = "model.json"
var DEFAULT_MODEL_PARAM = "modelMemory.txt"

var fs = Promise.promisifyAll(require("fs"));
var file = DEFAULT_FILE;
var modelDefine = path.resolve(__dirname, DEFAULT_MODEL);
var modelParam = path.resolve(__dirname, DEFAULT_MODEL_PARAM);

if (process.argv.length > 2) {
    file = process.argv[2];
}
file = path.resolve(__dirname, file);

//readmodel
fs.readFileAsync(modelDefine).then(function (data) {
    var mDefine = JSON.parse(data);
    return fs.readFileAsync(modelParam).then(function (data) {
        console.log("parameter file is exist. load from here.");
        var mParam = JSON.parse(data);
        return [new NeuralN(mParam.model), mDefine, mParam.statistics];
    }).catch(function (err) {
        var m = new NeuralN(mDefine.layers);
        return [m, mDefine, []];
    })

}).catch(function (err) {
    console.log(err);
}).then(function (modelSet) {
    var model = modelSet[0];
    var modelDef = modelSet[1];
    var modelSts = modelSet[2];

    var y_count = modelDef.layers[modelDef.layers.length - 1];
    var x_count = modelDef.layers[0];
    var msts = fst.FStatistics.load(modelSts, x_count);

    fs.readFileAsync(file).then(function (data) {
        //read dataset
        var dataset = data.toString().split("\n");
        var trainingset = [];
        for (var index in dataset) {
            var vector = dataset[index].split("\t");
            if (vector.length >= y_count + x_count) {
                var y = vector.splice(0, y_count);
                var x = [];
                for (var i = 0; i < x_count; i++) {
                    var vnum = parseFloat(vector[i]);
                    x.push(vnum);
                    msts[i].add(vnum);
                }
                trainingset.push({ "x": x, "y": y });
            }
        }

        //training
        trainingset.forEach(function (v) {
            var regularized = fst.FStatistics.regularizeAll(msts, v.x);
            model.train_set_add(regularized, v.y);
        })

        model.train({
            target_error: 0.01,
            iterations: 20000,
            multithread: true,
            step_size: 100,
            threads: 4
        }, function (err) {
            console.log("training has just end");

            //save trained model
            var modelParamObj = {
                "model": model.to_string(),
                "statistics": msts
            };
            var modelParamStr = JSON.stringify(modelParamObj);

            fs.writeFileAsync(modelParam, modelParamStr)
                .then(function () {
                    console.log("saved to " + modelParam + ".");
                })
        });

    });
})
;
var NeuralN = require('neuraln');
var d3 = require("d3");

/* Create a neural network with 4 layers (2 hidden layers) */
var network = new NeuralN([1,4,3,1]);
var training = [];

/* Add points to the training set */
for (var i = -1; i < 1; i += 0.01) {
    var t = Math.abs(Math.sin(i));
    network.train_set_add([i], [t]);
    training.push([i , t]);
}

/* Train the network with one of the two available methods */
/* monothread (blocking) vs multithread (non-blocking)     */
network.train({
    target_error: 0.01,
    iterations: 20000,
    
    multithread: true,
    /* Relevant only when multithread is true: */
    step_size: 100,
    threads: 4
}, function (err) {
    test();
});

function test() {
    /* Run */
    var result = [];
    for (var i = -1; i < 1; i += 0.01) {
        var x = Math.random() * 2 - 1;
        var y = network.run([x])[0];
        result.push([x, y]);
    }
    
    /* Retrieve the network's string representation */
    var string = network.to_string();
    
    /* Retrieve the network's state string */
    var state = network.get_state();

    result.forEach(function (xy) {
        console.log(xy.join(","));
    })
}

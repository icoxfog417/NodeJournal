export class FStatistics {
    min = 0;
    max = 0;
    sum = 0;
    count = 0;

    constructor(params= null) {
        if (params) {
            this.min = params.min;
            this.max = params.max;
            this.sum = params.sum;
            this.count = params.count;
        }
    }

    static load(params, loadCount=-1) {
        var fsts = [];
        var count = loadCount;
        if (loadCount < 0) {
            count = params.length;
        }

        for (var i = 0; i < count; i++) {
            if (params.length > i) {
                fsts.push(new FStatistics(params[i]));
            } else {
                fsts.push(new FStatistics());
            }
        }

        return fsts;
    }

    add(value) {
        if (value < this.min) {
            this.min = value;
        }
        if (value > this.max) {
            this.max = value;
        }
        this.sum += value;
        this.count += 1;
    }

    regularize(value) {
        var v = parseFloat(value);
        var mean = this.sum / this.count;
        var d = this.max - this.min;
        return (v - mean) / d;
    }

    static regularizeAll(fsts: FStatistics[], values) {
        var result = [];
        for (var i = 0; i < fsts.length; i++) {
            result.push(fsts[i].regularize(values[i]));
        }
        return result;
    }

    serialize() {
        return [
            this.min,
            this.max,
            this.sum,
            this.count
        ]
    }

}
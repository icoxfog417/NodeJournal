var FStatistics = (function () {
    function FStatistics(params) {
        if (typeof params === "undefined") { params = null; }
        this.min = 0;
        this.max = 0;
        this.sum = 0;
        this.count = 0;
        if (params) {
            this.min = params.min;
            this.max = params.max;
            this.sum = params.sum;
            this.count = params.count;
        }
    }
    FStatistics.load = function (params, loadCount) {
        if (typeof loadCount === "undefined") { loadCount = -1; }
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
    };

    FStatistics.prototype.add = function (value) {
        if (value < this.min) {
            this.min = value;
        }
        if (value > this.max) {
            this.max = value;
        }
        this.sum += value;
        this.count += 1;
    };

    FStatistics.prototype.regularize = function (value) {
        var v = parseFloat(value);
        var mean = this.sum / this.count;
        var d = this.max - this.min;
        return (v - mean) / d;
    };

    FStatistics.regularizeAll = function (fsts, values) {
        var result = [];
        for (var i = 0; i < fsts.length; i++) {
            result.push(fsts[i].regularize(values[i]));
        }
        return result;
    };

    FStatistics.prototype.serialize = function () {
        return [
            this.min,
            this.max,
            this.sum,
            this.count
        ];
    };
    return FStatistics;
})();
exports.FStatistics = FStatistics;
//# sourceMappingURL=FStatistics.js.map

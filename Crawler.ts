///<reference path='typings/node/node.d.ts'/>
///<reference path='typings/bluebird/bluebird.d.ts'/>
///<reference path='typings/cheerio/cheerio.d.ts'/>
///<reference path='Scanner.ts'/>


import http = require("http");
import scanner = require("./Scanner");
var Promise = require("bluebird");
var phantom = require("phantom");
Promise.promisifyAll(phantom);


export class Crawler {
    proxy = "";
    proxy_auth = "";
    includeJs = [];
    engine = null;
    static DEBUG_PREFIX = "ByCrawler:";

    constructor(proxy = "", proxy_auth = "") {
        this.proxy = proxy;
        this.proxy_auth = proxy_auth;
        this.engine = phantom;
    }

    startBrowser(): Promise<any> {
        var self = this
        return new Promise(function (resolve) {
            self.engine.create(self.proxy, self.proxy_auth, resolve,
                {
                    dnodeOpts: {
                        weak: false
                    }
                }
            );
        })
    }

    openTab(browser: any): Promise<any> {
        return new Promise(function (resolve) {
                browser.createPage(function (page) {
                    resolve({ "browser": browser, "page": page })
            })
        })
    }

    private load_js(tab: any): Promise<any> {
        var self = this;
        var page = tab.page;

        return new Promise(function (resolve) {
            var chains = [];
            for (var index in self.includeJs) {
                var include = function (p) {
                    return new Promise(function (lresolve) {
                        var js = self.includeJs[index];
                        p.includeJs(js, function (page_included) {
                            lresolve(page_included)
                        })
                    })
                }
                chains.push(include)
            }

            var loading = null;
            for (index in chains) {
                loading = chains[index](page).then(function (page_included) {
                    page = page;
                })
            }
            loading.finally(function () {
                resolve({ "browser": tab.browser, "page": page });
            })
        })
    }

    crawle(url: string, ...scanners: scanner.IScanner[]): Promise<any> {
        var self = this;
        return new Promise(function (resolve) {
            self
            .startBrowser()
            .then(self.openTab)
            .then(function (tab) {
                tab.page.open(url, function (status) {
                    self
                    .load_js(tab)
                    .done(function (tab) {
                        var page = tab.page
                        page.onConsoleMessage(function (msg) {
                            if (msg.indexOf(Crawler.DEBUG_PREFIX) >= 0) {
                                console.log(msg.replace(Crawler.DEBUG_PREFIX,""))
                            }
                        })
                        var scans = [];
                        for (var index in scanners) {
                            var s = scanners[index];
                            var p = new Promise(function (lresolve) {
                                var callback = s;
                                page.evaluate(callback.getSelector(), function (result) {
                                    var r = callback.getEvaluator()(result);
                                    lresolve(r);
                                })
                            });
                            scans.push(p);
                        }

                        Promise.all(scans).then(function (values) {
                            tab.browser.exit();
                            resolve(values);
                        }).finally(function () {
                            tab.browser.exit();
                        })
                    })
                })
            })
        })
    }
}


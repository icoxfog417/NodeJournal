NodeJournal (v0.0.1)
=============

NodeJournal reads the site and summarizes it like newspaper.

In concrete terms, first it reads the site's text contents then classifies these into title and detail by model.

* Read the site: [phantomjs](https://github.com/sgentle/phantomjs-node)
* Classify the content: [neuraln](https://github.com/totemstech/neuraln)

(neuraln needs C compiler when installing).  

You can train the model as below.

1. download site contents. You will get `dataset.txt`  
`node training/GetDataset.js (site-url)`

2. copy the `dataset.txt` to `training.txt` and add labels for supervised lerning.

3. prepare `model.json` to define the model (layer architecture).
```model.json
{
    "layers": [ 5, 10, 10, 3]
}
```

4. training the model. training result is saved to `modelMemory.txt`  
`node training/Training.js`  
If you have `modelMemory.txt` already, it will be loaded before lerning.

Then, you can read the site. The result is saved in `crawled.txt`.

```
node Crawl.js (site-url)
```


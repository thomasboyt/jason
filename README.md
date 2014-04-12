here's a really weird JS parser I wrote in ES6. to run:

```
npm install
gulp
cat fixtures/array.json | node dist/cli.js
```

TODO:

* use mori data structures for the json tree, only returned as native JS object at the end (immutability is cool)
* figure out terser patterns for some things, more consistent patterns for others
* try to remove imperative blocks of code
* tests would probably be cool

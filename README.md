# postcss-hash-classname

[![Build Status][ci-img]][ci]  ![david][david] ![download][download]

**postcss-hash-classname** is a [PostCSS] plugin to append the hash string to your css class name.

This plugin is inspired by [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin). I really like webpack and extract-text-webpack-plugin used to solve the css scope problem.

But at below cases, we can't require css file directly.

* you want to do the server-side render with unique css classname
* your projcet doesn't work with webpack
* you want to package your projcet to a commonjs/amd/umd library which can't require `css` file.

If above is your use case, and you still want to keep the unique class name property, this plugin can do the trick!

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ctxhou/postcss-hash-classname.svg
[ci]:      https://travis-ci.org/ctxhou/postcss-hash-classname
[david]:   https://david-dm.org/ctxhou/postcss-hash-classname.svg
[download]:https://img.shields.io/npm/dm/postcss-hash-classname.svg?maxAge=2592000


## Example

**Input**

```css
.foo:not(.bar) {
  ...
}
```

**Output**
```css
.foo-7snm3d:not(.bar-8kb5qn) {
  ...
}
```

then it would generate the corresponding `js/json` file.

```js
module.exports = {
  "foo": "foo-7snm3d",
  "bar": "bar-8kb5qn"
}
```

so you can require this js file and set your class name from this object.

## When to use?

If you want to build your own library but afraid your class name would conflict user's class name, it's time to use this package.

And if you organize your project in the component way, postcss-hash-classname will generate corresponding js in each folder.

Check out the `example` folder to know more.

## Installation

```
$ npm install postcss-hash-classname
```

## Usage

#### gulp example
check the `example` folder
```js

var opts = {
  hashType: 'md5',
  digestType: 'base32',
  maxLength: 6,
  outputName: 'yoyo',
  dist: './dest',
  type: '.js'
};

var processors = [
  require('postcss-hash-classname')(opts)
];

gulp.task('default', function() {
  return gulp.src('./**.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./dest/'));
});
```

### Options


#### `hashType`

Hashing algorithm used when hashing classnames and source files' paths.

Default: `"md5"`

Value: `"sha1"`, `"md5"`, `"sha256"`, `"sha512"`


#### `digestType`

Hash output format.

Default: `"base32"`

Allowed values: `"hex"`, `"base26"`, `"base32"`, `"base36"`, `"base49"`, `"base52"`, `"base58"`, `"base62"`, `"base64"`


#### `maxLength`

Hash output max length.

Default: `6`

Allowed values: maxLength the maximum length in chars (See [loader-utils.getHashDigest](https://github.com/webpack/loader-utils#gethashdigest) for reference)


#### `classnameFormat`

Used to set the output format of your classname.

Default: `[classname]-[hash]`

Allowed values:

* Explicit value: `"my-classname"`

` .A, .b { ... } ` => ` .myclassname, .my-classname { ... } `

* Template value: `"myclass-[classname]-[hash]"`

` .A, .b { ... } ` => ` .myclass-A-425tvq, .myclass-b-5gbwsr { ... } `

  Template words supported: `"classname"`, `"hash"`, `"classnamehash"`, `"sourcepathash"`

* Callback function (gets passed original classname and source file's path): `(classname, sourcePath) => { return path.parse(sourcePath).name + '-' + classname; }`

foo.css: ` .A, .b { ... } ` => ` .foo.-A, .foo-b { ... } `

bar.css:` .A, .b { ... } ` => ` .bar-A, .bar-b { ... } `


### `output`

Defines output file's path.

Default: `none` (if not set, will be constructed from options `dist`, `outputName` and `type`)

Allowed values:

* Explicit value: `"./style.js"`

`./css/style.css` => `./style.js`

* Template value: `"[dir]/[name]-output.json"`

`./css/style.css` => `./css/style-output.json`

  Template words supported: `"root"`, `"dir"`, `"base"`, `"ext"`, `"name"` (See [path.parse()](https://nodejs.org/api/path.html) for reference)

* Callback function (gets passed source file's path): `(sourcePath) => { return Math.round(1000*Math.random()) + '.js'; }`

`./css/style.css` => `./114.js`


#### `dist`

Defines output file's target directory. Used only is `output` option empty.

Default: Same path as source file's

Allowed values:

* Explicit value: `"./processed-styles"`

`./css/style.css` => `./processed-styles/style.js`

* Template value: `"[dir]/processed-styles"`

`./css/style.css` => `./css/processed-styles/style.js`

  Template words supported: `"root"`, `"dir"`, `"base"`, `"ext"`, `"name"` (See [path.parse()](https://nodejs.org/api/path.html) for reference)

* Callback function (gets passed source file's path): `(sourcePath) => { return sourcePath + '/processed-styles'; }`

`./css/style.css` => `./css/processed-styles/style.js`


#### `outputName`

Defines output file's filename. Used only is `output` option empty.

Default: `"style"`

Allowed values:

* Explicit value: `"my-style"`

`./css/style.css` => `./my-style.js`

* Template value: `"[name]-processed"`

`./css/style.css` => `./style-processed.js`

  Template words supported: `"root"`, `"dir"`, `"base"`, `"ext"`, `"name"` (See [path.parse()](https://nodejs.org/api/path.html) for reference)

* Callback function (gets passed source file's path): `(sourcePath) => { return Math.round(1000*Math.random()); }`

`./css/style.css` => `./984.js`



#### `type`

Defines output file's extension - `".js"` and `".json"` supported. Used only is `output` option empty.

Default: `".js"`

Allowed values:

* Explicit value: `".json"`

`./css/style.css` => `./style.json`

* Template value: `"[ext].js"`

`./css/style.css` => `./style.css.js`

  Template words supported: `"root"`, `"dir"`, `"base"`, `"ext"`, `"name"` (See [path.parse()](https://nodejs.org/api/path.html) for reference)

* Callback function (gets passed source file's path): `(sourcePath) => { return Math.round(1000*Math.random()) + '.js'; }`

`./css/style.css` => `./style.984.js`


## Contributors

* ofzza([@ofzza](https://github.com/ofzza))


## License

MIT [@ctxhou](github.com/ctxhou)

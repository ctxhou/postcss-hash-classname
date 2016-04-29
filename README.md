# postcss-hash-classname

[![Build Status][ci-img]][ci]  ![david][david] ![download][download]

**postcss-hash-classname** is a [PostCSS] plugin to append the hash string to your css class name.

This plugin is inspired by [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin). I really like webpack and extract-text-webpack-plugin used to solve the css scope problem. In some cases, your projcet doesn't work with webpack or you want to package your projcet to a commonjs/amd/umd library which can't require `css` file. If you still want to keep the unique class name property, this plugin can do the trick!

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ctxhou/postcss-hash-classname.svg
[ci]:      https://travis-ci.org/ctxhou/postcss-hash-classname
[david]:   https://david-dm.org/ctxhou/postcss-hash-classname.svg
[download]:https://img.shields.io/npm/dm/postcss-hash-classname.svg?maxAge=2592000


## Example

**Input**

```css
.foo {
  ...
}
```

**Output**
```css
.foo-sdijhfdsifj1 {
  ...
}
```

then it would generate the corresponding `js/json` file.

```js
module.exports = {
  foo: "foo-sdijhfdsifj1"
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

Value: `sha1`, `md5`, `sha256`, `sha512`

Default: `md5`

#### `digestType`

Value: `hex`, `base26`, `base32`, `base36`, `base49`, `base52`, `base58`, `base62`, `base64`

Default: `base32`

#### `maxLength`

Value: maxLength the maximum length in chars

Default: 6

**ps**: reference [loader-utils.getHashDigest](https://github.com/webpack/loader-utils#gethashdigest) to know more.

#### `classnameFormat`

Default: `[classname]-[hash]`

You can set the output format of your classname.

Take `.example` this class name as the example:

* without hash string. (it return the origin classname)

`[classname]` => output: `example`

* with prefix and without hash string

`prefix-[classname]` => output: `prefix-example`

* with prefix, suffix and hash string

`prefix-[classname]-suffix-[hash] => output: `prefix-example-suffix-sdjif12`

Of course, you can insert any word at any position you want, like

`prefix_[classname]___sufix-[hash]-hey111`

Just remember to keep the `[classname]` and `[hash]` word.

**ps**:

```
You may find that you dont need to write [classname].

Yeah it's permit. I don't add too many limititation.

Maybe you would need your classname without origin classname in some case.
```
#### `outputName`

filename of the `.js/.json`

Default: `style`

#### `dist`

destination folder of your output js/json

Default: same path with css file

#### `type`

Value: `.js` or `.json`

Default: `.js`


## License

MIT [@ctxhou](github.com/ctxhou)

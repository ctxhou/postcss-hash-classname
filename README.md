# postcss-hash-classname [![Build Status][ci-img]][ci]

**postcss-hash-classname** is a [PostCSS] plugin to append the hash string to your css class.

This plugin is inspired by [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin). I really like webpack and extract-text-webpack-plugin used to solve the css scope problem. But if the projcet doesn't work with webpack or you want to package your projcet to a commonjs/amd/umd library which can't require `css` file. In this case, if you still want to keep the unique class name property, this plugin can do the trick!

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ctxhou/postcss-hash-classname.svg
[ci]:      https://travis-ci.org/ctxhou/postcss-hash-classname


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
  foo: ".foo-sdijhfdsifj1"
}
```

so you can require this js file and set your class name from this object.

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

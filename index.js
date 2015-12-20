var fs = require('fs');
var postcss = require('postcss');
var loaderUtils = require('loader-utils');

function writefile(pair) {
  var write = 'module.exports=' + JSON.stringify(pair);
  return write;
}

module.exports = postcss.plugin('postcss-classname', function (opts) {
  opts = opts || {};
  var pair = {};
  // Work with options here
  return function (css) {
    css.walkRules(function (rule) {
      var selector = rule.selector;
      if (selector[0] === '.') {
        var className = selector.substring(1);
        var hash = loaderUtils.getHashDigest(selector, opts.hashType, opts.digestType, opts.maxLength);
        var newName = selector + '-' + hash;
        pair[className] = newName;
        rule.selector = newName;
      }
    });
    // set the output
    if (!opts.dist)
      opts.dist = '.';
    if (!opts.filename)
      opts.filename = 'style';
    if (!opts.type)
      opts.type = '.js';
    else if (opts.type[0] !== '.')
      opts.type = '.' + opts.type;
    var fileName = [opts.dist, opts.filename].join('/');
    fs.writeFile(fileName + opts.type, writefile(pair));
  };
});


var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var loaderUtils = require('loader-utils');
var parser = require('postcss-selector-parser');

function writefile(pair, type) {
  var string = JSON.stringify(pair);
  if (type === '.js')
    return 'module.exports=' + string;
  else
    return string;
}

module.exports = postcss.plugin('postcss-classname', function (opts) {
  opts = opts || {};

  var dist = opts.dist || ".",
      outputName = opts.outputName || "style",
      type = opts.type || ".js",
      hashType = opts.hashType || "md5",
      digestType = opts.digestType || "base32",
      maxLength = opts.maxLength || 6,
      outputFile;

  if (type[0] !== '.')
    type = '.' + type;

  return function (css) {
    var pair = {};
    var sourcePath = css.source.input.file;
    css.walkRules(function (rule) {
      console.log(rule.source)
      var selectors = rule.selectors;
      var selectors = selectors.map(function(selector){
        if (selector[0] === '.') {
          var className = selector.substring(1);
          var hash = loaderUtils.getHashDigest(selector, hashType, digestType, maxLength);
          pair[className] = className + '-' + hash; // write to object
          return selector + '-' + hash;
        } else {
          return selector
        }
      })
      rule.selectors = selectors;
    });

    // if it load from file, output the classname object to file path
    if (sourcePath) {
      var currentPath = path.dirname(sourcePath);
      currentPath = path.resolve(currentPath, dist);
      outputFile = currentPath + '/' + outputName + type;
    } else {
      outputFile = [dist, outputName].join('/');
      outputFile += type;
    }
    fs.writeFile(outputFile, writefile(pair, type));
  };
});

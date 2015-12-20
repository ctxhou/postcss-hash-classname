var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var loaderUtils = require('loader-utils');

function writefile(pair, type) {
  var string = JSON.stringify(pair);
  if (type === '.js')
    return 'module.exports=' + string;
  else
    return string;
}

module.exports = postcss.plugin('postcss-classname', function (opts) {
  opts = opts || {};
  var pair = {},
      dist = opts.dist || ".",
      outputName = opts.outputName || "style",
      type = opts.type || ".js",
      hashType = opts.hashType || "md5",
      digestType = opts.digestType || "base32",
      maxLength = opts.maxLength || 6,
      outputFile;

  if (type[0] !== '.')
    type = '.' + type;

  return function (css) {
    var sourcePath = css.source.input.file;
    // console.log(sourcePath)
    css.walkRules(function (rule) {
      var selector = rule.selector;
      if (selector[0] === '.') {
        var className = selector.substring(1);
        var hash = loaderUtils.getHashDigest(selector, hashType, digestType, maxLength);
        var newName = selector + '-' + hash;
        pair[className] = newName;
        rule.selector = newName;
      }
    });

    // if it load from file, output the classname object to file path
    if (sourcePath) {
      var currentPath = path.dirname(sourcePath);
      currentPath = path.resolve(currentPath, dist);
      outputFile = currentPath + '/' + outputName + type;
    } else {
      outputFile = [dist, outputName].join('/');
      outputFile += type;
      console.log(outputFile)
    }
    fs.writeFile(outputFile, writefile(pair, type));
  };
});

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
      classnameFormat = opts.classnameFormat || "[classname]-[hash]",
      maxLength = opts.maxLength || 6,
      outputFile;

  if (type[0] !== '.')
    type = '.' + type;

  return function (css) {
    var pair = {};
    var sourcePath = css.source.input.file;
    css.walkRules(function (rule) {
      var selectors = rule.selectors.map(function(selector){
        // to deal with concate classname or pseduo-selector
        return parser(function(sels) {
          sels.map(function(sel) {
            var nodes = sel.nodes;
            nodes.map(function(node) {
              if (node.type === 'class') {
                var value = node.value;
                var hashName = sourcePath ? (value + sourcePath) : value;
                // get hash and to ensure same class name but different file has different hash
                var hash = loaderUtils.getHashDigest( hashName, hashType, digestType, maxLength);
                var newClassname = classnameFormat.replace(/\[classname\]/gi, value);
                newClassname = newClassname.replace(/\[hash\]/gi, hash)
                node.value = newClassname;
                pair[value] = newClassname;
              }
            })
            sel.nodes = nodes;
          })
        }).process(selector).result
      })
      rule.selectors = selectors;
    });

    // if it load from file, output the classname object to file path
    if (sourcePath) {
      var currentPath = path.dirname(sourcePath);
      currentPath = path.resolve(currentPath, dist);
      // process outputName replacements if any
      var filename = outputName;
      if (typeof outputName === 'string') {
        var sourcePathParsed = path.parse(sourcePath)
        filename = filename.replace(/\[name\]/gi, sourcePathParsed.name);
      } else if (typeof outputName === 'function') {
        filename = outputName(sourcePath);
      }
      outputFile = currentPath + '/' + filename + type;
    } else {
      outputFile = [dist, outputName].join('/');
      outputFile += type;
    }
    fs.writeFile(outputFile, writefile(pair, type));
  };
});

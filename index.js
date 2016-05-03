var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var loaderUtils = require('loader-utils');
var parser = require('postcss-selector-parser');

/**
 * Renames all classnames in a css rule selector
 * @param selector css selector
 * @param sourcePath Source file's path
 * @param opts Options object
 * @param mappings Classname to renamed classname mappings repository
 * @return {*} Renamed css rule selector
 */
function renameSelector(selector, sourcePath, opts, mappings) {
  return selector.map(function(selector){
    return parser(function(sels) {
      sels.map(function(sel) {
        renameNodes(sel.nodes, sourcePath, opts, mappings);
      })
    }).process(selector).result
  });
}

/**
 * Renames all classnames in css nodes
 * @param nodes css nodes
 * @param sourcePath Source file's path
 * @param opts Options object
 * @param mappings Classname to renamed classname mappings repository
 * @return {*} Renamed css nodes
 */
function renameNodes(nodes, sourcePath, opts, mappings) {
  return nodes.map(function(node) {
    // Process CSS node
    if (node.type === 'class') {
      // Process "class" node
      var orgValue = node.value,
          newValue = renameClassNode(node.value, sourcePath, opts);
      // Edit node and store mapping of classname renaming
      node.value = mappings[orgValue] = newValue;
    } else if (node.type === 'pseudo' && node.value === ':not') {
      // Process ":not([selector])" pseudo node
      renameNodes(node.nodes, sourcePath, opts, mappings);
    } else if (node.type === 'selector') {
      // Rename selector nodes
      renameNodes(node.nodes, sourcePath, opts, mappings)
    }
  });
}

/**
 * Generates a replacement css classname
 * @param value Original classname
 * @param sourcePath Source file's path
 * @param opts Options object
 */
function renameClassNode(value, sourcePath, opts) {
  // Generate hashes
  var className = value,
      compositeHash = loaderUtils.getHashDigest( (sourcePath ? sourcePath + className : className), opts.hashType, opts.digestType, opts.maxLength),
      classHash = loaderUtils.getHashDigest( className, opts.hashType, opts.digestType, opts.maxLength),
      sourcePathHash = (sourcePath ? loaderUtils.getHashDigest( sourcePath, opts.hashType, opts.digestType, opts.maxLength) : ''),
      newClassName;
  // Check classname format type
  if (typeof opts.classnameFormat === 'string') {
    // Process classname as template
    newClassName = opts.classnameFormat
      .replace(/\[classname\]/gi, className)
      .replace(/\[hash\]/gi, compositeHash)
      .replace(/\[classnamehash\]/gi, classHash)
      .replace(/\[sourcepathash\]/gi, sourcePathHash);
  } else if (typeof opts.classnameFormat === 'function') {
    // Get new classname from callback
    newClassName = opts.classnameFormat(className, sourcePath);
  } else {
    // Keep classname
    newClassName = className;
  }
  // Return generated replacement classname
  return newClassName;
}

/**
 * Formats class mapping output for writing to a file of specified type
 * @param mappings Classname to renamed classname mappings repository
 * @param type Output file type
 * @return {string} Formatted output file contents
 */
function formatFileOutput(mappings, type) {
  var string = JSON.stringify(mappings, null, 2);
  if (type === '.js') {
    return 'module.exports=' + string;
  } else if (type === '.json') {
    return string;
  }
}

/**
 *
 * @param opts Plugin options object
 *  > opts.hashType:        Hash type used for hash generation; hashType e {sha1, md5, sha256, sha512}
 *  > opts.digestType:      Hash digest type for hash generation; digestType e {hex, base26, base32, base36, base49, base52, base58, base62, base64}
 *  > opts.maxLength:       Maximum hash length in chars; reference loader-utils.getHashDigest (https://github.com/webpack/loader-utils#gethashdigest) to know more.
 *  > opts.classnameFormat: Classname generation formatting definition; supported formatting:
 *    > string:               Used as output class name
 *    > template string:      Used as template for generating output class name; supported template words:
 *      > "[classname]":        Original classname
 *      > "[hash]":             Hash based on original classname and source file path
 *      > "[classnamehash]":    Hash based on original classname
 *      > "[sourcepathash]":    Hash based on source file path
 *    > callback function:  Callback function being passed original classname and source file's path as arguments needs to return replacement classname;
 *                          Callback function format: (classname, sourcePath) => { return [new classname]; }
 *  > opts.output:      Output file's path or path format definition; supported formatting:
 *    > string:             Used as output file's path
 *    > template string:    Used as template for generating output file's path; supported template words e { [root], [dir], [base], [ext], [name] },
 *                          see path.parse output (https://nodejs.org/api/path.html) for reference
 *    > callback function:  Callback function being passed source file's path needs to return output file's path;
 *                          Callback function format: (sourcePath) => { return [outputPath]; }
 * @return {Function}
 */
function plugin(opts) {
  var outputFile;

  // Set option defaults
  opts = opts || {};
  opts.hashType = opts.hashType || "md5";
  opts.digestType = opts.digestType || "base32";
  opts.maxLength = opts.maxLength || 6;
  opts.classnameFormat = opts.classnameFormat || "[classname]-[hash]";
  opts.output = opts.output || "[dir]/[name].json";

  // Return postcss plugin function
  return function (css) {
    var mappings = {},
        sourcePath = css.source.input.file;

    // Process css rule selectors
    css.walkRules(function (rule) {
      rule.selectors = renameSelector(rule.selectors, sourcePath, opts, mappings);
    });

    // Check opts.output format type
    if (sourcePath && typeof opts.output === 'string') {
      // Use opts.output as output path template
      var parsed = path.parse(sourcePath);
      outputFile = opts.output
        .replace(/\[root\]/gi, parsed.root)
        .replace(/\[dir\]/gi, parsed.dir)
        .replace(/\[base\]/gi, parsed.base)
        .replace(/\[ext\]/gi, parsed.ext)
        .replace(/\[name\]/gi, parsed.name);
    } else if (sourcePath && typeof opts.output === 'function') {
      // Use opts.output as output path callback
      outputFile = opts.output(sourcePath);
    } else {
      // Use opts.output as output path
      outputFile = opts.output;
    }

    // Write to output file
    fs.writeFile(outputFile, formatFileOutput(mappings, path.parse(outputFile).ext));
  };
}

// Export plugin syntax
module.exports = postcss.plugin('postcss-classname', plugin);

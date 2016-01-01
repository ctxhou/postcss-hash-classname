var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var expect  = require('chai').expect;

var plugin = require('../');


describe('postcss-classname', function () {
  var opts = { hashType: 'md5', digestType: 'base32' };
  it('change class name', function () {
    opts.maxLength = 6;
    opts.dist = './test/dist';
    opts.outputName = 'test1';
    var processor = postcss([ plugin(opts) ]);
    var testcss = '.test{}';
    var testcssLength = testcss.replace('{}', '').length;
    var result = processor.process(testcss).css.replace('{}', '');
    expect(result.length).to.equal(testcssLength + opts.maxLength + 1); // 1 means '.'
  });

  it('not class didnt change', function () {
    opts.dist = './test/dist';
    opts.outputName = 'test2';
    var processor = postcss([plugin(opts)]);
    var testcss1 = '#id{}';
    var testcss2 = 'body{}';
    expect(processor.process(testcss1).css).to.equal(testcss1);
    expect(processor.process(testcss2).css).to.equal(testcss2);
  });

  it('seperate classname', function() {
      opts.dist = './test/dist';
      var processor = postcss([plugin(opts)]);
      var test = '.asjidf, .djif, .sdf{}';
      var result = processor.process(test).css;
      expect(result).to.equal(".asjidf-5j8gya, .djif-4zw7xd, .sdf-hn3hq7{}");
  })

  it('concate classname', function() {
      opts.dist = './test/dist';
      var processor = postcss([plugin(opts)]);
      var test = '.asjidf.djif.sdf{}';
      var test2 = 'a.asjidf.djif.sdf{}';
      expect(processor.process(test).css).to.equal(".asjidf-5j8gya.djif-4zw7xd.sdf-hn3hq7{}");
      expect(processor.process(test2).css).to.equal("a.asjidf-5j8gya.djif-4zw7xd.sdf-hn3hq7{}");
  })

  it('pseduo selector', function() {
      opts.dist = './test/dist';
      var processor = postcss([plugin(opts)]);
      var test1 = '.asjidf::before{}';
      var test2 = '.asjidf:before{}';
      var test3 = '.asjidf:before, .sdf{}';
      var test4 = '.asjidf:before.sdf{}';
      expect(processor.process(test1).css).to.equal(".asjidf-5j8gya::before{}");
      expect(processor.process(test2).css).to.equal(".asjidf-5j8gya:before{}");
      expect(processor.process(test3).css).to.equal(".asjidf-5j8gya:before, .sdf-hn3hq7{}");
      expect(processor.process(test4).css).to.equal(".asjidf-5j8gya:before.sdf-hn3hq7{}");
  })

  it('test from file', function() {
    opts.dist = './test/dist';
    opts.outputName = 'style';
    var css = fs.readFileSync('./test/test.css', 'utf8');
    var expected = fs.readFileSync('./test/test-expected.css', 'utf8');
    var processor = postcss([plugin(opts)]);
    var result = processor.process(css).css;
    expect(result).to.equal(expected);
  })

  it('return custom suffix and predix', function() {
    opts.dist = './test/dist';
    opts.classnameFormat = 'prefix-[classname]_[hash]';
    var test1 = '.asjidf{}';
    var processor = postcss([plugin(opts)]);
    expect(processor.process(test1).css).to.equal(".prefix-asjidf_5j8gya{}");

    opts.classnameFormat = 'prefix-[classname]';
    var processor2 = postcss([plugin(opts)]);
    expect(processor2.process(test1).css).to.equal(".prefix-asjidf{}");
  })
});

describe('test output file', function() {
  var opts = { hashType: 'md5', digestType: 'base32', dist: './test/dist' };

  before(function(done){
    setTimeout(function(){
      var test = '.asjidf, .djif, .sdf{}';
      // test output validate file
      opts.type = '.js';
      opts.outputName = 'validate';
      postcss([plugin(opts)]).process(test).css;
      // test output json file
      opts.type = '.json'
      opts.outputName = 'jsonFile';
      postcss([plugin(opts)]).process(test).css;
      done();
    }, 100);
  });

  it("validate output", function(){
    var js = require('./dist/validate');
    var answer = { asjidf: 'asjidf-5j8gya', djif: 'djif-4zw7xd', sdf: 'sdf-hn3hq7' };
    for (var key in answer) {
      expect(answer[key]).to.equal(js[key]);
    }
  });

  it("generate json file", function() {
    var fileExist = false;
    fs.stat('./test/dist/jsonFile.json', function(err, stat) {
        if(err == null) {
          fileExist = true;
        }
      expect(fileExist).to.equal(true);
    });
  })
})

var express = require('express');
var router = express.Router();
var fs = require('fs');
var langs = ["Python2", "Python3", "Ruby", "C++", "Java"];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { langs: langs });
});
router.post('/compiled',function(req, res, next) {
    require('shelljs/global');
    var is_installed = exec('dpkg -l | grep docker', {}).output;
    if(is_installed === ''){
        res.render('compiled_error', { error: 'docker not installed'});
    }else{
        var docker = require('../utils/utils');
        var lang = langs[parseInt(req.body.language)];
        var ram = req.body.ram;
        var code = req.body.description;
        var path = (Date.now() / 1000 | 0).toString();
        docker.create_dir(path,lang,code);
        /* Establecemos un timeout para esperar a la función create_dir */
        setTimeout(function(){
            var data_build = docker.build(path);
            setTimeout(function(){
                console.log('waiting for build...');
            },3000);            
            var data = docker.run(path,ram);
            if(data.search('ERROR') != -1){
                res.render('compiled_error', { error: 'Execution time exceeded, probably there is an infinite loop in your code...' });
            }else if(data.search('Unable to find image') != -1){
                res.render('compiled_error', { error: 'Compilation error, something was wrong in your code', build: data_build.toString() });
            }else{            
                res.render('compiled', { data: data.toString(), code: code, lang: langs[parseInt(req.body.language)], build: data_build.toString() });
            }
            data = docker.stop(path);
        }, 3000);
    }
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about');
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact');
});

/* GET ps page */
router.get('/ps', function(req,res,next) {
    require('shelljs/global');
    var data = exec('ps', {}).output;
    res.render('version', { stdout: data.toString() });

});





module.exports = router;

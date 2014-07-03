var express = require('express'),
  fs = require('fs'),
  path = require('path'),
  Q = require('q');

var app = express();

if (!fs.existsSync('goals'))
  fs.mkdirSync('goals');

app.get('/', function(req, res) {
  var goals = [];

  Q.nfcall(fs.readdir, 'goals')
    .then(function(files) {
      var promise = Q();

      files.forEach(function(file) {
        promise = promise.then(function() {
          return Q.nfcall(fs.readFile, path.join('goals', file))
            .then(function(contents) {
              goals.push(contents.toString());
            });
          });
      });

      return promise;
    })
    .then(function() {
      res.send(goals);
    })
    .fail(function(err) {
      res.status(500).end('no goals for you');
    })
    .done();
});

app.post('/', function(req, res) {
  var timestamp = (new Date()).getTime().toString();
  req.pipe(fs.createWriteStream(path.join('goals', timestamp)));
  req.on('end', function() {
    res.send('ok');
  });
});

app.listen(80);

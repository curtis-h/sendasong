var config  = require('./config');
var express = require('express');
var parser  = require('body-parser');
var twilio  = require('twilio')(config.sid, config.token);
var request = require('request');
var app     = express();


app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));
app.use(express.static('public'));


function makeCall(id, number) {
    twilio.makeCall({
        to   : number,
        from : config.number,
        url  : 'http://twilhack.curtish.me/twiml?id='+id,
        method: 'get'
    },
    function(err, responseData) {
        console.log(responseData.from);
    });
}


app.get('/twiml', function(req, res) {
    var url   = 'https://api.soundcloud.com/tracks/'+req.query.id+'/stream?client_id='+config.sc_id;
    var twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Play loop="1">'+url+'</Play></Response>';
    console.log(twiml);
    res.send(twiml);
});


app.post('/', function(req, res) {
    console.log('post');
    console.log(req.body);
    
    var url = 'http://api.soundcloud.com/resolve.json?client_id='+config.sc_id+'&url='+req.body.url;
    console.log(url);
    
    request({url:url, json:true}, function (error, response, data) {
      if (!error && response.statusCode == 200) {
          console.log(data.id);
          console.log('http://twilhack.curtish.me/twiml?id='+data.id);
          
          makeCall(data.id, req.body.number);
          res.send('success');
      }
    })
    //res.send('posted');
});

app.listen(3000);
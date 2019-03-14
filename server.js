var express = require('express.io');
var app = express();
app.http().io();
var PORT = (3000);
console.log('Server started on ' + PORT);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.io.route('ready', function(req){
    req.io.join(req, res)
    app.io.room(req.data).broadcast('announce', {
        message: 'New client in the ' + req.data + ' room.'
    })
})

app.listen(PORT)
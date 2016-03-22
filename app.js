var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var routes = require('./routes/index');
var port = process.env.PORT || 8080;
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//connect to mongoDB server
var mongoose = require('mongoose');
require('./models/Attendances');
require('./models/Users');
require('./config/passport');

//mongoose.connect('mongodb://localhost/news');
mongoose.connect('mongodb://kalunlee136:564213ab@ds019648.mlab.com:19648/coordinator');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

routes(app);

app.listen(port, function(err,a){
    console.log('listening to port', port);
});


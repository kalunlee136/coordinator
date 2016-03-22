var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
var Attendance = require('../models/Attendances');
var User = require('../models/Users')
var Yelp = require('yelp');

    
var yelp = new Yelp({
  consumer_key: 'awhg7I0mWCV2yi7uCdzlvw',
  consumer_secret: '-bjBF5EWeF3ekmPme0erhtOqFgo',
  token: 'cAYTnAA1sJFHBT6bHjVZn33LJGNmZya2',
  token_secret: 'PivrWTGDvlz_cpHoKXjN9AHdR-c',
});

module.exports = function(app){
    /* GET home page. */
    app.get('/', function(req, res, next) {
      res.render('index');
    });
    
    app.post('/locations', function(req, res, next){
      // See http://www.yelp.com/developers/documentation/v2/search_api
      Attendance.find({city: req.body.location}, function(err, places){
        var names = places.map(function(p){
          return p.name;
        });

        yelp.search({ term: 'club', location: req.body.location}).then(function (data) {
          var b = data.businesses;
          for(var i=0;i<b.length;i++){
            b[i].upvotes = 0;
            b[i].city = req.body.location
          }
          console.log('locations', b[0].location);
          
          var unique = b.filter(function(business){
            return names.indexOf(business.name) === -1;
          });

          for(var i=0;i<places.length;i++){
            unique.unshift(places[i]);
          }
          
          res.json(unique);
        });
      });
      
    });
    
    app.get('/attendance',function(req,res,next){
      Attendance.find(function(err, attendances){
        if(err){ return next(err); }
    
        res.json(attendances);
      });
    });
    
    app.put('/attendance', auth,function(req,res,next){
      Attendance.findOne({name: req.body.location.name, city: req.body.location.city},function(err, place){
        console.log('place',place);
        if(place !== null){
          if (place.users.indexOf(req.payload._id) === -1){
              place.upvote();
              place.users.push(req.payload._id)
              place.save(function(err,p){
                res.json(p)
              });
          }else{
            place.downvote();
            place.users.splice(place.users.indexOf(req.payload._id), 1);
            place.save(function(err,p){
              res.json(p)
            });
          }
          
        }else{
          var attendance = new Attendance(req.body.location);
          attendance.upvotes += 1;
          attendance.users.push(req.payload._id);
          
          attendance.save(function(err,att){
            if(err) console.log(err);
              
            res.json(att);
          });
        }
      });
    });

    app.post('/register', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
      
      console.log(req.body)
      var user = new User();
    
      user.username = req.body.username;
    
      user.setPassword(req.body.password)
    
      user.save(function (err){
        if(err){ return next(err); }
    
        return res.json({token: user.generateJWT()})
      });
    });
    
    app.post('/login', function(req, res, next){
      if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all fields'});
      }
    
      passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
    
        if(user){
          return res.json({token: user.generateJWT()});
        } else {
          return res.status(401).json(info);
        }
      })(req, res, next);
    });
}


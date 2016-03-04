// Request API access: http://www.yelp.com/developers/getting_started/api_access

module.exports = function(){
    var Yelp = require('yelp');
    
    var yelp = new Yelp({
      consumer_key: 'awhg7I0mWCV2yi7uCdzlvw',
      consumer_secret: '-bjBF5EWeF3ekmPme0erhtOqFgo',
      token: 'cAYTnAA1sJFHBT6bHjVZn33LJGNmZya2',
      token_secret: 'PivrWTGDvlz_cpHoKXjN9AHdR-c',
    });
}

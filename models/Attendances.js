var mongoose = require('mongoose');

var AttendanceSchema = new mongoose.Schema({
  name:String,
  url:String,
  image_url:String,
  location: {},
  city:String,
  upvotes: {type: Number, default: 0},
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

AttendanceSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

AttendanceSchema.methods.downvote = function(cb) {
  if(this.upvotes > 0)
    this.upvotes -= 1;
  this.save(cb);
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
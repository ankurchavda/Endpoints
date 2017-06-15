var mongoose = require('mongoose');
var userSchema = mongoose.Schema({
	name: String,
	password: String,
	admin: Boolean
});

var User = module.exports = mongoose.model('User', userSchema);

module.exports.addUser = function(user, callback){
	User.create(user,callback); // password here is saved as plain text just for the sake of the example.
}

const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
      type: String,
      index: true,
      required: [true, 'Please tell us your name!']
    },
   room: [
       {
        type: mongoose.Schema.ObjectId,
        ref: 'Room'
       }
    ]
    
  });


  const User = mongoose.model('User', userSchema);
  module.exports = User;
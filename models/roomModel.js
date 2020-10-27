const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomName: String, //roomName is same as userFrom
    message:  // this is msg format which will be sent back to recipent client and will be rendered into HTML 
        [
            {
                username: String,          
                text: String,
                time: String,          
            }
        ]      
});
const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
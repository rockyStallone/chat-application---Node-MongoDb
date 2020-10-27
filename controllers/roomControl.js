const Room = require('../models/roomModel');

exports.createRoom = async (req,res) => {
   const newRoom = await Room.create(req.body);
   res.status(201).json({
       status:'success',
        data: newRoom
    })
}

exports.updateRoom = async (req,res) => {
    const room = await Room.findOneAndUpdate({name: req.query.roomName}, {$push: {message:req.body}}, {new:true}) 
    if(!room) {
        res.status(400).json({            
            status: 'failure',
            data: {
                message: 'room not found!'
            }
        })
        return;
    }

    res.status(200).json({
        status: 'success',
        data: {
            room
        }
    })
}
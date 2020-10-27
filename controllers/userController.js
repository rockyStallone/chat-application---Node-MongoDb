const User = require('../models/userModel');

exports.createUser = async (req,res) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            newUser
        }
    })
}

exports.updateUser = async (req,res) => {
    const user = await User.findOneAndUpdate({name: req.query.userName}, req.body, {new:true}) 
    if(!user) {
        res.status(400).json({            
            status: 'failure',
            data: {
                message: 'User not found!'
            }
        })
        return;
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
}
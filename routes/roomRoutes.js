const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomControl');



router.route('/').post( roomController.createRoom);
router.route('/').patch( roomController.updateRoom);
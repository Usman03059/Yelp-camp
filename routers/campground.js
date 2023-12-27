const express = require('express');
const router = express.Router();

const Campground = require('../models/campground')
const { validateCamp, islogin, isauthor } = require('../middlever')
const asyncError = require('../utils/asyncerror')
const campground = require('../controllers/campgrounds')
const multer  = require('multer')
const {storage}=require('../cloudinary/cloud')
const upload = multer({storage});



router.get('/', asyncError(campground.index));
router.get('/new', islogin, campground.newfarm);
//router.post('/',upload.array('image'),(req,res)=>{
  //  res.send('ite worked')
  //  console.log(req.body,req.file)
//})

router.post('/', islogin,upload.array('image'), validateCamp, asyncError(campground.newCam));

router.get('/:id', asyncError(campground.Showcam));
router.get('/:id/edit', islogin, isauthor, asyncError(campground.editpage));
router.put('/:id', islogin, isauthor, upload.array('image'), validateCamp, asyncError(campground.edit));
router.delete('/:id', isauthor, islogin, asyncError(campground.delete));
module.exports = router;
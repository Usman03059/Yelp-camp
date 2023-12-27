const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {cloudinary}=require('../cloudinary/cloud')
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};
module.exports.newfarm = (req, res) => {
    res.render('campgrounds/new')
}
module.exports.newCam = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.Location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images=req.files.map(f=>({url:f.path, filename:f.filename}))
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp)
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${newCamp._id}`)
}
module.exports.Showcam = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campgrounds) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campgrounds });
}
module.exports.editpage = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id)
    if (!campgrounds) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campgrounds });
}
module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const img=req.files.map(f=>({url:f.path, filename:f.filename}));
    campground.images.push(...img);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully update a campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully delete a campground!');
    res.redirect('/campgrounds')
}
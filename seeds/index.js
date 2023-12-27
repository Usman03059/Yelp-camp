const { cities } = require('./cities')
const { places, descriptors } = require('./seedhelper')
const mongoose = require('mongoose')
const Campground = require('../models/campground')
mongoose.connect('mongodb://127.0.0.1:27017/Yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection Error"));
db.once('open', () => {
    console.log("Connection database")
})
function sample(array) {
    return array[Math.floor(Math.random() * array.length)]
}

const seeddb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '652d806392fb9dd7783823d0',
            Location: `${cities[rand].city},${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnhum76lr/image/upload/v1703098240/Yelpcamp/vnfefnftl5cue6deq9r4.png',
                    filename: 'Yelpcamp/vnfefnftl5cue6deq9r4'
                },
                {
                    url: 'https://res.cloudinary.com/dnhum76lr/image/upload/v1703098239/Yelpcamp/sfxqbspnagic6dhovv6g.png',
                    filename: 'Yelpcamp/sfxqbspnagic6dhovv6g'
                }
            ],
            price,
            geometry: {
                type: 'Point', coordinates: [cities[rand].longitude,
                cities[rand].latitude,
                ]
            },
            description: 'lorem ipsum dolor sit'
        })
        await camp.save()
    }


}
seeddb().then(() => {
    mongoose.connection.close()
})
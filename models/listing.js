const mongoose = require("mongoose");
const Review = require("./review.js");
const { listingSchema } = require("../schema");
const Schema = mongoose.Schema;

const listeningSchema = new Schema({
    title: {
        type: String,
        required: true,
    },    
    description: String,
    image: {
       filename: String,
       url: String,
    },    
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

listeningSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id: { $in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listeningSchema);
module.exports = Listing;
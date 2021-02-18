const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({​​
    name: {​​type: String}​​,
    price: {​​
        type: Number
    }​​,
    image: {​​
        type: Array
    }​​,
    description: {​​
        type: String
    }​​,
    active: {​​
        type: Boolean
    }​​,
    featured: {​​
        type: Boolean
    }​​,
    country: {​​
        type: String
    }​​,
    city: {​​
        type: String
    }​​,
    email: {​​
        type: String
    }​​,
    contact: {​​
        type: Number
    }​​,
    date:{
        type:String
    }
}​​)

module.exports = mongoose.model('productSchema', productSchema);
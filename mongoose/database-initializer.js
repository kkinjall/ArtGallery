const mongoose = require('mongoose');

// Drop the users and gallery collections from the database
mongoose.connection.dropCollection('users', function(err){
    if(err){
        if (err == 26){
            console.log("Collection not found.");
        }
    }
    else{
        console.log("Cleared patrons collection.");
    }
})

mongoose.connection.dropCollection('galleries', function(err){
    if(err){
        if (err == 26){
            console.log("Collection not found.");
        }
    }
    else{
        console.log("Cleared galleries collection.");
    }
})

let userschema = new mongoose.Schema({
    _id: String,
    username :{
        type: String,
    },
    password : String,
    loggedin: Boolean,
    artist : Boolean,
    liked : Array,
    reviews : Array,
    following : Array,
    workshops : Array,
    enrolled : Array
});

let galleryschema = new mongoose.Schema({
    name : String,
    artist : String,
    year :  Number,
    category : String,
    medium : String,
    likes : Number,
    description : String,
    image : String,
    reviews : Array
});

let user = mongoose.model('users', userschema)
let gallery = mongoose.model('galleries', galleryschema)

// Import objects from json file to gallery collection
let galleriess = require('../gallery/gallery.json');
for(let i = 0; i < galleriess.length; i++){
    gallery.insertMany(galleriess[i]);
}

module.exports = {user, gallery}
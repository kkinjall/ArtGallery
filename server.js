const fs = require("fs");
const mongoose = require("mongoose");
const pug = require("pug");
const express = require("express");
const session = require("express-session");
const { user, gallery } = require("./mongoose/database-initializer.js");
let app = express();

app.use(express.static("./public")); // extract all files in the public directory
app.set("view engine", "pug"); // make the view type pug
app.set("views", "./views"); // specify the directory the pug files are in
app.use(express.json()); // parse any JSON object sent from client
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: 'a secretly secret secret',
	resave: true,
	saveUninitialized: true
}));

// Connect to database
mongoose.connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
	if (err) {
		console.log("Error in connecting to database.");
		console.log(err);
		return;
	}
	console.log("Connected to database!");
});

// Get requests
app.get("/", (req, res) => { res.render("pages/register"); });
app.get("/register", (req, res) => { res.render("pages/register"); });
app.get("/login", (req, res) => { res.render("pages/login"); });

// Get the gallery for a user that is logged in
app.get("/gallery/:username", (req, res) => {
	let name = req.params.username;
	name = decodeURI(name);
	
	// Get the gallery objects
	let galleee = {};
	gallery.find({}).exec(function (err, results) {
		for (let i = 0; i < results.length; i++) {
			galleee[results[i].name] = results[i];
		}
	});
	user.findOne({ username: name }).exec(function (err, results) {
		if (results != null && req.session.loggedin == true) { // check if user exists and is logged in
			res.render("gallery", { galleee });
		}

		else {
			res.status(404).send("Unauthorized Access. You must be logged in to view this page.");
		}
	})
});
app.get("/public/client.js", (req, res) => { res.status(200).send("client.js"); })
app.get("/public/login.css", (req, res) => { res.status(200).send("login.css"); })

// Have the user navigate to the page to search artworks if they're logged in
app.get('/searchArtworks', async (req, res) => {
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin) {
		res.render("pages/searchArtworks");
	}
	else {
		res.status(404).send("You must be logged in to view this page.");
	}
})

// Search for artwork that have the same name
app.get('/artName/:name', async (req, res) => {
	let name = req.params.name;
	name = decodeURI(name);
	let artworks = [];

	// Check if user exists and is logged in, then find all artworks that have the same name
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true) {
		let art = await gallery.find({});
		for (let i = 0; i < art.length; i++) {
			if (art[i].name.toLowerCase() == name.toLowerCase()) { // case insensitive
				artworks.push(art[i]);
			}
		}
		res.render("pages/searchResults", { search: name, artworks });
	}
	else {
		res.status(404).send("User must be logged in!");
	}
})

// Search for artworks that have the same artist
app.get('/artistSearch/:artist', async (req, res) => {
	let artist = req.params.artist;
	let artworks = [];

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin) {
		let art = await gallery.find({});
		for (let i = 0; i < art.length; i++) {
			if (art[i].artist.toLowerCase() == artist.toLowerCase()) {
				artworks.push(art[i]);
			}
		}
		res.render("pages/searchResults", { search: artist, artworks });
	}
	else {
		res.status(404).send("User must be logged in!");
	}
})

// Search for artwork categories that are the same
app.get('/category/:cat', async (req, res) => {
	let cat = req.params.cat;
	let artworks = [];
	console.log(cat);

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin) {
		let art = await gallery.find({});
		for (let i = 0; i < art.length; i++) {
			if (art[i].category.toLowerCase() == cat.toLowerCase()) {
				artworks.push(art[i]);
			}
		}
		res.render("pages/searchResults", { search: cat, artworks });
	}
	else {
		res.status(404).send("User must be logged in!");
	}
})

// Navigate the user (if they are an artist) to the page to add an artwork
app.get('/artAdd', async (req, res) => {
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true && currUser.artist == true) {
		res.render("pages/addArtwork");
	}

	else {
		res.status(404).send("Unauthorized Access. You aren't an artist or aren't logged in.");
	}
})

// Log out the user
app.get("/logout", async (req, res) => {
	if (req.session.loggedin) {
		req.session.loggedin = false;
		let currUser = await user.findOne({ username: req.session.username });
		if (currUser != null) {
			currUser.loggedin = false;
		}
		req.session.username = undefined;
		currUser.save();
		res.redirect("/login");
	}

	else {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
});


// Go to the specific artist's page 
app.get("/artist/:artist", async (req, res) => {
	let artistName = req.params.artist;
	artistName = decodeURI(artistName);

	let artistUser = await user.findOne({ username: artistName });
	if (artistUser != null) {
		let artwork = await gallery.find({ artist: artistName });
		if (artwork != null) {
			let workshops = artistUser.workshops;
			res.render("pages/artistProfile", { artistName, artwork, workshops }); // if the artist has any workshops display them
		}
	}
	else {
		let artwork = await gallery.find({ artist: artistName });
		if (artwork != null) {
			res.render("pages/artistProfile", { artistName, artwork, workshops: [] }); // if the artist has no workshops make it default
		}
	}
});

// Get page of liked artworks
app.get('/likedArtworks', async (req, res) => {
	let artworks = {};
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true) { // if user exists and is logged in...
		for (let i = 0; i < currUser.liked.length; i++) {
			let artwork = await gallery.findOne({ name: currUser.liked[i] });
			artworks[artwork.name] = artwork;
		}
	}
	res.render("pages/likedArtworks", { artworks });
});

// Get page of artists the user is following
app.get('/followedArtists', async (req, res) => {
	let artistsFollowed = [];
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true) { // if user exists and is logged in...
		for (let i = 0; i < currUser.following.length; i++) {
			let art = await gallery.findOne({ artist: currUser.following[i] });
			if (art != null) {
				artistsFollowed.push(art);
			}
		}
		res.render("pages/followedArtists", { user: req.session.username, artists: artistsFollowed })
	}

})

// Get page to add a workshop if user is an artist
app.get("/workshop", async (req, res) => {
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true && currUser.artist == true) {
		let userName = currUser.username;
		res.render("pages/addWorkshop", { userName });
	}

	else {
		res.status(404).send("User is not an artist. You must be an artist to access this page.");
	}
})

// Access notification page of any new artworks or workshops from artists the user follows
app.get('/notifications', async (req, res) => {
	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true) {
		let artwork = {};
		let workshop = [];
		for (let i = 0; i < currUser.following.length; i++) {
			let art = await gallery.find({ artist: currUser.following[i] });
			if (art != null) {
				artwork[currUser.following[i]] = art;
			}

			let wshop = await user.findOne({ username: currUser.following[i] });
			if (wshop != null) {
				workshop.push(wshop.workshops);
			}
		}
		res.render("pages/notification", { artists: currUser.following, artwork, workshop });
	}

	else {
		res.status(404).send("Error. You must be logged in to view this page.");
	}
})

// Gets particular artwork page
app.get("/:artName", (req, res) => {
	let artName = req.params.artName;
	artName = decodeURI(artName); // decode it into plain text

	let art;
	gallery.find({}).exec(function (err, results) {
		for (let i = 0; i < results.length; i++) {
			if (results[i].name == artName) {
				art = results[i];
				res.render("pages/artwork", { art });
			}
		}
	});
});

// Get search results for similar mediums
app.get("/mediumResults/:search", async (req, res) => {
	let search = req.params.search;

	let artworks = await gallery.find({ medium: search });
	if (artworks != null) {
		res.render("pages/similarMed", { search, artworks });
	}
})


// Get search results for similar categories
app.get("/catResults/:search", async (req, res) => {
	let search = req.params.search;

	let artworks = await gallery.find({ category: search });
	if (artworks != null) {
		res.render("pages/similarCat", { search, artworks });
	}
})

// Add the user to the database if they register successfully
app.post("/register/:username", async (req, res) => {
	let name = req.params.username;
	let pw = req.body.password;
	let empty = false;

	let currUser = await user.findOne({ username: name, password: pw });

	if (currUser != null) { // if there is already an existing user with the same username (case sensitive)...
		res.status(404).send("Username already exists, try again!");
	}

	else {
		let count = await user.count;
		if (count == 0) {
			empty = true;
		}

		if (empty == false) {
			let flag = false;
			let users = await user.find({});
			for (let i = 0; i < users.length; i++) {
				if (users[i]._id == req.sessionID) {
					flag = true;
					break;
				}
			}

			if (flag == false) { // if the user has no other tab opened on the same browser
				req.session.loggedin = true;
				req.session.username = name;
				console.log("Session ID:", req.sessionID);

				let userData = [{
					_id: req.sessionID,
					username: name,
					password: pw,
					loggedin: true,
					artist: false,
					liked: [],
				}]

				user.insertMany(userData)
				req.session.save();
				console.log("Saved User Data Successfully!");
				res.status(200).send();
			}

			else {
				res.status(400).send("Cannot register/login to another tab on the same browser.");
			}
		}

		else {
			req.session.loggedin = true;
			req.session.username = name;
			console.log("Session ID:", req.sessionID);

			let userData = [{
				_id: req.sessionID,
				username: name,
				password: pw,
				loggedin: true,
				artist: false,
				liked: [],
			}]

			user.insertMany(userData)
			req.session.save();
			console.log("Saved User Data Successfully!");
			res.status(200).send();

		}
	}
});

// Check the credentials of the user when they try to login
app.put("/login/:username", async (req, res) => {
	let name = req.params.username;
	let pw = req.body.password;
	let flag = false;

	if (req.session.loggedin == true) { // if the user is already logged in
		res.status(404).send("User is either already logged in or the user cannot try logging in a different tab on the same browser.");
	}

	// else, check if the user exists with the exact match of the username and password
	let currUser = await user.findOne({ username: name, password: pw });
	if (currUser != null && req.session.loggedin == false) {
		let users = await user.find({});
		if (users != null) {
			for (let i = 0; i < users.length; i++) {
				if (users[i]._id == req.sessionID && req.session.loggedin != false) { // if there is an existing user who's id matches the current session's and is logged in
					flag = true;
					break;
				}

				// if there is a user who's id does not match the current sessions but they have the same username and are logged in
				else if (users[i]._id != req.sessionID && users[i].username == name && users[i].loggedin == true) {
					flag = true;
					break;
				}
			}
		}

		if (flag == false) {
			console.log("Login successful");
			req.session.loggedin = true;
			currUser.loggedin = true;
			req.session.username = name;
			req.session.save();
			currUser.save();
			console.log("Session ID:", req.sessionID);
			res.status(200).send();
		}

		else {
			res.status(404).send("Cannot register/login to another tab on the same browser.");
		}
	}

	else {
		res.status(404).send("User does not exist. Register first before logging in.");
	}
});

// Upgrade user account to be an artist
app.put("/upgrade", (req, res) => {
	user.findOne({ username: req.session.username }).exec(function (err, results) {
		if (results != null && req.session.loggedin == true) {
			// if user is an artist, make them a patron
			if (results.artist) {
				results.artist = false;
				results.save();
				res.status(200).send("You are now a user!");
			}

			// if user is a patron, make them an artist
			else {
				results.artist = true;
				results.save();
				res.status(200).send("You are now an artist!");
			}
		}

		else {
			res.status(404).send("Unauthorized Access. You must be logged in to view this page.");
		}
	})
});

// Modify the amount of likes for the artwork
app.put('/like/:artName', (req, res) => {
	let artName = req.params.artName;
	artName = decodeURI(artName);
	let flag = false;
	let index = 0;

	user.findOne({ username: req.session.username }).exec(function (err, currUser) {
		if (currUser != null && req.session.loggedin == true) { // if user exists...
			gallery.findOne({ name: artName }).exec(function (err, art) { // if the artwork exists...
				if (art.artist != currUser.username) { // if the user liking the artwork is not the artist of that work...
					for (let i = 0; i < currUser.liked.length; i++) {
						if (currUser.liked[i] == artName) { // check if the user has already liked the artwork
							index = i;
							flag = true;
							break;
						}
					}

					// Increment the artwork by 1 if the user hasn't liked it before 
					if (flag == false) {
						art.likes += 1;
						currUser.liked.push(artName);
						art.save();
						currUser.save();
						res.status(200).send();
					}

					// if the user has, decrement by 1 if the number of likes arent already zero
					else {
						if (art.likes == 0) {
							art.likes = 0;
						}
						else {
							art.likes -= 1;
						}
						currUser.liked.splice(index, 1);
						art.save();
						currUser.save();
						res.status(200).send();
					}
				}
				else {
					res.status(404).send("Unauthorized Access. Artists' cannot like their own artwork.");
				}
			})
		}
		else {
			res.status(404).send("Unauthorized Access. You must be logged in to view this page.");
		}
	})
});

// Add new review to an artwork
app.post('/review/:artName', (req, res) => {
	let artName = req.params.artName;
	artName = decodeURI(artName);

	let review = req.body.review;

	user.findOne({ username: req.session.username }).exec(function (err, currUser) {
		if (currUser != null && req.session.loggedin == true && currUser.artist == false) { // if user exists...
			gallery.findOne({ name: artName }).exec(function (err, art) { // if the artwork exists...
				if (art != null && currUser.username != art.artist) { // if the user leaving a review for the artwork is not the artwork's artist
					art.reviews.push(review);
					currUser.reviews.push(review);
					art.save();
					currUser.save();
					res.status(200).send();
				}

				else {
					res.status(404).send("Unauthorized Access. Artists' cannot write a review for their own artwork.");
				}
			});
		}
		else {
			res.status(404).send("Unauthorized Access. You must be logged in to view this page.");
		}
	});
})

// Allow an artist to add workshops
app.post('/workshop/', async (req, res) => {
	let workshopName = req.body.workshop;
	let flag = false;

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true && currUser.artist == true) {
		for (let i = 0; i < currUser.workshops.length; i++) {
			if (currUser.workshops[i] == workshopName) { // if there is a workshop with the same name that already exists, do not add it again
				flag = true;
			}
		}

		// if there is no workshop with the same name, add it
		if (flag == false) {
			currUser.workshops.push(workshopName);
			currUser.save();
			res.status(200).send("Workshop Added!");
		}
	}

	else {
		res.status(404).send("You are etiher not logged in or you aren't an artist ( or both).");
	}
})

// Remove review for a specific artwork
app.put('/reviewR', async (req, res) => {
	let artName = req.body.name;
	let review = req.body.review;

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true && currUser.artist == false) { // if user exists...
		let art = await gallery.findOne({ name: artName });
		if (art != null) { // if the artwork exists...
			let index = art.reviews.indexOf(review);
			if (index != null) {
				art.reviews.splice(index, 1);
				art.save();
				res.status(200).send();
			}
		}

		else {
			res.status(404).send("This review for this artwork does not exist.");
		}
	}
	else {
		res.status(404).send("Unauthorized Access. You must be logged in to view this page.");
	}
});

// Have the user follow an artist they want
app.put('/artistFollow', async (req, res) => {
	let artistName = req.body.artist;
	let index = 0;
	let flag = false;

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && req.session.loggedin == true) { // if user exists...
		let artistPerson = await gallery.findOne({ artist: artistName });
		if (artistPerson != null && currUser.username != artistPerson.artist) { // if the user isnt trying to follow themselves as an artist...
			for (let i = 0; i < currUser.following.length; i++) {
				if (currUser.following[i] == artistName) {
					index = i;
					flag = true;
				}
			}

			//Add to the array of artists the user is following
			if (flag == false) {
				currUser.following.push(artistName);
				currUser.save();
				res.status(200).send("Followed ");
			}

			// Remove from the array of artists the user if following
			else {
				currUser.following.splice(index, 1);
				currUser.save();
				res.status(200).send("Unfollowed ");
			}
		}
	}
	else { res.status(404).send("Unauthorized Access. You must be logged in to view this page."); }
})

// Have the user enroll in a workshop
app.put('/enroll', async (req, res) => {
	let artistName = req.body.artist;
	let workshop = req.body.workshop;

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null & req.session.loggedin == true) {
		let artist = await user.findOne({ username: artistName });
		if (artist != null && artist.artist == true && artist.workshops.length > 0) { // if there are workshops to enroll by the artist
			for (let i = 0; i < artist.workshops.length; i++) {
				if (artist.workshops[i] == workshop) { // find the matching workshop the user wants to enroll in and enroll them in it
					currUser.enrolled.push(workshop);
					currUser.save();
					res.status(200).send('Successfully enrolled in ');
				}
			}
		}
		else {
			res.status(404).send("Either you aren't logged in, or the workshop does not exist for this artist.");
		}
	}

});

// Have the user add an artwork if they're an artist
app.post('/artAdd', async (req, res) => {
	let name = req.body.name;
	let year = req.body.year;
	let cat = req.body.cat;
	let medium = req.body.medium;
	let descript = req.body.description;
	let url = req.body.url;

	let currUser = await user.findOne({ username: req.session.username });
	if (currUser != null && currUser.artist == true && req.session.loggedin == true) {
		let similarArt = await gallery.findOne({ name: name });
		if (similarArt == null) {
			let artData = [{
				name: name,
				artist: req.session.username,
				year: year,
				category: cat,
				medium: medium,
				likes: 0,
				description: descript,
				image: url,
				reviews: []
			}]

			gallery.insertMany(artData);

			//Update gallery.json file with new artwork
			fs.readFile("./gallery/gallery.json", function callback(err, data) {
				if (err) { console.log(err); }

				let jsonObj = JSON.parse(data);
				jsonObj.push({
					"name": name,
					"artist": req.session.username,
					"year": year,
					"category": cat,
					"medium": medium,
					"likes": 0,
					"description": descript,
					"image": url
				})

				fs.writeFile("./gallery/gallery.json", JSON.stringify(jsonObj), err => {
					if (err) { throw err; }
				})
			})

			res.setHeader("Access-Control-Allow-Origin", "*");
			res.status(200).send();
		}

		else {
			res.status(404).send('Cannot add artwork as another name already exists.');
		}
	}

	else {
		res.status(404).send("Artwork could not be added. You are either not logged in or not an artist.");
	}
});

const port = 3000;
app.listen(port);
console.log("Server is listening at http://localhost:3000");
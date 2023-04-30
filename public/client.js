// check the registration info when user tries to log in
function checkRegister(){
    let userName = document.getElementById("userName").value;
    let pw = document.getElementById("password").value;
    let user = {"name": userName, "password": pw};

	if (userName == "" || pw == ""){ // if either fields are empty alert the user
		alert("Fill in all required fields!");
	}

	else{
		let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // when response is received, redirect user to the gallery
			window.location.replace("http://localhost:3000/gallery/" + userName);
		}

		if (this.readyState==4 && this.status==404){ // if username exists, alert the client
			alert(this.responseText);
		}
	}
	
	//Send a POST request to the server containing the user data
	req.open("POST", '/register/' + userName);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(user));
	}
}

// check the login info for the user trying to log in
function checkLogin(){
    let userName = document.getElementById("userName").value;
    let pw = document.getElementById("password").value;
	let user = {"name": userName, "password": pw};

	if (userName == "" || pw == ""){ // if either fields are empty alert the user
		alert("Fill in all required fields!");
	}

	else {
		let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // when response is received, redirect user to the gallery
			window.location.replace("http://localhost:3000/gallery/" + userName);
		}

		if (this.readyState==4 && this.status==404){ // if user is already logged in, alert the client
			alert(this.responseText);
		}
	}
	//Send a POST request to the server containing the user data
	req.open("PUT", '/login/' + userName);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(user));
}
}

// Upgrade the user's account
function upgradeAccount(){
	let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // when response is received alert the user that they have sucessfully upgraded
			alert(this.responseText);
			
		}

		if (this.readyState==4 && this.status==404){ // alert the user if there's a problem
			alert(this.responseText);
		}
	}
	//Send a PUT request to the server containing the user data
	req.open("PUT", '/upgrade');
	req.setRequestHeader("Content-Type", "text/html");
	req.send();
}

// Make request to server when user likes an artwork
function likeArtwork(artName){
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	if(this.readyState==4 && this.status==200){
	     window.location.reload(); // reload the current page to display the change in number of likes
	}

	if (this.readyState==4 && this.status==404){
		alert(this.responseText);
	}
}
	req.open("PUT", '/like/' + artName);
    req.send();
}

// Make request to server when user reviews an artwork
function reviewArtwork(artName){
	let review = {"review": document.getElementById("review").value};

	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // alert the user if the review was added successfully
			alert('Review added!');
		}
		if (this.readyState==4 && this.status==404){ // alert if they can't add a review
			alert(this.responseText);
		}
	}
	req.open("POST", '/review/' + artName);
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(review));
}

// Send a request to allow the user to remove their review
function removeReview(text){
	let text2 = text.split(',');
	let artName = text2[0];
	let review = text2[1];
	let removeRev = {"name" : artName, "review": review};
	document.getElementById("review").value = '';

	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // if they can remove their review, reload the page to display the review gone
			window.location.reload();
		}
		if (this.readyState==4 && this.status==404){ // else alert them if there's a problem
			alert(this.responseText);
		}
	}
	req.open("PUT", '/reviewR');
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(removeRev));
}

// Allow user to follow an artist
function followArtist(artistName){
	console.log("Client:", artistName);
	let artist = {"artist": artistName};
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){ // alert the user they are now following this artist
			alert(this.responseText + "" + artistName);
		}
		if (this.readyState==4 && this.status==404){ // alert the user if they can't follow the artist
			alert(this.responseText);
		}
	}
	req.open("PUT", '/artistFollow');
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(artist));
}

// Allow an a user who's an artist to add a workshop
function addWorkshop(){
	let workshopName = document.getElementById("workshopName").value;

	if (workshopName == ''){
		alert("Please fill out all fields!");
	}

	else{
		let workshopData = {"workshop": workshopName};
		document.getElementById("workshopName").value = '';

		let req = new XMLHttpRequest();
	    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			alert(this.responseText);
		}
		if (this.readyState==4 && this.status==404){
			alert(this.responseText);
		}
	}
	req.open("POST", '/workshop/');
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(workshopData));
	}
}

// Allow user to enroll in a workshop
function enrollWorkshop(text){
	let text2 = text.split(',');
	let artist = text2[0];
	let wshop = text2[1];
	let workshopData = {"artist" : artist, "workshop": wshop};

	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			alert(this.responseText + "" + wshop);
		}
		if (this.readyState==4 && this.status==404){
			alert(this.responseText);
		}
	}
	req.open("PUT", '/enroll');
	req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(workshopData));
}

// Allow user who if they are an artist to add artwork
function addArtwork(){
	let name = document.getElementById("artName").value;
	let year = document.getElementById("artYear").value;
	let cat = document.getElementById("artCategory").value;
	let medium = document.getElementById("artMedium").value;
	let description = document.getElementById("artDescription").value;
	let url = document.getElementById("artImage").value;

	if (name == '' || year == '' || cat == '' || medium == '' || description == '' || url == ''){
		alert("Please enter all fields!");
	}

	else{
		let artData = {"name": name, "year": year, "cat": cat, "medium": medium, "description": description, "url": url};
		// Clear the textfields
		document.getElementById("artName").value = '';
		document.getElementById("artYear").value = '';
		document.getElementById("artCategory").value = '';
		document.getElementById("artMedium").value = '';
		document.getElementById("artDescription").value = '';
		document.getElementById("artImage").value = '';

		let req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				alert("Artwork added successfully!");
			}
			if (this.readyState == 4 && this.status == 404) {
				alert(this.responseText);
			}
		}
		req.open("POST", '/artAdd');
		req.setRequestHeader("Content-Type", "application/json");
		req.send(JSON.stringify(artData));
	}
}

// Allow the user to search artworks with the same name
function searchName(){
	let name = document.getElementById("artworkName").value;
	console.log(name);

	if (name == ''){
		alert("Please enter name field correctly!");
	}

	else{
		document.getElementById("artworkName").value = '';

		let req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				window.location.replace("http://localhost:3000/artName/" + name);
			}
			if (this.readyState == 4 && this.status == 404) {
				alert(this.responseText);
			}
		}
		req.open("GET", '/artName/' + name);
		req.setRequestHeader("Content-Type", "text/html");
		req.send();
	}
}

// Allow users to search for artworks by an artist
function searchArtist(){
	let artist = document.getElementById("artworkArtist").value;
	console.log(artist);

	if (artist == ''){
		alert("Please enter artist field correctly!");
	}

	else{
		document.getElementById("artworkArtist").value = '';

		let req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				window.location.replace("http://localhost:3000/artistSearch/" + artist);

			}
			if (this.readyState == 4 && this.status == 404) {
				alert(this.responseText);
			}
		}
		req.open("GET", '/artistSearch/' + artist);
		req.setRequestHeader("Content-Type", "text/html");
		req.send();
	}
}

// Allow user to search for artworks with the same category
function searchCat(){
	let cat = document.getElementById("artworkCat").value;
	console.log(cat);

	if (cat == ''){
		alert("Please enter category field correctly!");
	}

	else{
		document.getElementById("artworkCat").value = '';

		let req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				window.location.replace("http://localhost:3000/category/" + cat);
			}
			if (this.readyState == 4 && this.status == 404) {
				alert(this.responseText);
			}
		}
		req.open("GET", '/category/' + cat);
		req.setRequestHeader("Content-Type", "text/html");
		req.send();
	}
}
// NodeRESTHost.js
// A simple REST host in Node.js with using Express.js framework.
//
// All data stored in memory, requests are handled in particular routes.
// 
// Created in 2014 by Radek Tomasek / SeaCat Ltd. 

// Include external modules - Express.js and BodyParser.
var express = require('express');
var bodyParser = require('body-parser');

// Initialize app by using Express framework.
var app = express();

// Use Body Parser (Helps to process incoming requests).
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Set default port 1337 or custom if defined by user externally.
app.set('port', process.env.PORT || 1337);

// Initialization of movies array.
var movies = [
  {
    id: 1,
    name: "Forrest Gump",
    director: "Robert Zemeckis",
    release: 1994
  },
  { 
    id: 2,
    name: "Donnie Darko",
    director: "Richard Kelly",
    release: 2001
  },
  {
    id: 3,
    name: "Inception",
    director: "Christopher Nolan",
    release: 2010
  }
]; 

// A simulation of creating new IDs. Basically get the last element and increase the value of an ID. 
function getNewId(){
  return movies[movies.length -1].id + 1;
}

// Function findIndexOfElement helps to identify the array index according to specified key/value pair. 
function findIndexOfElement(inputArray, key, value){
  for (var i = 0; i < inputArray.length; i++){
    if (inputArray[i][key] === value){
      return i;
    }
  }
  return -1;
}

// GET - list of all records.
app.get('/api/movies', function(request, response){
  response.json(movies.map(function(movie){
    return {
      id: movie.id,
      name: movie.name,
      director: movie.director,
      release: movie.release
    }
  }));
});

// GET - list of a record with particular id. If not found, forward the request to 404 - not found. 
app.get('/api/movies/:id', function(request, response, next){  
  // Get an integer interpretation of URL parameter. 
  var urlIntParam = parseInt(request.params.id);
  // Check whether the element is a valid positive number. If not (following case, redirect the request to 404).
  if (urlIntParam < 0 || isNaN(urlIntParam)){
    // Use following middleware - matched 404.
    next();
  }
  else {
    // Find array index in our movie array based on the input parameter (converted to integer). 
    var elementIndex = findIndexOfElement(movies, 'id', urlIntParam);
    // If element exists, get the response, otherwise redirect to 404.
    if (elementIndex >= 0){
      // Get an object from movie array.
      var selectedMovie = movies[elementIndex];
      // Return JSON response with selected attributes.
      response.json({
        id: selectedMovie.id,
        name: selectedMovie.name,
        director: selectedMovie.director,
        release: selectedMovie.release
      });
    }
    else
    {
      // redirection to 404.
      next();      
    }
  }
});

// POST - create a new element.
app.post('/api/movies', function(request, response){
  // Complete request body.
  var requestBody = request.body;
  
  movies.push({
    id: getNewId(),
    name: requestBody.name,
    director: requestBody.director,
    release: requestBody.release
  });
  
  response.status(200).end();
});

// PUT - update existing element.
app.put('/api/movies/:id', function(request, response, next){
  // Get an integer interpretation of URL parameter. 
  var urlIntParam = parseInt(request.params.id);
  // Check whether the element is a valid positive number. If not (following case, redirect the request to 404).
  if (urlIntParam < 0 || isNaN(urlIntParam)){
    // Use following middleware - matched 404.
    next();
  }
  else {
    // Find array index in our movie array based on the input parameter (converted to integer).
    var elementIndex = findIndexOfElement(movies, 'id', urlIntParam);
    // If element exists, get the response, otherwise redirect to 404.
    if (elementIndex >= 0){
      // Update element accordingly.
      movies[elementIndex] = {
        id: urlIntParam,
        name: request.body.name,
        director: request.body.director,
        release: request.body.release
      };
      // Element successfuly updated.
      response.status(200).end();
    }
    else {
      // redirection to 404.
      next();
    }
  }
});

// DELETE - remove particular record from array.
app.delete('/api/movies/:id', function(request, response, next){
  // Get an integer interpretation of URL parameter. 
  var urlIntParam = parseInt(request.params.id);
  // Check whether the element exists or not (or it is not a number). If not (following case, redirect the request to 404).
  if (urlIntParam < 0 || isNaN(urlIntParam)){
    // Use following middleware - matched 404.
    next();
  }
  else {
    // Find array index in our movie array based on the input parameter (converted to integer).
    var elementIndex = findIndexOfElement(movies, 'id', urlIntParam);
    // If element exists, get the response, otherwise redirect to 404.
    if (elementIndex >= 0){
      // Delete element according to index parameter.
      movies.splice(elementIndex, 1);
      // Element successfuly deleted.
      response.status(200).end();
    }
    else {
      // redirection to 404.
      next();
    }
  }
}); 

// Use Express midleware to handle 404 and 500 error states.
app.use(function(request, response){
   // Set status 404 if none of above routes processed incoming request. 
   response.status(404); 
   // Generate the output.
   response.send('404 - not found');
});

// 500 error handling. This will be handled in case of any internal issue on the host side.
app.use(function(err, request, response){
  // Set response type to application/json.
  response.type('application/json');
  // Set response status to 500 (error code for internal server error).
  response.status(500);
  // Generate the output - an Internal server error message. 
  response.send('500 - internal server error');
});

// Start listening on defined port, this keep running the application until hit Ctrl + C key combination.  
app.listen(app.get('port'), function(){
  console.log("Host is running and listening on http://localhost:" + app.get('port') + '; press Ctrl-C to terminate.');  
});
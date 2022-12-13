const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");
const validate = require("./validators");
const { hashPassword } = require("./auth.js");

require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json()); 
const port = process.env.APP_PORT ?? 5002;
 
const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

 
app.get("/api/movies", movieHandlers.getMovies); 
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

app.post("/api/movies", validate.validateMovie, movieHandlers.postMovie);
app.post("/api/users",validate.validateUser , hashPassword, userHandlers.postUser);

app.put("/api/movies/:id", validate.validateUpdateMovie, movieHandlers.updateMovie);
app.put("/api/users/:id", validate.validateUser, userHandlers.updateUser);

app.delete("/api/movies/:id", movieHandlers.deleteMovie);
app.delete("/api/users/:id", userHandlers.deleteUser);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on port : ${port}`);
  }
});

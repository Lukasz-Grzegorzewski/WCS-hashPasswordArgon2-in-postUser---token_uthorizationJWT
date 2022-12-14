require("dotenv").config();
const express = require("express");
const cors = require('cors');

const movieHandlers = require("./movieHandlers");
const userHandlers = require("./userHandlers");
const validate = require("./validators");
const { hashPassword, verifyPassword, verifyToken, verifyPayloadId } = require("./auth.js");

const app = express();
app.use(express.json());
// app.use(cors);
const port = process.env.APP_PORT ?? 5002;



// the public routes
app.get("/", (req, res) => res.send("Welcome to my favourite movie list"));
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);

app.post("/api/users", hashPassword, validate.validateUser, userHandlers.postUser);
app.post("/api/login", userHandlers.getUserByEmailWithPasswordAndPassToNext, verifyPassword)

// the private routes
app.use(verifyToken);

app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

app.post("/api/movies", validate.validateMovie, movieHandlers.postMovie);

app.put("/api/movies/:id", validate.validateUpdateMovie, movieHandlers.updateMovie);

app.delete("/api/movies/:id", movieHandlers.deleteMovie);

//verify if :id corespond the one of payload's token's
app.use("/api/users/:id", verifyPayloadId)

app.delete("/api/users/:id", userHandlers.deleteUser);
app.put("/api/users/:id", validate.validateUser, userHandlers.updateUser);



app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on port : ${port}`);
  }
});

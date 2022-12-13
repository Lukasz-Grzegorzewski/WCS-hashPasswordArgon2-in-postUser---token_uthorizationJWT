const { query } = require("./database");
const database = require("./database");

const getMovies = (req, res) => {
  let initialSql = "SELECT * FROM movies";
  const sqlValues = [];
  const where = [];

  if (req.query.color != null) {
    where.push({
      column: "color",
      value: req.query.color,
      operator: "=",
    });
  }
  if (req.query.max_duration != null) {
    where.push({
      column: "duration",
      value: req.query.max_duration,
      operator: "<=",
    });
  }

  // let sql = "SELECT * FROM movies";
  // const sqlValues = [];
  // if (req.query != null){
  //   console.log("Req.query : ", req.query);

  //   sql += " WHERE"
  //   if (req.query.color != null){
  //     sql += " color = ?";
  //     sqlValues.push(req.query.color);
  //   }
  //   if (req.query.max_duration != null){
  //     sql += " and duration <= ?";
  //     sqlValues.push(req.query.max_duration);
  //   }
  // }

  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? "where" : "and"} ${column} ${operator} ?`,
        initialSql
      ),
      where.map(({ value }) => value)
    )
    .then(([movies]) => {
      res.status(200).json(movies)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const getMovieById = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("SELECT * FROM movies WHERE id = ?", [id])
    .then(([movies]) => {
      movies[0] != null ?
        res.json(movies[0]) :
        res.status(404).send("Not found");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    })
};

const postMovie = (req, res) => {
  const { title, director, year, color, duration } = req.body;

  database
    .query(
      "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?) ",
      [title, director, year, color, duration]
    )
    .then(([result]) => {
      res.location(`/api/movies/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error posting the movie");
    });
}

const updateMovie = (req, res) => {
  const id = parseInt(req.params.id);
  const { title, director, year, color, duration } = req.body;


  database
    .query("update movies set title = ?, director = ?, year = ?, color = ?, duration = ? where id = ?"
      , [title, director, year, color, duration, id])
    .then(([result]) => {
      result.affectedRows === 0 ?
        res.status(404).send("Not Found") :
        res.sendStatus(204);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error editing the movie");
    })

}

const deleteMovie = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("DELETE FROM movies WHERE id = ?"
      , [id])
    .then(([result]) => {
      result.affectedRows === 0 ?
        res.status(404).send("Not Found") :
        res.sendStatus(204);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting the movie");
    })

}

module.exports = {
  getMovies,
  getMovieById,
  postMovie,
  updateMovie,
  deleteMovie,
};

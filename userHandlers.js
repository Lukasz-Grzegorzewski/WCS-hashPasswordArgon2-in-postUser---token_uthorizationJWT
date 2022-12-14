const { query } = require("./database");
const database = require("./database");

const getUsers = (req, res) => {
  const initialSql = "SELECT id, firstname, lastname, city, language FROM users";
  const where = [];

  if (req.query.language != null) {
    where.push({
      column: "language",
      value: req.query.language,
      operator: "=",
    });
  }
  if (req.query.city != null) {
    where.push({
      column: "city",
      value: req.query.city,
      operator: "=",
    });
  }

  // let sql = "SELECT * FROM users";
  // const sqlValues = [];

  // if (req.query != null){
  //   console.log("Req.query : ", req.query);

  //   sql += " WHERE"
  //   if (req.query.language != null){
  //     sql += " language = ?";
  //     sqlValues.push(req.query.language);
  //   }
  //   if (req.query.city != null){
  //     sql += " and city <= ?";
  //     sqlValues.push(req.query.city);
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
    .then(([users]) => res.status(200).json(users))
    .catch((err) => console.error(err)
    )
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const image404 = "https://img.freepik.com/premium-vector/error-404-illustration_585024-2.jpg?w=740";

  database
  // id, firstname, lastname, city, language
    .query("SELECT * FROM users WHERE id = ?", [id])
    .then(([user]) => {
      if (user[0] != null) {
        res.status(200).json(user[0]);
      } else {
        res.write("<div><h1 style='text-align:center;'>Not Found</h1><a href='/api/users'><button style='position: absolute; left: calc(50% - 50px); height: 30px; width: 100px; border:none; box-shadow: 3px 3px 5px rgba(0, 0, 0, .5);'> <<< USERS</button></a></div>");
        res.write("<img src=" + image404 + " style='width: 100vw;'></img>");
        res.status(404).send();
      }
    })
    .catch((err) => console.error(err))
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;  

  database
    .query("SELECT * FROM users WHERE email = ?", [email])
    .then(([users]) => {
      if (users.length > 0) {

        // console.log("before res.user", req.user);
        req.user = users[0];
        // console.log("after res.user", req.user);
        next();
      
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => console.error(err))
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, hashedPassword } = req.body;

  database
    .query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?) ",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving the user");
    });
}

const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { firstname, lastname, email, city, language } = req.body;


  database
    .query("update users set firstname = ?, lastname = ?, email = ?, city = ?, language = ? where id = ?"
      , [firstname, lastname, email, city, language, id])
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

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);

  database
    .query("DELETE FROM users WHERE id = ?"
      , [id])
    .then(([result]) => {
      result.affectedRows === 0 ?
        res.status(404).send("Not Found") :
        res.sendStatus(204);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error deleting user");
    })

}

module.exports = {
  getUsers,
  getUserById,
  postUser,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext
};

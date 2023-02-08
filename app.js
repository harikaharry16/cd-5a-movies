const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initialDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initialDBAndServer();

//API 1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie
;`;

  const moviesArray = await db.all(getAllMoviesQuery);

  const convertObj = (each) => {
    return {
      movieName: each.movie_name,
    };
  };

  response.send(moviesArray.map((each) => convertObj(each)));
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const createQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}');`;

  await db.run(createQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movieDetails = await db.get(getMovieQuery);
  //console.log(movieDetails);
  response.send({
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  });
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const putQuery = `UPDATE movie SET director_id = ${directorId},
                                           movie_name = '${movieName}',
                                           lead_actor = '${leadActor}'
                        WHERE movie_id = ${movieId};`;

  await db.run(putQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;

  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director ;`;

  const getQueryObj = await db.all(getDirectorQuery);

  const convertObj = (each) => {
    return {
      directorId: each.director_id,
      directorName: each.director_name,
    };
  };

  response.send(getQueryObj.map((each) => convertObj(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieDirectorQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;

  const movieNamesObj = await db.all(getMovieDirectorQuery);

  const convertObj = (each) => {
    return {
      movieName: each.movie_name,
    };
  };

  response.send(movieNamesObj.map((each) => convertObj(each)));
});

module.exports = app;

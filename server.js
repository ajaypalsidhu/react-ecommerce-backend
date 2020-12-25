const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
// to get access to node file system
const { readdirSync } = require("fs");
require("dotenv").config();

//app
const app = express();
// express() executes the express server and makes it available to the
// app variable.

//db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected from server.js"))
  .catch((err) => console.log(`DB connection error from server.js : ${err}`));
// fetch the DB from .env file and connect it to mongoose

//import routes from routes/auth.js or other files and the apply them as
// middleware
// const authRoutes = require('./routes/auth');    //---------->>>>>>>> 31

//middlewares - talk to the DB and make data available to the controller
// we use the use() method to apply middleares to the express app.
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());

// routes middleware
// app.use('/api', authRoutes);
// instead of individually requiring each route, we can use the node file system (fs)
// to fetch all of them and then map over each of them
readdirSync("./routes").map((route) =>
  app.use("/api", require("./routes/" + route))
);

// PORT - the port that we ant to use - fetched from .env file.
// if for some reason the value is not fetched from the .env file, we give
// a default alue
const port = process.env.PORT || 8000;

app.listen(port, () =>
  console.log(`The server is running on port ${port} - from server.js`)
);

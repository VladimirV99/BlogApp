import express from "express";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";

import * as config from "./config/credentials";
import passportStrategy from "./config/passport";
import users from "./routes/users";
import posts from "./routes/posts";
import comments from "./routes/comments";

mongoose
  .connect(config.database, {
    authSource: "admin",
  })
  .then(() => {
    console.log("Connected to database " + config.database);
  })
  .catch((err) => {
    console.log("Database error " + err);
  });

const app = express();

const port = process.env.PORT || 3000;

/* CORS */
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
  });
}

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.json());

app.use(passport.initialize());
passportStrategy(passport);

app.use("/users", users);
app.use("/posts", posts);
app.use("/comments", comments);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Invalid Endpoint");
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});

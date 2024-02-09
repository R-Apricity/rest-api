import bodyParser from "body-parser";
import dotenv from "dotenv";


import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
//Routes
import { default as apiroutes } from "./lib/routes.js";

///Init
dotenv.config();
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Rest-Api",
      version: "docs-beta-v1.0.0",
    },
  },
  apis: ["./lib/routes.js"], // Path to your route files
};

const app = express();

app
  .listen(process.env.SERVER_PORT || process.env.PORT || 3000, () => {
    console.log(
      `Example app listening on port ${
        process.env.SERVER_PORT || process.env.PORT || 3000
      }`
    );
  })
  .setTimeout(300000);
app.use(bodyParser.json());
app.use("/api", apiroutes);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(options)));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ error: "Invalid JSON format" });
  }
  next();
});

app.all("/", (req, res) => {
  res.send(
    `hello there, This is the available Routes, docs <a href="/docs">is located here</a> <br/>`
  );
});

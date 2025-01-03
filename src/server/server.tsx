import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import path from "path";
import { StaticRouter } from "react-router-dom";
import App from "../client/App";
import webpack from "webpack";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
const webpackConfig = require("../../webpack.config");

const app = express();
const compiler = webpack(webpackConfig[0]);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig[0].output.publicPath,
  })
);

app.use(webpackHotMiddleware(compiler));

app.use(express.static(path.resolve(__dirname, "../dist")));

app.get("*", (req, res) => {
  const content = ReactDOMServer.renderToString(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  );
  const indexFile = path.resolve(__dirname, "../dist/index.html");

  fs.readFile(indexFile, "utf8", (error, data) => {
    if (error) {
      console.error("Could not read index.html", error);
      res.status(500);
      res.send("Internal Server Error");
      return;
    }

    const result = data.replace(
      '<div id="root"></div>',
      `<div id="root">${content}</div>`
    );
    res.send(result);
  });
});

app.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});

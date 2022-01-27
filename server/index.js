const express = require("express");
const cors = require("cors");

//cors setup
const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

const { Box, createBox } = require("../models");
const DatabaseAccess = require("../database").DatabaseAccess;

/**
 * RESPONSE CODES
 * 550 - Error creating box
 * 590 - Error accessing database
 */
const FileBoxesApi = class FileBoxesApi {
    /**
     * Initialise the backend api
     *
     * @param      {Object}  eConfig  Configuration for express
     * @param      {Object}  dbConfig  Configuration for the MongoDB
     */
    constructor(
        eConfig,
        dbConfig
    ) {
        this.app = express();
        this.app.use(cors(corsOptions));
        this.dbAccess = new DatabaseAccess(dbConfig);
        this.PORT = eConfig.PORT;


        this.setupRoutes();
    }

    /**
     * Api gateway to add box to database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    add(req, res) {
        var box = createBox(req.query);
        if (box != null) {
            this.dbAccess.addBox(box);
            res.sendStatus(200);
        } else res.sendStatus(550);
    }

    all(req, res) {
        res.json({
            boxes : this.dbAccess.getAllBoxes()
        });
    }

    /**
     * Setup express routes
     */
    setupRoutes() {       
        this.app.get("/api", (req, res) => {
            //TODO(Callum): Display api routes
            res.json({ message: "Api routes: "});
        });
        this.app.get("/api/add", (req, res) => this.add(req, res));
        this.app.get("/api/all", (req, res) => this.all(req, res));
    }

    /**
     * Start the express listener
     */
    start() {
        this.app.listen(this.PORT, () => {
            console.log(`Server listening on ${this.PORT}`);
        });        
    }
}

module.exports = {
    FileBoxesApi,
};
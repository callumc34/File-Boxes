const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");

//cors setup
const whitelist = ["http://localhost:3000"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

//Local requires
const { Box, createBox } = require("../models");
const DatabaseAccess = require("../database").DatabaseAccess;

/**
 * Calculate the hash of a file
 * @param {Buffer} ByteBuffer     Bytes to hash
 * @return {String} SHA256 hash of the file
 */
const calcHash = (stream) => {
    const hashSum = crypto.createHash("sha256");
    hashSum.update(stream);

    return hashSum.digest("hex");
};

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
    constructor(eConfig, dbConfig) {
        this.app = express();
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(fileUpload());

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

    /**
     * Get all boxes
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    all(req, res) {
        this.dbAccess.getAllBoxes(res);
    }

    /**
     * Saves a file.
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    saveFile(req, res) {
        let uploadFile = req.files.file;

        const hash = calcHash(uploadFile.data);

        //TODO(Callum) : Checks for duplicates
        fs.mkdir(`${__dirname}/storage`);

        uploadFile.mv(`${__dirname}/storage/${hash}`, (err) => {
            if (err) return res.sendStatus(500);
            else {
                this.dbAccess.addBox(
                    new Box(req.body.name, req.body.description, hash)
                );
                res.sendStatus(200);
            }
        });
    }

    /**
     * Download the desired hash file
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    download(req, res) {
        const hash = req.query.fileHash;
        if (hash == undefined) return res.sendStatus(550);
        // fs.readFile(`${__dirname}/storage/${hash}`, (err, data) => {
        //     if (err) {
        //         return res.sendStatus(404);
        //     }
        //     res.writeHead(200);
        //     res.download(data);
        // });
        this.dbAccess.getBoxFromHash(hash).toArray((err, result) => {
            res.download(
                `${__dirname}/storage/${hash}`,
                `${result[0].name}.csv`
            );
        });
    }

    /**
     * Setup express routes
     */
    setupRoutes() {
        //Get api
        this.app.get("/api", (req, res) => {
            //TODO(Callum): Display api routes
            res.json({ message: "Api routes: " });
        });
        this.app.get("/api/add", (req, res) => this.add(req, res));
        this.app.get("/api/all", (req, res) => this.all(req, res));
        this.app.get("/api/download", (req, res) => this.download(req, res));

        //Post api
        this.app.post("/api/upload", (req, res) => this.saveFile(req, res));
    }

    /**
     * Start the express listener
     */
    start() {
        this.app.listen(this.PORT, () => {
            console.log(`Server listening on ${this.PORT}`);
        });
    }
};

module.exports = {
    FileBoxesApi,
};

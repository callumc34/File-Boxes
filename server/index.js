const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");

//cors setup
const whitelist = ["http://localhost:3000", "http://localhost:5000/"];
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
     * Edits a box based on its file hash
     *
     * @param      {Request}  req     The request
     * @param      {Response}}  res     The response
     */
    edit(req, res) {
        this.dbAccess.editBox(req.query).then(() => res.sendStatus(200));
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
            this.dbAccess.addBox(box).then(() => res.sendStatus(200));
        } else res.sendStatus(550);
    }

    /**
     * Api gateway to delete box from database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    delete(req, res) {
        const hash = req.query.fileHash;
        if (hash == undefined) return res.sendStatus(550);

        const filePath = `${__dirname}/storage/${hash}`;
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            this.dbAccess.removeBox(hash).then(() => res.sendStatus(200));
        }
    }

    /**
     * Deletes a box based on the name
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    deleteName(req, res) {
        this.dbAccess.removeNamedBox(req.query.name).then(() => {
            res.sendStatus(200);
        });
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
     * Download the desired hash file
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    download(req, res) {
        const hash = req.query.fileHash;
        if (hash == undefined || hash == "null") return res.sendStatus(550);

        this.dbAccess.getBoxFromHash(hash).then((result) => {
            const filePath = `${__dirname}/storage/${hash}`;
            res.download(filePath, `${result[0].name}.csv`);
        });
    }

    /**
     * Api gateway to upload an empty box to database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    emptyBox(req, res) {
        this.dbAccess
            .addBox(new Box(req.query.name, req.query.description, null))
            .then(() => {
                res.sendStatus(200);
            });
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
        fs.mkdir(`${__dirname}/storage`, () => {});

        uploadFile.mv(`${__dirname}/storage/${hash}`, (err) => {
            if (err) return res.sendStatus(500);
            else {
                this.dbAccess
                    .addBox(new Box(req.body.name, req.body.description, hash))
                    .then(() => res.sendStatus(200));
            }
        });
    }

    uploadFromEmpty(req, res) {
        this.dbAccess
            .removeNamedBox(req.body.name)
            .then(() => this.saveFile(req, res));
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
        this.app.get("/api/edit", (req, res) => this.edit(req, res));
        this.app.get("/api/delete", (req, res) => this.delete(req, res));
        this.app.get("/api/deletename", (req, res) =>
            this.deleteName(req, res)
        );
        this.app.get("/api/all", (req, res) => this.all(req, res));
        this.app.get("/api/download", (req, res) => this.download(req, res));
        this.app.get("/api/emptybox", (req, res) => this.emptyBox(req, res));
        //Post api
        this.app.post("/api/upload", (req, res) => this.saveFile(req, res));
        this.app.post("/api/uploadfromempty", (req, res) =>
            this.uploadFromEmpty(req, res)
        );
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

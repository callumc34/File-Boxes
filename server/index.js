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
 * 490 - Wrong login info
 * 491 - Failed token
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
            res.download(filePath, `${result.name}.csv`);
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
     * Get username from token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    usernameFromToken(req, res) {
        if (req.query.token == null) return res.sendStatus(400);
        this.dbAccess.getInfoFromToken(req.query.token).then((result) => {
            if (result.error) return res.sendStatus(491);
            return res.type("json").send(JSON.stringify(result));
        });
    }

    fileContents(req, res) {
        const { fileHash } = req.query;
        if (fileHash == null) return res.sendStatus(400);
        this.dbAccess.getBoxFromHash(fileHash).then((result) => {
            if (!result) return res.sendStatus(404);

            const filePath = `${__dirname}/storage/${fileHash}`;
            if (fs.existsSync(filePath)) {
                fs.readFile(filePath, "utf-8", (err, data) => {
                    return res.type("json").send(data);
                });
            } else return res.sendStatus(404);
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
        const { name, description } = req.body;

        const hash = calcHash(uploadFile.data);

        //TODO(Callum) : Checks for duplicates
        fs.mkdir(`${__dirname}/storage`, () => {});

        uploadFile.mv(`${__dirname}/storage/${hash}`, (err) => {
            if (err) return res.sendStatus(500);
            else {
                this.dbAccess
                    .addBox(new Box(name, description, hash))
                    .then(() => res.sendStatus(200));
            }
        });
    }

    /**
     * Uploads an empty box
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    uploadFromEmpty(req, res) {
        this.dbAccess.removeNamedBox(req.body.name).then(() => {
            this.saveFile(req, res);
        });
    }

    //Login/Signup

    /**
     * Signs a user up
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The resource
     */
    signUp(req, res) {
        const { username, password } = req.body;
        if (username == null || password == null) return res.sendStatus(400);
        this.dbAccess.signUp({ username, password }).then((result) => {
            if (result.error) return res.sendStatus(400);

            return res.sendStatus(200);
        });
    }

    /**
     * Login a user and return the token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    login(req, res) {
        const { username, password } = req.body;
        if (username == null || password == null) return res.status(400);

        this.dbAccess.signIn(username, password).then((result) => {
            if (result.error)
                return res
                    .status(490)
                    .type("json")
                    .send(JSON.stringify(result));

            //Login success - return token
            this.dbAccess.createTokenDefault(username).then((result) => {
                if (!result.token) return res.status(491);
                return res.type("json").send(JSON.stringify(result));
            });
        });
    }

    /**
     * Validate a token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The resource
     */
    validateToken(req, res) {
        const { username, token } = req.body;
        if (username == null || token == null) return res.sendStatus(400);

        this.dbAccess.validateToken(username, token).then((result) => {
            if (result.valid) return res.sendStatus(200);
            else return res.sendStatus(491);
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
        this.app.get("/api/edit", (req, res) => this.edit(req, res));
        this.app.get("/api/delete", (req, res) => this.delete(req, res));
        this.app.get("/api/deletename", (req, res) =>
            this.deleteName(req, res)
        );
        this.app.get("/api/all", (req, res) => this.all(req, res));
        this.app.get("/api/download", (req, res) => this.download(req, res));
        this.app.get("/api/emptybox", (req, res) => this.emptyBox(req, res));
        this.app.get("/api/user", (req, res) =>
            this.usernameFromToken(req, res)
        );
        this.app.get("/api/file", (req, res) => this.fileContents(req, res));
        //Post api
        this.app.post("/api/upload", (req, res) => this.saveFile(req, res));
        this.app.post("/api/uploadfromempty", (req, res) =>
            this.uploadFromEmpty(req, res)
        );

        //Login/Signup
        this.app.post("/api/signup", (req, res) => this.signUp(req, res));
        this.app.post("/api/login", (req, res) => this.login(req, res));
        this.app.get("/api/validate", (req, res) =>
            this.validateToken(req, res)
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

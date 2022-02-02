const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { queryParser } = require("express-query-parser");
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
const { Box } = require("../models");
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
        this.app.use(
            queryParser({
                parseNull: true,
                parseUndefined: true,
                parseBoolean: true,
                parseNumber: true,
            })
        );
        this.app.use(cookieParser());
        this.app.use(fileUpload());

        this.dbAccess = new DatabaseAccess(dbConfig);
        this.PORT = eConfig.PORT;

        this.setupRoutes();
    }

    /**
     * Validate an attempted box query
     *
     * @param      {string}  name     The name
     * @param      {description}  description     The description
     * @param      {Boolean}  public     The public state of the box
     * @param      {string}  username     The username
     * @param      {string}  token     The token
     * @returns    {Boolean} true if valid, false otherwise
     */
    static _requestValidate(name, description, isPublic, username, token) {
        //Validation checks
        if (!name || !description) return false;
        if (!username && isPublic != true) return false;
        if (username && !token) return false;
        return true;
    }

    /**
     * Check whether mongo db successfuly performed an operation and return a response to the user
     *
     * @param      {Result}  result    The result
     * @param      {Response}  response  The response
     */
    static _acknowledgeDatabase(result, response) {
        if (result.acknowledged) return response.sendStatus(200);
        return response.sendStatus(590);
    }

    /**
     * Determines if box is shared.
     *
     * @param      {string}   boxId   The box identifier
     * @param      {string}   token   The token
     * @return     {Promise}  { valid, username }
     */
    async _isShared(boxId, token) {
        let tokenInfo = await this.dbAccess.getInfoFromToken(token);
        if (tokenInfo.expired) return { valid: false };

        let username = tokenInfo.username;
        let result = await this.dbAccess.findSharedBox(username, boxId);

        if (result) return { valid: true, username };
        else return { valid: false, username };
    }

    /**
     * Validate a box ID and username
     *
     * @param      {string}    boxId  The box id
     * @param      {string}    token     The token
     * @param      {Function}  callback  The callback
     * @return     {Promise}    { valid, username }
     */
    async _validateToken(boxId, token) {
        let isShared = await this._isShared(boxId, token);

        if (isShared.valid) return { valid: true, username: isShared.username };
        if (!boxId) return { valid: false };

        let boxInfo = await this.dbAccess.getBoxFromId(boxId);
        let username = boxInfo.username;

        if (!username) return { valid: true, username }; //Publicly owned box anyone can modify it
        if (!token) return { valid: false };

        let result = await this.dbAccess.validateToken(username, token);

        return { valid: result.valid, username };
    }

    /**
     * Api gateway to add box to database
     * keys:
     *     name,
     *     description,
     *     fileHash,
     *     public,
     *     username,
     *     token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    add(req, res) {
        var { name, description, token } = req.query;
        var isPublic = req.query.public; //Special case

        this.dbAccess.getInfoFromToken(token).then((result) => {
            if (
                !FileBoxesApi._requestValidate(
                    name,
                    description,
                    isPublic,
                    result.username,
                    token
                )
            )
                return res.sendStatus(400);

            if (!result.expired) {
                this._addInternal(
                    undefined,
                    name,
                    description,
                    null,
                    isPublic,
                    result.username,
                    res
                );
            } else return res.sendStatus(401);
        });
    }

    /**
     * Adds a box to the database - unexposed
     *
     * @param      {string}  name     The name
     * @param      {description}  name     The description
     * @param      {string}  fileHash     The file hash
     * @param      {Boolean}  public     The public state of the box
     * @param      {string}  username     The username
     * @param      {ObjectId}  id     The box id
     * @param      {Response}  res     The response
     */
    _addInternal(id, name, description, fileHash, isPublic, username, res) {
        let box = new Box(name, description, fileHash, isPublic, username, id);
        this.dbAccess.addBox(box).then((result) => {
            if (result.acknowledged) {
                return res.json({ _id: result.insertedId });
            } else return res.sendStatus(590);
        });
    }

    /**
     * Edits a box based on its file hash
     *
     * keys:
     *     _id,
     *     name, - optional
     *     description, - optional
     *     fileHash, - optional
     *     public, - optional
     *     username - optional
     *     token - optional
     *
     * @param      {Request}  req     The request
     * @param      {Response}}  res     The response
     */
    edit(req, res) {
        var { _id, name, description, fileHash, token } = req.query;
        var isPublic = req.query.public;

        this._validateToken(_id, token).then((result) => {
            if (
                !FileBoxesApi._requestValidate(
                    name,
                    description,
                    isPublic,
                    result.username,
                    token
                )
            )
                return res.sendStatus(400);

            if (result.valid) {
                let box = new Box(
                    name,
                    description,
                    fileHash,
                    isPublic,
                    result.username,
                    _id
                );
                this.dbAccess
                    .editBox(box)
                    .then((done) =>
                        FileBoxesApi._acknowledgeDatabase(done, res)
                    );
            } else return res.sendStatus(401);
        });
    }

    /**
     * Share a box with a user
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    shareBox(req, res) {
        var { _id, token, username } = req.query;

        //Must have a box id and token
        if (!_id || !token) return res.sendStatus(400);
        this._validateToken(_id, token).then((result) => {
            if (result.valid) {
                this.dbAccess
                    .addSharedBoxUser(_id, username)
                    .then((done) =>
                        FileBoxesApi._acknowledgeDatabase(done, res)
                    );
            }
        });
    }

    /**
     * Get the contents of a file
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The resource
     */
    fileContents(req, res) {
        var { _id, token } = req.query;

        this._validateToken(_id, token).then((result) => {
            if (result.valid) {
                this.dbAccess.getBoxFromId(_id).then((box) => {
                    const filePath = `${__dirname}/storage/${box.fileHash}`;
                    if (fs.existsSync(filePath)) {
                        fs.readFile(filePath, "utf-8", (err, data) => {
                            return res.json(data);
                        });
                    } else return res.sendStatus(404);
                });
            } else return res.sendStatus(401);
        });
    }

    /**
     * Api gateway to delete box from database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    delete(req, res) {
        var { _id, token } = req.query;

        this._validateToken(_id, token).then((result) => {
            if (result.valid)
                this.dbAccess
                    .removeBox(_id)
                    .then((done) =>
                        FileBoxesApi._acknowledgeDatabase(done, res)
                    );
            else return res.sendStatus(401);
        });
    }

    /**
     * Get all public boxes
     *
     * @param      {<type>}  req     The request
     * @param      {<type>}  res     The resource
     */
    publicBoxes(req, res) {
        this.dbAccess.findBoxes({ public: true }).then((result) => {
            res.json({ boxes: result });
        });
    }

    /**
     * Gets the users boxes
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    userBoxes(req, res) {
        var { token } = req.query;

        this.dbAccess.getInfoFromToken(token).then((result) => {
            if (!result.expired) {
                this.dbAccess
                    .findBoxes({ username: result.username })
                    .then((done) => {
                        res.json({ boxes: done });
                    });
            } else return res.sendStatus(401);
        });
    }

    /**
     * Gets a users inbox
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    inbox(req, res) {
        var { token } = req.query;

        this.dbAccess.getInfoFromToken(token).then((result) => {
            if (!result.expired) {
                this.dbAccess
                    .findBoxes({
                        shared: { $in: [result.username], $exists: true },
                    })
                    .then((done) => {
                        res.json({ boxes: done });
                    });
            } else return res.sendStatus(401);
        });
    }

    /**
     * Download the desired hash file
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    download(req, res) {
        var { _id, token } = req.query;

        return this._validateToken(_id, token).then((valid) => {
            if (!valid.valid) return res.sendStatus(401);
            this.dbAccess.getBoxFromId(_id).then((box) => {
                const filePath = `${__dirname}/storage/${box.fileHash}`;
                res.download(filePath, `${box.name}.csv`);
            });
        });
    }

    /**
     * Authenticate from token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    usernameFromToken(req, res) {
        if (req.query.token == null) return res.sendStatus(400);
        this.dbAccess.getInfoFromToken(req.query.token).then((result) => {
            if (result.error) return res.sendStatus(491);
            return res.json(result);
        });
    }

    /**
     * Saves a file.
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    saveFile(req, res) {
        var { _id, token } = req.body;

        var uploadFile = req.files.file;

        this._validateToken(_id, token).then((result) => {
            if (!result.valid) return res.sendStatus(401);
            const hash = calcHash(uploadFile.data);
            this.dbAccess.updateBoxHash(_id, hash).then((done) => {
                if (!done.acknowledged) return res.sendStatus(590);
                uploadFile.mv(`${__dirname}/storage/${hash}`, (err) => {
                    if (err) return res.sendStatus(500);
                    else return res.sendStatus(200);
                });
            });
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
        if (!username || !password) return res.sendStatus(400);
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
        if (!username || !password) return res.status(400);

        this.dbAccess.signIn(username, password).then((result) => {
            if (result.error) return res.sendStatus(490);

            //Login success - return token
            this.dbAccess.createTokenDefault(username).then((result) => {
                if (!result.token) return res.status(491);
                return res.json(result);
            });
        });
    }

    /**
     * Admin login
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    adminLogin(req, res) {
        const { username, password } = req.body;

        this.dbAccess.adminLogin(username, password).then((result) => {
            if (!result.token) return res.sendStatus(490);
            return res.json(result);
        });
    }

    /**
     * Authenticate an admin token
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The resource
     */
    authenticateAdmin(req, res) {
        const { token } = req.body;

        this.dbAccess.authenticateAdmin(token).then((result) => {
            return res.json(result);
        });
    }

    /**
     * Gets all users
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    users(req, res) {
        const { token } = req.body;

        this.dbAccess.authenticateAdmin(token).then((result) => {
            if (!result.valid) return res.sendStatus(401);
            this.dbAccess.allUsers().then((users) => {
                res.json({ users });
            });
        });
    }

    /**
     * Deletes a user from the database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    deleteUser(req, res) {
        const { token, username } = req.body;

        if (!token || !username) return res.sendStatus(401);

        this.dbAccess.authenticateAdmin(token).then((resutl) => {
            this.dbAccess.deleteUser(username).then((done) => {
                if (!done.acknowledged) return res.sendStatus(590);
                this.dbAccess.deleteUsersBoxes(username).then((finished) => {
                    FileBoxesApi._acknowledgeDatabase(finished, res);
                });
            });
        });
    }

    /**
     * Deletes a users boxes from the database
     *
     * @param      {Request}  req     The request
     * @param      {Response}  res     The response
     */
    deleteUserBoxes(req, res) {
        const { token, username } = req.body;

        if (!token || !username) return res.sendStatus(401);

        this.dbAccess.authenticateAdmin(token).then((resutl) => {
            this.dbAccess.deleteUsersBoxes(username).then((done) => {
                FileBoxesApi._acknowledgeDatabase(done, res);
            });
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
        this.app.get("/api/sharebox", (req, res) => this.shareBox(req, res));
        this.app.get("/api/file", (req, res) => this.fileContents(req, res));
        this.app.get("/api/delete", (req, res) => this.delete(req, res));
        this.app.get("/api/public", (req, res) => this.publicBoxes(req, res));
        this.app.get("/api/boxes", (req, res) => this.userBoxes(req, res));
        this.app.get("/api/inbox", (req, res) => this.inbox(req, res));
        this.app.get("/api/download", (req, res) => this.download(req, res));
        this.app.get("/api/user", (req, res) =>
            this.usernameFromToken(req, res)
        );
        //Post api
        this.app.post("/api/upload", (req, res) => this.saveFile(req, res));

        //Login/Signup
        this.app.post("/api/signup", (req, res) => this.signUp(req, res));
        this.app.post("/api/login", (req, res) => this.login(req, res));
        this.app.post("/api/admin", (req, res) => {
            res.json({ message: "Admin access required " });
        });
        this.app.post("/api/admin/login", (req, res) =>
            this.adminLogin(req, res)
        );
        this.app.post("/api/admin/auth", (req, res) =>
            this.authenticateAdmin(req, res)
        );
        this.app.post("/api/admin/users", (req, res) => this.users(req, res));
        this.app.post("/api/admin/deleteuser", (req, res) =>
            this.deleteUser(req, res)
        );
        this.app.post("/api/admin/deleteuserboxes", (req, res) =>
            this.deleteUserBoxes(req, res)
        );
    }

    /**
     * Start the express listener
     */
    start() {
        this.dbAccess.once("open", () => {
            console.log("MongoDB connected.");
            this.app.listen(this.PORT, () => {
                console.log(`Server listening on ${this.PORT}.`);
            });
        });
    }
};

module.exports = {
    FileBoxesApi,
};

const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");

const { DB_USERNAME, DB_PASSWORD, DB_URL, DB_NAME } = require("./secrets");

const URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}`;

//Time constants
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const DatabaseAccess = class DatabaseAccess extends MongoClient {
    /**
     * Creats a new DatabaseAccess class
     * @param      {Obkect} Configuration options for MongoClient
     */
    constructor(options) {
        super(URI, options);
        this.connect();
    }

    /**
     * Gets the box collection.
     *
     * @return     {Collection}  The box collection.
     */
    async getBoxCollection() {
        return await this.db(DB_NAME).collection("boxes");
    }

    /**
     * Gets the user collection.
     *
     * @return     {Collection}  The box collection.
     */
    async getUserCollection() {
        return await this.db(DB_NAME).collection("users");
    }

    /**
     * Gets the token collection.
     *
     * @return     {Promise}  The token collection.
     */
    async getTokenCollection() {
        return await this.db(DB_NAME).collection("tokens");
    }

    /**
     * Gets the information from token.
     *
     * @param      {string}   token   The token
     * @return     {Promise}  { username, expired }.
     */
    async getInfoFromToken(token) {
        let tokens = await this.getTokenCollection();
        let user = await tokens.findOne({ token });

        if (!user)
            return {
                username: null,
                expired: false,
            };

        return {
            username: user.username,
            expired: Date.now() > user.expires ? true : false,
        };
    }

    /**
     * Creates a token for the user - generic 1 hour
     *
     * @param      {string}   username  The username
     * @return     {Promise}  { token, error }
     */
    async createTokenDefault(username) {
        return await this.createToken(username, Date.now() + HOUR);
    }

    /**
     * Creates a token for the user
     *
     * @param      {string}   username  The username
     * @param      {long long}   expires   The expires
     * @return     {Promise}  { token, error }
     */
    async createToken(username, expires) {
        let tokens = await this.getTokenCollection();

        await tokens.deleteMany({ username });

        let result = await tokens.insertOne({
            username,
            expires,
            token: crypto.randomBytes(32).toString("hex"),
        });

        if (result.acknowledged) {
            let find = await this._hasToken(username);
            if (find.error || find.expired)
                return { error: "Error finding token" };
            return { token: find.token, error: false };
        } else return { error: "Unable to create token" };
    }

    /**
     * Validates a token
     *
     * @param      {string}   username  The username
     * @param      {string}   token     The token
     * @return     {Promise}  { valid, error }
     */
    async validateToken(username, token) {
        let tokens = await this.getTokenCollection();
        let found = await this._hasToken(username);
        if (!found.token) return { valid: false };
        else
            return {
                valid: token === found.token && !found.expired ? true : false,
            };
    }

    /**
     * Determines if user has any tokens available
     *
     * @param      {string}   username  The username
     * @return     {Promise}  { token, expired, error }.
     */
    async _hasToken(username) {
        let tokens = await this.getTokenCollection();

        let user = await tokens.findOne({ username });
        if (user == null) return { error: "No user" };

        if (user.expires < Date.now()) return { token: null, expired: true };
        else return { token: user.token, expired: false };
    }

    /**
     * Adds a new user to the database
     *
     * @param      {Object}   user    The user
     * @return     {Promise}  { result, error }
     */
    async signUp(user) {
        const { username, password } = user;
        if (username == null || password == null)
            return { error: "Invalid user call" };

        let userCollection = await this.getUserCollection();
        let users = await userCollection.find({ username }).toArray();
        if (users.length > 0) return { error: "Username already exists" };

        let salt = await crypto.randomBytes(32).toString("hex");
        let hash = await crypto
            .createHmac("sha512", password + salt)
            .digest("hex");

        let result = await userCollection.insertOne({
            username,
            salt,
            password: hash,
        });
        if (result.insertedId) {
            await this.createToken(username, Date.now() + HOUR);
            return { result: true, error: false };
        }
    }

    /**
     * Authenticate user in database
     *
     * @param      {string}   username  The username
     * @param      {string}   password  The password
     * @return     {Promise}  { result, error }
     */
    async signIn(username, password) {
        let userCollection = await this.getUserCollection();
        let user = await userCollection.findOne({ username });

        if (user == null) return { error: "No user found with that username." };

        let hash = await crypto
            .createHmac("sha512", password + user.salt)
            .digest("hex");

        if (hash === user.password) return { result: true, error: false };
        else return { result: false, error: "Invalid password." };
    }

    /**
     * Adds a box to the mongodb
     *
     * @param      {Box}  box     The box to add
     */
    async addBox(box) {
        var boxes = await this.getBoxCollection();
        if (box._id) {
            await boxes.deleteMany({ _id: new ObjectId(box._id) });
        }
        return await boxes.insertOne(box);
    }

    /**
     * Edits the box in the database
     *
     * @param      {Object}  box     The box to be edited
     */
    async editBox(box) {
        if (box._id == null) return false;

        let boxes = await this.getBoxCollection();
        return await boxes.updateMany(
            { _id: new ObjectId(box._id) },
            {
                $set: {
                    name: box.name,
                    description: box.description,
                    fileHash: box.fileHash,
                    username: box.username,
                    public: box.public,
                },
            }
        );
    }

    /**
     * Adds a user to a box.
     *
     * @param      {string}   id        The identifier
     * @param      {string}   username  The username
     * @return     {Promise}  { MongoDB Result }
     */
    async addSharedBoxUser(id, username) {
        let boxes = await this.getBoxCollection();
        return await boxes.updateOne(
            { _id: new ObjectId(id) },
            { $push: { shared: username } }
        );
    }

    async updateBoxHash(id, fileHash) {
        let boxes = await this.getBoxCollection();
        return await boxes.updateMany(
            { _id: new ObjectId(id) },
            { $set: { fileHash } }
        );
    }

    /**
     * Removes a box. based on its id
     *
     * @param      {String}  _id  The box id
     */
    async removeBox(id) {
        let boxes = await this.getBoxCollection();
        return await boxes.deleteMany({ _id: new ObjectId(id) });
    }

    /**
     * Gets the box from id.
     *
     * @param      {String}  _id  The file id
     * @return     {Object}  The box from hash.
     */
    async getBoxFromId(_id) {
        let boxes = await this.getBoxCollection();
        return await boxes.findOne({ _id: new ObjectId(_id) });
    }

    /**
     * Finds a shared box.
     *
     * @param      {string}   username  The username
     * @param      {string}   id        The identifier
     * @return     {Promise}  { Found box }
     */
    async findSharedBox(username, id) {
        let boxes = await this.getBoxCollection();
        return await boxes.findOne(
            { shared: { $in: [username] } },
            { _id: new ObjectId(id) }
        );
    }

    /**
     * Finds boxes from query
     *
     * @param      {Object}   Query   The query
     * @return     {Promise}  [ Found boxes ]
     */
    async findBoxes(Query) {
        let boxes = await this.getBoxCollection();
        return await boxes.find(Query).toArray();
    }
};

module.exports = {
    DatabaseAccess,
};

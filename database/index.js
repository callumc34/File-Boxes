const MongoClient = require("mongodb").MongoClient;

const { DB_USERNAME, DB_PASSWORD, DB_URL, DB_NAME } = require("./secrets");

const URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}`;

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
     * Adds a box to the mongodb
     *
     * @param      {Box}  box     The box to add
     */
    async addBox(box) {
        let boxes = await this.getBoxCollection();
        await boxes.deleteMany({ name: box.name });
        return await boxes.insertOne(
            {
                name: box.name,
                description: box.description,
                fileHash: box.fileHash,
            },
            (err) => {
                if (err) console.log(err);
            }
        );
    }

    /**
     * Edits the box in the database
     *
     * @param      {Object}  box     The box to be edited
     */
    async editBox(box) {
        if (box.fileHash == null) return false;
        let boxes = await this.getBoxCollection();
        return await boxes.updateMany(
            { fileHash: box.fileHash },
            { $set: { name: box.name, description: box.description } }
        );
    }

    /**
     * Removes a named box.
     *
     * @param      {String}  name    The name
     */
    async removeNamedBox(name) {
        let boxes = await this.getBoxCollection();
        return await boxes.deleteMany({ name });
    }

    /**
     * Removes a box. based on its hash
     *
     * @param      {String}  fileHash  The file hash
     */
    async removeBox(fileHash) {
        let boxes = await this.getBoxCollection();
        return await boxes.deleteMany({ fileHash });
    }

    /**
     * Gets the box from hash.
     *
     * @param      {String}  fileHash  The file hash
     * @return     {Object}  The box from hash.
     */
    async getBoxFromHash(fileHash) {
        let boxes = await this.getBoxCollection();
        return await boxes.find({ fileHash }).toArray();
    }

    /**
     * Gets all boxes from the mongodb
     * @param      {Response} Response to return to
     *
     * @return     {Array}  All boxes in the mongodb.
     */
    async getAllBoxes(res) {
        let boxes = await this.getBoxCollection();
        return await boxes.find({}).toArray((err, result) => {
            res.json({ boxes: result });
        });
    }
};

module.exports = {
    DatabaseAccess,
};

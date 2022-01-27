const MongoClient = require("mongodb").MongoClient;

const Box = require("../models").Box;
const { DB_USERNAME, DB_PASSWORD, DB_URL, DB_NAME } = require("./secrets");

const URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}/${DB_NAME}`;

const DatabaseAccess = class DatabaseAccess extends MongoClient {
    /**
     * Creats a new DatabaseAccess class
     * @param      {Obkect} Configuration options for MongoClient
     */
    constructor(
        options
    ) {
        super(URI, options);
        this.connect();
    }

    getBoxCollection() {
        return this.db(DB_NAME).collection("boxes");
    }

    /**
     * Adds a box to the mongodb
     *
     * @param      {Box}  box     The box to add
     */
    addBox(box) {
        this.getBoxCollection().deleteMany({ name : box.name });
        return this.getBoxCollection().insertOne(
            { name : box.name, description : box.description, fileId : box.fileId },
            (err, res) => console.log(err, res)
        );
    }

    removeBox(name) {
        this.getBoxCollection().deleteMany({ name });
    }

    /**
     * Gets all boxes from the mongodb
     * @param      {Response} Response to return to
     *
     * @return     {Array}  All boxes in the mongodb.
     */
    getAllBoxes(res) {
        return this.getBoxCollection().find({}).toArray((err, result) => {
            res.json({boxes : result});
        });
    }
}

module.exports = {
    DatabaseAccess,
}
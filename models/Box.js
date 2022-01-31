const Box = class Box {
    /**
     * Constructs a new box
     *
     * @param      {string}  name         The name of the box
     * @param      {string}  description  The description of the box
     * @param      {int}  fileHash       The file identifier for the box
     * @param      {string} username    The username associated
     */
    constructor(name, description, fileHash, username, isPublic, id) {
        this.name = name;
        this.description = description;
        this.fileHash = fileHash;
        this.username = username != "undefined" ? username : null;
        this.public = isPublic;
        this._id = id;
    }

    /**
     * Creates a box from an Object / Query
     *
     * @param    {Object}  obj  The configuration
     * @return     {Box}     Box instance
     */
    static fromObj(obj) {
        if (obj.name == null || obj.description == null) return null;
        return new Box(
            obj.name,
            obj.description,
            obj.fileHash,
            obj.username,
            !!parseInt(obj.public),
            obj._id
        );
    }
};

module.exports = {
    Box,
};

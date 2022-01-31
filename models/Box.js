const Box = class Box {
    /**
     * Constructs a new box
     *
     * @param      {string}  name         The name of the box
     * @param      {string}  description  The description of the box
     * @param      {int}  fileHash       The file identifier for the box
     * @param      {string} username    The username associated
     */
    constructor(name, description, fileHash, isPublic, username, id) {
        this.name = name;
        this.description = description;
        this.fileHash = fileHash;
        this.username = username;
        this.public = isPublic;
        this._id = id;
    }
};

module.exports = {
    Box,
};
